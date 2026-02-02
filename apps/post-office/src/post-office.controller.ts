import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ConfigService } from '@pkg/config';
import { MailerService } from './mailer.service';

interface VerificationMessage {
  to: string;
  subject: string;
  otp: string;
  firstName?: string;
  otpWindowMinutes?: number;
}

interface PasswordChangedMessage {
  to: string;
  subject: string;
  changedAt: string;
  firstName?: string;
  ipAddress?: string;
  device?: string;
}

interface PasswordResetInitMessage {
  to: string;
  subject: string;
  otp: string;
  ttlSeconds: number;
  firstName?: string;
}

interface PasswordResetCompleteMessage {
  to: string;
  subject: string;
  changedAt: string;
  firstName?: string;
}

@Controller()
export class PostOfficeController {
  private readonly logger = new Logger(PostOfficeController.name);

  constructor(private readonly mailer: MailerService, private readonly config: ConfigService) {}

  @EventPattern('payments.collection.received')
  async onCollection(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Collection event received: ${JSON.stringify(data)}`);
    this.ack(context);
  }

  @EventPattern('auth.email.verification')
  async onEmailVerification(@Payload() data: VerificationMessage, @Ctx() context: RmqContext) {
    await this.process(context, async () => {
      if (!data?.to || !data?.subject || !data?.otp) {
        throw new Error('Invalid email verification payload');
      }
      await this.mailer.sendVerificationEmail({
        to: data.to,
        subject: data.subject,
        otp: data.otp,
        firstName: data.firstName,
        otpWindowMinutes: data.otpWindowMinutes
      });
    });
  }

  @EventPattern('auth.password.changed')
  async onPasswordChanged(@Payload() data: PasswordChangedMessage, @Ctx() context: RmqContext) {
    await this.process(context, async () => {
      if (!data?.to || !data?.subject || !data?.changedAt) {
        throw new Error('Invalid password changed payload');
      }
      await this.mailer.sendPasswordChangedEmail({
        to: data.to,
        subject: data.subject,
        changedAt: data.changedAt,
        firstName: data.firstName,
        ipAddress: data.ipAddress,
        device: data.device
      });
    });
  }

  @EventPattern('auth.password.reset.init')
  async onPasswordResetInit(@Payload() data: PasswordResetInitMessage, @Ctx() context: RmqContext) {
    await this.process(context, async () => {
      if (!data?.to || !data?.subject || !data?.otp || typeof data.ttlSeconds !== 'number') {
        throw new Error('Invalid password reset init payload');
      }
      await this.mailer.sendPasswordResetInitEmail({
        to: data.to,
        subject: data.subject,
        otp: data.otp,
        ttlSeconds: data.ttlSeconds,
        firstName: data.firstName
      });
    });
  }

  @EventPattern('auth.password.reset.completed')
  async onPasswordResetCompleted(@Payload() data: PasswordResetCompleteMessage, @Ctx() context: RmqContext) {
    await this.process(context, async () => {
      if (!data?.to || !data?.subject || !data?.changedAt) {
        throw new Error('Invalid password reset completed payload');
      }
      await this.mailer.sendPasswordResetCompletedEmail({
        to: data.to,
        subject: data.subject,
        changedAt: data.changedAt,
        firstName: data.firstName
      });
    });
  }

  private async process(context: RmqContext, handler: () => Promise<void>) {
    try {
      await handler();
      this.ack(context);
    } catch (error: any) {
      this.logger.error(`[post-office] handler failed: ${error?.message ?? error}`);
      await this.handleFailure(context, error);
    }
  }

  private ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }

  private async handleFailure(context: RmqContext, error: any) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const exchange: string = (originalMsg.fields as any).exchange || 'amq.topic';
    const routingKey: string = (originalMsg.fields as any).routingKey || '';
    const headers = { ...(originalMsg.properties.headers || {}) } as Record<string, any>;
    const current = Number(headers['x-retry'] ?? 0);
    const maxRetries = Number(this.config.get<number>('POSTOFFICE_MAX_RETRIES') ?? 5);

    if (current < maxRetries) {
      headers['x-retry'] = current + 1;
      channel.publish(exchange, routingKey, originalMsg.content, {
        headers,
        persistent: true,
        contentType: originalMsg.properties.contentType,
      });
      this.logger.warn(`Republished message for retry ${headers['x-retry']}/${maxRetries} (${routingKey})`);
      channel.ack(originalMsg);
      return;
    }

    // Publish to DLX when retries exhausted
    const dlx = 'post-office.dlx';
    const dlqRouting = 'post-office.dlq';
    const dlqHeaders = {
      ...headers,
      'x-error': String(error?.message ?? error),
      'x-original-routing': routingKey,
      'x-retry': current,
    };
    channel.publish(dlx, dlqRouting, originalMsg.content, {
      headers: dlqHeaders,
      persistent: true,
      contentType: originalMsg.properties.contentType,
    });
    this.logger.error(`Sent message to DLQ after ${current} retries (${routingKey})`);
    channel.ack(originalMsg);
  }
}

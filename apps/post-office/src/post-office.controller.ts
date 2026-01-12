import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class PostOfficeController {
  private readonly logger = new Logger(PostOfficeController.name);

  @EventPattern('payments.collection.received')
  async onCollection(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Collection event received: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }

  @EventPattern('auth.email.verification')
  async onEmailVerification(@Payload() data: any, @Ctx() context: RmqContext) {
    // For now, just log the queued message with OTP
    this.logger.log(`Email verification queued: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}

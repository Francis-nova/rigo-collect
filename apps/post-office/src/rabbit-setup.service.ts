import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@pkg/config';
import * as amqplib from 'amqplib';
// Fallback type declarations if @types/amqplib is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmqpConnection = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmqpChannel = any;

@Injectable()
export class RabbitSetupService implements OnModuleInit {
  private readonly logger = new Logger(RabbitSetupService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn('RABBITMQ_URL not set; skipping DLQ setup');
      return;
    }
    const dlx = 'post-office.dlx';
    const dlq = 'post-office.dlq';
    try {
      const conn: AmqpConnection = await amqplib.connect(url);
      const ch: AmqpChannel = await conn.createChannel();
      await ch.assertExchange(dlx, 'topic', { durable: true });
      await ch.assertQueue(dlq, { durable: true });
      await ch.bindQueue(dlq, dlx, dlq);
      await ch.close();
      await conn.close();
      this.logger.log('DLX/DLQ asserted (post-office.dlx → post-office.dlq)');
    } catch (err: any) {
      this.logger.error(`Failed to assert DLX/DLQ: ${err?.message ?? err}`);
    }
  }
}

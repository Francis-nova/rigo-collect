import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import indexConfig from '../configs/index.config';

@Injectable()
export class RabbitPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitPublisherService.name);
  private conn?: any;
  private channel?: any;
  private exchange = 'amq.topic';

  async ensureConnection() {
    if (this.channel && this.conn) return;
    const url = indexConfig.messaging.rabbitmqUrl;
    this.conn = await amqp.connect(url);
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    this.logger.log('RabbitMQ publisher connected');
  }

  async publish(routingKey: string, payload: any) {
    await this.ensureConnection();
    const body = Buffer.from(JSON.stringify(payload));
    const ok = this.channel!.publish(this.exchange, routingKey, body, {
      persistent: true,
      contentType: 'application/json',
    });
    if (!ok) {
      this.logger.warn(`Publish returned false for ${routingKey}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.conn?.close();
    } catch (err) {
      this.logger.error('Error closing RabbitMQ publisher', err as any);
    }
  }
}

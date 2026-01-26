import { Injectable, Logger } from '@nestjs/common';
import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly budpay: BudPayProvider,
    private readonly providus: ProvidusProvider,
    private readonly queue: QueueService,
  ) {}

  async handleBudpay(payload: any, headers: Record<string, string>) {
    this.logger.debug('Received BudPay webhook', { headers });
      if (payload?.notify === 'payout') {
        await this.queue.addBudpayIncomingWebhookJob(payload); // keep intake
        // also dispatch explicit payout job for dedicated handler
        await this.queue['budpayQueue'].add('payout-webhook', payload, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        });
      } else {
        await this.queue.addBudpayIncomingWebhookJob(payload);
      }
    return { accepted: true };
  }

  async handleProvidus(payload: any, headers: Record<string, string>) {
    this.logger.debug('Received Providus webhook', { headers });
    await this.queue.addProvidusWebhookJob(payload);
    return { accepted: true };
  }
}

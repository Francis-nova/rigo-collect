import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { PayoutDto } from '../payout/dtos/payout.dto';

@Injectable()
export class QueueService {

  constructor(
    @InjectQueue('payouts')
    private readonly payoutQueue: Queue,
    @InjectQueue('budpay')
    private readonly budpayQueue: Queue,
    @InjectQueue('providus')
    private readonly providusQueue: Queue,
  ) { }

    /**
   * Add a payout job to the queue
   */
  async addPayoutJob(data: PayoutDto, options?: any) {
    return await this.payoutQueue.add('payout', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
      ...options,
    });
  }

  /**
   * Add a BudPay incoming webhook job
   */
  async addBudpayIncomingWebhookJob(data: any, options?: any) {
    return await this.budpayQueue.add('webhook', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
      ...options,
    });
  }

  /**
   * Add a Providus incoming webhook job
   */
  async addProvidusWebhookJob(data: any, options?: any) {
    return await this.providusQueue.add('webhook', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
      ...options,
    });
  }

}
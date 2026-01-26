import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { QueuesModule } from '../queue/queues.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [HttpModule, QueuesModule],
  controllers: [WebhookController],
  providers: [WebhookService, BudPayProvider, ProvidusProvider],
  exports: [WebhookService],
})
export class WebhookModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { QueuesModule } from '../queue/queues.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { RedisService } from '../../providers/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transactions.entity';
import { Account } from '../../entities/account.entity';
import { SubAccount } from '../../entities/sub-account.entity';
import { RabbitPublisherService } from '../../providers/rabbit-publisher.service';
import { InternalApiService } from '../../providers/internal-api.service';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [HttpModule, QueuesModule, FeesModule, TypeOrmModule.forFeature([Transaction, Account, SubAccount])],
  controllers: [WebhookController],
  providers: [WebhookService, BudPayProvider, ProvidusProvider, RedisService, RabbitPublisherService, InternalApiService],
  exports: [WebhookService],
})
export class WebhookModule {}

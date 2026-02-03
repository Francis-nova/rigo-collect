import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from '../../entities/currency.entity';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transactions.entity';
import { SubAccount } from '../../entities/sub-account.entity';
import { QueueService } from './queue.service';
import { PayoutProcessor } from './processors/payout.processor';
import { SettingsModule } from '../../settings/settings.module';
import { PaymentProviderFactory } from '../../providers/provider.factory';
import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { BudpayProcessor } from './processors/budpay.processor';
import { ProvidusProcessor } from './processors/providus.processor';
import { RedisService } from '../../providers/redis.service';
import { PayoutProviderFactory } from '../../providers/payout-provider.factory';
import { TransactionProcessor } from './processors/transaction.processor';
import { RabbitPublisherService } from '../../providers/rabbit-publisher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Currency,
      Account,
      SubAccount,
    ]),
    HttpModule, // Required for HTTP-based providers
    SettingsModule, // Settings service used by PaymentProviderFactory
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === 'true' ? {} as any : undefined,
      },
    }),

    BullModule.registerQueue({ name: 'payouts', defaultJobOptions: { attempts: 2 } }),
    BullModule.registerQueue({ name: 'budpay', defaultJobOptions: { attempts: 2 } }),
    BullModule.registerQueue({ name: 'providus', defaultJobOptions: { attempts: 2 } }),
    BullModule.registerQueue({ name: 'transactions', defaultJobOptions: { attempts: 2 } }),
  ],
  providers: [
    QueueService,
    PayoutProcessor,
    TransactionProcessor,
    BudpayProcessor,
    ProvidusProcessor,
    // Provider factory and concrete providers required by PayoutProcessor
    PaymentProviderFactory,
    PayoutProviderFactory,
    BudPayProvider,
    ProvidusProvider,
    RedisService,
    RabbitPublisherService,
  ],
  exports: [BullModule, QueueService],
})

export class QueuesModule { }

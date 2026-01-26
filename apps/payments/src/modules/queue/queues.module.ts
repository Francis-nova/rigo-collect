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

    BullModule.registerQueue({ name: 'payouts' }),
    BullModule.registerQueue({ name: 'budpay' }),
    BullModule.registerQueue({ name: 'providus' }),
  ],
  providers: [
    QueueService,
    PayoutProcessor,
    BudpayProcessor,
    // Provider factory and concrete providers required by PayoutProcessor
    PaymentProviderFactory,
    BudPayProvider,
    ProvidusProvider,
  ],
  exports: [BullModule, QueueService],
})

export class QueuesModule { }

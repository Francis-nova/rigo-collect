import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import indexConfig from './configs/index.config';
import { HealthController } from './health.controller';
import { CurrencyModule } from './modules/currency/currency.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { PayoutModule } from './modules/payout/payout.module';
import { QueuesModule } from './modules/queue/queues.module';
import { SettingsModule } from './settings/settings.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(indexConfig.database),
    CurrencyModule,
    SettingsModule,
    AccountsModule,
    TransactionsModule,
    PayoutModule,
    QueuesModule,
    ProfileModule
  ],
  controllers: [HealthController]
})
export class AppModule { }

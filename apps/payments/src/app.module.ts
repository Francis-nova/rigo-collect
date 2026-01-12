import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import indexConfig from './configs/index.config';
import { PaymentsController } from './payments.controller';
import { HealthController } from './health.controller';
import { BankingProviderModule } from './providers/provider.factory';
import { CurrencyModule } from './modules/currency/currency.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(indexConfig.database),
    BankingProviderModule,
    CurrencyModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [PaymentsController, HealthController]
})
export class AppModule {}

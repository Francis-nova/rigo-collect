import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import indexConfig from './configs/index.config';
import { HealthController } from './health.controller';
import { CurrencyModule } from './modules/currency/currency.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(indexConfig.database),
    CurrencyModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}

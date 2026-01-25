import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../entities/account.entity';
import { SubAccount } from '../../entities/sub-account.entity';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PaymentProviderFactory } from '../../providers/provider.factory';
import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { SettingsModule } from '../../settings/settings.module';
import { Currency } from '../../entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, SubAccount, Currency]), SettingsModule, HttpModule],
  controllers: [AccountsController],
  providers: [AccountsService, PaymentProviderFactory, BudPayProvider, ProvidusProvider],
  exports: [AccountsService],
})
export class AccountsModule {}

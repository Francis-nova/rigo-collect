import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from '../../entities/currency.entity';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { PayoutProviderFactory } from '../../providers/payout-provider.factory';
import { SettingsModule } from '../../settings/settings.module';
import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { QueuesModule } from '../queue/queues.module';
import { ProfileModule } from '../profile/profile.module';
import { RedisService } from '../../providers/redis.service';

@Module({
  imports: [QueuesModule, TypeOrmModule.forFeature([Currency]), SettingsModule, HttpModule, ProfileModule],
  controllers: [PayoutController],
  providers: [PayoutService, PayoutProviderFactory, BudPayProvider, ProvidusProvider, RedisService],
  exports: [PayoutService],
})
export class PayoutModule {}

// src/payment/payment-provider.factory.ts
import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { IBankingProvider } from '@pkg/interfaces';
import { BudPayProvider } from './providers.impl/budpay.provider';
import { ProvidusProvider } from './providers.impl/providus.provider';

@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly settingRepository: SettingsService,
    private readonly budpayProvider: BudPayProvider,
    private readonly providusProvider: ProvidusProvider,
  ) {}

  async getProvider(): Promise<IBankingProvider> {
    const provider = await this.settingRepository.get('default.system.provider');

    switch (provider) {
      case 'budpay':
        return this.budpayProvider;

      case 'providus':
        return this.providusProvider;

      default:
        throw new Error('Invalid provider');
    }
  }
}
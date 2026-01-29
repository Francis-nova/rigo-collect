import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { IBankingProvider } from '@pkg/interfaces';
import { BudPayProvider } from './providers.impl/budpay.provider';
import { ProvidusProvider } from './providers.impl/providus.provider';

@Injectable()
export class PayoutProviderFactory {
  constructor(
    private readonly settings: SettingsService,
    private readonly budpayProvider: BudPayProvider,
    private readonly providusProvider: ProvidusProvider,
  ) { }

  /**
   * Returns the provider to use for payouts. Order of precedence:
   * 1) explicitly requested provider name (if provided)
   * 2) setting key `default.payout.provider`
   * 3) fallback to `default.system.provider`
   */
  async getProvider(): Promise<IBankingProvider> {
    const provider =
      (await this.settings.get('default.payout.provider')) ||
      (await this.settings.get('default.system.provider'));

    if (!provider) {
      throw new Error('Payout provider not configured');
    }

    switch (provider) {
      case 'budpay':
        return this.budpayProvider;
      case 'providus':
        return this.providusProvider;
      default:
        throw new Error(`Unsupported payout provider: ${provider}`);
    }
  }
}

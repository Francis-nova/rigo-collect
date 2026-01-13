import { Injectable, Logger } from '@nestjs/common';
import { IBankingProvider } from '@pkg/interfaces';
import { SettingsService } from '../settings/settings.service';
import { MockProvider } from './providers.impl/mock.provider';
import { BudPayProvider } from './providers.impl/budpay.provider';
import { ProvidusProvider } from './providers.impl/providus.provider';

@Injectable()
export class ProviderRouter {
  private readonly logger = new Logger(ProviderRouter.name);
  private readonly registry: Record<string, IBankingProvider> = {};

  constructor(private readonly settings: SettingsService) {
    // Register available providers (stubs for now)
    [new MockProvider(), new BudPayProvider(), new ProvidusProvider()].forEach((p) => {
      this.registry[p.name()] = p;
    });
  }

  private getProviderByName(name: string | undefined): IBankingProvider | undefined {
    if (!name) return undefined;
    return this.registry[name.toLowerCase()];
  }

  async pickProvider(overrideName?: string): Promise<IBankingProvider> {
    // 1) Override takes precedence
    const fromOverride = this.getProviderByName(overrideName);
    if (fromOverride) return fromOverride;

    // 2) DB setting default
    const defaultName = (await this.settings.get('DEFAULT_BANKING_PROVIDER')) || 'mock';
    const fromDefault = this.getProviderByName(defaultName);
    if (fromDefault) return fromDefault;

    // 3) Fallback via failover list
    const failover = (await this.settings.get('BANKING_PROVIDER_FAILOVER')) || '';
    for (const name of failover.split(',').map((s) => s.trim()).filter(Boolean)) {
      const p = this.getProviderByName(name);
      if (p) {
        this.logger.warn(`Falling back to provider: ${name}`);
        return p;
      }
    }

    // 4) Final fallback to mock
    this.logger.warn('Falling back to provider: mock');
    return this.registry['mock'];
  }
}

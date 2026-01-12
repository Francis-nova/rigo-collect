import { Module, Provider } from '@nestjs/common';
import { BANKING_PROVIDER } from '@pkg/common';
import { IBankingProvider } from '@pkg/interfaces';
import { MockProvider } from './providers.impl/mock.provider';
import indexConfig from '../configs/index.config';

const providerFactory = (): IBankingProvider => {
  const name = indexConfig.provider.banking;
  switch (name) {
    case 'mock':
    default:
      return new MockProvider();
  }
};

const providerBinding: Provider = {
  provide: BANKING_PROVIDER,
  useFactory: providerFactory,
};

@Module({
  providers: [providerBinding],
  exports: [providerBinding]
})
export class BankingProviderModule {}

import { Module, Provider } from '@nestjs/common';
import { BANKING_PROVIDER } from '@pkg/common';
import { IBankingProvider } from '@pkg/interfaces';
import indexConfig from '../configs/index.config';
import { SettingsModule } from '../settings/settings.module';

const providerFactory = (): IBankingProvider => {
  const name = indexConfig.provider.banking;
  switch (name) {
    case 'mock':
    default:
      throw new Error(`Banking provider "${name}" is not implemented yet.`);
  }
};

const providerBinding: Provider = {
  provide: BANKING_PROVIDER,
  useFactory: providerFactory,
};

@Module({
  imports: [SettingsModule],
  providers: [providerBinding],
  exports: [providerBinding]
})
export class BankingProviderModule {}

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import indexConfig from '../configs/index.config';
import { Setting } from '../entities/setting.entity';

const dataSource = new DataSource({
  ...(indexConfig.database as any),
  entities: [Setting],
});

const seedSettings: Array<Pick<Setting, 'key' | 'value'>> = [
  { key: 'DEFAULT_BANKING_PROVIDER', value: 'budpay' },
  { key: 'BANKING_PROVIDER_FAILOVER', value: 'providus,budpay' },
];

async function run() {
  try {
    await dataSource.initialize();
    const repo = dataSource.getRepository(Setting);

    await repo.upsert(seedSettings, { conflictPaths: ['key'] });

    const count = await repo.count();
    console.log(`Seeded provider settings. Total settings rows: ${count}`);
  } catch (err) {
    console.error('Provider settings seed failed:', err);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy().catch(() => void 0);
  }
}

run();

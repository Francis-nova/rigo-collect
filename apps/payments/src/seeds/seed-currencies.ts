import 'reflect-metadata';
import { DataSource } from 'typeorm';
import indexConfig from '../configs/index.config';
import { Currency } from '../entities/currency.entity';

const dataSource = new DataSource({
  ...(indexConfig.database as any),
  entities: [Currency],
});

const seedCurrencies: Array<Pick<Currency, 'code' | 'countryCode' | 'name' | 'symbol' | 'isActive'>> = [
  { code: 'USD', countryCode: 'US', name: 'US Dollar', symbol: '$', isActive: true },
  { code: 'EUR', countryCode: 'EU', name: 'Euro', symbol: '€', isActive: true },
  { code: 'GBP', countryCode: 'GB', name: 'Pound Sterling', symbol: '£', isActive: true },
  { code: 'NGN', countryCode: 'NG', name: 'Nigerian Naira', symbol: '₦', isActive: true },
  { code: 'GHS', countryCode: 'GH', name: 'Ghanaian Cedi', symbol: '₵', isActive: true },
  { code: 'KES', countryCode: 'KE', name: 'Kenyan Shilling', symbol: 'KSh', isActive: true },
];

async function run() {
  try {
    await dataSource.initialize();
    const repo = dataSource.getRepository(Currency);

    // Upsert by unique code
    await repo.upsert(
      seedCurrencies.map((c) => ({ ...c })),
      { conflictPaths: ['code'] },
    );

    const count = await repo.count();
    console.log(`Seeded currencies. Total rows: ${count}`);
  } catch (err) {
    console.error('Currency seed failed:', err);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy().catch(() => void 0);
  }
}

run();

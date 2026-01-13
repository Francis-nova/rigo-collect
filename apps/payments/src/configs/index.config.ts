import { config } from 'dotenv';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

// Load env from .env to mirror auth app
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: join(process.cwd(), envFile) });

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, './../entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: true,
};

const budPayConfig = {
  secretKey: process.env.BUDPAY_API_SECRET_KEY || '',
  publicKey: process.env.BUDPAY_API_PUBLIC_KEY || '',
  baseUrl: process.env.BUDPAY_BASE_URL || 'https://api.budpay.com',
};

const providusConfig = {
  clientId: process.env.PROVIDUS_CLIENT_ID || '',
  clientSecret: process.env.PROVIDUS_CLIENT_SECRET || '',
  signature: process.env.PROVIDUS_API_SIGNATURE || '',
  baseUrl: process.env.PROVIDUS_BASE_URL || 'https://api.providusbank.com',
};

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PAYMENTS_PORT || process.env.PORT || '3002', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  database: databaseConfig,
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || '*',
  apiServerPrefix: process.env.API_SERVER_PREFIX || '',
  messaging: {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queues: {
      payments: process.env.PAYMENTS_QUEUE || 'payments',
    }
  },
  auth: {
    baseUrl: process.env.AUTH_BASE_URL || 'http://localhost:3001',
    internalApiKey: process.env.INTERNAL_API_KEY || undefined,
  },
  provider: {
    banking: (process.env.BANKING_PROVIDER || 'mock').toLowerCase(),
  },
  budPayConfig,
  providusConfig,
}
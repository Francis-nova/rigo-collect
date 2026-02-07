import { config } from 'dotenv';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

// Load the environment variables from .env file
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

const storage = {
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
    folderDefault: process.env.CLOUDINARY_FOLDER_DEFAULT || undefined,
  },
  s3: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT || undefined,
    forcePathStyle: (process.env.AWS_FORCE_PATH_STYLE === 'true' || process.env.AWS_FORCE_PATH_STYLE === '1') || false,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || undefined,
  }
}

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4322', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  database: databaseConfig,
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || '*',
  apiServerPrefix: process.env.API_SERVER_PREFIX || '',
  storage,
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_SECRET || process.env.JWT_SECRET!,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
    internalApiKey: process.env.INTERNAL_API_KEY || undefined,
    apiKeyPepper: process.env.API_KEY_PEPPER || process.env.JWT_SECRET || '',
    emailVerification: {
      ttlSeconds: Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 600),
      resendLimit: Number(process.env.EMAIL_VERIFICATION_RESEND_LIMIT || 3),
      resendWindowSec: Number(process.env.EMAIL_VERIFICATION_RESEND_WINDOW || 3600),
    },
    forgotPassword: {
      ttlSeconds: Number(process.env.FORGOT_PASSWORD_TTL_SECONDS || 600),
      initLimit: Number(process.env.FORGOT_PASSWORD_INIT_LIMIT || 5),
      initWindowSec: Number(process.env.FORGOT_PASSWORD_INIT_WINDOW || 900),
      completeLimit: Number(process.env.FORGOT_PASSWORD_COMPLETE_LIMIT || 5),
      completeWindowSec: Number(process.env.FORGOT_PASSWORD_COMPLETE_WINDOW || 900),
    },
  },
  messaging: {
    rabbitmqUrl: process.env.RABBITMQ_URL!,
    queues: {
      postOffice: 'post-office',
      auth: 'auth',
    }
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  }
};

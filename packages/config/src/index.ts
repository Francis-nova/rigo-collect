import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';

const loadEnv = () => ({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  BANKING_PROVIDER: process.env.BANKING_PROVIDER || 'mock',
  SMTP_HOST: process.env.SMTP_HOST || '127.0.0.1',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
  SMTP_SECURE: ['true', '1', 'yes', 'on'].includes(String(process.env.SMTP_SECURE ?? '').toLowerCase()),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@rigo-collect.com'
  ,
  POSTOFFICE_MAX_RETRIES: parseInt(process.env.POSTOFFICE_MAX_RETRIES || '5', 10)
});

@Global()
@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [loadEnv] })],
  providers: [],
  exports: [NestConfigModule]
})
export class ConfigModule { }

export { ConfigService };

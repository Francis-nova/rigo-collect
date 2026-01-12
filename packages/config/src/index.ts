import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';

const loadEnv = () => ({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  BANKING_PROVIDER: process.env.BANKING_PROVIDER || 'mock'
});

@Global()
@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [loadEnv] })],
  providers: [],
  exports: [NestConfigModule]
})
export class ConfigModule {}

export { ConfigService };

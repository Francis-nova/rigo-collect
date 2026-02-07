import { Module } from '@nestjs/common';
import { ConfigModule } from '@pkg/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AUTH_SERVICE, PAYMENTS_SERVICE } from '@pkg/common';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')!],
            queue: 'auth',
            queueOptions: { durable: true }
          }
        })
      },
      {
        name: PAYMENTS_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')!],
            queue: 'payments',
            queueOptions: { durable: true }
          }
        })
      }
    ])
  ],
  controllers: [HealthController]
})
export class AppModule {}

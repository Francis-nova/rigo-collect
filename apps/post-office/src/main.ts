import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const rabbitUrl = config.get<string>('RABBITMQ_URL')!;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: { urls: [rabbitUrl], queue: 'post-office', queueOptions: { durable: true } }
  });

  await app.startAllMicroservices();
  const port = 3003;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`post-office service listening (http:${port}, rmq:post-office)`);
}

bootstrap();

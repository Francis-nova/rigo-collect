import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// HTTP health check is handled by HealthController registered in AppModule
import indexConfig from './configs/index.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@pkg/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn']);

  const rabbitUrl = indexConfig.messaging.rabbitmqUrl;

  // Enable CORS
  app.enableCors({
    origin: indexConfig.corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix(indexConfig.apiPrefix);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: { urls: [rabbitUrl], queue: indexConfig.messaging.queues.payments, queueOptions: { durable: true } }
  });

  await app.startAllMicroservices();
  
  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payments Service API')
    .setDescription('Payments, virtual accounts, and payouts')
    .setVersion('0.1.0')
    .addServer(indexConfig.apiServerPrefix)
    .addBearerAuth({ type: 'http', scheme: 'bearer' })
    .build();

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig, { extraModels: [] });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  const port = indexConfig.port;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`payments service listening (http:${port}, rmq:payments)`);
}

bootstrap()
    .then(() => {
        const port = indexConfig.port ?? 3001;
        console.log(`
      --------------
      | Application is running on: http://localhost:${port}
      | Swagger documentation is available at: http://localhost:${port}/docs
      --------------
    `);
    })
    .catch((err) => {
        console.error('Error starting application:', err);
    });


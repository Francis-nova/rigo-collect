import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@pkg/common';
import indexConfig from './configs/index.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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
        options: {
            urls: [rabbitUrl],
            queue: 'auth',
            queueOptions: { durable: true },
        }
    });

    await app.startAllMicroservices();

    // Optional HTTP listener for admin endpoints later

    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('Merchant onboarding and API key management')
        .setVersion('0.1.0')
        .addServer(indexConfig.apiServerPrefix)
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
        })
        .build();

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        extraModels: [],
    });
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    const port = indexConfig.port ?? 3001;
    await app.listen(port);
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

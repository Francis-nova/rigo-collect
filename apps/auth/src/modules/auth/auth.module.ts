import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { VerificationCode } from '../../entities/verification-code.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@pkg/config';
import { POSTOFFICE_SERVICE } from '@pkg/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessToken } from '../../entities/access-token.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { PassportModule } from '@nestjs/passport';
import { BusinessModule } from '../business/business.module';
import { JwtStrategy } from './jwt.strategy';
import { redisProvider } from '../../providers/redis.provider';
import indexConfig from '../../configs/index.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Role, User, VerificationCode, AccessToken, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: indexConfig.auth.jwtSecret,
      signOptions: { expiresIn: indexConfig.auth.jwtExpiresIn }
    }),
    ClientsModule.register([
      {
        name: POSTOFFICE_SERVICE,
        transport: Transport.RMQ,
        options: { urls: [indexConfig.messaging.rabbitmqUrl], queue: indexConfig.messaging.queues.postOffice, queueOptions: { durable: true } }
      }
    ]),
    BusinessModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, redisProvider],
  exports: [AuthService],
})
export class AuthModule {}

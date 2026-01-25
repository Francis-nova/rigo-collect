import { Module } from '@nestjs/common';
import { InternalValidationController } from './internal.validation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessToken } from '../../entities/access-token.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { VerificationCode } from '../../entities/verification-code.entity';
import { Business } from '../../entities/business.entity';

@Module({
  controllers: [InternalValidationController],
  imports: [
    TypeOrmModule.forFeature([Role, User, Business, VerificationCode, AccessToken, RefreshToken]),
  ],
})
export class InternalModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../../entities/business.entity';
import { BusinessUser } from '../../entities/business-user.entity';
import { BusinessInvite } from '../../entities/business-invite.entity';
import { PersonKyc } from '../../entities/person-kyc.entity';
import { Director } from '../../entities/director.entity';
import { Document } from '../../entities/document.entity';
import { Industry } from '../../entities/industry.entity';
import { User } from '../../entities/user.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { KycService } from './kyc.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { POSTOFFICE_SERVICE } from '@pkg/common';
import indexConfig from '../../configs/index.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessUser, BusinessInvite, PersonKyc, Director, Document, AuditLog, Industry, User]),
    ClientsModule.register([
      {
        name: POSTOFFICE_SERVICE,
        transport: Transport.RMQ,
        options: { urls: [indexConfig.messaging.rabbitmqUrl], queue: indexConfig.messaging.queues.postOffice, queueOptions: { durable: true } }
      }
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, KycService],
  exports: [BusinessService, KycService],
})
export class BusinessModule {}

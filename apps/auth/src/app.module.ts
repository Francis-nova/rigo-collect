import { Module } from '@nestjs/common';
import { ConfigModule } from '@pkg/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { Role } from './entities/role.entity';
import { Industry } from './entities/industry.entity';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { User } from './entities/user.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { AccessToken } from './entities/access-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { POSTOFFICE_SERVICE } from '@pkg/common';
import indexConfig from './configs/index.config';
import { BusinessModule } from './modules/business/business.module';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { ProfileModule } from './modules/profile/profile.module';
import { InternalModule } from './modules/internal/internal.module';
import { RolesSeeder } from './seeds/roles.seeder';
import { IndustriesSeeder } from './seeds/industries.seeder';
import { CountriesSeeder } from './seeds/countries.seeder';
// Redis provider is registered within feature modules to limit scope

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot(indexConfig.database),
    TypeOrmModule.forFeature([Role, User, VerificationCode, AccessToken, RefreshToken, Industry, Country, State]),
    ClientsModule.register([
      {
        name: POSTOFFICE_SERVICE,
        transport: Transport.RMQ,
        options: { urls: [indexConfig.messaging.rabbitmqUrl], queue: indexConfig.messaging.queues.postOffice, queueOptions: { durable: true } }
      }
    ]),
    AuthModule,
    BusinessModule,
    UtilitiesModule,
    ProfileModule,
    InternalModule,
  ],
  controllers: [],
  providers: [RolesSeeder, IndustriesSeeder, CountriesSeeder],
})
export class AppModule {}

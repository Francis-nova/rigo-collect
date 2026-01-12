import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesService } from './utilities.service';
import { UtilitiesController } from './utilities.controller';
import { ConfigModule } from '@pkg/config';
import { Industry } from '../../entities/industry.entity';
import { Country } from '../../entities/country.entity';
import { State } from '../../entities/state.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Industry, Country, State])],
  controllers: [UtilitiesController],
  providers: [UtilitiesService],
  exports: [UtilitiesService],
})
export class UtilitiesModule {}

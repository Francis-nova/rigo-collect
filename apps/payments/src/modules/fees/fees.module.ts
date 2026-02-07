import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayinFeeConfig } from '../../entities/payin-fee-config.entity';
import { PayinFeeService } from './payin-fee.service';

@Module({
  imports: [TypeOrmModule.forFeature([PayinFeeConfig])],
  providers: [PayinFeeService],
  exports: [PayinFeeService],
})
export class FeesModule {}

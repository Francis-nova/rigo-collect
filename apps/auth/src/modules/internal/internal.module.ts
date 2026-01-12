import { Module } from '@nestjs/common';
import { InternalValidationController } from './internal.validation.controller';

@Module({
  controllers: [InternalValidationController],
})
export class InternalModule {}

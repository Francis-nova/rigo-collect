import { Module } from '@nestjs/common';
import { ConfigModule } from '@pkg/config';
import { PostOfficeController } from './post-office.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PostOfficeController]
})
export class AppModule {}

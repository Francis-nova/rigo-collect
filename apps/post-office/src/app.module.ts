import { Module } from '@nestjs/common';
import { ConfigModule } from '@pkg/config';
import { PostOfficeController } from './post-office.controller';
import { MailerService } from './mailer.service';
import { TemplatesService } from './templates/templates.service';
import { RabbitSetupService } from './rabbit-setup.service';

@Module({
  imports: [ConfigModule],
  controllers: [PostOfficeController],
  providers: [MailerService, TemplatesService, RabbitSetupService]
})
export class AppModule {}

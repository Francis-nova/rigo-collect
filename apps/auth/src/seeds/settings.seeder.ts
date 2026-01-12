import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
import indexConfig from '../configs/index.config';

@Injectable()
export class SettingsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SettingsSeeder.name);

  constructor(
    @InjectRepository(Setting) private readonly settingRepo: Repository<Setting>,
  ) {}

  async onApplicationBootstrap() {
    const keyName = 'INTERNAL_API_KEY';
    const envValue = indexConfig.auth.internalApiKey;

    try {
      const existing = await this.settingRepo.findOne({ where: { key: keyName } });
      if (!existing && envValue) {
        const entity = this.settingRepo.create({ key: keyName, value: envValue });
        await this.settingRepo.save(entity);
        this.logger.log('Seeded INTERNAL_API_KEY from env into settings');
      }
    } catch (err: any) {
      this.logger.error('Failed to seed INTERNAL_API_KEY', err?.stack || err);
    }
  }
}

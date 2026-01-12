import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../entities/industry.entity';

@Injectable()
export class IndustriesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(IndustriesSeeder.name);

  constructor(
    @InjectRepository(Industry) private readonly industryRepo: Repository<Industry>,
  ) {}

  async onApplicationBootstrap() {
    const seeds: Array<{ name: string; code: string }> = [
      { name: 'Financial Services', code: 'FIN_SERV' },
      { name: 'E-commerce', code: 'ECOM' },
      { name: 'Logistics', code: 'LOGISTICS' },
      { name: 'Healthcare', code: 'HEALTH' },
      { name: 'Education', code: 'EDU' },
      { name: 'Hospitality', code: 'HOSP' },
      { name: 'Manufacturing', code: 'MANUF' },
      { name: 'Agriculture', code: 'AGRI' },
      { name: 'Telecommunications', code: 'TELCO' },
      { name: 'Energy', code: 'ENERGY' },
    ];

    try {
      for (const s of seeds) {
        const existing = await this.industryRepo.findOne({ where: { code: s.code } });
        if (!existing) {
          const entity = this.industryRepo.create(s);
          await this.industryRepo.save(entity);
          this.logger.log(`Seeded industry: ${s.name}`);
        }
      }
    } catch (err: any) {
      this.logger.error('Failed to seed industries', err?.stack || err);
    }
  }
}

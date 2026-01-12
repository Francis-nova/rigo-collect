import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    const roles = [
      { name: 'OWNER', desc: 'Business owner with full permissions' },
      { name: 'FINANCE', desc: 'Finance/operations role for payouts and reconciliation' },
      { name: 'DEVELOPER', desc: 'Developer role for API keys and integrations' },
    ];

    try {
      for (const r of roles) {
        const existing = await this.roleRepo.findOne({ where: { name: r.name } });
        if (!existing) {
          const entity = this.roleRepo.create(r);
          await this.roleRepo.save(entity);
          this.logger.log(`Seeded role: ${r.name}`);
        }
      }
    } catch (err: any) {
      this.logger.error('Failed to seed roles', err?.stack || err);
    }
  }
}

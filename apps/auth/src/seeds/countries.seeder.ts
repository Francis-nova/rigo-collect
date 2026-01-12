import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';

@Injectable()
export class CountriesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CountriesSeeder.name);

  constructor(
    @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
    @InjectRepository(State) private readonly stateRepo: Repository<State>,
  ) {}

  async onApplicationBootstrap() {
    const seeds: Array<{ name: string; code: string; states: Array<{ name: string; code?: string }> }> = [
      { name: 'United States', code: 'US', states: [
        { name: 'California', code: 'CA' },
        { name: 'New York', code: 'NY' },
        { name: 'Texas', code: 'TX' },
      ] },
      { name: 'Canada', code: 'CA', states: [
        { name: 'Ontario', code: 'ON' },
        { name: 'Quebec', code: 'QC' },
        { name: 'British Columbia', code: 'BC' },
      ] },
      { name: 'Nigeria', code: 'NG', states: [
        { name: 'Lagos' },
        { name: 'FCT Abuja' },
        { name: 'Rivers' },
      ] },
      { name: 'United Kingdom', code: 'UK', states: [
        { name: 'England' },
        { name: 'Scotland' },
        { name: 'Wales' },
        { name: 'Northern Ireland' },
      ] },
    ];

    try {
      for (const c of seeds) {
        let country = await this.countryRepo.findOne({ where: { code: c.code } });
        if (!country) {
          country = this.countryRepo.create({ name: c.name, code: c.code });
          country = await this.countryRepo.save(country);
          this.logger.log(`Seeded country: ${c.name}`);
        }

        for (const s of c.states) {
          const existingState = await this.stateRepo.findOne({ where: { name: s.name, countryId: country.id } });
          if (!existingState) {
            const state = this.stateRepo.create({ name: s.name, code: s.code, countryId: country.id, country });
            await this.stateRepo.save(state);
            this.logger.log(`  • Seeded state: ${s.name} (${country.name})`);
          }
        }
      }
    } catch (err: any) {
      this.logger.error('Failed to seed countries and states', err?.stack || err);
    }
  }
}

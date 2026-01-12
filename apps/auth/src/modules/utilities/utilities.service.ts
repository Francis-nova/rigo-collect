import { Injectable } from '@nestjs/common';
import { createStorageProvider, StorageConfig, UploadInput, UploadResult } from '@pkg/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../../entities/industry.entity';
import { Country } from '../../entities/country.entity';
import { State } from '../../entities/state.entity';
import indexConfig from '../../configs/index.config';

@Injectable()
export class UtilitiesService {
  constructor(
    @InjectRepository(Industry) private readonly industryRepo: Repository<Industry>,
    @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
    @InjectRepository(State) private readonly stateRepo: Repository<State>,
  ) {}

  private buildConfig(provider: 'cloudinary' | 's3'): StorageConfig {
    if (provider === 'cloudinary') {
      return {
        provider: 'cloudinary',
        cloudName: indexConfig.storage.cloudinary.cloudName!,
        apiKey: indexConfig.storage.cloudinary.apiKey!,
        apiSecret: indexConfig.storage.cloudinary.apiSecret!,
        folderDefault: indexConfig.storage.cloudinary.folderDefault,
      };
    }
    return {
      provider: 's3',
      region: indexConfig.storage.s3.region!,
      bucket: indexConfig.storage.s3.bucket!,
      accessKeyId: indexConfig.storage.s3.accessKeyId!,
      secretAccessKey: indexConfig.storage.s3.secretAccessKey!,
      endpoint: indexConfig.storage.s3.endpoint,
      forcePathStyle: indexConfig.storage.s3.forcePathStyle,
      publicBaseUrl: indexConfig.storage.s3.publicBaseUrl,
    };
  }

  async upload(provider: 'cloudinary' | 's3', input: UploadInput): Promise<UploadResult> {
    const cfg = this.buildConfig(provider);
    const storage = createStorageProvider(cfg);
    return storage.upload(input);
  }

  async listIndustries() {
    return this.industryRepo.find({ order: { name: 'ASC' } });
  }

  async listCountries() {
    return this.countryRepo.find({ order: { name: 'ASC' } });
  }

  async listStatesByCountry(countryId: string) {
    return this.stateRepo.find({ where: { countryId }, order: { name: 'ASC' } });
  }
}

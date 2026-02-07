import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { ApiKey, ApiKeyEnvironment } from '../../entities/api-key.entity';
import { BusinessService } from '../business/business.service';
import indexConfig from '../../configs/index.config';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey) private readonly apiKeyRepo: Repository<ApiKey>,
    private readonly businessService: BusinessService,
  ) {}

  async rotate(userId: string, businessId: string, environment: ApiKeyEnvironment = 'production') {
    const membership = await this.businessService.getUserMembership(userId, businessId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new Error('You do not have access to this business');
    }
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new Error('Only business owners or admins can manage API keys');
    }

    const business = await this.businessService.getBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const now = new Date();
    await this.apiKeyRepo.update({ businessId, environment, isActive: true }, { isActive: false, revokedAt: now });

    const apiKey = this.generateKey(environment);
    const lastFour = apiKey.slice(-8);
    const keyHash = this.hashKey(apiKey);

    const record = this.apiKeyRepo.create({ businessId, environment, keyHash, lastFour, isActive: true });
    await this.apiKeyRepo.save(record);

    return { apiKey, environment: record.environment, lastFour: record.lastFour };
  }

  async list(userId: string, businessId: string) {
    const membership = await this.businessService.getUserMembership(userId, businessId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new Error('You do not have access to this business');
    }
    const keys = await this.apiKeyRepo.find({ where: { businessId }, order: { createdAt: 'DESC' } });
    return keys.map(k => ({
      id: k.id,
      environment: k.environment,
      lastFour: k.lastFour,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      revokedAt: k.revokedAt,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));
  }

  async validateApiKey(apiKey?: string) {
    if (!apiKey) return { valid: false };
    const keyHash = this.hashKey(apiKey);
    const record = await this.apiKeyRepo.findOne({ where: { keyHash, isActive: true, revokedAt: IsNull() } });
    if (!record) return { valid: false };

    record.lastUsedAt = new Date();
    await this.apiKeyRepo.save(record);

    return { valid: true, merchantId: record.businessId, environment: record.environment, lastFour: record.lastFour };
  }

  private generateKey(environment: ApiKeyEnvironment) {
    const prefix = environment === 'production' ? 'rk_live_' : 'rk_test_';
    const suffix = randomBytes(24).toString('hex');
    return `${prefix}${suffix}`;
  }

  private hashKey(apiKey: string) {
    const pepper = indexConfig.auth.apiKeyPepper || '';
    return createHash('sha256').update(`${apiKey}${pepper}`).digest('hex');
  }
}

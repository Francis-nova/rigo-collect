import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

type CacheEntry = { value: string | null; expiresAt: number };

@Injectable()
export class SettingsService {
  private cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 60_000; // 60s cache

  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>,
  ) {}

  async get(key: string): Promise<string | null> {
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const row = await this.repo.findOne({ where: { key } });
    const value = row?.value ?? null;
    this.cache.set(key, { value, expiresAt: now + this.ttlMs });
    return value;
  }

  async getAll(keys: string[]): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};
    await Promise.all(keys.map(async (k) => { result[k] = await this.get(k); }));
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

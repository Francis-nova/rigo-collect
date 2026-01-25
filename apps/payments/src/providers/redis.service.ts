import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const tls = process.env.REDIS_TLS === 'true' ? {} : undefined;
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: tls as any,
    });

    this.client.on('error', (err) => this.logger.error('Redis error', err as any));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy() {
    try { await this.client.quit(); } catch { /* ignore */ }
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async setLock(key: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, '1', 'EX', ttlSeconds);
  }

  async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ttlSeconds(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // Key helpers
  attemptsKey(businessId: string, userId: string): string {
    return `payout:pin:fail:${businessId}:${userId}`;
  }

  lockKey(businessId: string, userId: string): string {
    return `payout:lock:${businessId}:${userId}`;
  }
}

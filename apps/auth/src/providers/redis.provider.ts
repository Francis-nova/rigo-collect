import { FactoryProvider } from '@nestjs/common';
import indexConfig from '../configs/index.config';
import Redis from 'ioredis';

export const REDIS = 'REDIS';

export const redisProvider: FactoryProvider = {
  provide: REDIS,
  useFactory: () => {
    const url = indexConfig.redis.url;
    return new Redis(url);
  },
};

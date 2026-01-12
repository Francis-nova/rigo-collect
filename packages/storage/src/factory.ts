import { CloudinaryProvider } from './providers/cloudinary';
import { S3Provider } from './providers/s3';
import type { StorageConfig, StorageProvider } from './types';

export function createStorageProvider(config: StorageConfig): StorageProvider {
  if (config.provider === 'cloudinary') {
    return new CloudinaryProvider(config);
  }
  if (config.provider === 's3') {
    return new S3Provider(config);
  }
  throw new Error(`Unsupported storage provider: ${(config as any).provider}`);
}

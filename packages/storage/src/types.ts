export type ProviderType = 'cloudinary' | 's3';

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  folder?: string; // logical folder/category
  acl?: 'private' | 'public-read';
  metadata?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  key: string;
  provider: ProviderType;
  size?: number;
  mimeType?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folderDefault?: string;
}

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // optional for custom S3-compatible
  forcePathStyle?: boolean;
  publicBaseUrl?: string; // optional CDN/public base
}

export type StorageConfig =
  | ({ provider: 'cloudinary' } & CloudinaryConfig)
  | ({ provider: 's3' } & S3Config);

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
}

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type { S3Config, StorageProvider, UploadInput, UploadResult } from '../types';

export class S3Provider implements StorageProvider {
  private readonly client: S3Client;
  constructor(private readonly config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    });
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const keyPrefix = input.folder ? `${input.folder}/` : '';
    const key = `${keyPrefix}${Date.now()}-${randomUUID()}-${input.filename}`;

    const put = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: input.buffer,
      ContentType: input.mimeType,
      ACL: input.acl === 'public-read' ? 'public-read' : undefined,
      Metadata: input.metadata,
    });

    await this.client.send(put);

    // Determine URL: use publicBaseUrl if provided, else presigned as fallback
    let url: string;
    if (this.config.publicBaseUrl && input.acl === 'public-read') {
      const base = this.config.publicBaseUrl.replace(/\/$/, '');
      url = `${base}/${key}`;
    } else {
      url = await getSignedUrl(this.client, put, { expiresIn: 60 });
    }

    return { url, key, provider: 's3', size: input.buffer.length, mimeType: input.mimeType };
  }
}

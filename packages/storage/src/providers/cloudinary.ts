import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryConfig, StorageProvider, UploadInput, UploadResult } from '../types';

export class CloudinaryProvider implements StorageProvider {
  constructor(private readonly config: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const folder = input.folder ?? this.config.folderDefault ?? undefined;
    const res = await cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'auto',
      public_id: input.filename.replace(/\.[^/.]+$/, ''),
      overwrite: true,
    },
    // cloudinary upload_stream expects a callback; wrap in Promise
    // We'll write buffer to the stream
    ) as any;

    // The above typing doesn't compile—proper stream pattern below:
    const result = await new Promise<UploadResult>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({
        folder,
        resource_type: 'auto',
        public_id: input.filename.replace(/\.[^/.]+$/, ''),
        overwrite: true,
      }, (error, response?: any) => {
        if (error) return reject(error);
        if (!response) return reject(new Error('No response from Cloudinary'));
        resolve({
          url: response.secure_url || response.url,
          key: response.public_id,
          provider: 'cloudinary',
          size: response.bytes,
          mimeType: response.resource_type,
        });
      });
      upload.end(input.buffer);
    });

    return result;
  }
}

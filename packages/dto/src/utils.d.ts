export declare enum UploadProvider {
    cloudinary = "cloudinary",
    s3 = "s3"
}
export declare class UploadFileDto {
    provider: UploadProvider;
    folder?: string;
    acl?: 'private' | 'public-read';
}

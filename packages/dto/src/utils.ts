import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum UploadProvider {
  cloudinary = 'cloudinary',
  s3 = 's3',
}

export class UploadFileDto {
  @IsEnum(UploadProvider)
  @ApiProperty({ enum: UploadProvider })
  provider!: UploadProvider;

  @IsOptional() @IsString()
  @ApiProperty({ required: false, example: 'kyc/user-123' })
  folder?: string;

  @IsOptional() @IsString()
  @ApiProperty({ required: false, example: 'public-read' })
  acl?: 'private' | 'public-read';
}

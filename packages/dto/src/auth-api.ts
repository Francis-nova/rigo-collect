import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class IssueApiKeyDto {
  @ApiProperty({ description: 'Merchant ID to issue key for' })
  @IsUUID()
  merchantId!: string;
}

export class ApiKeyIssueResponseDto {
  @ApiProperty({ description: 'API key (returned once)', example: 'live_xxx' })
  apiKey!: string;
  @ApiProperty({ description: 'Server key record id' })
  id!: string;
  @ApiProperty({ description: 'Prefix used for lookups' })
  prefix!: string;
}

export class MerchantResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty({ required: false, nullable: true })
  website?: string | null;
  @ApiProperty()
  status!: string;
}

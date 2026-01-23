import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length, IsOptional } from 'class-validator';

export class CreateSubAccountDto {
  @ApiProperty({ example: 'Receiving Wallet' })
  @IsString()
  @Length(2, 50)
  accountName!: string;

  @ApiProperty({ example: '999', required: false })
  @IsString()
  @IsOptional()
  @Length(2, 16)
  bankCode?: string;

  @ApiProperty({ example: 'Mock Bank', required: false })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  bankName?: string;

  @ApiProperty({ example: 'uuid-of-currency' })
  @IsUUID()
  currencyId!: string;

  @ApiProperty({ example: 'NGN', required: false })
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  providerOverride?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

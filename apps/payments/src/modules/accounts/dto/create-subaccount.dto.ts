import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length, IsOptional } from 'class-validator';

export class CreateSubAccountDto {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(5, 32)
  accountNumber!: string;

  @ApiProperty({ example: 'Receiving Wallet' })
  @IsString()
  @Length(2, 50)
  accountName!: string;

  @ApiProperty({ example: '999' })
  @IsString()
  @Length(2, 16)
  bankCode!: string;

  @ApiProperty({ example: 'Mock Bank' })
  @IsString()
  @Length(2, 50)
  bankName!: string;

  @ApiProperty({ example: 'uuid-of-currency' })
  @IsUUID()
  currencyId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

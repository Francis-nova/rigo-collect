import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsUUID, IsString, IsOptional } from 'class-validator';

export class PayoutDestinationDto {
  @ApiProperty({ example: '0050883605' })
  @IsString()
  @IsDefined()
  accountNumber!: string;

  @ApiProperty({ example: '000013' })
  @IsString()
  @IsDefined()
  bankCode!: string;

  @ApiProperty({ example: 'GUARANTY TRUST BANK' })
  @IsString()
  @IsDefined()
  bankName!: string;

  @ApiProperty({ example: 'OYENIYI TOLULOPE OYEBIYI' })
  @IsString()
  @IsDefined()
  accountName!: string;
}

export class PayoutDto {
  @ApiProperty({ example: 'uuid', description: 'Account ID to payout from' })
  @IsDefined()
  @IsUUID()
  accountId!: string;

  @ApiProperty({ example: 100000 })
  @IsDefined()
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsString()
  @IsOptional()
  narration?: string;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  @IsDefined()
  currency!: string;

  @ApiProperty({ example: 1234, required: false })
  @IsNumber()
  @IsOptional()
  pin?: number;

  @ApiProperty({ example: { accountNumber: '0050883605', bankCode: '000013', bankName: 'GUARANTY TRUST BANK', accountName: 'OYENIYI TOLULOPE OYEBIYI' } })
  @IsDefined()
  destination!: PayoutDestinationDto;
}
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVirtualAccountDto {
  @ApiProperty({ example: 'biz_12345' })
  @IsNotEmpty() @IsString() merchantId!: string;

  @ApiProperty({ example: 'NGN' })
  @IsNotEmpty() @IsString() currency!: string;

  @ApiProperty({ example: 'BUDPAY', required: false })
  @IsOptional() @IsString() providerOverride?: string;
}

export class PayoutDto {
  @ApiProperty({ example: 'biz_12345' })
  @IsNotEmpty() @IsString() merchantId!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber() amount!: number;

  @ApiProperty({ example: 'NGN' })
  @IsNotEmpty() @IsString() currency!: string;

  @ApiProperty({ example: '0050883605' })
  @IsNotEmpty() @IsString() destinationAccountNumber!: string;

  @ApiProperty({ example: '000013' })
  @IsNotEmpty() @IsString() destinationBankCode!: string;

  @ApiProperty({ example: 'Vendor payment for invoice #1024', required: false })
  @IsOptional() @IsString() narration?: string;

  @ApiProperty({ example: '4d2a1f08-b934-4ce5-8a6d-7b1f1d9a2c33' })
  @IsNotEmpty() @IsString() idempotencyKey!: string;

  @ApiProperty({ example: 'BUDPAY', required: false })
  @IsOptional() @IsString() providerOverride?: string;
}
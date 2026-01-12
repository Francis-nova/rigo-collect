import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVirtualAccountDto {
  @IsNotEmpty() @IsString() merchantId!: string;
  @IsNotEmpty() @IsString() currency!: string;
}

export class PayoutDto {
  @IsNotEmpty() @IsString() merchantId!: string;
  @IsNumber() amount!: number;
  @IsNotEmpty() @IsString() currency!: string;
  @IsNotEmpty() @IsString() destinationAccountNumber!: string;
  @IsNotEmpty() @IsString() destinationBankCode!: string;
  @IsOptional() @IsString() narration?: string;
  @IsNotEmpty() @IsString() idempotencyKey!: string;
}
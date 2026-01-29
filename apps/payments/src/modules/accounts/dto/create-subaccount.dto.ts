import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

enum CurrencyCode {
  NGN = 'NGN',
}

export class CreateSubAccountDto {
  @ApiProperty({ description: 'The main account number of the business', example: '1523470522' })
  @IsString()
  @Length(10)
  accountNumber!: string;

  @ApiProperty({ description: 'Receiving account name', example: 'Eze Obinna' })
  @IsString()
  @Length(2, 50)
  accountName!: string;

  @ApiProperty({ description: 'Currency code', example: 'NGN', required: true })
  @IsString()
  @IsOptional()
  currency!: CurrencyCode;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ResolveAccountDto {
  @ApiProperty({ example: '0050883605' })
  @IsString()
  @Length(10, 12)
  accountNumber!: string;

  @ApiProperty({ example: '000013' })
  @IsString()
  @Length(2, 16)
  bankCode!: string;
}
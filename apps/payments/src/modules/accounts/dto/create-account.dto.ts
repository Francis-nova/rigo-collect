import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'NGN' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: true, example: 'Main Business Account' })
  @IsString()
  accountName?: string;
}
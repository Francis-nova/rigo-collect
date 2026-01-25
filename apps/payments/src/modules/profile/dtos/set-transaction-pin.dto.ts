import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class SetTransactionPinDto {
  @ApiProperty({ example: '1234', description: '4-digit transaction pin' })
  @IsString()
  @Length(4)
  @Matches(/^\d+$/)
  pin!: string;
}

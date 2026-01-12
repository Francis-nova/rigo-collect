import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ITransactionType, ITransactionAction } from '../../../entities/transactions.entity';

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID()
  accountId!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsUUID()
  currencyId!: string;

  @ApiProperty({ enum: ITransactionType })
  @IsEnum(ITransactionType)
  type!: ITransactionType;

  @ApiProperty({ enum: ITransactionAction, required: false })
  @IsEnum(ITransactionAction)
  @IsOptional()
  action?: ITransactionAction;

  @ApiProperty({ required: false })
  @IsOptional()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

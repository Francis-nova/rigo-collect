import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Length } from "class-validator/types/decorator/string/Length";

export class feeDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  amount!: number;
}
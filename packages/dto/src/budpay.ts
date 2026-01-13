import { IsNotEmpty, IsString } from "class-validator"

export class IBudCustomerCreateDto {

  @IsNotEmpty() @IsString()
  email!: string

  @IsNotEmpty() @IsString()
  firstName!: string

  @IsNotEmpty() @IsString()
  lastName!: string

  @IsNotEmpty() @IsString()
  phone!: string

  metadata?: Record<string, any>
}

export class IBudResp<T> {
  status!: boolean
  message!: string
  data!: T
}

export interface IBudCustomerCreateRespDto {
  email: string
  domain: string
  customer_code: string
  id: string
  created_at: string
  updated_at: string
}

export interface IBudBank {
  name: string
  id: number
  bank_code: string
  prefix: string
}

export interface IBudVirtualAccountResp {
  bank: IBudBank
  customer: IBudCustomerCreateRespDto
  account_name: string
  account_number: string
  currency: string
  status: string
  domain: string
  reference: string
  assignment: string
  id: number
  created_at: string
  updated_at: string
}
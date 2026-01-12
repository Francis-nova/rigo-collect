import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './business';

export enum IdType {
  NIN = 'NIN',
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
}

export class DirectorCreateDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'John' })
  firstName!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ example: '1985-03-21', description: 'YYYY-MM-DD' })
  dateOfBirth!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'NG', description: 'ISO country code' })
  nationality!: string;

  @IsOptional() @IsString()
  @ApiProperty({ example: '12345678901', required: false })
  bvn?: string;

  @IsNotEmpty() @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: '12 Marina Road, Lagos' })
  residentialAddress!: string;

  @IsNotEmpty() @IsEnum(IdType)
  @ApiProperty({ enum: IdType, example: IdType.NIN })
  idType!: IdType;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'A1234567' })
  idNumber!: string;

  @IsNotEmpty() @IsBoolean()
  @ApiProperty({ example: false })
  isPep!: boolean;

  @IsOptional() @IsString()
  @ApiProperty({ example: 'https://cdn.example.com/docs/id.png', required: false })
  idFileUrl?: string;
}

export class DirectorUpdateDto {
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiPropertyOptional({ example: '1985-03-21', description: 'YYYY-MM-DD' })
  dateOfBirth?: string;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: 'NG', description: 'ISO country code' })
  nationality?: string;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: '12345678901' })
  bvn?: string;
  @IsOptional() @IsEmail()
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  email?: string;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: '12 Marina Road, Lagos' })
  residentialAddress?: string;
  @IsOptional() @IsEnum(IdType)
  @ApiPropertyOptional({ enum: IdType, example: IdType.PASSPORT })
  idType?: IdType;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: 'A1234567' })
  idNumber?: string;
  @IsOptional() @IsBoolean()
  @ApiPropertyOptional({ example: false })
  isPep?: boolean;
  @IsOptional() @IsString()
  @ApiPropertyOptional({ example: 'https://cdn.example.com/docs/id.png' })
  idFileUrl?: string;
}

export enum DocumentType {
  CERTIFICATE_OF_INCORPORATION = 'CERTIFICATE_OF_INCORPORATION',
  MEMART = 'MEMART',
  CAC_STATUS_REPORT = 'CAC_STATUS_REPORT',
  TAX_IDENTIFICATION_NUMBER = 'TAX_IDENTIFICATION_NUMBER',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  BOARD_RESOLUTION = 'BOARD_RESOLUTION',
  DIRECTOR_ID = 'DIRECTOR_ID',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class DocumentCreateDto {
  @IsNotEmpty() @IsEnum(DocumentType)
  @ApiProperty({ enum: DocumentType })
  documentType!: DocumentType;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'https://cdn.example.com/docs/incorporation.pdf' })
  fileUrl!: string;

  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ example: '2020-05-30', required: false })
  issuedDate?: string;
}

export class DocumentStatusUpdateDto {
  @IsNotEmpty() @IsEnum(DocumentStatus)
  @ApiProperty({ enum: DocumentStatus })
  status!: DocumentStatus;

  @IsOptional() @IsString()
  @ApiProperty({ example: 'Verified via CAC portal', required: false })
  note?: string;
}

export class TinUpdateDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: '12345678-0001' })
  tinNumber!: string;
}

export class BusinessAddressUpdateDto {
  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  @ApiPropertyOptional({ type: AddressDto })
  registeredAddress?: AddressDto;

  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  @ApiPropertyOptional({ type: AddressDto })
  operatingAddress?: AddressDto;
}

export class ProofOfAddressCreateDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'https://cdn.example.com/docs/proof-of-address.pdf' })
  fileUrl!: string;

  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ example: '2024-01-10', required: false, description: 'YYYY-MM-DD' })
  issuedDate?: string;
}

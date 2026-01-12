import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export enum EntityType {
  LIMITED_LIABILITY = 'LIMITED_LIABILITY',
  SOLE_PROPRIETOR = 'SOLE_PROPRIETOR',
  PARTNERSHIP = 'PARTNERSHIP',
  PLC = 'PLC',
}

export enum BusinessTier {
  TIER_1 = "TIER_1",
  TIER_2 = "TIER_2",
  TIER_3 = "TIER_3",
}

export enum BusinessRiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum BusinessStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum BusinessKYC {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED"
}

export enum BusinessKycStage {
  ADDRESS_COLLECTED = "ADDRESS_COLLECTED",
  DIRECTORS_COLLECTED = "DIRECTORS_COLLECTED",
  DOCUMENTS_UPLOADED = "DOCUMENTS_UPLOADED",
  PROOF_OF_ADDRESS_UPLOADED = "PROOF_OF_ADDRESS_UPLOADED",
  REVIEW_IN_PROGRESS = "REVIEW_IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export class AddressDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: '12 Marina Road' })
  street!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Lagos' })
  city!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Lagos' })
  state!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'NG', description: 'ISO country code' })
  country!: string;
}

export class BusinessCreateDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Acme Holdings Limited' })
  legalName!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Acme' })
  tradingName!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'RC1234567' })
  registrationNumber!: string;

  @IsNotEmpty() @IsEnum(EntityType)
  @ApiProperty({ enum: EntityType, example: EntityType.LIMITED_LIABILITY })
  entityType!: EntityType;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ example: '2020-05-30', description: 'YYYY-MM-DD' })
  dateOfIncorporation!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'NG', description: 'ISO country code' })
  countryOfIncorporation!: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'uuid....' })
  industry!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'Payments processing and acquiring' })
  natureOfBusiness!: string;

  @IsNotEmpty() @IsUrl()
  @ApiProperty({ example: 'https://acme.example.com' })
  websiteUrl!: string;

  @IsNotEmpty() @IsEmail()
  @ApiProperty({ example: 'contact@acme.example.com' })
  email!: string;

  @IsNotEmpty() @IsString()
  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @ValidateNested() @Type(() => AddressDto)
  @ApiProperty({ type: AddressDto })
  registeredAddress!: AddressDto;

  @ValidateNested() @Type(() => AddressDto)
  @ApiProperty({ type: AddressDto })
  operatingAddress!: AddressDto;
}

export class InviteUserDto {
  @IsNotEmpty() @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsNotEmpty() @IsString() @IsIn(['ADMIN', 'FINANCE', 'VIEWER'])
  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'FINANCE', 'VIEWER'] })
  role!: 'ADMIN' | 'FINANCE' | 'VIEWER';
}

export class AcceptInviteDto {
  @IsNotEmpty() @IsString()
  @ApiProperty({ example: 'invite-id-uuid' })
  inviteId!: string;
}

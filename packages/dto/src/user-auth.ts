import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export enum UserTypeDto {
  user = 'user',
  admin = 'admin',
}

export class UserSignupDto {
  @ApiProperty()
  @IsNotEmpty() @IsString() firstName!: string;

  @ApiProperty()
  @IsNotEmpty() @IsString() lastName!: string;

  @ApiProperty()
  @IsEmail() email!: string;

  @ApiProperty({ description: 'Registered business name' })
  @IsNotEmpty() @IsString() businessName!: string;

  @ApiProperty({ description: 'Type of business (free text)' })
  @IsNotEmpty() @IsString() businessType!: string;

  @ApiProperty({ enum: UserTypeDto, default: UserTypeDto.user })
  @IsEnum(UserTypeDto)
  userType: UserTypeDto = UserTypeDto.user;
}

export class VerifyEmailDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ description: '6-digit OTP' }) @IsNotEmpty() @IsString() code!: string;
}

export class RequestPhoneOtpDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsPhoneNumber('NG') phone!: string; // Adjust region as needed
}

export class VerifyPhoneDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ description: '6-digit OTP' }) @IsNotEmpty() @IsString() code!: string;
}

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ required: false, nullable: true }) phone?: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() userType!: string;
}

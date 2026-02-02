import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class signinDto {
    @ApiProperty({
        description: 'Email address used to sign in',
        example: 'francis@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'Password used to sign in',
        example: 'P@ssw0rd123',
    })
    @IsNotEmpty()
    @IsString()
    password!: string;
}

export class signupDto {
    @IsNotEmpty() @IsString() @ApiProperty({
        description: 'First name of the user',
        example: 'Francis',
    }) firstName!: string;
    @IsNotEmpty() @IsString() @ApiProperty({
        description: 'Last name of the user',
        example: 'Deogra',
    }) lastName!: string;
    @IsNotEmpty() @IsEmail() @ApiProperty({
        description: 'Email address used to sign in',
        example: 'francis@example.com',
    }) email!: string;
    @IsNotEmpty() @IsString() @ApiProperty({
        description: 'Password used to sign in',
        example: 'P@ssw0rd123',
    }) password!: string;
    @IsNotEmpty() @IsString() @ApiProperty({
        description: 'Business name associated with the user',
        example: 'Francis Enterprises ltd',
    }) businessName!: string;
}

export class otpDto {
    @IsNotEmpty() @IsString() @ApiProperty({
        description: 'One-time password for verification',
        example: '123456',
    }) otp!: string;
}

export class RefreshDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Refresh token used to obtain a new access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refreshToken!: string;
}

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password', example: 'OldP@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    currentPassword!: string;

    @ApiProperty({ description: 'New password', example: 'NewP@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    newPassword!: string;

    @ApiProperty({ description: 'Retype new password', example: 'NewP@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    confirmPassword!: string;
}

export class ForgotPasswordInitDto {
    @ApiProperty({ description: 'Email address to reset password for', example: 'francis@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email!: string;
}

export class ForgotPasswordCompleteDto {
    @ApiProperty({ description: 'Email address to reset password for', example: 'francis@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({ description: 'OTP received via email', example: '123456' })
    @IsNotEmpty()
    @IsString()
    otp!: string;

    @ApiProperty({ description: 'New password', example: 'NewP@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    newPassword!: string;

    @ApiProperty({ description: 'Retype new password', example: 'NewP@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    confirmPassword!: string;
}


export class UserSigninResponseDto {
    @ApiProperty() token!: string;
    @ApiProperty() refreshToken!: string;
}

export class MerchantOnboardDto {
    @IsNotEmpty() @IsString() businessName!: string;
}

export class ApiKeyVerifyRequestDto {
    @IsNotEmpty() @IsString() apiKey!: string;
}

export class ApiKeyVerifyResponseDto {
    valid!: boolean;
    merchantId?: string;
}

export enum IBusinessTypes {
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
    PARTNERSHIP = 'PARTNERSHIP',
    CORPORATION = 'CORPORATION',
    LLC = 'LLC',
    NON_PROFIT = 'NON_PROFIT',
    COOPERATIVE = 'COOPERATIVE',
    FRANCHISE = 'FRANCHISE',
    OTHER = 'OTHER'
}

export class SwitchBusinessDto {
    @ApiProperty({ description: 'Business ID to switch into', example: 'uuid-of-business' })
    @IsNotEmpty()
    @IsString()
    businessId!: string;
}
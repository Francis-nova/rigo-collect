"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchBusinessDto = exports.IBusinessTypes = exports.ApiKeyVerifyResponseDto = exports.ApiKeyVerifyRequestDto = exports.MerchantOnboardDto = exports.UserSigninResponseDto = exports.ForgotPasswordCompleteDto = exports.ForgotPasswordInitDto = exports.ChangePasswordDto = exports.RefreshDto = exports.otpDto = exports.signupDto = exports.signinDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class signinDto {
}
exports.signinDto = signinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address used to sign in',
        example: 'francis@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], signinDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password used to sign in',
        example: 'P@ssw0rd123',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], signinDto.prototype, "password", void 0);
class signupDto {
}
exports.signupDto = signupDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Email address used to sign in',
        example: 'francis@example.com',
    }),
    __metadata("design:type", String)
], signupDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the user',
        example: 'Francis',
    }),
    __metadata("design:type", String)
], signupDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        description: 'Email address used to sign in',
        example: 'francis@example.com',
    }),
    __metadata("design:type", String)
], signupDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Password used to sign in',
        example: 'P@ssw0rd123',
    }),
    __metadata("design:type", String)
], signupDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Business name associated with the user',
        example: 'Francis Enterprises ltd',
    }),
    __metadata("design:type", String)
], signupDto.prototype, "businessName", void 0);
class otpDto {
}
exports.otpDto = otpDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'One-time password for verification',
        example: '123456',
    }),
    __metadata("design:type", String)
], otpDto.prototype, "otp", void 0);
class RefreshDto {
}
exports.RefreshDto = RefreshDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Refresh token used to obtain a new access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], RefreshDto.prototype, "refreshToken", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current password', example: 'OldP@ssw0rd123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New password', example: 'NewP@ssw0rd123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Retype new password', example: 'NewP@ssw0rd123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "confirmPassword", void 0);
class ForgotPasswordInitDto {
}
exports.ForgotPasswordInitDto = ForgotPasswordInitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address to reset password for', example: 'francis@example.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ForgotPasswordInitDto.prototype, "email", void 0);
class ForgotPasswordCompleteDto {
}
exports.ForgotPasswordCompleteDto = ForgotPasswordCompleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address to reset password for', example: 'francis@example.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ForgotPasswordCompleteDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OTP received via email', example: '123456' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForgotPasswordCompleteDto.prototype, "otp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New password', example: 'NewP@ssw0rd123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ForgotPasswordCompleteDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Retype new password', example: 'NewP@ssw0rd123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForgotPasswordCompleteDto.prototype, "confirmPassword", void 0);
class UserSigninResponseDto {
}
exports.UserSigninResponseDto = UserSigninResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSigninResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSigninResponseDto.prototype, "refreshToken", void 0);
class MerchantOnboardDto {
}
exports.MerchantOnboardDto = MerchantOnboardDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MerchantOnboardDto.prototype, "businessName", void 0);
class ApiKeyVerifyRequestDto {
}
exports.ApiKeyVerifyRequestDto = ApiKeyVerifyRequestDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApiKeyVerifyRequestDto.prototype, "apiKey", void 0);
class ApiKeyVerifyResponseDto {
}
exports.ApiKeyVerifyResponseDto = ApiKeyVerifyResponseDto;
var IBusinessTypes;
(function (IBusinessTypes) {
    IBusinessTypes["SOLE_PROPRIETORSHIP"] = "SOLE_PROPRIETORSHIP";
    IBusinessTypes["PARTNERSHIP"] = "PARTNERSHIP";
    IBusinessTypes["CORPORATION"] = "CORPORATION";
    IBusinessTypes["LLC"] = "LLC";
    IBusinessTypes["NON_PROFIT"] = "NON_PROFIT";
    IBusinessTypes["COOPERATIVE"] = "COOPERATIVE";
    IBusinessTypes["FRANCHISE"] = "FRANCHISE";
    IBusinessTypes["OTHER"] = "OTHER";
})(IBusinessTypes || (exports.IBusinessTypes = IBusinessTypes = {}));
class SwitchBusinessDto {
}
exports.SwitchBusinessDto = SwitchBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business ID to switch into', example: 'uuid-of-business' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SwitchBusinessDto.prototype, "businessId", void 0);
//# sourceMappingURL=auth.js.map
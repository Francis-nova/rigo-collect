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
exports.MerchantResponseDto = exports.ApiKeyIssueResponseDto = exports.IssueApiKeyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class IssueApiKeyDto {
}
exports.IssueApiKeyDto = IssueApiKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Merchant ID to issue key for' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], IssueApiKeyDto.prototype, "merchantId", void 0);
class ApiKeyIssueResponseDto {
}
exports.ApiKeyIssueResponseDto = ApiKeyIssueResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'API key (returned once)', example: 'live_xxx' }),
    __metadata("design:type", String)
], ApiKeyIssueResponseDto.prototype, "apiKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Server key record id' }),
    __metadata("design:type", String)
], ApiKeyIssueResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prefix used for lookups' }),
    __metadata("design:type", String)
], ApiKeyIssueResponseDto.prototype, "prefix", void 0);
class MerchantResponseDto {
}
exports.MerchantResponseDto = MerchantResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    __metadata("design:type", Object)
], MerchantResponseDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "status", void 0);
//# sourceMappingURL=auth-api.js.map
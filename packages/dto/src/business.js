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
exports.AcceptInviteDto = exports.InviteUserDto = exports.BusinessCreateDto = exports.AddressDto = exports.BusinessKycStage = exports.BusinessKYC = exports.BusinessStatus = exports.BusinessRiskLevel = exports.BusinessTier = exports.EntityType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var EntityType;
(function (EntityType) {
    EntityType["LIMITED_LIABILITY"] = "LIMITED_LIABILITY";
    EntityType["SOLE_PROPRIETOR"] = "SOLE_PROPRIETOR";
    EntityType["PARTNERSHIP"] = "PARTNERSHIP";
    EntityType["PLC"] = "PLC";
})(EntityType || (exports.EntityType = EntityType = {}));
var BusinessTier;
(function (BusinessTier) {
    BusinessTier["TIER_1"] = "TIER_1";
    BusinessTier["TIER_2"] = "TIER_2";
    BusinessTier["TIER_3"] = "TIER_3";
})(BusinessTier || (exports.BusinessTier = BusinessTier = {}));
var BusinessRiskLevel;
(function (BusinessRiskLevel) {
    BusinessRiskLevel["LOW"] = "LOW";
    BusinessRiskLevel["MEDIUM"] = "MEDIUM";
    BusinessRiskLevel["HIGH"] = "HIGH";
})(BusinessRiskLevel || (exports.BusinessRiskLevel = BusinessRiskLevel = {}));
var BusinessStatus;
(function (BusinessStatus) {
    BusinessStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    BusinessStatus["ACTIVE"] = "ACTIVE";
    BusinessStatus["SUSPENDED"] = "SUSPENDED";
})(BusinessStatus || (exports.BusinessStatus = BusinessStatus = {}));
var BusinessKYC;
(function (BusinessKYC) {
    BusinessKYC["PENDING"] = "PENDING";
    BusinessKYC["IN_REVIEW"] = "IN_REVIEW";
    BusinessKYC["APPROVED"] = "APPROVED";
    BusinessKYC["REJECTED"] = "REJECTED";
    BusinessKYC["SUSPENDED"] = "SUSPENDED";
})(BusinessKYC || (exports.BusinessKYC = BusinessKYC = {}));
var BusinessKycStage;
(function (BusinessKycStage) {
    BusinessKycStage["ADDRESS_COLLECTED"] = "ADDRESS_COLLECTED";
    BusinessKycStage["DIRECTORS_COLLECTED"] = "DIRECTORS_COLLECTED";
    BusinessKycStage["DOCUMENTS_UPLOADED"] = "DOCUMENTS_UPLOADED";
    BusinessKycStage["PROOF_OF_ADDRESS_UPLOADED"] = "PROOF_OF_ADDRESS_UPLOADED";
    BusinessKycStage["REVIEW_IN_PROGRESS"] = "REVIEW_IN_PROGRESS";
    BusinessKycStage["COMPLETED"] = "COMPLETED";
})(BusinessKycStage || (exports.BusinessKycStage = BusinessKycStage = {}));
class AddressDto {
}
exports.AddressDto = AddressDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '12 Marina Road' }),
    __metadata("design:type", String)
], AddressDto.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Lagos' }),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Lagos' }),
    __metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'NG', description: 'ISO country code' }),
    __metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
class BusinessCreateDto {
}
exports.BusinessCreateDto = BusinessCreateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Acme Holdings Limited' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "legalName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Acme' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "tradingName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'RC1234567' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "registrationNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(EntityType),
    (0, swagger_1.ApiProperty)({ enum: EntityType, example: EntityType.LIMITED_LIABILITY }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    (0, swagger_1.ApiProperty)({ example: '2020-05-30', description: 'YYYY-MM-DD' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "dateOfIncorporation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'NG', description: 'ISO country code' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "countryOfIncorporation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: 'uuid....' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Payments processing and acquiring' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "natureOfBusiness", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    (0, swagger_1.ApiProperty)({ example: 'https://acme.example.com' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "websiteUrl", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({ example: 'contact@acme.example.com' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    __metadata("design:type", String)
], BusinessCreateDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    (0, swagger_1.ApiProperty)({ type: AddressDto }),
    __metadata("design:type", AddressDto)
], BusinessCreateDto.prototype, "registeredAddress", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    (0, swagger_1.ApiProperty)({ type: AddressDto }),
    __metadata("design:type", AddressDto)
], BusinessCreateDto.prototype, "operatingAddress", void 0);
class InviteUserDto {
}
exports.InviteUserDto = InviteUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ADMIN', 'FINANCE', 'VIEWER']),
    (0, swagger_1.ApiProperty)({ example: 'ADMIN', enum: ['ADMIN', 'FINANCE', 'VIEWER'] }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "role", void 0);
class AcceptInviteDto {
}
exports.AcceptInviteDto = AcceptInviteDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'invite-id-uuid' }),
    __metadata("design:type", String)
], AcceptInviteDto.prototype, "inviteId", void 0);
//# sourceMappingURL=business.js.map
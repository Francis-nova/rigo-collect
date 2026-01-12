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
exports.ProofOfAddressCreateDto = exports.BusinessAddressUpdateDto = exports.TinUpdateDto = exports.DocumentStatusUpdateDto = exports.DocumentCreateDto = exports.DocumentStatus = exports.DocumentType = exports.DirectorUpdateDto = exports.DirectorCreateDto = exports.IdType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const business_1 = require("./business");
var IdType;
(function (IdType) {
    IdType["NIN"] = "NIN";
    IdType["PASSPORT"] = "PASSPORT";
    IdType["DRIVERS_LICENSE"] = "DRIVERS_LICENSE";
})(IdType || (exports.IdType = IdType = {}));
class DirectorCreateDto {
}
exports.DirectorCreateDto = DirectorCreateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    (0, swagger_1.ApiProperty)({ example: '1985-03-21', description: 'YYYY-MM-DD' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'NG', description: 'ISO country code' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '12345678901', required: false }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "bvn", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '12 Marina Road, Lagos' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "residentialAddress", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(IdType),
    (0, swagger_1.ApiProperty)({ enum: IdType, example: IdType.NIN }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "idType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'A1234567' }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "idNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], DirectorCreateDto.prototype, "isPep", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.example.com/docs/id.png', required: false }),
    __metadata("design:type", String)
], DirectorCreateDto.prototype, "idFileUrl", void 0);
class DirectorUpdateDto {
}
exports.DirectorUpdateDto = DirectorUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'John' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'Doe' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    (0, swagger_1.ApiPropertyOptional)({ example: '1985-03-21', description: 'YYYY-MM-DD' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'NG', description: 'ISO country code' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: '12345678901' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "bvn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: '+2348012345678' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: '12 Marina Road, Lagos' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "residentialAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(IdType),
    (0, swagger_1.ApiPropertyOptional)({ enum: IdType, example: IdType.PASSPORT }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "idType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'A1234567' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "idNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    __metadata("design:type", Boolean)
], DirectorUpdateDto.prototype, "isPep", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/docs/id.png' }),
    __metadata("design:type", String)
], DirectorUpdateDto.prototype, "idFileUrl", void 0);
var DocumentType;
(function (DocumentType) {
    DocumentType["CERTIFICATE_OF_INCORPORATION"] = "CERTIFICATE_OF_INCORPORATION";
    DocumentType["MEMART"] = "MEMART";
    DocumentType["CAC_STATUS_REPORT"] = "CAC_STATUS_REPORT";
    DocumentType["TAX_IDENTIFICATION_NUMBER"] = "TAX_IDENTIFICATION_NUMBER";
    DocumentType["PROOF_OF_ADDRESS"] = "PROOF_OF_ADDRESS";
    DocumentType["BOARD_RESOLUTION"] = "BOARD_RESOLUTION";
    DocumentType["DIRECTOR_ID"] = "DIRECTOR_ID";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["VERIFIED"] = "VERIFIED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
class DocumentCreateDto {
}
exports.DocumentCreateDto = DocumentCreateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(DocumentType),
    (0, swagger_1.ApiProperty)({ enum: DocumentType }),
    __metadata("design:type", String)
], DocumentCreateDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.example.com/docs/incorporation.pdf' }),
    __metadata("design:type", String)
], DocumentCreateDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    (0, swagger_1.ApiProperty)({ example: '2020-05-30', required: false }),
    __metadata("design:type", String)
], DocumentCreateDto.prototype, "issuedDate", void 0);
class DocumentStatusUpdateDto {
}
exports.DocumentStatusUpdateDto = DocumentStatusUpdateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(DocumentStatus),
    (0, swagger_1.ApiProperty)({ enum: DocumentStatus }),
    __metadata("design:type", String)
], DocumentStatusUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'Verified via CAC portal', required: false }),
    __metadata("design:type", String)
], DocumentStatusUpdateDto.prototype, "note", void 0);
class TinUpdateDto {
}
exports.TinUpdateDto = TinUpdateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: '12345678-0001' }),
    __metadata("design:type", String)
], TinUpdateDto.prototype, "tinNumber", void 0);
class BusinessAddressUpdateDto {
}
exports.BusinessAddressUpdateDto = BusinessAddressUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => business_1.AddressDto),
    (0, swagger_1.ApiPropertyOptional)({ type: business_1.AddressDto }),
    __metadata("design:type", business_1.AddressDto)
], BusinessAddressUpdateDto.prototype, "registeredAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => business_1.AddressDto),
    (0, swagger_1.ApiPropertyOptional)({ type: business_1.AddressDto }),
    __metadata("design:type", business_1.AddressDto)
], BusinessAddressUpdateDto.prototype, "operatingAddress", void 0);
class ProofOfAddressCreateDto {
}
exports.ProofOfAddressCreateDto = ProofOfAddressCreateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.example.com/docs/proof-of-address.pdf' }),
    __metadata("design:type", String)
], ProofOfAddressCreateDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    (0, swagger_1.ApiProperty)({ example: '2024-01-10', required: false, description: 'YYYY-MM-DD' }),
    __metadata("design:type", String)
], ProofOfAddressCreateDto.prototype, "issuedDate", void 0);
//# sourceMappingURL=kyc.js.map
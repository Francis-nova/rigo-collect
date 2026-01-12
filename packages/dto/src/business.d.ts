export declare enum EntityType {
    LIMITED_LIABILITY = "LIMITED_LIABILITY",
    SOLE_PROPRIETOR = "SOLE_PROPRIETOR",
    PARTNERSHIP = "PARTNERSHIP",
    PLC = "PLC"
}
export declare enum BusinessTier {
    TIER_1 = "TIER_1",
    TIER_2 = "TIER_2",
    TIER_3 = "TIER_3"
}
export declare enum BusinessRiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export declare enum BusinessStatus {
    PENDING_APPROVAL = "PENDING_APPROVAL",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum BusinessKYC {
    PENDING = "PENDING",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare enum BusinessKycStage {
    ADDRESS_COLLECTED = "ADDRESS_COLLECTED",
    DIRECTORS_COLLECTED = "DIRECTORS_COLLECTED",
    DOCUMENTS_UPLOADED = "DOCUMENTS_UPLOADED",
    PROOF_OF_ADDRESS_UPLOADED = "PROOF_OF_ADDRESS_UPLOADED",
    REVIEW_IN_PROGRESS = "REVIEW_IN_PROGRESS",
    COMPLETED = "COMPLETED"
}
export declare class AddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
}
export declare class BusinessCreateDto {
    legalName: string;
    tradingName: string;
    registrationNumber: string;
    entityType: EntityType;
    dateOfIncorporation: string;
    countryOfIncorporation: string;
    industry: string;
    natureOfBusiness: string;
    websiteUrl: string;
    email: string;
    phone: string;
    registeredAddress: AddressDto;
    operatingAddress: AddressDto;
}
export declare class InviteUserDto {
    email: string;
    role: 'ADMIN' | 'FINANCE' | 'VIEWER';
}
export declare class AcceptInviteDto {
    inviteId: string;
}

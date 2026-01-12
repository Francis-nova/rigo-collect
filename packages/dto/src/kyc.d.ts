import { AddressDto } from './business';
export declare enum IdType {
    NIN = "NIN",
    PASSPORT = "PASSPORT",
    DRIVERS_LICENSE = "DRIVERS_LICENSE"
}
export declare class DirectorCreateDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    bvn?: string;
    email: string;
    phone: string;
    residentialAddress: string;
    idType: IdType;
    idNumber: string;
    isPep: boolean;
    idFileUrl?: string;
}
export declare class DirectorUpdateDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    bvn?: string;
    email?: string;
    phone?: string;
    residentialAddress?: string;
    idType?: IdType;
    idNumber?: string;
    isPep?: boolean;
    idFileUrl?: string;
}
export declare enum DocumentType {
    CERTIFICATE_OF_INCORPORATION = "CERTIFICATE_OF_INCORPORATION",
    MEMART = "MEMART",
    CAC_STATUS_REPORT = "CAC_STATUS_REPORT",
    TAX_IDENTIFICATION_NUMBER = "TAX_IDENTIFICATION_NUMBER",
    PROOF_OF_ADDRESS = "PROOF_OF_ADDRESS",
    BOARD_RESOLUTION = "BOARD_RESOLUTION",
    DIRECTOR_ID = "DIRECTOR_ID"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare class DocumentCreateDto {
    documentType: DocumentType;
    fileUrl: string;
    issuedDate?: string;
}
export declare class DocumentStatusUpdateDto {
    status: DocumentStatus;
    note?: string;
}
export declare class TinUpdateDto {
    tinNumber: string;
}
export declare class BusinessAddressUpdateDto {
    registeredAddress?: AddressDto;
    operatingAddress?: AddressDto;
}
export declare class ProofOfAddressCreateDto {
    fileUrl: string;
    issuedDate?: string;
}

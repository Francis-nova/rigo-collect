export declare class IssueApiKeyDto {
    merchantId: string;
}
export declare class ApiKeyIssueResponseDto {
    apiKey: string;
    id: string;
    prefix: string;
}
export declare class MerchantResponseDto {
    id: string;
    name: string;
    email: string;
    website?: string | null;
    status: string;
}

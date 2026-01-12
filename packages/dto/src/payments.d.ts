export declare class CreateVirtualAccountDto {
    merchantId: string;
    currency: string;
}
export declare class PayoutDto {
    merchantId: string;
    amount: number;
    currency: string;
    destinationAccountNumber: string;
    destinationBankCode: string;
    narration?: string;
    idempotencyKey: string;
}

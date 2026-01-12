export interface VirtualAccountRequest {
    merchantId: string;
    currency: string;
}
export interface VirtualAccount {
    accountNumber: string;
    bankName: string;
    accountName: string;
    meta?: Record<string, any>;
}
export interface TransferInEvent {
    provider: string;
    reference: string;
    amount: number;
    currency: string;
    accountNumber: string;
    narration?: string;
    occurredAt: string;
    raw: any;
}
export interface PayoutRequest {
    merchantId: string;
    amount: number;
    currency: string;
    destinationAccountNumber: string;
    destinationBankCode: string;
    narration?: string;
    idempotencyKey: string;
}
export interface PayoutResult {
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerReference: string;
    raw?: any;
}
export interface IBankingProvider {
    name(): string;
    createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount>;
    handleIncomingTransfer(event: any): Promise<TransferInEvent>;
    initiatePayout(input: PayoutRequest): Promise<PayoutResult>;
}

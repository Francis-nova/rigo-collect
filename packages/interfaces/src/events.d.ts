export declare const Events: {
    readonly MerchantOnboarded: "auth.merchant.onboarded";
    readonly ApiKeyRotated: "auth.apikey.rotated";
    readonly CollectionReceived: "payments.collection.received";
    readonly PayoutRequested: "payments.payout.requested";
    readonly PayoutProcessed: "payments.payout.processed";
    readonly NotificationSend: "postoffice.notification.send";
};
export type EventName = (typeof Events)[keyof typeof Events];
export interface CollectionReceivedPayload {
    merchantId: string;
    amount: number;
    currency: string;
    provider: string;
    reference: string;
    accountNumber: string;
    narration?: string;
    occurredAt: string;
}
export interface PayoutRequestedPayload {
    merchantId: string;
    amount: number;
    currency: string;
    destinationAccountNumber: string;
    destinationBankCode: string;
    narration?: string;
    idempotencyKey: string;
}

export const Events = {
  MerchantOnboarded: 'auth.merchant.onboarded',
  ApiKeyRotated: 'auth.apikey.rotated',
  CollectionReceived: 'payments.collection.received',
  PayoutRequested: 'payments.payout.requested',
  PayoutProcessed: 'payments.payout.processed',
  NotificationSend: 'postoffice.notification.send'
} as const;

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

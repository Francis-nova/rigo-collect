import { IBankingProvider, PayoutRequest, PayoutResult, TransferInEvent, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';

export class MockProvider implements IBankingProvider {
  name(): string { return 'mock'; }

  async createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount> {
    return {
      accountNumber: '9991234567',
      bankName: 'Mock Bank',
      accountName: `VA_${input.merchantId}`,
      meta: { currency: input.currency }
    };
  }

  async handleIncomingTransfer(event: any): Promise<TransferInEvent> {
    return {
      provider: 'mock',
      reference: event?.reference || 'mock-ref',
      amount: Number(event?.amount || 100),
      currency: event?.currency || 'NGN',
      accountNumber: event?.accountNumber || '9991234567',
      narration: event?.narration,
      occurredAt: new Date().toISOString(),
      raw: event
    };
  }

  async initiatePayout(input: PayoutRequest): Promise<PayoutResult> {
    return { status: 'PENDING', providerReference: `MOCK-${Date.now()}`, raw: { input } };
  }
}

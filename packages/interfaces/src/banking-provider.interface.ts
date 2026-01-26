export interface VirtualAccountRequest { accountName: string; currency: string; phone?: string; bvn?: string; metadata?: Record<string, any>; }
export interface VirtualAccount { accountNumber: string; bankName: string; accountName: string; meta?: Record<string, any>; }
export interface TransferInEvent { provider: string; reference: string; amount: number; currency: string; accountNumber: string; narration?: string; occurredAt: string; raw: any; }
export interface PayoutRequest { destinationAccountName: string; amount: number; currency: string; destinationAccountNumber: string; destinationBankCode: string; destinationBankName?: string; narration?: string; reference: string; }
export interface PayoutResult { status: 'PENDING'|'SUCCESS'|'FAILED'; providerReference: string; raw?: any; }
export interface VerifyTransaction<T> { status: 'SUCCESS'|'FAILED'|'PENDING'; reference: string; amount?: number; currency?: string; details?: T; raw?: any; }

export interface IBankingProvider {
  name(): string;
  createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount>;
  initiatePayout(input: PayoutRequest): Promise<PayoutResult>;
  banksList?(country?: string): Promise<Array<{ name: string; code: string }>>;
  resolveAccount?(accountNumber: string, bankCode: string): Promise<{ accountName: string; accountNumber: string; bankCode: string; }>;
  verifyTransaction?(reference: string): Promise<VerifyTransaction<any>>;
  payoutStatusCheck?(transactionReference: string): Promise<{ status: 'PENDING'|'SUCCESS'|'FAILED'; providerReference: string; raw?: any; }>;
}

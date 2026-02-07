import { Transaction } from "apps/payments/src/entities/transactions.entity";

export class TransactionResource {
  constructor() { }

  toJSON(transaction: Transaction) {
    return {
      id: transaction.id,
      reference: transaction.reference,
      transactionId: transaction.transactionId,
      amount: Number(transaction.metadata?.grossAmount ?? 0),
      settlementAmount: Number(transaction.metadata?.netAmount ?? 0),
      fee: Number(transaction.metadata?.feeAmount ?? 0),
      currency: transaction.account.currency.code,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      account: {
        id: transaction.account.id,
        name: transaction.account.name,
        status: transaction.account.status,
        currency: {
          id: transaction.account.currency.id,
          code: transaction.account.currency.code,
          name: transaction.account.currency.name,
          symbol: transaction.account.currency.symbol,
          countryCode: transaction.account.currency.countryCode,
        },
        collectionAccount: transaction.metadata?.collectionAccount ?? null,
        payer: transaction.metadata?.payer ?? null,
        meta: {
          feeRule: transaction.metadata?.feeRule ?? null,
          afterBalance: transaction.metadata?.afterBalance ?? null,
          beforeBalance: transaction.metadata?.beforeBalance ?? null,
        },
      },
    };
  }

  public toJSONArray(transactions: Transaction[]): any[] {
    return transactions.map((transaction) =>
      new TransactionResource().toJSON(transaction),
    );
  }
}

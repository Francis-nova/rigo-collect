import { Transaction } from "apps/payments/src/entities/transactions.entity";

export class TransactionResource {
  constructor() {}

  toJSON(transaction: Transaction) {
    return {
      id: transaction.id,   
      reference: transaction.reference,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency ?? 0,
      fee: transaction.fee ?? 0,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      account: {
        id: transaction.account.id,
        status: transaction.account.status,
        currency: {
          id: transaction.account.currency.id,
          code: transaction.account.currency.code,
          name: transaction.account.currency.name,
          symbol: transaction.account.currency.symbol,
          countryCode: transaction.account.currency.countryCode,
        },
        meta: {
          reference: transaction.account?.metadata?.name,
          status: transaction.account?.metadata?.status,
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

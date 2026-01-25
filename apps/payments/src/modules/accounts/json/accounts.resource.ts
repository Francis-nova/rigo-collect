import { Account } from "apps/payments/src/entities/account.entity";

export class AccountResource {

  constructor() { }

  public toJson(account: Account) {
    return {
      id: account.id,
      name: account.name,
      currency: {
        code: account.currency?.code,
        name: account.currency?.name,
        symbol: account.currency?.symbol,
        status: account.currency?.isActive,
      },
      accountAddress: account.subaccounts?.map(sub => ({
        id: sub.id,
        accountNumber: sub.accountNumber,
        accountName: sub.accountName,
        bankName: sub.bankName,
        bankCode: sub.bankCode,
        isDefaultAccountAddress: sub.isDefaultAccountAddress,
        status: sub.status,
      })),
      balance: Number(account.balance ?? 0),
      status: account.status,
      createdAt: account.createdAt,
    };
  }

  public toJsonList(accounts: Account[]) {
    return accounts.map((account) => this.toJson(account));
  }
}

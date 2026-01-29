import { Account } from "apps/payments/src/entities/account.entity";
import { SubAccount } from "apps/payments/src/entities/sub-account.entity";

export class SubAccountResource {

  constructor() { }

  public toJson(subAccount: SubAccount) {
    return {
      id: subAccount.id,
      status: subAccount.status,
      accountNumber: subAccount.accountNumber,
      accountName: subAccount.accountName,
      bankCode: subAccount.bankCode,
      bankName: subAccount.bankName,
      type: subAccount.isDefaultAccountAddress ? 'DEFAULT' : 'SUB_ACCOUNT',
      parentAccount: {
        id: subAccount.parentAccount?.id,
        name: subAccount.parentAccount?.name,
        status: subAccount.parentAccount?.status,
      },
      currency: {
        id: subAccount.currency?.id,
        code: subAccount.currency?.code,
        name: subAccount.currency?.name,
        symbol: subAccount.currency?.symbol,
      },
    }
  };

  public toJsonList(subAccounts: SubAccount[]) {
    return subAccounts.map((subAccount) => this.toJson(subAccount));
  }
}

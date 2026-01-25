import { Account } from "apps/payments/src/entities/account.entity";
import { SubAccount } from "apps/payments/src/entities/sub-account.entity";

export class SubAccountResource {

  constructor() { }

  public toJson(subAccount: SubAccount) {
    return {
      id: subAccount.id,
    };
  }

  public toJsonList(subAccounts: SubAccount[]) {
    return subAccounts.map((subAccount) => this.toJson(subAccount));
  }
}

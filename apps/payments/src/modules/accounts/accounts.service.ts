import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { AccountStatus } from '../../entities/types/account-status.enum';
import { SubAccount } from '../../entities/sub-account.entity';
import { CreateSubAccountDto } from './dto/create-subaccount.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(SubAccount)
    private readonly subAccountRepo: Repository<SubAccount>,
  ) {}

  async findActive(): Promise<Account[]> {
    return this.accountRepo.find({ where: { status: AccountStatus.ACTIVE }, order: { name: 'ASC' } });
  }

  async listSubAccounts(accountId: string): Promise<SubAccount[]> {
    return this.subAccountRepo.find({ where: { accountId }, order: { accountName: 'ASC' } });
  }

  async createSubAccount(accountId: string, dto: CreateSubAccountDto): Promise<SubAccount> {
    const parent = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!parent) throw new NotFoundException('main_account_not_found');

    const entity = this.subAccountRepo.create({
      accountId: parent.id,
      businessId: parent.businessId,
      currencyId: dto.currencyId ?? parent.currencyId,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      bankCode: dto.bankCode,
      bankName: dto.bankName,
      status: AccountStatus.ACTIVE,
      metadata: dto.metadata ?? null,
    });
    return this.subAccountRepo.save(entity);
  }
}

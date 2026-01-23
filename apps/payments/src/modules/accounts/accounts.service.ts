import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { AccountStatus } from '../../entities/types/account-status.enum';
import { SubAccount } from '../../entities/sub-account.entity';
import { CreateSubAccountDto } from './dto/create-subaccount.dto';
import { VirtualAccountRequest } from '@pkg/interfaces';

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
}

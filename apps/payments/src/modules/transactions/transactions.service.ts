import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, ITransactionStatus } from '../../entities/transactions.entity';
import { Account } from '../../entities/account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
  ) {}

  async listByAccount(accountId: string): Promise<Transaction[]> {
    return this.txRepo.find({ where: { accountId }, order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const account = await this.accountRepo.findOne({ where: { id: dto.accountId } });
    if (!account) throw new NotFoundException('account_not_found');

    const tx = this.txRepo.create({
      accountId: dto.accountId,
      amount: dto.amount,
      currencyId: dto.currencyId,
      type: dto.type,
      status: ITransactionStatus.PROCESSING,
      reference: dto.reference,
      description: dto.description,
      metadata: dto.metadata,
    });
    return this.txRepo.save(tx);
  }
}

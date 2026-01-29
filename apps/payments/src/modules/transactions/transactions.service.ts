import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { ITransactionStatus, ITransactionType, Transaction } from '../../entities/transactions.entity';
import { Account } from '../../entities/account.entity';
import { ok } from '@pkg/common';
import { TransactionResource } from './json/transaction.resource';

interface GetTransactionsDto {
  accountId?: string;
  page?: number;
  limit?: number;
  type?: ITransactionType;
  status?: ITransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  transactionId?: string;
  reference?: string;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly transactionResource = new TransactionResource();

  constructor(
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
  ) { }

  async getTransactions(auth: any, query: GetTransactionsDto) {
    const {
      accountId,
      page = 1,
      limit = 10,
      type,
      status,
      reference,
      transactionId,
    } = query;

    try {
      const account = await this.accountRepo.find({
        where: { businessId: auth?.business?.id },
        select: ['id'],
      });

      const businessAccounts = account.map((a) => a.id);

      // Validate account belongs to business if provided...
      if (accountId && !businessAccounts.includes(accountId)) {
        throw new Error('Account not found for this business');
      }

      const offset = (page - 1) * limit;

      // Default 6-month filter if dateFrom/dateTo not provided
      let dateFrom: Date;
      let dateTo: Date;
      if (query.dateFrom && query.dateTo) {
        dateFrom = new Date(query.dateFrom);
        dateTo = new Date(query.dateTo);
      } else {
        dateTo = new Date(); // today
        dateFrom = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 6); // 6 months ago
      }

      // Build where clause...
      const where: any = {
        createdAt: Between(dateFrom, dateTo),
      };

      // Filter by wallet IDs - specific wallet or all customer wallets
      if (accountId) {
        where.accountId = accountId;
      } else {
        where.accountId = In(businessAccounts);
      }

      if (type) where.type = type;
      if (status) where.status = status;
      if (reference) where.reference = reference;
      if (transactionId) where.transactionId = transactionId;

      const [transactions, totalItems] =
        await this.txRepo.findAndCount({
          where,
          relations: ['account', 'account.currency'],
          order: { createdAt: 'DESC' },
          skip: offset,
          take: limit,
        });

      const totalPages = Math.ceil(totalItems / limit);
      const paginationMeta = {
        limit,
        page,
        totalItems,
        itemsPerPage: limit,
        totalPages,
      };

      // Transform transactions using the resource
      const transformedTransactions =
        this.transactionResource.toJSONArray(transactions);

      return ok(
        { transactions: transformedTransactions, meta: paginationMeta },
        'Transactions fetched successfully',
      );
    } catch (error: any) {
      this.logger.error(`Error fetching transactions: ${error.message}`, error.stack);
      throw error;
    }
  }
}

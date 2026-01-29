import { Processor, Process, OnQueueActive, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionStatus, ITransactionType, Transaction } from 'apps/payments/src/entities/transactions.entity';
import { Job } from 'bull';
import { Repository } from 'typeorm';

interface TransactionJob {
  transactionId: string;
}

@Injectable()
@Processor('transactions')
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  @Process('process-transaction')
  async handle(job: Job<TransactionJob>): Promise<void> {
    this.logger.log(`Processing transaction job ${job.id}`);
    const { transactionId } = job.data;

    try {
      const transaction = await this.transactionRepository.findOne({
        where: {
          id: transactionId,
          type: ITransactionType.DEBIT,
          status: ITransactionStatus.PENDING,
        },
      });

      if (!transaction) {
        this.logger.error(`Transaction with id ${transactionId} not found`);
        throw new Error(`Transaction with id ${transactionId} not found`);
      }

      // get provider
      if (!transaction?.provider) {
        this.logger.error(
          `Provider with name: ${transaction.provider} not found`,
        );
        throw new Error(`Provider with name: ${transaction.provider} not found`);
      }

      switch (transaction.provider) {
        case 'ibanq':
          await this.handleProvidusTransaction(transaction);
          break;
        case 'optimus':
          throw new Error(`Unsupported provider ${transaction.provider} for payout`);
        default:
          this.logger.error(`Unsupported provider ${transaction.provider} for payout`);
          throw new Error(`Unsupported provider ${transaction.provider} for payout`);
      }

    } catch (error) {
      this.logger.error(`Transaction job ${job.id} failed:`, error);
      throw error;
    }
  }

  // handle providus Transactions here...
  private async handleProvidusTransaction(transaction: Transaction) {
    this.logger.log(`Handling PROVIDUS transaction ${transaction.id}`);
    // Implementation for handling PROVIDUS transactions
    throw new Error('Method not implemented.');
  }
}
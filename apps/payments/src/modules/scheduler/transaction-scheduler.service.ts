import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionStatus, ITransactionType, Transaction } from '../../entities/transactions.entity';
import { QueueService } from '../queue/queue.service';
@Injectable()
export class TransactionSchedulerService {
  private readonly logger = new Logger(TransactionSchedulerService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly queueService: QueueService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePendingTransactions() {
    this.logger.log('Checking for pending or processing transactions...');

    try {
      // Get all transactions with status pending or processing
      const transactions = await this.transactionRepository.find({
        where: [
          { status: ITransactionStatus.PENDING, type: ITransactionType.DEBIT },
        ],
      });

      if (transactions.length === 0) {
        this.logger.log('No pending or processing transactions found.');
        return;
      }

      this.logger.log(`Found ${transactions.length} transactions to process.`);

      // Add each transaction to the queue....
      for (const transaction of transactions) {
        await this.queueService.addTransactionJob({
          transactionId: transaction.id,
        });
      }

      this.logger.log('All pending transactions added to queue.');
    } catch (error) {
      this.logger.error('Error handling pending transactions:', error);
    }
  }
}

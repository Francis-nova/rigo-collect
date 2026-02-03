import { Processor, Process, OnQueueActive, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionStatus, ITransactionType, Transaction } from 'apps/payments/src/entities/transactions.entity';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Account } from 'apps/payments/src/entities/account.entity';
import { BudPayProvider } from 'apps/payments/src/providers/providers.impl/budpay.provider';
import { RabbitPublisherService } from 'apps/payments/src/providers/rabbit-publisher.service';

interface TransactionJob {
  transactionId?: string;
  reference?: string;
  provider?: string;
}

@Injectable()
@Processor('transactions')
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly budpayProvider: BudPayProvider,
    private readonly publisher: RabbitPublisherService,
  ) { }

  @Process('transaction')
  async handle(job: Job<TransactionJob>): Promise<void> {
    this.logger.log(`Processing transaction job ${job.id}`);
    const { transactionId, reference } = job.data || {};

    try {
      const where: any = {
        type: ITransactionType.DEBIT,
      };
      if (transactionId) where.id = transactionId;
      if (reference) where.reference = reference;

      const transaction = await this.transactionRepository.findOne({ where });

      if (!transaction) {
        this.logger.error(`Transaction not found for id/ref: ${transactionId || reference}`);
        throw new Error(`Transaction not found for id/ref: ${transactionId || reference}`);
      }

      // get provider
      if (!transaction?.provider) {
        this.logger.error(
          `Provider with name: ${transaction.provider} not found`,
        );
        throw new Error(`Provider with name: ${transaction.provider} not found`);
      }

      switch (transaction.provider) {
        case 'providus':
          await this.handleProvidusTransaction(transaction);
          break;
        case 'budpay':
          await this.handleBudpayTransaction(transaction);
          break;
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

  // handle budpay Transactions here...
  private async handleBudpayTransaction(transaction: Transaction) {
    this.logger.log(`Handling BUDPAY transaction ${transaction.id}`);

    // Only reconcile PENDING/PROCESSING debit transactions
    if (![ITransactionStatus.PENDING, ITransactionStatus.PROCESSING].includes(transaction.status)) {
      this.logger.debug(`Skipping transaction ${transaction.reference}: status=${transaction.status}`);
      return;
    }

    // Ensure reference exists for provider status check
    if (!transaction.reference) {
      this.logger.error(`Transaction ${transaction.id} missing reference for status check`);
      throw new Error('Transaction missing reference');
    }

    // Check payout status with BudPay
    const statusResp = await this.budpayProvider.payoutStatusCheck(transaction.reference);
    this.logger.debug(`BudPay status for ${transaction.reference}: ${statusResp.status}`);

    if (statusResp.status === 'SUCCESS' && statusResp.raw.status === 'success') {
      transaction.status = ITransactionStatus.COMPLETED;
      transaction.metadata = { ...(transaction.metadata || {}), providerResponse: statusResp.raw };
      await this.transactionRepository.save(transaction);
      const recipients = [
        (transaction.metadata as any)?.notifyEmail,
        (transaction.metadata as any)?.notifyBusinessEmail,
        (transaction.metadata as any)?.notifyOwnerEmail,
      ].filter((e) => !!e);
      await this.publishForRecipients('payments.payout.success', recipients, {
        subject: 'Payout Successful',
        amount: Number(transaction.amount),
        currency: (transaction.metadata as any)?.currency || 'NGN',
        reference: transaction.reference!,
        date: new Date().toISOString(),
        status: 'SUCCESS',
        beneficiary: (transaction.metadata as any)?.destination,
      });
      return;
    }

    if (statusResp.status === 'FAILED' && statusResp.raw.status === 'failed') {
      // Mark original as FAILED
      transaction.status = ITransactionStatus.FAILED;
      transaction.metadata = { ...(transaction.metadata || {}), providerResponse: statusResp.raw };
      await this.transactionRepository.save(transaction);

      // Refund customer: amount + fee (if any)
      const fee = Number((transaction.metadata as any)?.fee ?? transaction.fee ?? 0);
      const creditBack = Number(transaction.amount) + fee;

      const account = await this.accountRepository.findOne({ where: { id: transaction.accountId } });
      if (!account) {
        this.logger.warn('Account not found for reversal', { accountId: transaction.accountId });
        return;
      }

      const beforeBalance = Number(account.balance);
      const afterBalance = beforeBalance + creditBack;
      await this.accountRepository.update({ id: account.id }, { balance: afterBalance });

      const reversalRef = `${transaction.reference}-reversal`;
      const existingReversal = await this.transactionRepository.findOne({ where: { reference: reversalRef } });
      if (!existingReversal) {
        const reversal = this.transactionRepository.create({
          accountId: account.id,
          amount: Number(transaction.amount),
          currencyId: transaction.currencyId,
          reference: reversalRef,
          status: ITransactionStatus.COMPLETED,
          type: ITransactionType.CREDIT,
          description: `Reversal for failed payout #${transaction.reference}`,
          processedAt: new Date(),
          metadata: {
            originalReference: transaction.reference,
            feeCredited: fee,
            beforeBalance,
            afterBalance,
            providerResponse: statusResp.raw,
          },
        });
        await this.transactionRepository.save(reversal);
      }

      this.logger.log(`Reversed failed payout #${transaction.reference}. Credited back ${creditBack}`);
      const recipients = [
        (transaction.metadata as any)?.notifyEmail,
        (transaction.metadata as any)?.notifyBusinessEmail,
        (transaction.metadata as any)?.notifyOwnerEmail,
      ].filter((e) => !!e);
      await this.publishForRecipients('payments.payout.failed', recipients, {
        subject: 'Payout Failed',
        amount: Number(transaction.amount),
        currency: (transaction.metadata as any)?.currency || 'NGN',
        reference: transaction.reference!,
        date: new Date().toISOString(),
        status: 'FAILED',
        beneficiary: (transaction.metadata as any)?.destination,
      });
      return;
    }

    // PENDING: leave as-is; a later retry can re-verify
    this.logger.debug(`Payout still pending for ${transaction.reference}`);
  }

  private async publishForRecipients(routingKey: string, recipients: string[], basePayload: any) {
    for (const to of recipients) {
      const payload = { ...basePayload, to };
      try {
        await this.publisher.publish(routingKey, payload);
        this.logger.debug(`Published ${routingKey} to ${to} for ${payload.reference}`);
      } catch (err) {
        this.logger.error(`Failed to publish ${routingKey} to ${to}`, err as any);
      }
    }
  }
}
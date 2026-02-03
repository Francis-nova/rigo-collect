import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubAccount } from '../../../entities/sub-account.entity';
import { Account } from '../../../entities/account.entity';
import { ITransactionStatus, ITransactionType, Transaction } from '../../../entities/transactions.entity';
import { BudPayProvider } from '../../../providers/providers.impl/budpay.provider';
import { RabbitPublisherService } from '../../../providers/rabbit-publisher.service';

@Injectable()
@Processor('budpay')
export class BudpayProcessor {
  private readonly logger = new Logger(BudpayProcessor.name);

  constructor(
    @InjectRepository(SubAccount)
    private readonly subRepo: Repository<SubAccount>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly txnRepo: Repository<Transaction>,
    private readonly provider: BudPayProvider,
    private readonly publisher: RabbitPublisherService,
  ) { }

  /**
   * Handle incoming transfer event dispatched to the 'budpay' queue
   */
  @Process('webhook')
  async handleIncomingTransfer(job: any) {
    const { notify, notifyType, data } = job.data;

    try {
      switch (notify) {
        case 'transaction':
          await this.handleTransaction(data, notifyType);
          break;
        case 'payout':
          await this.handlePayout(data, notifyType);
          break;
        case 'virtual_account':
          await this.handleVirtualAccount(data, notifyType);
          break;
        default:
          console.log('Unknown webhook type:', notify);
      }
    } catch (err: any) {
      this.logger.error('Error handling BudPay incoming transfer', err?.stack || err);
      throw err;
    }
  }

  /**
   * Update order status
   * @param data 
   * @param notifyType 
   */
  async handleTransaction(data: any, notifyType: string) {
    // Implementation for handling transaction notifications
    throw new Error('Method not implemented.');
  }

  /**
   * Update payout status
   * @param data 
   * @param notifyType 
   */
  async handlePayout(data: any, notifyType: string) {
    // get transaction by reference
    const transaction = await this.txnRepo.findOne({
      where: { reference: data?.reference, status: ITransactionStatus.PENDING },
    });

    if (!transaction) {
      this.logger.warn('Payout transaction not found or not pending', { reference: data?.reference });
      throw new Error('Payout transaction not found or not pending');
    }

    // validate the payout details with BudPay
    const validatePayout = await this.provider.payoutStatusCheck(data?.reference);

    // handle failed payout
    if (validatePayout?.raw?.status === 'failed') {
      // mark original transaction failed
      transaction.status = ITransactionStatus.FAILED;
      transaction.metadata = { ...transaction.metadata, providerResponse: validatePayout?.raw };
      await this.txnRepo.save(transaction);

      // reverse funds back to account and record reversal transaction
      const fee = Number((transaction.metadata as any)?.fee ?? data?.fee ?? 0);
      const creditBack = Number(transaction.amount) + fee;

      const account = await this.accountRepo.findOne({ where: { id: transaction.accountId } });
      if (!account) {
        this.logger.warn('Account not found for reversal', { accountId: transaction.accountId });
        return;
      }

      const beforeBalance = Number(account.balance);
      const afterBalance = beforeBalance + creditBack;
      await this.accountRepo.update({ id: account.id }, { balance: afterBalance });

      // avoid duplicate reversal creation
      const reversalRef = `${transaction.reference}-reversal`;
      const existingReversal = await this.txnRepo.findOne({ where: { reference: reversalRef } });
      if (!existingReversal) {
        const reversal = this.txnRepo.create({
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
            providerResponse: validatePayout?.raw,
          },
        });
        await this.txnRepo.save(reversal);
      }

      this.logger.log(`Reversed failed payout #${transaction.reference}. Credited back ${creditBack}`);

      // send notification to business/customer via RabbitMQ (post-office)
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

    // handle successful payout
    if (validatePayout?.raw?.status === 'successful') {
      transaction.status = ITransactionStatus.COMPLETED;
      transaction.metadata = { ...transaction.metadata, providerResponse: validatePayout?.raw };
      await this.txnRepo.save(transaction);

      // send notification to business/customer via RabbitMQ (post-office)
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
    }
  }

  /**
   * Credit customer wallet when virtual account funding notification is received...
   *  */
  async handleVirtualAccount(data: any, notifyType: string) {
    try {
      // Implementation for handling virtual account notifications
      const validateTransaction = await this.provider.verifyTransaction(data?.reference);

      if (validateTransaction?.raw?.status !== 'successful') {
        this.logger.warn('Virtual account funding transaction not successful', { reference: data?.reference });
        throw new Error('Virtual account funding transaction not successful');
      }

      // Further implementation to credit customer wallet
      // get the sub account linked to the virtual account
      const subAccount = await this.subRepo.findOne({ where: { accountNumber: validateTransaction?.details?.transferDetails?.craccount } });
      if (!subAccount) {
        this.logger.warn('Sub-account not found for virtual account', { accountNumber: validateTransaction?.details?.transferDetails?.craccount });
        throw new Error('Sub-account not found for virtual account');
      }

      // get the main account
      const mainAccount = await this.accountRepo.findOne({ where: { id: subAccount.accountId } });
      if (!mainAccount) {
        this.logger.warn('Main account not found for sub-account', { subAccountId: subAccount.id });
        throw new Error('Main account not found for sub-account');
      }

      // credit the main account
      const beforeBalance = Number(mainAccount.balance);
      const afterBalance = beforeBalance + Number(validateTransaction.amount);
      await this.accountRepo.update({ id: mainAccount.id }, { balance: afterBalance });

      // record the transaction
      const transaction = this.txnRepo.create({
        accountId: mainAccount.id,
        amount: Number(validateTransaction.amount),
        currencyId: mainAccount.currencyId,
        reference: validateTransaction.reference,
        status: ITransactionStatus.COMPLETED,
        type: ITransactionType.CREDIT,
        description: `CR - ${validateTransaction?.details?.transferDetails?.narration}  #${subAccount.accountNumber}`,
        processedAt: new Date(),
        metadata: {
          providerResponse: validateTransaction.raw,
          beforeBalance,
          afterBalance,
        },
      });
      await this.txnRepo.save(transaction);

      this.logger.log(`Credited account #${mainAccount.id} with ${validateTransaction.amount} from virtual account funding.`);

      // publish pay-in success notifications to business and owner if available in metadata
      const notifyList: string[] = [];
      const meta = (mainAccount.metadata || {}) as any;
      if (Array.isArray(meta.notifyEmails)) notifyList.push(...meta.notifyEmails);
      if (meta.notifyBusinessEmail) notifyList.push(meta.notifyBusinessEmail);
      if (meta.notifyOwnerEmail) notifyList.push(meta.notifyOwnerEmail);

      const uniqueRecipients = Array.from(new Set(notifyList.filter(Boolean)));
      if (uniqueRecipients.length) {
        for (const to of uniqueRecipients) {
          await this.publisher.publish('payments.collection.received', {
            to,
            subject: 'Payment Received',
            amount: Number(validateTransaction.amount),
            currency: validateTransaction.currency || mainAccount.currency?.code || 'NGN',
            reference: validateTransaction.reference,
            date: new Date().toISOString(),
            status: 'SUCCESS',
            payer: {
              name: validateTransaction?.details?.transferDetails?.payerName,
              narration: validateTransaction?.details?.transferDetails?.narration,
            },
          });
        }
      } else {
        this.logger.warn('No notification recipients found in account metadata for pay-in');
      }

      return true;
    } catch (err: any) {
      this.logger.error('Error handling BudPay virtual account webhook', err?.stack || err);
      throw err;
    }
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

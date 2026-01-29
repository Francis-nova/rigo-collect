import { Injectable, Logger } from '@nestjs/common';
import { BudPayProvider } from '../../providers/providers.impl/budpay.provider';
import { ProvidusProvider } from '../../providers/providers.impl/providus.provider';
import { QueueService } from '../queue/queue.service';
import { ok } from '@pkg/common';
import indexConfig from '../../configs/index.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, ITransactionStatus, ITransactionType } from '../../entities/transactions.entity';
import { Repository } from 'typeorm';
import { SubAccount } from '../../entities/sub-account.entity';
import { Account } from '../../entities/account.entity';

export interface WebHookData {
  sessionId: string;
  accountNumber: string;
  tranRemarks: string;
  transactionAmount: string;
  settledAmount: string;
  feeAmount: string;
  vatAmount: string;
  currency: string;
  initiationTranRef: string | null;
  settlementId: string;
  sourceAccountNumber: string;
  sourceAccountName: string;
  sourceBankName: string;
  channelId: string;
  tranDateTime: string;
  ipServiceAddress: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly queue: QueueService,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(SubAccount)
    private readonly subAccountRepo: Repository<SubAccount>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly providusProvider: ProvidusProvider,
  ) { }

  async handleBudpay(payload: any, headers: Record<string, string>) {
    this.logger.debug('Received BudPay webhook', { headers });
    await this.queue.addBudpayIncomingWebhookJob(payload);
    return ok('budpay webhook received');
  }

  async handleProvidus(payload: WebHookData, headers: Record<string, string>) {
    this.logger.log('Received Providus webhook', { headers });
    this.logger.log('Received Providus payload', { payload });
    try {
      const authSignature = headers['x-auth-signature'];
      this.logger.debug('Received Providus webhook', { headers });

      // check if transaction is duplicated...
      if (!authSignature || authSignature !== indexConfig.providusConfig.signature as string) {
        this.logger.warn('Invalid Providus webhook signature', { headers });
        return {
          "requestSuccessful": true,
          "sessionId": payload.sessionId,
          "responseMessage": "invalid signature",
          "responseCode": "02"
        }
      }

      // check if transaction is duplicated...
      const checkDuplicated = await this.txRepo.count({ where: { transactionId: payload.sessionId } });

      if (checkDuplicated) {
        return {
          "requestSuccessful": true,
          "sessionId": payload.sessionId,
          "responseMessage": "duplicate transaction",
          "responseCode": "01"
        };
      }

      // check account number...
      const subAccount = await this.subAccountRepo.findOne({ where: { accountNumber: payload.accountNumber } });
      if (!subAccount) {
        this.logger.warn('Providus webhook for unknown account number', { accountNumber: payload.accountNumber });
        return {
          "requestSuccessful": true,
          "sessionId": payload.sessionId,
          "responseMessage": "invalid account number",
          "responseCode": "02"
        }
      }

      // if production, only process settled transactions
      if (indexConfig.nodeEnv === 'production' && !payload.sessionId) {
        const result = await this.providusProvider.verifyTransaction(payload.sessionId);
        if (
          result.details?.accountNumber === null || // check for code... 
          result.details?.sessionId === '' // check is the field is null...
        ) {
          return {
            'requestSuccessful': true,
            'sessionId': payload.sessionId ?? result.details?.sessionId,
            'responseMessage': 'rejected transaction',
            'responseCode': '02'
          };
        }
      }

      // credit main account and log transaction
      const account = await this.accountRepo.findOne({ where: { id: subAccount.accountId } });
      if (!account) {
        this.logger.warn('Providus webhook account not found for sub-account', { accountId: subAccount.accountId });
        return {
          requestSuccessful: true,
          sessionId: payload.sessionId,
          responseMessage: 'account not found',
          responseCode: '02'
        };
      }

      const amount = Number(payload.settledAmount || payload.transactionAmount || 0);
      const beforeBalance = Number(account.balance);
      const afterBalance = beforeBalance + amount;
      await this.accountRepo.update({ id: account.id }, { balance: afterBalance });

      const transaction = this.txRepo.create({
        accountId: account.id,
        amount,
        currencyId: account.currencyId,
        transactionId: payload.sessionId,
        reference: payload.sessionId,
        status: ITransactionStatus.COMPLETED,
        type: ITransactionType.CREDIT,
        description: payload.tranRemarks || `CR - VA Funding #${payload.sourceAccountNumber} - ${payload.sourceAccountName}`,
        processedAt: new Date(payload.tranDateTime || Date.now()),
        metadata: payload,
      });

      await this.txRepo.save(transaction);

      // TODO Post data to core client service

      return {
        requestSuccessful: true,
        sessionId: payload.sessionId,
        responseMessage: 'transaction processed successfully',
        responseCode: '00'
      }
    } catch (err: any) {
      this.logger.error('Error handling Providus webhook', err?.stack || err);
      return {
        "requestSuccessful": true,
        // "sessionId": transaction.sessionId,
        "responseMessage": "system failure, retry",
        "responseCode": "03"
      }
    }
  }
}

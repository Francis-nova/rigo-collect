import { Injectable, Logger } from "@nestjs/common";
import { Account } from "../../../entities/account.entity";
import { Repository } from "typeorm";
import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from "@nestjs/typeorm";
import { ITransactionStatus, ITransactionType, Transaction } from "../../../entities/transactions.entity";
import { PayoutProviderFactory } from "apps/payments/src/providers/payout-provider.factory";

@Injectable()
@Processor('payouts')
export class PayoutProcessor {
  private readonly logger = new Logger(PayoutProcessor.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly providerFactory: PayoutProviderFactory,
  ) { }

  @Process('payout')
  async handlePayoutJob(job: any) {
    try {
      const payoutData = job.data;
      this.logger.log('Processing payout job with data:', payoutData);
      this.logger.debug(`Processing payout job for account: ${payoutData.accountNumber}`);

      // get transaction...
      const transaction = await this.transactionRepository.findOne({
        where: {
          reference: payoutData.reference,
          status: ITransactionStatus.PENDING,
          type: ITransactionType.DEBIT,
        },
        relations: ['account'],
      })

      if (!transaction) {
        this.logger.error(`Transaction with reference ${payoutData.reference} not found`);
        throw new Error(`Transaction with reference ${payoutData.reference} not found`);
      }

      // get provider
      const provider = await this.providerFactory.getProvider();
      this.logger.debug(`Resolving account via provider: ${provider.name()}`);
      if (!provider || typeof provider.resolveAccount !== 'function') {
        this.logger.error('Could not resolve bank account');
        throw new Error('Could not resolve bank account');
      }

      // initiate payout via provider
      const payoutResult = await provider.initiatePayout({
        destinationAccountNumber: payoutData?.destination?.accountNumber,
        destinationBankCode: payoutData?.destination?.bankCode,
        destinationAccountName: payoutData?.destination?.accountName,
        destinationBankName: payoutData?.destination?.bankName,
        amount: Number(payoutData.amount),
        currency: payoutData?.currency,
        narration: payoutData.narration,
        reference: payoutData.transactionRef,
      });

      this.logger.log(`Payout initiated with resp: ${JSON.stringify(payoutResult)}`);

      // update transaction status based on payout result
      transaction.status = ITransactionStatus.PROCESSING;
      await this.transactionRepository.save(transaction);

      this.logger.log(`Payout job completed for account: ${payoutData.accountNumber}`);
    } catch (error: any) {
      this.logger.error('Error processing payout job', error?.stack || error);
      throw error;
    }
  }
}

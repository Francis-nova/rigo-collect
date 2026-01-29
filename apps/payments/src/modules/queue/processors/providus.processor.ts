import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../entities/account.entity';
import { Transaction, ITransactionStatus, ITransactionType } from '../../../entities/transactions.entity';
import { ProvidusProvider } from '../../../providers/providers.impl/providus.provider';
import { SubAccount } from 'apps/payments/src/entities/sub-account.entity';

@Injectable()
@Processor('providus')
export class ProvidusProcessor {
  private readonly logger = new Logger(ProvidusProcessor.name);


  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly txnRepo: Repository<Transaction>,
    @InjectRepository(SubAccount)
    private readonly subAccountRepo: Repository<SubAccount>,
    private readonly provider: ProvidusProvider,
  ) { }

  @Process('webhook')
  async handleWebhook(job: any) {
    const payload = job.data;
    this.logger.debug(`Received Providus webhook job`, payload);
  }
}

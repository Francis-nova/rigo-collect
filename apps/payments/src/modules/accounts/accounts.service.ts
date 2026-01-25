import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { AccountStatus } from '../../entities/types/account-status.enum';
import { SubAccount } from '../../entities/sub-account.entity';
import { ok } from '@pkg/common';
import { AccountResource } from './json/accounts.resource';
import { CreateAccountDto } from './dto/create-account.dto';
import { PaymentProviderFactory } from '../../providers/provider.factory';
import { Currency } from '../../entities/currency.entity';
import { useQueryRunner } from '../../common/utils/use-query-runner';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(SubAccount)
    private readonly subAccountRepo: Repository<SubAccount>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
    private readonly providerFactory: PaymentProviderFactory,
    private readonly dataSource: DataSource,
  ) { }

  async findActive(auth: any) {
    try {
      const accounts = await this.accountRepo
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.currency', 'currency')
        .leftJoinAndSelect(
          'account.subaccounts',
          'subaccount',
          'subaccount.isDefaultAccountAddress = :isDefault',
          { isDefault: true },
        )
        .where('account.status = :status', { status: AccountStatus.ACTIVE })
        .andWhere('account.businessId = :businessId', { businessId: auth?.business?.id })
        .getMany();

      return ok(
        new AccountResource().toJsonList(accounts),
      )
    } catch (error: any) {
      this.logger.error('Error fetching active accounts', error?.stack || error);
      throw new NotFoundException('No active accounts found');
    }
  }

  /**
   * create a new business account...
   * @param auth 
   * @param payload 
   */
  async createAccount(auth: any, payload: CreateAccountDto) {
    try {
      return await useQueryRunner(this.dataSource, async (queryRunner) => {
        const accountRepo = queryRunner.getRepository(Account);
        const subAccountRepo = queryRunner.getRepository(SubAccount);
        const currencyRepo = queryRunner.getRepository(Currency);

        // check how many accounts exist for the business
        const existingAccountsCount = await accountRepo.count({ where: { businessId: auth?.business?.id } });
        if (existingAccountsCount > 2) {
          throw new NotFoundException(`Can not create more than 3 accounts per business for ${auth?.business?.name}`);
        }

        // get currency id from currency code
        const currency = await currencyRepo.findOne({ where: { code: payload.currency } });

        if (!currency) {
          throw new NotFoundException(`Currency not found for code: ${payload.currency}`);
        }

        // Create account record in db
        const newAccount = accountRepo.create({
          name: `${auth?.business?.name} - ${payload.accountName}`,
          currencyId: currency?.id,
          businessId: auth?.business.id,
          balance: 0,
          status: AccountStatus.ACTIVE,
        });

        await accountRepo.save(newAccount);

        // get provider to create account number
        const provider = await this.providerFactory.getProvider();
        this.logger.debug(`Creating business account via provider: ${provider.name()}`);
        if (!provider || typeof provider.createVirtualAccount !== 'function') {
          throw new Error('Could not create business account');
        }

        this.logger.debug('creating virtual account via provider', auth?.business);

        const vaResponse = await provider.createVirtualAccount({
          accountName: `${auth?.business?.name} - ${payload.accountName}`,
          currency: payload.currency,
          phone: auth?.business?.phoneNumber,
        });

        this.logger.debug('virtual account response', vaResponse);

        // create default sub-account for the main account
        const subAccount = subAccountRepo.create({
          accountId: newAccount.id,
          parentAccount: newAccount,
          accountName: vaResponse.accountName,
          accountNumber: vaResponse.accountNumber,
          bankCode: vaResponse.meta?.bankCode || '000',
          bankName: vaResponse.bankName,
          currencyId: currency.id,
          businessId: auth?.business.id,
          status: AccountStatus.ACTIVE,
          isDefaultAccountAddress: true,
          metadata: vaResponse.meta || {},
        });

        await subAccountRepo.save(subAccount);

        return ok(new AccountResource().toJson(newAccount));
      });
    } catch (error: any) {
      this.logger.error('Error creating business account', error?.stack || error);
      throw new NotFoundException(error.message ?? 'Failed to create business account');
    }
  }

  async listSubAccounts(user: any, accountId: string) {
    try {
      // verify account exists and belongs to the user's business
      const account = await this.accountRepo.findOne({ where: { id: accountId, businessId: user?.business?.id } });
      if (!account) {
        throw new NotFoundException('Account not found for the specified business');
      }

      const subAccounts = await this.subAccountRepo.find({
        where: { accountId: account.id, isDefaultAccountAddress: false, businessId: user?.business?.id },
      });

      return ok(subAccounts);
    } catch (error: any) {
      this.logger.error(`Error fetching subaccounts for accountId: ${accountId}`, error?.stack || error);
      throw new NotFoundException(error.message ?? 'No sub-accounts found for the specified account');
    }
  }

  /**
   * TODO: implement create sub-account method
   */
  async createSubAccount() { }
}

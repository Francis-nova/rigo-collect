import { Injectable, Logger } from '@nestjs/common';
import { PayoutProviderFactory } from '../../providers/payout-provider.factory';
import { ResolveAccountDto } from './dtos/reslove-account.dto';
import { SettingsService } from '../../settings/settings.service';
import { calculateBankTransferFee, calculateVAT } from '../../common/helpers/app.helper';
import { ok, fail } from '@pkg/common';
import { PayoutDto } from './dtos/payout.dto';
import { useQueryRunner } from '../../common/utils/use-query-runner';
import { Account } from '../../entities/account.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { ITransactionStatus, ITransactionType, Transaction } from '../../entities/transactions.entity';
import { QueueService } from '../queue/queue.service';
import { Currency } from '../../entities/currency.entity';
import { ProfileService } from '../profile/profile.service';
import { RedisService } from '../../providers/redis.service';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly payoutProviderFactory: PayoutProviderFactory,
    private readonly dataSource: DataSource,
    private queueService: QueueService,
    private readonly profileService: ProfileService,
    private readonly redis: RedisService,
  ) { }

  async getBankList(country: string = 'NGN'): Promise<Array<{ name: string; code: string }>> {
    try {
      const provider = await this.payoutProviderFactory.getProvider();
      this.logger.debug(`Fetching bank list from provider: ${provider.name()}`);
      if (!provider || typeof provider.banksList !== 'function') {
        throw new Error('Could not fetch bank list');
      }
      return provider.banksList(country);
    } catch (error: any) {
      this.logger.error('Failed to fetch bank list', error?.stack || error);
      throw new Error('Error fetching bank list. Please try again later.');
    }
  }

  async resolveAccount(payload: ResolveAccountDto) {
    try {
      const provider = await this.payoutProviderFactory.getProvider();
      this.logger.debug(`Resolving account via provider: ${provider.name()}`);
      if (!provider || typeof provider.resolveAccount !== 'function') {
        throw new Error('Could not resolve bank account');
      }
      return provider.resolveAccount(payload.accountNumber, payload.bankCode);
    } catch (error: any) {
      this.logger.error('Failed to resolve account', error?.stack || error);
      throw new Error('Error resolving account. Please try again later.');
    }
  }

  async getPayoutFee(amount: number) {
    try {
      const numericAmount = Number(amount);

      // Tiered bank fee
      let fee = 0;
      if (numericAmount <= 5000) fee = 10;
      else if (numericAmount <= 50000) fee = 25;
      else fee = 50;

      // VAT is applied only on the bank fee
      const vatRate = 0.075;
      const vat = Number((fee * vatRate).toFixed(2));
      const total = Number((fee + vat).toFixed(2));

      return ok({ fee, vat, total });
    } catch (error: any) {
      this.logger.error('Failed to fetch payout fee', error?.stack || error);
      throw new Error('Error fetching payout fee. Please try again later.');
    }
  }

  async initiatePayout(auth: any, payload: PayoutDto) {
    try {
      // Check payout lock first
      const businessId = auth?.business?.id;
      const userId = auth?.user?.id;
      const lockKey = this.redis.lockKey(businessId, userId);
      const attemptsKey = this.redis.attemptsKey(businessId, userId);
      const LOCK_TTL_SECONDS = 6 * 60 * 60; // 6 hours

      if (await this.redis.exists(lockKey)) {
        const ttl = await this.redis.ttlSeconds(lockKey);
        return fail('Account temporarily locked due to failed PIN attempts. Try again later.', {
          locked: true,
          lockTtlSeconds: ttl,
          attempts: 3,
        });
      }

      // Verify PIN using profile service
      if (!payload.pin && payload.pin !== 0) {
        // treat missing PIN as failed attempt
        const count = await this.redis.incrWithTtl(attemptsKey, LOCK_TTL_SECONDS);
        if (count >= 3) {
          await this.redis.setLock(lockKey, LOCK_TTL_SECONDS);
          await this.redis.del(attemptsKey);
          return fail('Too many failed attempts. Account locked for 6 hours.', {
            attempts: 3,
            locked: true,
            lockTtlSeconds: LOCK_TTL_SECONDS,
          });
        }
        return fail('Transaction PIN is required', { attempts: count, locked: false });
      }

      const verification = await this.profileService.verifyTransactionPin(auth, { pin: String(payload.pin) } as any);
      if (!verification?.status) {
        const count = await this.redis.incrWithTtl(attemptsKey, LOCK_TTL_SECONDS);
        if (count >= 3) {
          await this.redis.setLock(lockKey, LOCK_TTL_SECONDS);
          // reset count to avoid unlimited growth
          await this.redis.del(attemptsKey);
          return fail('Too many failed attempts. Account locked for 6 hours.', {
            attempts: 3,
            locked: true,
            lockTtlSeconds: LOCK_TTL_SECONDS,
          });
        }
        return fail('Invalid transaction PIN', { attempts: count, locked: false });
      }

      // Successful verification: reset attempts
      await this.redis.del(attemptsKey);
      // create transaction reference
      const transactionRef = `payout-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // get provider to initiate payout
      const provider = await this.payoutProviderFactory.getProvider();
      return await useQueryRunner(this.dataSource, async (queryRunner) => {
        // get account id
        const accountRepo = queryRunner.getRepository(Account);
        const currencyRepo = queryRunner.getRepository(Currency);

        const { accountId, destination } = payload;
        // businessId already resolved above

        const [account, currency] = await Promise.all([
          accountRepo.findOne({
            where: {
              id: accountId,
              businessId,
            },
            relations: ['currency'],
          }),
          currencyRepo.findOne({
            where: { code: payload.currency },
          }),
        ]);

        if (!account) {
          throw new Error('Account not found for payout');
        }

        if (!currency) {
          throw new Error('Currency not supported for payout');
        }

        // get transaction fee...
        const fee = await this.getPayoutFee(Number(payload.amount));
        const feeData = (fee?.data as any) || { fee: 0, vat: 0, total: 0 };

        // total amount to debit (amount + fee + VAT)
        const totalAmount = Number(payload.amount) + Number(feeData.total ?? 0);

        // balance check before locking
        if (account.balance < totalAmount) {
          // create insufficient balance record in db...
          const failedTransaction = queryRunner.create(Transaction, {
            accountId: account.id,
            amount: payload.amount,
            currencyId: account.currencyId,
            reference: transactionRef,
            status: ITransactionStatus.FAILED,
            type: ITransactionType.DEBIT,
            description: 'Payout failed due to insufficient balance',
            processedAt: new Date(),
            metadata: {
              reason: 'Insufficient wallet balance for payout',
              destination: payload.destination,
            },
          });

          await queryRunner.save(Transaction, failedTransaction);
          throw new Error('Insufficient account balance for payout');
        }

        // Lock the account row and perform debit to prevent race conditions
        const lockedAccount = await queryRunner
          .createQueryBuilder(Account, 'a')
          .setLock('pessimistic_write')
          .where('a.id = :id', { id: account.id })
          .getOne();

        if (!lockedAccount) {
          throw new Error('Account not found during debit');
        }

        // Revalidate balance under lock
        if (Number(lockedAccount.balance) < totalAmount) {
          const failedTransaction = queryRunner.create(Transaction, {
            accountId: account.id,
            amount: payload.amount,
            currencyId: account.currencyId,
            reference: transactionRef,
            status: ITransactionStatus.FAILED,
            type: ITransactionType.DEBIT,
            description: 'Payout failed due to insufficient balance',
            processedAt: new Date(),
            provider: provider.name(),
            metadata: {
              reason: 'Insufficient wallet balance (locked) for payout',
              destination: payload.destination,
            },
          });

          await queryRunner.save(Transaction, failedTransaction);
          throw new Error('Insufficient account balance for payout');
        }

        //  check provider balance if supported
        if (typeof provider.walletBalance === 'function') {
          const providerBalance = await provider.walletBalance(currency.code);
          if (providerBalance?.balance < totalAmount) {
            this.logger.error(`Payout provider ${provider.name()} has insufficient balance: ${providerBalance?.balance} ${providerBalance?.currency}`);
            throw new Error(`Can not process payout at the moment. Please try again later.`);
          }
        }

        const beforeBalance = Number(lockedAccount.balance);
        const afterBalance = beforeBalance - totalAmount;
        await queryRunner.update(Account, { id: account.id }, { balance: afterBalance });

        // resolve account details
        const resolvedAccount = await this.resolveAccount(payload.destination);

        if (!resolvedAccount?.accountName) {
          throw new Error('Failed to resolve destination account details');
        }

        this.logger.debug(`Initiating payout via provider: ${provider.name()}`);
        if (!provider || typeof provider.initiatePayout !== 'function') {
          throw new Error('Could not initiate payout');
        }

        // create transaction record in db
        const transaction = queryRunner.create(Transaction, {
          accountId: account.id,
          amount: payload.amount,
          currencyId: account.currencyId,
          reference: transactionRef,
          status: ITransactionStatus.PENDING,
          type: ITransactionType.DEBIT,
          description: payload.narration || `Payout ${account.currency.code} ${payload.amount} - ${resolvedAccount.accountName}`,
          processedAt: new Date(),
          provider: provider.name(),
          metadata: {
            destination: payload.destination,
            currency: payload.currency,
            fee: Number(feeData.total ?? 0),
            beforeBalance,
            afterBalance,
            notifyEmail: auth?.user?.email,
            notifyBusinessEmail: auth?.business?.email,
            notifyOwnerEmail: auth?.business?.owner?.email || auth?.user?.email,
          },
        });

        await queryRunner.save(Transaction, transaction);

        // add payout to a queue for processing...
        await this.queueService.addPayoutJob({
          ...payload,
        });

        return ok(transactionRef, 'Payout initiated successfully');
      });
    } catch (error: any) {
      console.log('error initiating payout', error);
      this.logger.error('Failed to initiate payout', error?.stack || error);
      throw new Error(error?.message ?? 'Error initiating payout. Please try again later.');
    }
  }
}
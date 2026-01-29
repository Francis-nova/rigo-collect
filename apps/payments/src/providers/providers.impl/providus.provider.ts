import { Injectable, Logger } from '@nestjs/common';
import { IBankingProvider, PayoutRequest, PayoutResult, VerifyTransaction, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';
import indexConfig from '../../configs/index.config';
import { IProvidusCreateVARespDto } from '@pkg/dto';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../redis.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProvidusProvider implements IBankingProvider {
  private readonly logger = new Logger(ProvidusProvider.name);


  constructor(
    private readonly http: HttpService,
    private readonly redis: RedisService,
  ) { }

  name(): string { return 'providus'; }

  verifySignature(signature: string): boolean {
    if (!signature || signature !== indexConfig.providusConfig.signature) {
      return false;
    }
    return true;
  }

  async createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount> {
    this.logger.debug('Create virtual account providus');
    const url = `${indexConfig.providusConfig.baseUrl}/appdevapi/api/PiPCreateReservedAccountNumber`;
    const resp = await firstValueFrom(this.http.post<IProvidusCreateVARespDto>(url,
      {
        account_name: input.accountName,
        bvn: '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Client-Id': indexConfig.providusConfig.clientId,
          'X-Auth-Signature': indexConfig.providusConfig.signature,
        },
      },
    ));

    // check for failure....
    if (resp.data.responseCode !== '00') {
      this.logger.error(`Providus VA creation failed: ${resp.data.responseMessage}`);
      throw new Error('failed to create virtual account');
    }

    return {
      accountNumber: resp.data?.account_number,
      accountName: resp.data?.account_name,
      bankName: 'Providus Bank',
      meta: {
        bvn: resp.data?.bvn,
        type: 'reserved',
        status: 'active',
      },
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransaction<any>> {
    this.logger.debug(`Verifying transaction ${reference} via Providus`);
    try {
      const response = await firstValueFrom(this.http.get(`${indexConfig.providusConfig.baseUrl}/PiPverifyTransaction_sessionid`,
        {
          params: {
            session_id: reference,
          },
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            'Client-Id': indexConfig.providusConfig.clientId,
            'X-Auth-Signature': indexConfig.providusConfig.signature,
          },
          timeout: 90 * 1000,
        }
      ));

      this.logger.debug(`Providus transaction verified: ${reference}`, response?.data);

      return {
        status: response?.data?.status,
        reference: reference,
        amount: response?.data?.amount,
        currency: response?.data?.currency,
        details: response?.data,
      };
    } catch (error: any) {
      this.logger.error(`Error verifying transaction via Providus: ${error.message}`);
      throw new Error('Providus transaction verification failed');
    }
  }

  async initiatePayout(input: PayoutRequest): Promise<PayoutResult> {

    const body = {
      transactionAmount: Number(input.amount),
      currencyCode: 'NGN',
      narration: input.narration,
      sourceAccountName: indexConfig.providusConfig.accountName || '',
      beneficiaryAccountName: input.destinationAccountName,
      beneficiaryAccountNumber: input.destinationAccountNumber,
      beneficiaryBank: input.destinationBankCode,
      transactionReference: input.reference,
      userName: indexConfig.providusConfig.username,
      password: indexConfig.providusConfig.password
    }

    try {

      const response = await firstValueFrom(this.http.post(`${indexConfig.providusConfig.transferBaseUrl}/NIPFundTransfer`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            'Client-Id': indexConfig.providusConfig.clientId,
            'X-Auth-Signature': indexConfig.providusConfig.signature,
          },
          timeout: 90 * 1000,
        }
      ));

      // check for failure...
      if (
        response.data.responseCode !== '00' // check for code... 
      ) {
        this.logger.error(`Providus payout initiation failed: ${response?.data?.responseMessage}`, response?.data);
        throw new Error('payout initiation failed');
      }
      this.logger.debug(`Providus payout initiated: ${input.reference}`, response?.data);

      return {
        status: 'PENDING',
        providerReference: response?.data?.transactionReference,
        raw: response?.data,
      };

    } catch (error: any) {
      this.logger.error(`Providus payout initiation failed: ${error?.message}`, error?.stack);
      throw new Error('Providus payout initiation failed');
    }
  }

  async banksList(): Promise<Array<{ name: string; code: string }>> {
    const cacheKey = 'providus:banks:NGN';
    const cacheTtlSeconds = 7 * 24 * 60 * 60; // 7 days

    const cached = await this.redis.get<Array<{ name: string; code: string }>>(cacheKey);
    if (cached?.length) {
      this.logger.debug('Providus banksList cache hit');
      return cached;
    }

    this.logger.debug('Fetching banks list from Providus');
    try {
      const response = await firstValueFrom(this.http.get(`${indexConfig.providusConfig.baseUrl}/GetNIPBanks`, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Client-Id': indexConfig.providusConfig.clientId,
          'X-Auth-Signature': indexConfig.providusConfig.signature,
        },
        timeout: 90 * 1000,
      }));

      if (response?.data?.responseCode !== '00') {
        this.logger.error(`Failed to fetch banks list: ${response.data.responseMessage}`);
        throw new Error('Failed to fetch banks list');
      }

      const mapped = response?.data?.banks.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
      })) ?? [];

      await this.redis.set(cacheKey, mapped, cacheTtlSeconds);
      return mapped;
    } catch (error: any) {
      this.logger.error(`Error fetching banks list from Providus: ${error.message}`);
      throw new Error('Failed to fetch banks list');
    }
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string; accountNumber: string; bankCode: string; }> {
    this.logger.debug(`Validating NIP account ${accountNumber} with bank code ${bankCode} via Providus`);
    try {
      const response = await firstValueFrom(this.http.post(`${indexConfig.providusConfig.baseUrl}/GetNIPAccount`,
        {
          accountNumber: accountNumber,
          beneficiaryBank: bankCode,
          userName: indexConfig.providusConfig.username,
          password: indexConfig.providusConfig.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            'Client-Id': indexConfig.providusConfig.clientId,
            'X-Auth-Signature': indexConfig.providusConfig.signature,
          },
          timeout: 90 * 1000,
        }
      ));

      if (response?.data?.responseCode !== '00') {
        this.logger.error(`NIP account validation failed: ${response?.data?.responseMessage}`);
        throw new Error('NIP account validation failed');
      }

      this.logger.debug(`Providus NIP account validated: ${response?.data}`);

      return {
        accountName: response?.data?.account_name,
        accountNumber: accountNumber,
        bankCode: bankCode,
      };
    } catch (error: any) {
      this.logger.error(`Error validating NIP account via Providus: ${error.message}`);
      throw new Error('failed to resolve account');
    }
  }

  async payoutStatusCheck(transactionReference: string): Promise<{ status: 'PENDING' | 'SUCCESS' | 'FAILED'; providerReference: string; raw?: any; }> {
    try {
      const response = await firstValueFrom(this.http.get(`${indexConfig.providusConfig.transferBaseUrl}/payout/status`, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Client-Id': indexConfig.providusConfig.clientId,
          'X-Auth-Signature': indexConfig.providusConfig.signature,
        },
        timeout: 90 * 1000,
      }));

      if (response?.data?.responseCode !== '00') {
        this.logger.error(`Providus payout status check failed: ${response.data.responseMessage}`);
        throw new Error('Providus payout status check failed');
      }

      this.logger.debug(`Providus payout status response ${transactionReference}`, JSON.stringify(response?.data));

      return {
        status: response?.data?.status,
        providerReference: response?.data?.providerReference,
        raw: response?.data,
      };
    } catch (error: any) {
      this.logger.error(`Providus payout status validation failed: ${error?.message}`, error?.stack);
      throw new Error('Providus payout status validation failed');
    }
  }
}

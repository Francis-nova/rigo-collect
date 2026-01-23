import { Logger } from '@nestjs/common';
import { IBankingProvider, PayoutRequest, PayoutResult, TransferInEvent, VerifyTransaction, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';
import indexConfig from '../../configs/index.config';
import { IProvidusCreateVARespDto } from '@pkg/dto';
import axios from 'axios';

export class ProvidusProvider implements IBankingProvider {
  private readonly logger = new Logger(ProvidusProvider.name);
  name(): string { return 'providus'; }

  async createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount> {
    this.logger.debug('Create virtual account providus');
    const url = `${indexConfig.providusConfig.baseUrl}/appdevapi/api/PiPCreateReservedAccountNumber`;
    const resp = await axios.post<IProvidusCreateVARespDto>(url,
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
    );

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

  async handleIncomingTransfer(event: any): Promise<TransferInEvent> {
    return {
      provider: 'providus',
      reference: event?.reference || 'providus-ref',
      amount: Number(event?.amount || 100),
      currency: event?.currency || 'NGN',
      accountNumber: event?.accountNumber || '9001234567',
      narration: event?.narration,
      occurredAt: new Date().toISOString(),
      raw: event
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransaction<any>> {
    this.logger.debug(`Verifying transaction ${reference} via Providus`);
    try {
      const response = await axios.get(`${indexConfig.providusConfig.baseUrl}/PiPverifyTransaction_sessionid`,
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
      );

      if (response?.data?.responseCode !== '00') {
        this.logger.error(`Providus transaction verification failed: ${response.data.responseMessage}`);
        throw new Error('Providus transaction verification failed');
      }

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

      const response = await axios.post(`${indexConfig.providusConfig.transferBaseUrl}/NIPFundTransfer`,
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
      );

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
    this.logger.debug('Fetching banks list from Providus');
    try {
      const response = await axios.get(`${indexConfig.providusConfig.baseUrl}/GetNIPBanks`, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Client-Id': indexConfig.providusConfig.clientId,
          'X-Auth-Signature': indexConfig.providusConfig.signature,
        },
        timeout: 90 * 1000,
      });

      if (response?.data?.responseCode !== '00') {
        this.logger.error(`Failed to fetch banks list: ${response.data.responseMessage}`);
        throw new Error('Failed to fetch banks list');
      }

      return response?.data?.banks.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
      }));
    } catch (error: any) {
      this.logger.error(`Error fetching banks list from Providus: ${error.message}`);
      throw new Error('Failed to fetch banks list');
    }
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string; accountNumber: string; bankCode: string; }> {
    this.logger.debug(`Validating NIP account ${accountNumber} with bank code ${bankCode} via Providus`);
    try {
      const response = await axios.post(`${indexConfig.providusConfig.baseUrl}/GetNIPAccount`,
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
      );

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
      const response = await axios.get(`${indexConfig.providusConfig.transferBaseUrl}/payout/status`, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Client-Id': indexConfig.providusConfig.clientId,
          'X-Auth-Signature': indexConfig.providusConfig.signature,
        },
        timeout: 90 * 1000,
      });

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

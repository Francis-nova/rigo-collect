import { Injectable, Logger } from '@nestjs/common';
import { IBankingProvider, PayoutRequest, PayoutResult, TransferInEvent, VerifyTransaction, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';
import indexConfig from '../../configs/index.config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { generateUniqueAlphaNumeric } from '../../common/helpers/app.helper';

type IBudResp<T> = { status: boolean; message: string; currency: string; data: T };
type IBudCustomerCreateDto = {
  email: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, any>;
};
type IBudCustomerCreateRespDto = {
  email: string;
  domain: string;
  customer_code: string;
  id: string;
  created_at: string;
  updated_at: string;
};
type IBudVirtualBank = { name: string; bank_code: string; prefix?: string };
type IBudVirtualAccountResp = {
  account_number: string;
  account_name: string;
  bank: IBudVirtualBank;
  currency: string;
  status: string;
};

@Injectable()
export class BudPayProvider implements IBankingProvider {
  private readonly logger = new Logger(BudPayProvider.name);

  name(): string { return 'budpay'; }

  constructor(
    private readonly http: HttpService,
  ) { }

  /**
   * create customer...
   */
  private async createCustomer(payload: IBudCustomerCreateDto): Promise<IBudResp<IBudCustomerCreateRespDto>> {
    this.logger.debug('Create customer budpay');
    const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/customer`;
    const resp = await firstValueFrom(
      this.http.post<IBudResp<IBudCustomerCreateRespDto>>(url,
        {
          email: payload.email,
          first_name: payload.first_name ?? payload.firstName,
          last_name: payload.last_name ?? payload.lastName,
          phone: payload.phone,
          metadata: payload.metadata,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
          },
        },
      )
    );
    return resp.data;
  }

  /**
   * create virtual account...
   * @param input 
   * @returns 
   */
  async createVirtualAccount(input: VirtualAccountRequest): Promise<VirtualAccount> {
    try {
      const name = input.accountName.split(" "); // split name
      const payload: IBudCustomerCreateDto = {
        email: `${generateUniqueAlphaNumeric(20)}@example.com`,
        first_name: name[0],
        last_name: name.slice(1).join(" ") || 'User',
        metadata: { currency: input.currency },
      };
      const customer = await this.createCustomer(payload);
      this.logger.debug(`BudPay Customer created: ${customer?.data?.customer_code}`);
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/dedicated_virtual_account`;
      const resp = await firstValueFrom(
        this.http.post<IBudResp<IBudVirtualAccountResp>>(url,
          { customer: customer?.data?.customer_code },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
            },
          },
        )
      );

      return {
        accountNumber: resp.data?.data?.account_number,
        accountName: resp.data?.data?.account_name,
        bankName: resp.data?.data?.bank?.name,
        meta: {
          currency: resp.data?.data?.currency,
          bankCode: resp.data?.data?.bank?.bank_code,
          prefix: resp.data?.data?.bank?.prefix,
          type: 'reserved',
          status: 'active',
        },
      };
    } catch (err) {
      console.error('BudPay createVirtualAccount error', err);
      this.logger.error('BudPay createVirtualAccount failed, falling back to stub', err as any);
      throw new Error('failed to create virtual account');
    }
  }

  async handleIncomingTransfer(event: any): Promise<TransferInEvent> {
    return {
      provider: 'budpay',
      reference: event?.reference || 'budpay-ref',
      amount: Number(event?.amount || 100),
      currency: event?.currency || 'NGN',
      accountNumber: event?.accountNumber || '7001234567',
      narration: event?.narration,
      occurredAt: new Date().toISOString(),
      raw: event
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransaction<any>> {
    try {

      this.logger.debug('Verify transaction budpay');
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/transaction/verify/${reference}`;
      const resp = await firstValueFrom(
        this.http.get<IBudResp<any>>(url,
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
            },
          },
        )
      );

      return {
        status: resp.data?.data?.status.toLowerCase() === 'success' ? 'SUCCESS' :
          resp.data?.data?.status.toLowerCase() === 'failed' ? 'FAILED' : 'PENDING',
        reference: resp.data?.data?.reference,
        currency: resp.data?.data.currency,
        amount: resp.data?.data.amount,
        details: resp.data?.data,
      };
    } catch (error) {
      this.logger.error(`Error verifying transaction via BudPay: ${error}`);
      throw new Error('failed to verify transaction');
    }
  }

  async initiatePayout(input: PayoutRequest): Promise<PayoutResult> {
    const body = {
      amount: Number(input.amount),
      currency: 'NGN',
      bank_code: input.destinationBankCode,
      account_number: input.destinationAccountNumber,
      bank_name: input.destinationBankName ?? '',
      narration: input.narration,
      meta_data: {
        beneficiaryName: input.destinationAccountName,
        reference: input.reference,
      },
    }

    try {
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/bank_transfer`;
      const resp = await firstValueFrom(
        this.http.post<IBudResp<any>>(url,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
              Encryption: 'Signature_HMAC-SHA-512 '
            },
          },
        )
      );

      this.logger.debug(`BudPay Payout initiated: ${input.reference}`, resp.data);

      return {
        status: 'PENDING',
        providerReference: resp.data?.data?.transfer_code || input.reference,
        raw: resp.data,
      };

    } catch (error: any) {
      console.error('BudPay initiatePayout error', error);
      this.logger.error('BudPay initiatePayout failed, falling back to stub', error as any);
      throw new Error(error.message ??'failed to initiate payout');
    }
  }

  async banksList(country: string = 'NGN'): Promise<Array<{ name: string; code: string }>> {
    try {
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/bank_list/${country}`;
      const resp = await firstValueFrom(
        this.http.get<IBudResp<Array<{ bank_name: string; bank_code: string }>>>(url, {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
          },
        }),
      )

      return resp.data?.data?.map((bank: { bank_name: string; bank_code: string }) => ({
        name: bank.bank_name,
        code: bank.bank_code,
      }));

    } catch (error: any) {
      console.log('BudPay banksList error', error);
      this.logger.error('BudPay banksList failed, falling back to stub', error);
      throw new Error('failed to fetch banks list');
    }
  }

  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string; accountNumber: string; bankCode: string; }> {
    try {
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/account_name_verify`;
      const resp = await firstValueFrom(
        this.http.post<IBudResp<string>>(url,
          {
            account_number: accountNumber,
            bank_code: bankCode,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
            },
          },
        ),
      );

      return {
        accountName: resp.data?.data,
        accountNumber: accountNumber,
        bankCode: bankCode,
      };

    } catch (error: any) {
      this.logger.error('BudPay resolveAccount failed, falling back to stub', error);
      throw new Error('failed to resolve account');
    }
  }

  private getPayoutStatusFromBudPayStatus(budPayStatus: string): 'PENDING' | 'SUCCESS' | 'FAILED' {
    switch (budPayStatus.toLowerCase()) {
      case 'success':
        return 'SUCCESS';
      case 'failed':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }

  async walletBalance(country: string = 'NGN'): Promise<{ currency: string; balance: number; }> {
    try {
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/wallet/balance/${country}`;
      const resp = await firstValueFrom(
        this.http.get<IBudResp<{ currency: string; balance: number }>>(url,
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
            },
          },
        )
      );

      return {
        currency: resp.data?.data?.currency,
        balance: resp.data?.data?.balance,
      };

    } catch (error: any) {
      this.logger.error('BudPay walletBalance failed, falling back to stub', error as any);
      throw new Error('failed to fetch wallet balance');
    }
  }

  async payoutStatusCheck(transactionReference: string): Promise<{ status: 'PENDING' | 'SUCCESS' | 'FAILED'; providerReference: string; raw?: any; }> {
    try {
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/bank_transfer/status`;
      const resp = await firstValueFrom(
        this.http.post<IBudResp<{ status: string; transfer_code: string }>>(url,
          {
            reference: transactionReference,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
            },
          },
        )
      );

      return {
        status: this.getPayoutStatusFromBudPayStatus(resp.data?.data?.status || ''),
        providerReference: transactionReference,
        raw: resp.data,
      };

    } catch (error) {
      this.logger.error('BudPay payoutStatusCheck failed, falling back to stub', error as any);
      throw new Error('failed to check payout status');
    }
  }
}

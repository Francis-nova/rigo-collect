import { Logger } from '@nestjs/common';
import { IBankingProvider, PayoutRequest, PayoutResult, TransferInEvent, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';
import axios from 'axios';
import indexConfig from '../../configs/index.config';

type IBudResp<T> = { status: boolean; message: string; data: T };
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

export class BudPayProvider implements IBankingProvider {
  private readonly logger = new Logger(BudPayProvider.name);

  name(): string { return 'budpay'; }

  constructor() { }

  /**
   * create customer...
   */
  private async createCustomer(payload: IBudCustomerCreateDto): Promise<IBudResp<IBudCustomerCreateRespDto>> {
    this.logger.debug('Create customer budpay');
    const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/customer`;
    const resp = await axios.post<IBudResp<IBudCustomerCreateRespDto>>(url,
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
        email: `${input.merchantId}@example.com`,
        first_name: name[0],
        last_name: name.slice(1).join(" ") || 'User',
        metadata: { merchantId: input.merchantId },
      };
      const customer = await this.createCustomer(payload);
      this.logger.debug(`BudPay Customer created: ${customer?.data?.customer_code}`);
      const url = `${indexConfig.budPayConfig.baseUrl}/api/v2/dedicated_virtual_account`;
      const resp = await axios.post<IBudResp<IBudVirtualAccountResp>>(url,
        { customer: customer?.data?.customer_code },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${indexConfig.budPayConfig.secretKey}`,
          },
        },
      );

      // check for failure....
      if (!resp.data.status) {
        this.logger.error(`Budpay VA creation failed: ${resp.data.message}`);
        throw new Error('failed to create virtual account');
      }

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

  async initiatePayout(input: PayoutRequest): Promise<PayoutResult> {
    return { status: 'PENDING', providerReference: `BUDPAY-${Date.now()}`, raw: { input } };
  }
}

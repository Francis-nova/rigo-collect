import { Logger } from '@nestjs/common';
import { IBankingProvider, PayoutRequest, PayoutResult, TransferInEvent, VirtualAccount, VirtualAccountRequest } from '@pkg/interfaces';
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

  async initiatePayout(input: PayoutRequest): Promise<PayoutResult> {
    return { status: 'PENDING', providerReference: `PROVIDUS-${Date.now()}`, raw: { input } };
  }
}

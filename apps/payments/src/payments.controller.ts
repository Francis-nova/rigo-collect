import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateVirtualAccountDto, PayoutDto } from '@pkg/dto';
import { IBankingProvider, PayoutResult, VirtualAccount } from '@pkg/interfaces';
import { Inject } from '@nestjs/common';
import { BANKING_PROVIDER } from '@pkg/common';

@Controller()
export class PaymentsController {
  constructor(@Inject(BANKING_PROVIDER) private readonly provider: IBankingProvider) {}

  @MessagePattern('payments.createVirtualAccount')
  async createVA(@Payload() dto: CreateVirtualAccountDto): Promise<VirtualAccount> {
    return this.provider.createVirtualAccount({ merchantId: dto.merchantId, currency: dto.currency });
  }

  @MessagePattern('payments.initiatePayout')
  async payout(@Payload() dto: PayoutDto): Promise<PayoutResult> {
    return this.provider.initiatePayout({
      merchantId: dto.merchantId,
      amount: dto.amount,
      currency: dto.currency,
      destinationAccountNumber: dto.destinationAccountNumber,
      destinationBankCode: dto.destinationBankCode,
      narration: dto.narration,
      idempotencyKey: dto.idempotencyKey
    });
  }
}

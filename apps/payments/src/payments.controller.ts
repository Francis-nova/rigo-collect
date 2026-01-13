import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateVirtualAccountDto, PayoutDto } from '@pkg/dto';
import { PayoutResult, VirtualAccount } from '@pkg/interfaces';
import { ProviderRouter } from './providers/provider.router';

@Controller()
export class PaymentsController {
  constructor(private readonly router: ProviderRouter) {}

  @MessagePattern('payments.createVirtualAccount')
  async createVA(@Payload() dto: CreateVirtualAccountDto): Promise<VirtualAccount> {
    const provider = await this.router.pickProvider(dto.providerOverride);
    return provider.createVirtualAccount({ merchantId: dto.merchantId, currency: dto.currency });
  }

  @MessagePattern('payments.initiatePayout')
  async payout(@Payload() dto: PayoutDto): Promise<PayoutResult> {
    const provider = await this.router.pickProvider(dto.providerOverride);
    return provider.initiatePayout({
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

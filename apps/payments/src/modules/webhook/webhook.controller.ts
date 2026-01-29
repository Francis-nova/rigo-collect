import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebHookData, WebhookService } from './webhook.service';
import { ok } from '@pkg/common';

@ApiTags('Webhooks')
@Controller('v1/webhook')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post('budpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'BudPay webhook receiver' })
  @ApiOkResponse({ description: 'BudPay webhook processed' })
  async budpay(@Body() payload: any, @Headers() headers: Record<string, string>) {
    return await this.service.handleBudpay(payload, headers);
  }

  @Post('providus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Providus webhook receiver' })
  @ApiHeader({ name: 'X-auth-Signature', required: false, description: 'Signature header from Providus' })
  @ApiOkResponse({ description: 'Providus webhook processed' })
  @ApiBody({
    description: 'Providus webhook payload example',
    schema: {
      example: {
        sessionId: '10000621102614065999555',
        accountNumber: '9977686053',
        tranRemarks: 'FROM eTRANZACT/ OTUEKONG ANIEFIOK UMOIYOHO-NXG :TRFFRM OTUEKONG ANIEFIOK UMOIYOHO T/100006211026140659995533415183',
        transactionAmount: '1000.50',
        settledAmount: '1000.50',
        feeAmount: '0.00',
        vatAmount: '0.00',
        currency: 'NGN',
        initiationTranRef: 'null',
        settlementId: '210211026000758100',
        sourceAccountNumber: '0042979403',
        sourceAccountName: 'OTUEKONG ANIEFIOK UMOIYOHO',
        sourceBankName: 'eTRANZACT',
        channelId: '1',
        tranDateTime: '2021-10-26 14:37:45.0',
        ipServiceAddress: '18.220.114.25',
      },
    },
  })
  async providus(@Body() payload: WebHookData, @Headers() headers: Record<string, string>) {
    return await this.service.handleProvidus(payload, headers);
  }
}

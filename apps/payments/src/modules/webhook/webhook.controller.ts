import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
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
  @ApiOkResponse({ description: 'Providus webhook processed' })
  async providus(@Body() payload: any, @Headers() headers: Record<string, string>) {
    return await this.service.handleProvidus(payload, headers);
  }
}

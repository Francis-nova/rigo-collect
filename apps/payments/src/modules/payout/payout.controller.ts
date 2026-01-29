import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ok } from '@pkg/common';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';
import { PayoutService } from './payout.service';
import { ResolveAccountDto } from './dtos/reslove-account.dto';
import { feeDto } from './dtos/fee.dto';
import { PayoutDto } from './dtos/payout.dto';

@ApiTags('Payouts')
@Controller('v1/payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) { }

  @Get('/banks')
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of banks (name/code)' })
  @ApiOperation({ summary: 'List available banks from active provider' })
  async listActive() {
    const items = await this.payoutService.getBankList();
    return ok(items);
  }

  @Post('/resolve-account')
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Resolved bank account details' })
  @ApiOperation({ summary: 'Resolve bank account details' })
  async resolveAccount(
    @Body() payload: ResolveAccountDto,
  ) {
    const resolve = await this.payoutService.resolveAccount(payload);
    return ok(resolve);
  }

  @Post('/fee')
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Payout fee details' })
  @ApiOperation({ summary: 'Get payout fee for a given amount and currency' })
  async getPayoutFee(
    @Body() payload: feeDto,
  ) {
    return this.payoutService.getPayoutFee(payload.amount);
  }

  @Post('/')
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Payout initiation response' })
  @ApiOperation({ summary: 'Initiate a payout to a bank account' })
  @ApiBody({
    type: PayoutDto,
    description: 'Payout initiation payload',
  })
  async initiatePayout(
    @Req() req: any,
    @Body() payload: PayoutDto,
  ) {
    return this.payoutService.initiatePayout(req, payload);
  }
  
}
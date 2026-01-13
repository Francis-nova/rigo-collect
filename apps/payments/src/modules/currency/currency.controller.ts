import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { Currency } from '../../entities/currency.entity';
import { ok } from '@pkg/common';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';

@ApiTags('Currencies')
@Controller('v1/currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of active currencies', type: [Currency] })
  @ApiOperation({ summary: 'List all active currencies' })
  async listActive() {
    const items: Currency[] = await this.currencyService.findActive();
    return ok(items);
  }
}
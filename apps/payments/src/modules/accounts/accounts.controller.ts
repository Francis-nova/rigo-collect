import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { Account } from '../../entities/account.entity';
import { SubAccount } from '../../entities/sub-account.entity';
import { ok } from '@pkg/common';
import { CreateSubAccountDto } from './dto/create-subaccount.dto';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';

@ApiTags('Accounts')
@Controller('v1/accounts')
@UseGuards(AuthProfileGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active currencies' })
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of active accounts', type: [Account] })
  async listActive() {
    return this.accountsService.findActive();
  }

  @Get(':accountId/subaccounts')
  @ApiOkResponse({ description: 'List of subaccounts for an account', type: [SubAccount] })
  async listSubAccounts(@Param('accountId') accountId: string) {
    const items = await this.accountsService.listSubAccounts(accountId);
    return ok(items);
  }
}

import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { Account } from '../../entities/account.entity';
import { SubAccount } from '../../entities/sub-account.entity';
import { CreateSubAccountDto } from './dto/create-subaccount.dto';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('Accounts')
@Controller('v1/accounts')
@UseGuards(AuthProfileGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Get()
  @ApiOperation({ summary: 'List all active currencies' })
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of active accounts', type: [Account] })
  async listActive(@Req() req: any) {
    return this.accountsService.findActive(req);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new business account' })
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Business account created successfully', type: Account })
  async createAccount(@Body() payload: CreateAccountDto, @Req() req: any) {
    return this.accountsService.createAccount(req, payload);
  }

  @Get(':accountId/subaccounts')
  @ApiOperation({ summary: 'List all active sub accounts for an account' })
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of subaccounts for an account', type: [SubAccount] })

  async listSubAccounts(@Param('accountId') accountId: string, @Req() req: any) {
    return await this.accountsService.listSubAccounts(req, accountId);
  }

  /**
   * create sub-account endpoint...
   */
  @Post('subaccounts')
  @ApiOperation({ summary: 'Create a new sub-account for an account' })
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Sub-account created successfully', type: SubAccount })
  async createSubAccount(@Body() payload: CreateSubAccountDto, @Req() req: any) {
    console.log('create sub-account payload', payload, req);
    return this.accountsService.createSubAccount();
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../../entities/transactions.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ok } from '@pkg/common';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';

@ApiTags('Transactions')
@Controller('v1/transactions')
@UseGuards(AuthProfileGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get('accounts/:accountId')
  @ApiOkResponse({ description: 'Transactions for account', type: [Transaction] })
  async listByAccount(@Param('accountId') accountId: string) {
    const items = await this.service.listByAccount(accountId);
    return ok(items);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Transaction created', type: Transaction })
  async create(@Body() dto: CreateTransactionDto) {
    const created = await this.service.create(dto);
    return ok(created, 'created');
  }
}

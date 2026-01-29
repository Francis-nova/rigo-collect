import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ITransactionStatus, ITransactionType, Transaction } from '../../entities/transactions.entity';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';

@ApiTags('Transactions')
@Controller('v1/transactions')
@UseGuards(AuthProfileGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) { }

  @Get('')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (1 indexed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 100)' })
  @ApiQuery({ name: 'accountId', required: false, type: String, description: 'Filter by account id' })
  @ApiQuery({ name: 'type', required: false, enum: ITransactionType, description: 'Filter by transaction type' })
  @ApiQuery({ name: 'status', required: false, enum: ITransactionStatus, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'ISO date from (inclusive)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'ISO date to (inclusive)' })
  @ApiQuery({ name: 'reference', required: false, type: String, description: 'Filter by reference' })
  @ApiQuery({ name: 'transactionId', required: false, type: String, description: 'Filter by transaction id' })
  @ApiOkResponse({ description: 'List of transactions', type: [Transaction] })
  @ApiBearerAuth()
  @UseGuards(AuthProfileGuard)
  async list(
    @Req() req: any,
    @Query('accountId') accountId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ITransactionType,
    @Query('status') status?: ITransactionStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('reference') reference?: string,
    @Query('transactionId') transactionId?: string,
  ) {
    return this.service.getTransactions(req, {
      accountId,
      reference,
      transactionId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      status,
      dateFrom,
      dateTo,
    });
  }
}

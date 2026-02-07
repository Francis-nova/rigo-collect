import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { BusinessService } from '../business/business.service';
import { ok } from '@pkg/common';

@ApiTags('API Keys')
@Controller('v1/api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(
    private readonly apiKeys: ApiKeysService,
    private readonly businessService: BusinessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List API keys for the current business' })
  @ApiResponse({ status: 200, description: 'API keys retrieved' })
  async list(@Req() req: any) {
    const businessId = req.user?.business?.id;
    if (!businessId) throw new Error('Business context is required');
    const membership = await this.businessService.getUserMembership(req.user?.userId, businessId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new Error('You do not have access to this business');
    }
    const keys = await this.apiKeys.list(businessId);
    return ok(keys, 'Api keys retrieved');
  }

  @Post('rotate')
  @ApiOperation({ summary: 'Rotate API key for the current business (revokes previous active key)' })
  @ApiResponse({ status: 201, description: 'API key rotated' })
  async rotate(@Req() req: any) {
    const businessId = req.user?.business?.id;
    if (!businessId) throw new Error('Business context is required');
    const membership = await this.businessService.getUserMembership(req.user?.userId, businessId);
    if (!membership || membership.status !== 'ACTIVE') {
      throw new Error('You do not have access to this business');
    }
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new Error('Only business owners or admins can manage API keys');
    }
    const result = await this.apiKeys.rotate(businessId);
    return ok(result, 'Api key rotated');
  }

  @MessagePattern('auth.validateApiKey')
  async validate(@Payload() payload: { apiKey?: string }) {
    return this.apiKeys.validateApiKey(payload?.apiKey);
  }
}

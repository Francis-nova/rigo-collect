import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { ok } from '@pkg/common';

@ApiTags('API Keys')
@Controller('v1/api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeys: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List API keys for the current business' })
  @ApiResponse({ status: 200, description: 'API keys retrieved' })
  async list(@Req() req: any) {
    const businessId = req.user?.business?.id;
    if (!businessId) throw new Error('Business context is required');
    const keys = await this.apiKeys.list(req.user?.userId, businessId);
    return ok(keys, 'api_keys_retrieved');
  }

  @Post('rotate')
  @ApiOperation({ summary: 'Rotate API key for the current business (revokes previous active key)' })
  @ApiResponse({ status: 201, description: 'API key rotated' })
  async rotate(@Req() req: any) {
    const businessId = req.user?.business?.id;
    if (!businessId) throw new Error('Business context is required');
    const result = await this.apiKeys.rotate(req.user?.userId, businessId);
    return ok(result, 'api_key_rotated');
  }

  @MessagePattern('auth.validateApiKey')
  async validate(@Payload() payload: { apiKey?: string }) {
    return this.apiKeys.validateApiKey(payload?.apiKey);
  }
}

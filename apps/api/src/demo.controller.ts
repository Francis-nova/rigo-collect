import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('v1/demo')
export class DemoController {
  @Get('protected')
  @UseGuards(ApiKeyGuard)
  getProtected() {
    return { ok: true };
  }
}

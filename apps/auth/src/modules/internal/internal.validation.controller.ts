import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ok } from '@pkg/common';
import { AuthGuard } from '@nestjs/passport';
import { InternalGuard } from '../../guards/internal.guard';

@ApiExcludeController(true)
@UseGuards(InternalGuard)
@Controller('internal')
export class InternalValidationController {
  // Validates a bearer token and returns minimal identity info
  @Get('validate-token')
  @UseGuards(AuthGuard('jwt'))
  validate(@Req() req: any) {
    const { user, business, iat, exp } = req;
    return ok({ valid: true, user, business, iat, exp });
  }
}

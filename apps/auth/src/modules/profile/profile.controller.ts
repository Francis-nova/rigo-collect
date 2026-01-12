import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '@pkg/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor() { }

  @Get('/')
  @ApiOkResponse({ description: 'Current user and selected business' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate user email (accounts)' })
  me(@Req() req: any) {
    // req.user should be JWT payload / user, and req.business if your JWT guard attaches it
    const { user } = req;
    return ok({ user });
  }
}

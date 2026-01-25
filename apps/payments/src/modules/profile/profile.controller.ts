import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { SetTransactionPinDto } from './dtos/set-transaction-pin.dto';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthProfileGuard } from '../../guards/auth-profile.guard';

@ApiTags('Settings')
@Controller('v1/settings')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post('set-pin')
  @UseGuards(AuthProfileGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Set transaction pin' })
  @ApiOperation({ summary: 'Set a new transaction pin' })
  async setTransactionPin(
    @Req() req: any,
    @Body() body: SetTransactionPinDto
  ) {
    return this.profileService.setTransactionPin(req, body);
  }
}

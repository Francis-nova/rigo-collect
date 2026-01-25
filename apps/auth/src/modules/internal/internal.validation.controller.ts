import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ok } from '@pkg/common';
import { AuthGuard } from '@nestjs/passport';
import { InternalGuard } from '../../guards/internal.guard';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../entities/business.entity';

@ApiExcludeController(true)
@UseGuards(InternalGuard)
@Controller('internal')
export class InternalValidationController {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) { }

  // Validates a bearer token and returns minimal identity info
  @Get('validate-token')
  @UseGuards(AuthGuard('jwt'))
  async validate(@Req() req: any) {
    const { userId, business, iat, exp } = req.user;

    const [user, businessEntity] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId },
      }),
      business?.id
        ? this.businessRepository.findOne({
          where: { id: business.id },
        })
        : Promise.resolve(null),
    ]);

    return ok({
      status: true,
      user,
      business: businessEntity,
      iat,
      exp,
    });
  }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ok } from '@pkg/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalGuard } from '../../guards/internal.guard';
import { Business } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';

@ApiExcludeController(true)
@UseGuards(InternalGuard)
@Controller('internal')
export class InternalBusinessController {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Returns business info and owner (if available) for internal consumers
  @Get('business/:id')
  async getBusiness(@Param('id') id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) {
      return ok({ status: false, message: 'business_not_found' });
    }
    let owner: User | null = null;
    if (business.ownerId) {
      owner = await this.userRepo.findOne({ where: { id: business.ownerId } });
    }
    return ok({
      status: true,
      business,
      owner,
    });
  }
}

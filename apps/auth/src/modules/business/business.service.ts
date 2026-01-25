import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Business } from '../../entities/business.entity';
import { BusinessUser, BusinessUserRole } from '../../entities/business-user.entity';
import { BusinessInvite } from '../../entities/business-invite.entity';
import { AddressDto, BusinessAddressUpdateDto, BusinessCreateDto, BusinessKycStage, BusinessStatus, TinUpdateDto } from '@pkg/dto';
import { ok } from 'packages/common/src/http/response';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { POSTOFFICE_SERVICE } from '@pkg/common';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectRepository(Business) private readonly businessRepo: Repository<Business>,
    @InjectRepository(BusinessUser) private readonly pivotRepo: Repository<BusinessUser>,
    @InjectRepository(BusinessInvite) private readonly inviteRepo: Repository<BusinessInvite>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject(POSTOFFICE_SERVICE) private readonly postOfficeClient: ClientProxy,
  ) { }

  async createBusinessWithOwner(userId: string, payload: BusinessCreateDto) {
    try {
      return this.businessRepo.manager.transaction(async (trx) => {
        const bRepo = trx.getRepository(Business);
        const pRepo = trx.getRepository(BusinessUser);

        const business = bRepo.create({
          name: payload.legalName,
          tradingName: payload.tradingName,
          registrationNumber: payload.registrationNumber,
          entityType: payload.entityType,
          ownerId: userId,
          status: BusinessStatus.PENDING_APPROVAL,
          natureOfBusiness: payload.natureOfBusiness,
          countryOfIncorporation: payload.countryOfIncorporation,
          dateOfIncorporation: new Date(payload.dateOfIncorporation),
          industry: payload.industry,
          websiteUrl: payload.websiteUrl,
          email: payload.email,
          phoneNumber: payload.phone,
          registeredAddress: payload.registeredAddress,
          operatingAddress: payload.operatingAddress,
        } as DeepPartial<Business>);

        await bRepo.save(business);

        const membership = pRepo.create({ userId, businessId: business.id, role: 'OWNER', status: 'ACTIVE' } as DeepPartial<BusinessUser>);
        await pRepo.save(membership);

        //TODO send an email to the user about their new business creation via queue...

        return ok({ business, pivot: membership }, 'business created successfully');
      });
    } catch (error: any) {
      this.logger.error('Failed to create business with owner', error?.stack || error);
      throw new Error('Error creating business. Please try again later.');
    }
  }

  async findUserBusinesses(userId: string) {
    const pivots = await this.pivotRepo.find({ where: { userId, status: 'ACTIVE' as any } });
    const ids = pivots.map((p) => p.businessId);
    if (!ids.length) return [];
    const businesses = await this.businessRepo.findBy({ id: In(ids) });
    const map = new Map(businesses.map((b) => [b.id, b]));
    return ok(pivots.map((p) => ({ ...map.get(p.businessId)!, role: p.role, membershipStatus: p.status })), 'user businesses retrieved');
  }

  async addMember(businessId: string, memberUserId: string, role: Exclude<BusinessUserRole, 'OWNER'>) {
    const existing = await this.pivotRepo.findOne({ where: { businessId, userId: memberUserId } });
    if (existing) return existing;
    const pivot = this.pivotRepo.create({ businessId, userId: memberUserId, role, status: 'INVITED' });

    //TODO send an email invitation to the user via queue...

    return this.pivotRepo.save(pivot);
  }

  async updateAddresses(businessId: string, payload: BusinessAddressUpdateDto) {
    const updates: Partial<Business> = {};
    if (payload.registeredAddress) updates.registeredAddress = payload.registeredAddress as AddressDto;
    if (payload.operatingAddress) updates.operatingAddress = payload.operatingAddress as AddressDto;
    if (payload.registeredAddress || payload.operatingAddress) updates.kycStage = BusinessKycStage.ADDRESS_COLLECTED;
    await this.businessRepo.update(businessId, updates);
    return this.businessRepo.findOne({ where: { id: businessId } });
  }

  async updateTin(businessId: string, payload: TinUpdateDto) {
    const updates: Partial<Business> = { tinNumber: payload.tinNumber };
    await this.businessRepo.update(businessId, updates);
    return this.businessRepo.findOne({ where: { id: businessId } });
  }

  // Industries listing moved to UtilitiesService

  async getUserMembership(userId: string, businessId: string) {
    const pivot = await this.pivotRepo.findOne({ where: { userId, businessId } });
    return pivot || null;
  }

  async getBusinessById(businessId: string) {
    return this.businessRepo.findOne({ where: { id: businessId } });
  }

  async inviteUser(businessId: string, inviterUserId: string, email: string, role: Exclude<BusinessUserRole, 'OWNER'> | 'VIEWER' | 'ADMIN' | 'FINANCE') {
    // Ensure inviter is an active member of the business
    const inviterMembership = await this.getUserMembership(inviterUserId, businessId);
    if (!inviterMembership || inviterMembership.status !== 'ACTIVE') {
      throw new Error('You do not have permission to invite members to this business');
    }

    // If user already exists and is a member, prevent duplicate
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      const existingMembership = await this.getUserMembership(existingUser.id, businessId);
      if (existingMembership && existingMembership.status === 'ACTIVE') {
        throw new Error('User is already a member of this business');
      }
    }

    // Upsert invite by email + businessId
    let invite = await this.inviteRepo.findOne({ where: { email, businessId } });
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    if (invite) {
      invite.role = role;
      invite.token = token;
      invite.expiresAt = expiresAt;
      invite.acceptedAt = null;
    } else {
      invite = this.inviteRepo.create({ email, businessId, inviterUserId, role, token, expiresAt } as DeepPartial<BusinessInvite>);
    }
    await this.inviteRepo.save(invite);

    this.postOfficeClient.emit('business.invite.sent', {
      to: email,
      subject: 'You have been invited to join a business',
      businessId,
      role,
      token,
      inviterUserId,
      expiresAt: expiresAt.toISOString(),
    });

    return ok({ token, expiresAt }, 'invite_sent');
  }

  async listInvitesForEmail(email: string) {
    const invites = await this.inviteRepo.find({ where: { email }, order: { createdAt: 'DESC' } });
    const pending = invites.filter(i => !i.acceptedAt && i.expiresAt.getTime() > Date.now());
    return ok(pending, 'invites_retrieved');
  }

  async acceptInviteById(inviteId: string, userId: string) {
    const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
    if (!invite) throw new Error('Invite not found');
    if (invite.acceptedAt) throw new Error('Invite already accepted');
    if (invite.expiresAt.getTime() <= Date.now()) throw new Error('Invite has expired');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('Invite email does not match your account email');
    }

    // Prevent duplicate membership
    const existingMembership = await this.getUserMembership(userId, invite.businessId);
    if (existingMembership && existingMembership.status === 'ACTIVE') {
      throw new Error('You are already a member of this business');
    }

    const pivot = this.pivotRepo.create({ userId, businessId: invite.businessId, role: invite.role as any, status: 'ACTIVE' } as DeepPartial<BusinessUser>);
    await this.pivotRepo.save(pivot);

    invite.acceptedAt = new Date();
    await this.inviteRepo.save(invite);

    this.postOfficeClient.emit('business.invite.accepted', {
      to: invite.email,
      subject: 'You have joined the business',
      businessId: invite.businessId,
      role: invite.role,
      userId,
      acceptedAt: invite.acceptedAt.toISOString(),
    });

    return ok({ businessId: invite.businessId, role: invite.role }, 'invite_accepted');
  }

  async declineInviteById(inviteId: string, userId: string) {
    const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
    if (!invite) throw new Error('Invite not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('Invite email does not match your account email');
    }

    // Mark as expired by setting expiresAt to now
    invite.expiresAt = new Date(Date.now());
    await this.inviteRepo.save(invite);

    this.postOfficeClient.emit('business.invite.declined', {
      to: invite.email,
      subject: 'You declined the business invitation',
      businessId: invite.businessId,
      role: invite.role,
      userId,
      declinedAt: new Date().toISOString(),
    });

    return ok(null, 'invite_declined');
  }
}

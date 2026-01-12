import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressDto, BusinessAddressUpdateDto, BusinessCreateDto, DirectorCreateDto, DirectorUpdateDto, DocumentCreateDto, DocumentStatusUpdateDto, ProofOfAddressCreateDto, TinUpdateDto } from '@pkg/dto';
import { InviteUserDto, AcceptInviteDto } from '@pkg/dto';
import { KycService } from './kyc.service';

@ApiTags('Business')
@Controller('v1/business')
export class BusinessController {
    constructor(private readonly business: BusinessService, private readonly kyc: KycService) { }

    @Post()
    @ApiOperation({ summary: 'Create business (owner = current user)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    create(@Body() payload: BusinessCreateDto, @Req() req: any) {
        return this.business.createBusinessWithOwner(req.user.userId, payload);
    }

    @Get('my')
    @ApiOperation({ summary: 'List my businesses' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    listMy(@Req() req: any) {
        return this.business.findUserBusinesses(req.user.userId);
    }

    // Directors
    @Post('kyc/:businessId/directors')
    @ApiOperation({ summary: 'Add a director to the business' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    addDirector(@Param('businessId') businessId: string, @Body() payload: DirectorCreateDto, @Req() req: any) {
        return this.kyc.addDirector(businessId, payload, req.user.userId);
    }

    @Get('kyc/:businessId/directors')
    @ApiOperation({ summary: 'List business directors' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    listDirectors(@Param('businessId') businessId: string) {
        return this.kyc.listDirectors(businessId);
    }

    @Patch('kyc/:businessId/directors/:directorId')
    @ApiOperation({ summary: 'Update a director' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateDirector(
        @Param('businessId') businessId: string,
        @Param('directorId') directorId: string,
        @Body() payload: DirectorUpdateDto,
        @Req() req: any,
    ) {
        return this.kyc.updateDirector(businessId, directorId, payload, req.user.userId);
    }

    // Documents
    @Post('kyc/:businessId/documents')
    @ApiOperation({ summary: 'Upload/record a business document' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    addDocument(@Param('businessId') businessId: string, @Body() payload: DocumentCreateDto, @Req() req: any) {
        return this.kyc.addDocument(businessId, payload, req.user.userId);
    }

    @Get('kyc/:businessId/documents')
    @ApiOperation({ summary: 'List business documents' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    listDocuments(@Param('businessId') businessId: string) {
        return this.kyc.listDocuments(businessId);
    }    

    // Business KYC: Address and Proof of Address
    @Patch('kyc/:businessId/address')
    @ApiOperation({ summary: 'Update business registered/operating addresses' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateBusinessAddresses(
        @Param('businessId') businessId: string,
        @Body() payload: BusinessAddressUpdateDto,
    ) {
        return this.business.updateAddresses(businessId, payload);
    }

    @Post('kyc/:businessId/proof-of-address')
    @ApiOperation({ summary: 'Upload business proof of address document' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    addProofOfAddress(
        @Param('businessId') businessId: string,
        @Body() payload: ProofOfAddressCreateDto,
        @Req() req: any,
    ) {
        return this.kyc.addProofOfAddress(businessId, payload, req.user.userId);
    }

    @Patch('kyc/:businessId/tin')
    @ApiOperation({ summary: 'Set/update business TIN number' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateTin(
        @Param('businessId') businessId: string,
        @Body() payload: TinUpdateDto,
    ) {
        return this.business.updateTin(businessId, payload);
    }

    @Post('kyc/:businessId/submit-for-review')
    @ApiOperation({ summary: 'Acknowledge and submit KYC for review' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    submitForReview(
        @Param('businessId') businessId: string,
        @Req() req: any,
    ) {
        return this.kyc.submitForReview(businessId, req.user.userId);
    }

    @Get('kyc/:businessId/readiness')
    @ApiOperation({ summary: 'Check KYC readiness (sections completeness)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    getKycReadiness(
        @Param('businessId') businessId: string,
    ) {
        return this.kyc.getKycReadiness(businessId);
    }

    // Invitations
    @Post(':businessId/invite')
    @ApiOperation({ summary: 'Invite a user to join this business by email' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    inviteUser(
        @Param('businessId') businessId: string,
        @Body() payload: InviteUserDto,
        @Req() req: any,
    ) {
        return this.business.inviteUser(businessId, req.user.userId, payload.email, payload.role);
    }

    @Get('invites')
    @ApiOperation({ summary: 'List my pending business invites' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    listInvites(@Req() req: any) {
        return this.business.listInvitesForEmail(req.user.email);
    }

    @Post('invites/:inviteId/accept')
    @ApiOperation({ summary: 'Accept an invitation to join a business' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    acceptInvite(
        @Param('inviteId') inviteId: string,
        @Req() req: any,
    ) {
        return this.business.acceptInviteById(inviteId, req.user.userId);
    }

    @Post('invites/:inviteId/decline')
    @ApiOperation({ summary: 'Decline a business invitation' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    declineInvite(
        @Param('inviteId') inviteId: string,
        @Req() req: any,
    ) {
        return this.business.declineInviteById(inviteId, req.user.userId);
    }
}

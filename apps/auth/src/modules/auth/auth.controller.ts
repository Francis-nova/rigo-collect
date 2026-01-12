import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { otpDto, RefreshDto, signinDto, signupDto, ChangePasswordDto, ForgotPasswordInitDto, ForgotPasswordCompleteDto } from '@pkg/dto';
import { SwitchBusinessDto } from '@pkg/dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiTooManyRequestsResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('signin')
    @ApiOperation({ summary: 'Sign in to an existing (accounts)' })
    @ApiResponse({ status: 201, description: 'User signed in successfully' })
    signin(
        @Body() payload: signinDto) {
        return this.auth.signin(payload);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Create a new user (accounts)' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    signup(@Body() payload: signupDto) {
        return this.auth.signup(payload);
    }

    @Post('validate-email')
    @ApiOperation({ summary: 'Validate user email (accounts)' })
    @ApiResponse({ status: 201, description: 'User email validated successfully' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    validateEmail(@Body() payload: otpDto, @Req() req: any) {
        return this.auth.validateEmail(payload, req.user?.userId);
    }

    @Post('resend-email-otp')
    @ApiOperation({ summary: 'Resend email verification OTP' })
    @ApiResponse({ status: 200, description: 'OTP resent successfully' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    resendEmailOtp(@Req() req: any) {
        return this.auth.resendEmailOtp(req.user?.userId);
    }

    @Post('refresh') 
    @ApiOperation({ summary: 'Exchange refresh token for new access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })

    refresh(@Body() payload: RefreshDto) {
        return this.auth.refresh(payload.refreshToken);
    }

    @Get('logout')
    @ApiOperation({ summary: 'Logout (revoke current access token)' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: any) {
        return this.auth.logout(req.user?.jti);
    }

    @Post('change-password')
    @ApiOperation({ summary: 'Change account password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    changePassword(@Body() payload: ChangePasswordDto, @Req() req: any) {
        return this.auth.changePassword(req.user?.userId, payload);
    }

    @Post('forgot/init')
    @ApiOperation({ summary: 'Start forgot password (send OTP via email)' })
    @ApiResponse({ status: 200, description: 'OTP sent if email exists' })
    @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded for password reset requests' })
    forgotInit(@Body() payload: ForgotPasswordInitDto) {
        return this.auth.forgotPasswordInit(payload);
    }

    @Post('forgot/complete')
    @ApiOperation({ summary: 'Complete forgot password (verify OTP and set new password)' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
    @ApiTooManyRequestsResponse({ description: 'Too many invalid OTP attempts' })
    forgotComplete(@Body() payload: ForgotPasswordCompleteDto) {
        return this.auth.forgotPasswordComplete(payload);
    }

    @Post('switch-business')
    @ApiOperation({ summary: 'Switch active business context (returns new tokens)' })
    @ApiResponse({ status: 200, description: 'Business context switched and new tokens issued' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    switchBusiness(@Body() payload: SwitchBusinessDto, @Req() req: any) {
        return this.auth.switchBusiness(req.user?.userId, payload.businessId);
    }
}

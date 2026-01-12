import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { User } from '../../entities/user.entity';
import { otpDto, signinDto, signupDto, UserSigninResponseDto, ChangePasswordDto, ForgotPasswordInitDto, ForgotPasswordCompleteDto } from '@pkg/dto';
import { fail, ok } from '@pkg/common';
import * as argon2 from 'argon2';
import { VerificationCode } from '../../entities/verification-code.entity';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { POSTOFFICE_SERVICE } from '@pkg/common';
import { JwtService } from '@nestjs/jwt';
import { AccessToken } from '../../entities/access-token.entity';
import { v4 as uuidv4 } from 'uuid';
import indexConfig from '../../configs/index.config';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { BusinessService } from '../business/business.service';
import { REDIS } from '../../providers/redis.provider';
import type Redis from 'ioredis';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(VerificationCode) private readonly verificationRepository: Repository<VerificationCode>,
        @Inject(POSTOFFICE_SERVICE) private readonly postOfficeClient: ClientProxy,
        @InjectRepository(AccessToken) private readonly tokenRepository: Repository<AccessToken>,
        @InjectRepository(RefreshToken) private readonly refreshRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly businessService: BusinessService,
        @Inject(REDIS) private readonly redis: Redis,
    ) { }
    private readonly logger = new Logger(AuthService.name);

    async signin(payload: signinDto) {
        try {
            // check if user exists
            const user = await this.userRepository.findOneBy({ email: payload.email });

            if (!user) {
                throw new Error('Invalid signin credentials');
            }

            //  check if password matches...
            const valid = await argon2.verify(user.passwordHash, payload.password);
            if (!valid) {
                throw new Error('Invalid signin credentials');
            }

            const { accessToken, refreshToken } = await this.issueTokensForUser(user);
            return ok({ refreshToken, token: accessToken } as UserSigninResponseDto, 'signin successful');

        } catch (error: any) {
            this.logger.error('Signin failed', error?.stack || error);
            throw new Error(error?.message ?? 'Error signing in. Please try again later.');
        }
    }

    async signup(payload: signupDto) {
        try {
            // Check if user already exists
            const existing = await this.userRepository.findOneBy({ email: payload.email });
            if (existing) {
                throw new Error('Email already registered');
            }

            // Hash password
            const passwordHash = await argon2.hash(payload.password);

            // Create user record
            const user = this.userRepository.create({
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                passwordHash,
                businessName: payload.businessName,
                status: 'PENDING_EMAIL',
            });
            const saved = await this.userRepository.save(user);

            // Generate OTP (6 digits)
            const otp = String(Math.floor(100000 + Math.random() * 900000));
            const codeHash = await argon2.hash(otp);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Store verification code
            const vcode = this.verificationRepository.create({
                userId: saved.id,
                user: saved,
                type: 'email',
                codeHash,
                expiresAt,
            });
            await this.verificationRepository.save(vcode);

            // Skip default business creation during signup; onboarding flow handled elsewhere

            // Queue message to post-office service
            this.postOfficeClient.emit('auth.email.verification', {
                to: saved.email,
                subject: `Hello ${saved.firstName}, Verify your email`,
                otp,
                userId: saved.id,
            });

            const { accessToken, refreshToken } = await this.issueTokensForUser(saved);
            return ok({ id: saved.id, email: saved.email, nextAction: 'VALIDATE_EMAIL', token: accessToken, refreshToken }, 'signup successful');
        } catch (error: any) {
            this.logger.error('Signup failed', error?.stack || error);
            throw new Error(error.message ?? 'Error signing up. Please try again later or contact support.');
        }
    }

    async validateEmail(payload: otpDto, userId?: string) {
        try {
            // Find an active, unconsumed email verification code that matches the OTP
            const where: any = { type: 'email', consumedAt: IsNull(), expiresAt: MoreThan(new Date()) };
            if (userId) where.userId = userId;
            const candidates = await this.verificationRepository.find({ where });
            let matched: VerificationCode | null = null;
            for (const c of candidates) {
                if (c.expiresAt && c.expiresAt.getTime() < Date.now()) continue;
                const okMatch = await argon2.verify(c.codeHash, payload.otp);
                if (okMatch) { matched = c; break; }
            }

            if (!matched) {
                throw new Error('Invalid or expired OTP');
            }

            // Mark code consumed and activate user
            matched.consumedAt = new Date();
            await this.verificationRepository.save(matched);

            const user = await this.userRepository.findOneBy({ id: matched.userId });
            if (!user) {
                throw new Error('User not found');
            }
            user.emailVerifiedAt = new Date();
            user.status = 'ACTIVE';
            await this.userRepository.save(user);

            return ok({ id: user.id, email: user.email }, 'email_validated');
        } catch (error: any) {
            this.logger.error('Email validation failed', error?.stack || error);
            throw new Error(error?.message ?? 'Failed to validate email. Please try again later.');
        }
    }

    async resendEmailOtp(userId: string) {
        // Fetch user
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Rate limit resend attempts per email
        const limit = indexConfig.auth.emailVerification.resendLimit;
        const windowSec = indexConfig.auth.emailVerification.resendWindowSec; // 1 hour
        const attemptKey = `email:otp:resend:${user.email}`;
        const attempts = await this.redis.incr(attemptKey);
        if (attempts === 1) await this.redis.expire(attemptKey, windowSec);
        if (attempts > limit) return fail('Too many resend attempts. Please try again later.');

        // Generate and store a new OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const codeHash = await argon2.hash(otp);
        const ttlSec = indexConfig.auth.emailVerification.ttlSeconds;
        const expiresAt = new Date(Date.now() + ttlSec * 1000);

        const vcode = this.verificationRepository.create({
            userId: user.id,
            user,
            type: 'email',
            codeHash,
            expiresAt,
        });
        await this.verificationRepository.save(vcode);

        // Send via post-office
        this.postOfficeClient.emit('auth.email.verification', {
            to: user.email,
            subject: `Hello ${user.firstName}, Verify your email`,
            otp,
            userId: user.id,
        });

        return ok(null, 'otp_resent');
    }

    async logout(jti?: string) {
        if (!jti) {
            throw new Error('Invalid token');
        }
        const record = await this.tokenRepository.findOne({ where: { jti } });
        if (!record) {
            throw new Error('Token not found');
        }
        record.revokedAt = new Date();
        await this.tokenRepository.save(record);
        return ok(null, 'logged_out');
    }

    async changePassword(userId: string, payload: ChangePasswordDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        const valid = await argon2.verify(user.passwordHash, payload.currentPassword);
        if (!valid) throw new Error('Current password is incorrect');

        if (payload.newPassword !== payload.confirmPassword) {
            throw new Error('New password and confirm password do not match');
        }

        if (payload.newPassword === payload.currentPassword) {
            throw new Error('New password must be different from current password');
        }

        const newHash = await argon2.hash(payload.newPassword);
        user.passwordHash = newHash;
        await this.userRepository.save(user);

        // Revoke all active access and refresh tokens for this user
        const now = new Date();
        await this.tokenRepository.update({ userId: user.id, revokedAt: IsNull() }, { revokedAt: now });
        await this.refreshRepository.update({ userId: user.id, revokedAt: IsNull() }, { revokedAt: now });

        // Notify via post-office queue
        this.postOfficeClient.emit('auth.password.changed', {
            to: user.email,
            subject: `Your password was changed`,
            userId: user.id,
            changedAt: now.toISOString(),
            ipAddress: '',
            device: '', // TODO capture device info....
        });

        return ok(null, 'password_changed_tokens_revoked');
    }

    async refresh(refreshToken: string) {
        const record = await this.refreshRepository.findOne({ where: { token: refreshToken } });
        if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
            throw new Error('Invalid refresh token');
        }
        const user = await this.userRepository.findOneBy({ id: record.userId });
        if (!user) throw new Error('User not found');

        // rotate refresh: revoke old and issue new pair
        record.revokedAt = new Date();
        await this.refreshRepository.save(record);

        // Preserve business context if present on the refresh token
        let bizCtx: { businessId?: string; businessRole?: string } | undefined;
        try {
            const decoded: any = this.jwtService.verify(refreshToken, { secret: indexConfig.auth.refreshSecret });
            if (decoded?.biz_id) {
                bizCtx = { businessId: decoded.biz_id, businessRole: decoded.biz_role };
            }
        } catch { /* ignore verify errors since record has already validated */ }

        const { accessToken, refreshToken: newRefresh } = await this.issueTokensForUser(user, bizCtx);
        return ok({ token: accessToken, refreshToken: newRefresh }, 'token_refreshed');
    }

    private async issueTokensForUser(user: User, context?: { businessId?: string; businessRole?: string }): Promise<{ accessToken: string; refreshToken: string }> {
        // Access token
        const accessJti = uuidv4();
        const accessPayload: any = { sub: user.id, email: user.email, jti: accessJti };
        if (context?.businessId) {
            accessPayload.biz_id = context.businessId;
            accessPayload.biz_role = context.businessRole;
        }
        const accessToken = this.jwtService.sign(accessPayload);
        const accessDecoded: any = this.jwtService.decode(accessToken);
        let accessExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        if (accessDecoded?.exp) accessExpiresAt = new Date(accessDecoded.exp * 1000);

        await this.tokenRepository.save(
            this.tokenRepository.create({ userId: user.id, user, jti: accessJti, token: accessToken, expiresAt: accessExpiresAt, businessId: context?.businessId || null, businessRole: context?.businessRole || null })
        );

        // Refresh token
        const refreshJti = uuidv4();
        const refreshPayload: any = { sub: user.id, email: user.email, jti: refreshJti, typ: 'refresh' };
        if (context?.businessId) {
            refreshPayload.biz_id = context.businessId;
            refreshPayload.biz_role = context.businessRole;
        }
        const refreshSecret = indexConfig.auth.refreshSecret;
        const refreshExpiresIn = indexConfig.auth.refreshExpiresIn;
        const refreshToken = this.jwtService.sign(refreshPayload, { secret: refreshSecret, expiresIn: refreshExpiresIn });
        const refreshDecoded: any = this.jwtService.decode(refreshToken);
        let refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (refreshDecoded?.exp) refreshExpiresAt = new Date(refreshDecoded.exp * 1000);

        await this.refreshRepository.save(
            this.refreshRepository.create({ userId: user.id, user, jti: refreshJti, token: refreshToken, expiresAt: refreshExpiresAt, businessId: context?.businessId || null, businessRole: context?.businessRole || null })
        );

        return { accessToken, refreshToken };
    }

    async switchBusiness(userId: string, businessId: string) {
        // verify membership
        const membership = await this.businessService.getUserMembership(userId, businessId);
        if (!membership || membership.status !== 'ACTIVE') {
            throw new Error('You do not have access to this business');
        }
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        // Issue new tokens with business context
        const { accessToken, refreshToken } = await this.issueTokensForUser(user, { businessId, businessRole: membership.role });

        return ok({ token: accessToken, refreshToken, business: { id: businessId, role: membership.role } }, 'business_switched');
    }

    async forgotPasswordInit(payload: ForgotPasswordInitDto) {
        try {
            // Rate limit init attempts per email
            const limit = indexConfig.auth.forgotPassword.initLimit;
            const windowSec = indexConfig.auth.forgotPassword.initWindowSec; // 15 minutes
            const attemptKey = `fp:attempt:init:${payload.email}`;
            const attempts = await this.redis.incr(attemptKey);
            if (attempts === 1) {
                await this.redis.expire(attemptKey, windowSec);
            }
            if (attempts > limit) {
                return fail('Too many password reset requests. Please try again later.');
            }

            // Always respond success to avoid email enumeration
            const user = await this.userRepository.findOneBy({ email: payload.email });
            if (!user) {
                return fail('Email not found, could not reset password.');
            }

            const otp = String(Math.floor(100000 + Math.random() * 900000));
            const ttl = indexConfig.auth.forgotPassword.ttlSeconds; // 10 minutes
            const key = `fp:otp:${payload.email}`;

            await this.redis.set(key, otp, 'EX', ttl);

            this.postOfficeClient.emit('auth.password.reset.init', {
                to: user.email,
                subject: `Reset your password`,
                otp,
                userId: user.id,
                ttlSeconds: ttl,
            });

            return ok(null, 'An OTP has been sent to your email. use it to reset your password.');
        } catch (error: any) {
            this.logger.error('Forgot password init failed', error?.stack || error);
            return fail('Failed to create forgot password request. Please try again later.');
        }
    }

    async forgotPasswordComplete(payload: ForgotPasswordCompleteDto) {
        const user = await this.userRepository.findOneBy({ email: payload.email });
        if (!user) {
            throw new Error('Invalid email or OTP');
        }

        const key = `fp:otp:${payload.email}`;
        const stored = await this.redis.get(key);

        // Track invalid OTP attempts and limit them
        const completeLimit = indexConfig.auth.forgotPassword.completeLimit;
        const completeWindowSec = indexConfig.auth.forgotPassword.completeWindowSec;
        const completeAttemptKey = `fp:attempt:complete:${payload.email}`;

        if (!stored || stored !== payload.otp) {
            const cAttempts = await this.redis.incr(completeAttemptKey);
            if (cAttempts === 1) await this.redis.expire(completeAttemptKey, completeWindowSec);
            if (cAttempts > completeLimit) {
                return fail('Too many invalid OTP attempts. Please try again later.');
            }
            return fail('Invalid or expired OTP');
        }

        if (payload.newPassword !== payload.confirmPassword) {
            throw new Error('New password and confirm password do not match');
        }

        const newHash = await argon2.hash(payload.newPassword);
        user.passwordHash = newHash;
        await this.userRepository.save(user);

        // Delete OTP so it cannot be reused
        await this.redis.del(key);
        await this.redis.del(completeAttemptKey);

        // Revoke all existing tokens
        const now = new Date();
        await this.tokenRepository.update({ userId: user.id, revokedAt: IsNull() }, { revokedAt: now });
        await this.refreshRepository.update({ userId: user.id, revokedAt: IsNull() }, { revokedAt: now });

        // Notify via post-office
        this.postOfficeClient.emit('auth.password.reset.completed', {
            to: user.email,
            subject: `Your password was reset`,
            userId: user.id,
            changedAt: now.toISOString(),
        });

        return ok(null, 'password_reset_success');
    }
}

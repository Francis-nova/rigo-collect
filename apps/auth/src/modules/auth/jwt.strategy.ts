import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken } from '../../entities/access-token.entity';
import indexConfig from '../../configs/index.config';
import { User } from '../../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
  biz_id?: string;
  biz_role?: string;
  biz_name?: string;
  biz_status?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AccessToken) private readonly tokenRepo: Repository<AccessToken>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: indexConfig.auth.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // Ensure token exists and is not revoked
    const record = await this.tokenRepo.findOne({ where: { jti: payload.jti } });
    if (!record) {
      throw new UnauthorizedException('Token not found');
    }
    if (record.revokedAt) {
      throw new UnauthorizedException('Token revoked');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Attach user and business context to request
    const business = payload.biz_id
      ? { id: payload.biz_id, role: payload.biz_role, name: payload.biz_name, status: payload.biz_status }
      : undefined;
    return { userId: user.id, email: user.email, jti: payload.jti, business };
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import indexConfig from '../configs/index.config';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  businessName: string;
  businessType: string;
  userType: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserBusiness {
  id: string
  name: string
  tradingName: string;
  registrationNumber: string;
  entityType: string;
  ownerId: string;
  status: string;
  natureOfBusiness: string;
  countryOfIncorporation: string;
  dateOfIncorporation: string;
  industry: string;
  websiteUrl: string;
  email: string;
  phoneNumber: string;
  tinNumber: null,
  registeredAddress: {
    city: string,
    state: string,
    street: string,
    country: string
  },
  operatingAddress: {
    city: string,
    state: string,
    street: string,
    country: string
  },
  tier: string,
  riskLevel: Record<string, any>,
  kycStatus: string,
  kycStage: string,
  approvedAt: string,
  approvedBy: string,
  createdAt: string,
  updatedAt: string,
}

export interface IAuthProfile {
  user: IUser;
  business: IUserBusiness;
}

@Injectable()
export class AuthProfileGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('missing_bearer_token');
    }
    try {
      const url = `${indexConfig.auth.baseUrl}/${indexConfig.apiPrefix}/internal/validate-token`;
      const headers: Record<string, string> = { Authorization: authHeader };
      const internalKey = indexConfig.auth.internalApiKey;
      if (!internalKey) {
        throw new UnauthorizedException('internal_key_not_configured');
      }
      headers['X-Internal-Key'] = internalKey;
      const resp = await axios.get(url, { headers });
      const payload = resp.data?.data ?? null;
      if (!payload || payload.status !== true) throw new UnauthorizedException('Invalid token validation');
      req.authProfile = payload;
      req.user = payload.user as IUser;
      req.business = payload.business as IUserBusiness;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

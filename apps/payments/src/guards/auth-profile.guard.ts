import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import indexConfig from '../configs/index.config';

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
      if (!payload || payload.valid !== true) throw new UnauthorizedException('invalid_token_validation_response');
      req.authProfile = payload;
      req.user = payload.user;
      req.business = payload.business;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException('invalid_or_expired_token');
    }
  }
}

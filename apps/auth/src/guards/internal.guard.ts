import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import indexConfig from '../configs/index.config';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const headerKey = (req.headers['x-internal-key'] || req.headers['X-Internal-Key']) as string | undefined;
    const expected = indexConfig.auth.internalApiKey;
    if (!expected) {
      throw new ForbiddenException('Internal access not configured');
    }
    if (!headerKey || headerKey !== expected) {
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@pkg/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'] as string | undefined;
    if (!apiKey) throw new UnauthorizedException('Missing API key');

    const res = await firstValueFrom(this.authClient.send('auth.validateApiKey', { apiKey }));
    if (!res?.valid) throw new UnauthorizedException('Invalid API key');
    // attach merchant to request for downstream handlers
    req.merchant = { id: res.merchantId };
    return true;
  }
}

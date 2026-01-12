import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	// Map returned user payload to req.user and also attach req.business
	handleRequest(err: any, user: any, info: any, context: any, status?: any) {
		const req = context?.switchToHttp?.()?.getRequest?.();
		if (req && user?.business) {
			req.business = user.business;
		}
		if (err || !user) {
			// default behavior
			return super.handleRequest(err, user, info, context, status);
		}
		return user;
	}
}

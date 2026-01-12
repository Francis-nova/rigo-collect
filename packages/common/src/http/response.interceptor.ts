import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ok } from './response';
import { RESPONSE_MESSAGE_KEY } from './response-message.decorator';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) || 'success';

    // Only transform HTTP responses
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: any): ApiResponse => {
        return ok(data ?? null, message);
      })
    );
  }
}

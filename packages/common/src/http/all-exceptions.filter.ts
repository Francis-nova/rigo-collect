import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { fail } from './response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'internal_error';
    let data: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = typeof response === 'string' ? response : response?.message || exception.message;
      data = response?.error || null;
    } else if (exception?.message) {
      message = exception.message;
    }

    res.status(status).json(fail(message, data));
  }
}

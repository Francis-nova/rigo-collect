import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { fail } from './response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(_httpAdapterHost?: any) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'internal_error';
    let data: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      const respMessage = typeof response === 'string' ? response : response?.message || exception.message;

      // If validation errors are present, surface them clearly
      if (status === HttpStatus.BAD_REQUEST && Array.isArray(respMessage)) {
        message = 'validation_failed';
        data = respMessage; // array of validation error messages
      } else {
        message = Array.isArray(respMessage) ? 'bad_request' : respMessage;
        // Prefer structured response data when available
        data = typeof response === 'object' ? (response?.error ?? response) : null;
      }
    } else if (exception?.message) {
      message = exception.message;
    }

    res.status(status).json(fail(message, data));
  }
}

import { Injectable, LoggerService as NestLogger } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';

@Injectable()
export class AppLogger implements NestLogger {
  private readonly logger: PinoLogger;
  constructor() {
    this.logger = pino({ transport: { target: 'pino-pretty' } });
  }
  log(message: any, context?: string) { this.logger.info({ context }, message); }
  error(message: any, trace?: string, context?: string) { this.logger.error({ context, trace }, message); }
  warn(message: any, context?: string) { this.logger.warn({ context }, message); }
  debug?(message: any, context?: string) { this.logger.debug({ context }, message); }
  verbose?(message: any, context?: string) { this.logger.trace({ context }, message); }
}

export { pino };

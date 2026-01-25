import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionPin, TransactionPinStatus } from '../../entities/transaction-pin.entity';
import { SetTransactionPinDto } from './dtos/set-transaction-pin.dto';
import * as crypto from 'crypto';
import { fail, ok } from '@pkg/common';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(TransactionPin)
    private readonly pinRepo: Repository<TransactionPin>,
  ) { }

  private hashPin(pin: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 100_000;
    const keylen = 32;
    const digest = 'sha256';
    const derived = crypto.pbkdf2Sync(pin, salt, iterations, keylen, digest).toString('hex');
    return `${salt}:${iterations}:${digest}:${derived}`;
  }

  private verifyHashedPin(pin: string, storedHash: string): boolean {
    try {
      const parts = storedHash.split(':');
      if (parts.length !== 4) return false;
      const [salt, iterationsStr, digest, derivedHex] = parts;
      const iterations = Number(iterationsStr);
      if (!salt || !iterations || !digest || !derivedHex) return false;
      const keylen = Buffer.from(derivedHex, 'hex').length; // preserve original length
      const computed = crypto.pbkdf2Sync(pin, salt, iterations, keylen, digest);
      const stored = Buffer.from(derivedHex, 'hex');
      if (stored.length !== computed.length) return false;
      // timing-safe compare
      return crypto.timingSafeEqual(stored, computed);
    } catch {
      return false;
    }
  }

  async setTransactionPin(auth: any, dto: SetTransactionPinDto) {
    try {
      const existing = await this.pinRepo.findOne({
        where: { userId: auth?.user?.id, businessId: auth?.business?.id },
      });

      if (existing) {
        this.logger.warn('Attempt to set transaction pin when one already exists', { userId: auth?.user?.id, businessId: auth?.business?.id });
        throw new Error('Transaction pin already set. Try to reset it instead.');
      }

      const pinHash = this.hashPin(dto.pin);

      const record = this.pinRepo.create({
        userId: auth?.user?.id,
        businessId: auth?.business?.id,
        pinHash,
        status: TransactionPinStatus.ACTIVE,
      });
      await this.pinRepo.save(record);
      return ok('Transaction pin set successfully');
    } catch (error: any) {
      this.logger.error('Error setting transaction pin', error?.stack || error);
      throw new Error(error?.message ?? 'Failed to set transaction pin. Please try again later.');
    }
  }

  async verifyTransactionPin(auth: any, dto: SetTransactionPinDto) {
    try {
      const record = await this.pinRepo.findOne({
        where: { userId: auth?.user?.id, businessId: auth?.business?.id, status: TransactionPinStatus.ACTIVE },
      });

      if (!record) {
        this.logger.warn('Transaction pin not set for user', { userId: auth?.user?.id, businessId: auth?.business?.id });
        return fail('Transaction pin not set');
      }

      if (record.status === TransactionPinStatus.BLOCKED) {
        this.logger.warn('Transaction pin is blocked', { userId: auth?.user?.id, businessId: auth?.business?.id });
        return fail('Transaction pin is blocked');
      }

      const isValid = this.verifyHashedPin(dto.pin, record.pinHash);
      if (!isValid) {
        return fail('Invalid transaction pin');
      }
      return ok('Transaction pin verified');
    } catch (error: any) {
      this.logger.error('Error verifying transaction pin', error?.stack || error);
      throw new Error(error?.message ?? 'Failed to verify transaction pin. Please try again later.');
    }
  }
}

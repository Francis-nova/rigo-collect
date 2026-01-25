import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { CreateDateColumn, Entity, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Currency } from './currency.entity';

export enum ITransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum ITransactionAction {
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
}

export enum ITransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
  PROCESSING = 'processing',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  accountId!: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: Account;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'uuid' })
  currencyId!: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId' })
  currency!: Currency;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  fee?: number;

  @Column({
    type: 'enum',
    enum: ITransactionType,
  })
  type!: ITransactionType;

  @Column({
    type: 'enum',
    enum: ITransactionStatus,
  })
  status!: ITransactionStatus;

  @Column({ nullable: true, unique: true })
  reference?: string; // this is unique reference for each transaction...

  @Column({ nullable: true, unique: true })
  transactionId?: string; // this is provider transaction id...

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

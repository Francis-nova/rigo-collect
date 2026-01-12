import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { SubAccount } from './sub-account.entity';
import { AccountStatus } from './types/account-status.enum';

// moved to ./types/account-status.enum

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // e.g., 0123456789
  @Index()
  @Column({ type: 'varchar', length: 32, unique: true })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 50 })
  accountName!: string;

  // e.g., bank code or provider code
  @Index()
  @Column({ type: 'varchar', length: 16 })
  bankCode!: string;

  @Column({ type: 'varchar', length: 50 })
  bankName!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // the account name...

  // The currency id: e.g., NGN, USD
  @Column({ type: 'uuid' })
  currencyId!: string;

  @ManyToOne(() => Currency, (currency) => currency.accounts)
  currency!: Currency;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance!: number;

  // the business Id of the account (this is link to what business owns the account)
  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @Column('jsonb', { nullable: true })
  metadata!: Record<string, any>; // e.g., accountNumber, routingNumber, etc. or anything extra

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => SubAccount, (sub) => sub.parentAccount)
  subaccounts!: SubAccount[];
}

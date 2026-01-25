import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { SubAccount } from './sub-account.entity';
import { AccountStatus } from './types/account-status.enum';

// moved to ./types/account-status.enum

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

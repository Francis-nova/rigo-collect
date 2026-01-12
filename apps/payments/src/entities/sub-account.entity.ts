import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from './account.entity';
import { AccountStatus } from './types/account-status.enum';

@Entity({ name: 'sub_accounts' })
export class SubAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  accountId!: string; // parent/main account id

  @ManyToOne(() => Account, (account) => account.subaccounts, { onDelete: 'CASCADE' })
  parentAccount!: Account;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 50 })
  accountName!: string;

  @Index()
  @Column({ type: 'varchar', length: 16 })
  bankCode!: string;

  @Column({ type: 'varchar', length: 50 })
  bankName!: string;

  @Column({ type: 'uuid' })
  currencyId!: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Index()
  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @Column('jsonb', { nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

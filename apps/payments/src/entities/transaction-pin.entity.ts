import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TransactionPinStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Entity({ name: 'transaction_pins' })
export class TransactionPin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'varchar', length: 255 })
  pinHash!: string;

  @Column({ type: 'enum', enum: TransactionPinStatus, default: TransactionPinStatus.ACTIVE })
  status!: TransactionPinStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

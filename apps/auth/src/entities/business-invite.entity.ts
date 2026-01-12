import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Business } from './business.entity';

@Entity({ name: 'business_invites' })
export class BusinessInvite {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @Column({ type: 'varchar', length: 256 })
  @Index()
  email!: string;

  @Column({ name: 'inviter_user_id', type: 'uuid' })
  inviterUserId!: string;

  @Column({ type: 'varchar', length: 16 })
  role!: string; // 'OWNER' | 'ADMIN' | 'FINANCE' | 'VIEWER'

  @Column({ type: 'varchar', length: 64, unique: true })
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

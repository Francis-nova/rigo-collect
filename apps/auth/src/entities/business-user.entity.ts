import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Business } from './business.entity';

export type BusinessUserRole = 'OWNER' | 'ADMIN' | 'FINANCE' | 'VIEWER';
export type BusinessUserStatus = 'ACTIVE' | 'INVITED' | 'REMOVED';

@Entity({ name: 'business_users' })
@Unique('uniq_user_business', ['userId', 'businessId'])
export class BusinessUser {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @Column({ type: 'varchar', length: 16, default: 'VIEWER' })
  role!: BusinessUserRole;

  @Column({ type: 'varchar', length: 16, default: 'ACTIVE' })
  status!: BusinessUserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import { Business } from './business.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ApiKeyEnvironment = 'production' | 'sandbox';

@Entity({ name: 'api_keys' })
@Index('idx_api_keys_business_env_active', ['businessId', 'environment', 'isActive'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @Column({ name: 'key_hash', type: 'varchar', length: 128, unique: true })
  keyHash!: string;

  @Column({ name: 'last_four', type: 'varchar', length: 8 })
  lastFour!: string;

  @Column({ type: 'varchar', length: 16, default: 'production' })
  environment!: ApiKeyEnvironment;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

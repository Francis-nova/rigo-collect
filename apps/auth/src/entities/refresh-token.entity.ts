import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  jti!: string;

  @Column({ type: 'text' })
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  // Optional business context attached to the refresh token
  @Column({ name: 'business_id', type: 'uuid', nullable: true })
  businessId?: string | null;

  @Column({ name: 'business_role', type: 'varchar', length: 16, nullable: true })
  businessRole?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

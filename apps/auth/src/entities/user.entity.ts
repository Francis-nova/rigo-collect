import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type UserType = 'user' | 'admin';
export type UserStatus = 'PENDING_EMAIL' | 'PENDING_PHONE' | 'ACTIVE';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  firstName!: string;

  @Column({ type: 'varchar', length: 120 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255 })
  businessName!: string;

  @Column({ type: 'varchar', length: 255, default: 'merchant' })
  businessType!: string;

  @Column({ type: 'varchar', length: 16, default: 'user' })
  userType!: UserType;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  phoneVerifiedAt?: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING_EMAIL' })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Business } from './business.entity';
import { PersonKyc } from './person-kyc.entity';

@Entity({ name: 'directors' })
export class Director {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @ManyToOne(() => PersonKyc, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonKyc;

  @Column({ name: 'person_id', type: 'uuid' })
  @Index()
  personId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

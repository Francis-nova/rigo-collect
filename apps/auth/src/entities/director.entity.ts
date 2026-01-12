import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Business } from './business.entity';
import { PersonKyc } from './person-kyc.entity';

@Entity({ name: 'directors' })
export class Director {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @ManyToOne(() => PersonKyc, { onDelete: 'CASCADE' })
  person!: PersonKyc;

  @Column({ name: 'person_id', type: 'uuid' })
  @Index()
  personId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

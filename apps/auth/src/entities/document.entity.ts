import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Business } from './business.entity';
import { Director } from './director.entity';
import { DocumentStatus, DocumentType } from '@pkg/dto';

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business!: Business;

  @Column({ name: 'business_id', type: 'uuid' })
  @Index()
  businessId!: string;

  @ManyToOne(() => Director, { onDelete: 'SET NULL', nullable: true })
  director?: Director | null;

  @Column({ name: 'director_id', type: 'uuid', nullable: true })
  @Index()
  directorId?: string | null;

  @Column({ type: 'enum', enum: DocumentType })
  documentType!: DocumentType;

  @Column({ type: 'varchar', length: 500 })
  fileUrl!: string;

  @Column({ type: 'date', nullable: true })
  issuedDate?: Date | null;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status!: DocumentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verifiedByUserId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  risk?: {
    expectedMonthlyVolume: string,
    expectedTransactionCount: number,
    sourceOfFunds: string,
    businessUseCase: string,
    highRiskIndustry: boolean
  };

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

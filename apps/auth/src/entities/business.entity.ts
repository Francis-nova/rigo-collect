import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { AddressDto, BusinessKYC, BusinessKycStage, BusinessRiskLevel, BusinessStatus, BusinessTier, EntityType } from '@pkg/dto';

@Entity({ name: 'businesses' })
export class Business {
    @PrimaryGeneratedColumn('uuid') id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 150 })
    tradingName!: string;

    @Column({ type: 'varchar', length: 70, nullable: true })
    registrationNumber!: string | null;

    @Column({ type: 'enum', enum: EntityType, nullable: true })
    entityType!: EntityType;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    owner?: User | null;

    @Column({ name: 'owner_id', type: 'uuid', nullable: true })
    @Index()
    ownerId?: string | null;

    @Column({ type: 'enum', enum: BusinessStatus, default: BusinessStatus.PENDING_APPROVAL })
    status!: BusinessStatus;

    @Column({ type: 'varchar', length: 100, nullable: true })
    natureOfBusiness!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    countryOfIncorporation!: string | null;

    @Column({ type: 'date', nullable: true })
    dateOfIncorporation!: Date | null;

    @Column({ type: 'text', nullable: true })
    industry!: string | null;

    @Column({ type: 'varchar', length: 250, nullable: true })
    websiteUrl!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email!: string | null;

    @Column({ type: 'varchar', length: 15, nullable: true })
    phoneNumber!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    tinNumber!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    registeredAddress!: AddressDto | null;

    @Column({ type: 'jsonb', nullable: true })
    operatingAddress!: AddressDto | null;

    @Column({ type: 'enum', enum: BusinessTier, nullable: true })
    tier!: BusinessTier | null;

    @Column({ type: 'enum', enum: BusinessRiskLevel, nullable: true })
    riskLevel!: BusinessRiskLevel | null;

    @Column({ type: 'enum', enum: BusinessKYC, nullable: true })
    kycStatus!: BusinessKYC | null;

    @Column({ type: 'enum', enum: BusinessKycStage, nullable: true })
    kycStage!: BusinessKycStage | null;

    @Column({ type: 'timestamptz', nullable: true })
    approvedAt!: Date | null;

    @Column({ type: 'uuid', nullable: true })
    approvedBy!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

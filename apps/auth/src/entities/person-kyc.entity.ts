import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IdType } from '@pkg/dto';

@Entity({ name: 'person_kyc' })
export class PersonKyc {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar', length: 120 })
  firstName!: string;

  @Column({ type: 'varchar', length: 120 })
  lastName!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'varchar', length: 3 })
  nationality!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  bvn?: string | null;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  residentialAddress!: string;

  @Column({ type: 'enum', enum: IdType })
  idType!: IdType;

  @Column({ type: 'varchar', length: 64 })
  idNumber!: string;

  @Column({ type: 'boolean', default: false })
  isPep!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from './country.entity';

@Entity({ name: 'states' })
export class State {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  code?: string;

  @ManyToOne(() => Country, { nullable: false, onDelete: 'CASCADE' })
  country!: Country;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

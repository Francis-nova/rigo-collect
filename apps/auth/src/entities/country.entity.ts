import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  @Index()
  code!: string; // ISO code

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

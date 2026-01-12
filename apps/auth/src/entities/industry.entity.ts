import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'industries' })
export class Industry {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  @Index()
  code!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

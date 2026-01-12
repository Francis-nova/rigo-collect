import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar', length: 100 })
  entityType!: string;

  @Column({ type: 'varchar', length: 64 })
  entityId!: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true })
  actorUserId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

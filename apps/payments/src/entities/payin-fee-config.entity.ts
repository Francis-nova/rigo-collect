import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'payin_fee_configs' })
@Index('uq_payin_fee_configs_business_currency', ['businessId', 'currencyCode'], {
  unique: true,
  where: 'business_id IS NOT NULL',
})
@Index('uq_payin_fee_configs_default_currency', ['currencyCode'], {
  unique: true,
  where: 'business_id IS NULL',
})
export class PayinFeeConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, name: 'business_id' })
  businessId!: string | null;

  @Column({ type: 'varchar', length: 8, name: 'currency_code', default: 'NGN' })
  currencyCode!: string;

  @Column('decimal', { precision: 12, scale: 2, name: 'flat_fee', default: 0 })
  flatFee!: number;

  @Column('decimal', { precision: 5, scale: 4, name: 'percent_fee', default: 0 })
  percentFee!: number;

  @Column('decimal', { precision: 12, scale: 2, name: 'percent_cap', nullable: true })
  percentCap?: number | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

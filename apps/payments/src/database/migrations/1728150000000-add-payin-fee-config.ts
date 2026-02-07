import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddPayinFeeConfig1728150000000 implements MigrationInterface {
  name = 'AddPayinFeeConfig1728150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'payin_fee_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          { name: 'business_id', type: 'uuid', isNullable: true },
          { name: 'currency_code', type: 'varchar', length: '8', default: `'NGN'` },
          { name: 'flat_fee', type: 'numeric', precision: 12, scale: 2, default: '0' },
          { name: 'percent_fee', type: 'numeric', precision: 5, scale: 4, default: '0' },
          { name: 'percent_cap', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_payin_fee_configs_business_currency ON payin_fee_configs(business_id, currency_code) WHERE business_id IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_payin_fee_configs_default_currency ON payin_fee_configs(currency_code) WHERE business_id IS NULL',
    );

    await queryRunner.query(
      `INSERT INTO payin_fee_configs (business_id, currency_code, flat_fee, percent_fee, percent_cap, is_active) VALUES (NULL, 'NGN', 100, 1.4, 2000, true) ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS uq_payin_fee_configs_default_currency');
    await queryRunner.query('DROP INDEX IF EXISTS uq_payin_fee_configs_business_currency');
    await queryRunner.dropTable('payin_fee_configs');
  }
}

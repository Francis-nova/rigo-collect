import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateApiKeysTable1707330000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('api_keys');
    if (!hasTable) {
      await queryRunner.createTable(new Table({
        name: 'api_keys',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'business_id', type: 'uuid', isNullable: false },
          { name: 'key_hash', type: 'varchar', length: '128', isUnique: true },
          { name: 'last_four', type: 'varchar', length: '8', isNullable: false },
          { name: 'environment', type: 'varchar', length: '16', default: `'production'` },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'last_used_at', type: 'timestamptz', isNullable: true },
          { name: 'revoked_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }), true);
    }

    const table = await queryRunner.getTable('api_keys');
    const hasIndex = table?.indices.some((i) => i.name === 'idx_api_keys_business_env_active');
    if (!hasIndex) {
      await queryRunner.createIndex('api_keys', new TableIndex({
        name: 'idx_api_keys_business_env_active',
        columnNames: ['business_id', 'environment', 'is_active'],
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('api_keys');
    const hasIndex = table?.indices.some((i) => i.name === 'idx_api_keys_business_env_active');
    if (hasIndex) {
      await queryRunner.dropIndex('api_keys', 'idx_api_keys_business_env_active');
    }
    const hasTable = await queryRunner.hasTable('api_keys');
    if (hasTable) {
      await queryRunner.dropTable('api_keys');
    }
  }
}

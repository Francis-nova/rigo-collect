import { DataSource, EntityManager, ObjectLiteral, Repository } from 'typeorm';

export async function useQueryRunner<T>(
  source: DataSource | Repository<ObjectLiteral>,
  callback: (manager: EntityManager) => Promise<T>,
) {
  const connection =
    source instanceof Repository ? source.manager.connection : source;
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();
    const result = await callback(queryRunner.manager);
    await queryRunner.commitTransaction();

    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

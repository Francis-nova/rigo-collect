import 'dotenv/config';
import { DataSource } from 'typeorm';
import config from '../configs/index.config';

// Central TypeORM DataSource for CLI migrations (default export only, as required by TypeORM CLI)
export default new DataSource(config.database);

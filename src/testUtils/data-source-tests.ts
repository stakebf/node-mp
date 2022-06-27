import 'dotenv/config';
import { DataSource } from 'typeorm';

import UserEntity from '../entities/User';

export const TestPostgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env?.DB_POSTGRES_HOST ?? 'localhost',
  port: Number(process.env?.DB_POSTGRES_PORT ?? 5433),
  username: 'postgres',
  password: 'postgres',
  database: 'nodeMPTest',
  entities: [UserEntity],
  dropSchema: true,
  migrationsRun: true,
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: false
});

import 'dotenv/config';
import { DataSource } from 'typeorm';

import UserEntity from '@entities/User';
import GroupEntity from '@entities/Group';

export const PostgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env?.DB_POSTGRES_HOST ?? 'localhost',
  port: Number(process.env?.DB_POSTGRES_PORT ?? 5433),
  username: process.env?.DB_POSTGRES_USERNAME ?? '',
  password: process.env?.DB_POSTGRES_PASSWORD ?? '',
  database: process.env?.DB_POSTGRES_NAME ?? 'nodeMP',
  entities: [UserEntity, GroupEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: false
});

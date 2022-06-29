import 'dotenv/config';
import { DataSource } from 'typeorm';

import UserEntity from '../entities/User';

export const TestPostgresDataSource = new DataSource({
  type: 'postgres',
  host: 'heffalump.db.elephantsql.com',
  port: 5432,
  username: 'gscdabqu',
  password: 'szn1UERuPx1LOpdV-kdRSLbWV980CyfC',
  database: 'gscdabqu',
  entities: [UserEntity],
  synchronize: true
});

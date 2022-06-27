import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import getUserRouter from '@routes/user';
import errorHandler from '@src/errorHandler/errorHandler';
import { PostgresDataSource } from '@src/data-source';
import logger from '@src/logger';

const app = express();

PostgresDataSource.initialize()
  .then(() => {
    console.log('PostgresDataSource is initialized');
  })
  .catch((error) => {
    console.log(error);
    logger.error('Something went wrong with PostgresDataSource initialization');
  });

app.use(cors());
app.use(express.json());

app.use('/api/users', getUserRouter(PostgresDataSource));
app.use(errorHandler);

app.listen(process.env.DEFAULT_SERVER_PORT ?? 3050);

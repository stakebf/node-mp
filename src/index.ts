import 'dotenv/config';
import 'express-async-errors';
import express, { Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import getUserRouter from '@routes/user';
import getGroupRouter from '@routes/group';
import errorHandler from '@src/errorHandler/errorHandler';
import { PostgresDataSource } from '@src/data-source';
import logger from '@src/logger';

const app = express();

PostgresDataSource.initialize()
  .then(() => {
    logger.info('PostgresDataSource is initialized');
  })
  .catch((error) => {
    logger.error(error);
    logger.error('Something went wrong with PostgresDataSource initialization');
  });

morgan.token('req-body', (req: Request, res, param) => {
  return `body - ${JSON.stringify(req.body)}`;
});

morgan.token('req-params', (req: Request, res, param) => {
  return `params - ${JSON.stringify(req.params)}`;
});

app.use(morgan(':date[clf] (:method) :url \n status - :status \n :req-body \n :req-params \n response time - :response-time ms'));

process.on('uncaughtException', (error) => {
  logger.error(`uncaught exception: ${error.message}`);
});

app.use(cors());
app.use(express.json());

app.use('/api/users', getUserRouter(PostgresDataSource));
app.use('/api/groups', getGroupRouter(PostgresDataSource));
app.use(errorHandler);

app.listen(process.env.DEFAULT_SERVER_PORT ?? 3050);

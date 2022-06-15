import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter from '@routes/user';
import errorHandler from '@src/errorHandler/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);
app.use(errorHandler);

app.listen(process.env.PORT ?? 3050);

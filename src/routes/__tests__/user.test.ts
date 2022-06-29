import request from 'supertest';
import express from 'express';
import TestConnection from '@src/testUtils/connection';
import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

import getUserRouter from '@routes/user';
import UserRepository from '@repositories/user';
import User from '@entities/User';

const app = express();
app.use(express.json());
app.use('/api/users', getUserRouter(TestPostgresDataSource));

const repository = new UserRepository(TestPostgresDataSource.getRepository(User));
const testConnection = new TestConnection(TestPostgresDataSource);

describe('POST /users', () => {
  beforeAll(async () => {
    await testConnection.create();

    const userList = await repository.getAllUsers();

    if (userList.length) {
      const ids = userList.map(({ id }) => id);
      await repository.deleteAllUsers(ids);
    }
  });

  afterAll(async () => {
    await testConnection.destroy();
  });

  it('responds with json', async () => {
    const result = await request(app)
      .post('/api/users')
      .send({
        login: 'newUser1111',
        password: 'sd1anAn',
        age: 15
      });

    expect(result.status).toEqual(200);
  });
});

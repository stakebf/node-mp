import request from 'supertest';
import express from 'express';
import TestConnection from '@src/testUtils/connection';
import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

import getUserRouter from '@routes/user';

const app = express();
app.use(express.json());
app.use('/api/users', getUserRouter(TestPostgresDataSource));

const testConnection = new TestConnection();

describe('POST /users', () => {
  beforeAll(async () => {
    await testConnection.create();
  });

  afterAll(async () => {
    await testConnection.destroy();
  });

  it('responds with json', async () => {
    const result = await request(app)
      .post('/api/users')
      .send({
        login: 'newUser11',
        password: 'sd1anAn',
        age: 15
      });

    expect(result.status).toEqual(200);
  });
});

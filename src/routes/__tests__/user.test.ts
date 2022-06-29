import { agent as request } from 'supertest';
import express from 'express';
import TestConnection from '@src/testUtils/connection';
import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

import getUserRouter from '@routes/user';
import UserRepository from '@repositories/user';
import User from '@entities/User';
import { IUser } from '@src/shared/types/user';

const app = express();
app.use(express.json());
app.use('/api/users', getUserRouter(TestPostgresDataSource));

const repository = new UserRepository(TestPostgresDataSource.getRepository(User));
const testConnection = new TestConnection(TestPostgresDataSource);

describe('check users routes', () => {
  let createdUser: IUser;
  let createdUser2: IUser;
  const userPassword = 'sd1anAn';

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

  describe('POST /users', () => {
    it('should return status=200 if user was created', async () => {
      const result = await request(app)
        .post('/api/users')
        .send({
          login: 'newUser',
          password: userPassword,
          age: 15
        });

      createdUser = JSON.parse(result.text);

      expect(result.status).toEqual(200);
    });

    it('should return status=400 if user already exist', async () => {
      const result = await request(app)
        .post('/api/users')
        .send({
          login: 'newUser',
          password: userPassword,
          age: 15
        });

      expect(result.status).toEqual(400);
    });

    it('should return status=400 if not all parameters were passed', async () => {
      const result = await request(app)
        .post('/api/users')
        .send({
          login: 'newUser2',
          password: userPassword
        });

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('You have passed wrong parameters');
    });
  });

  describe('GET /users/:id', () => {
    it('should return status=200 if user exists', async () => {
      const result = await request(app)
        .get(`/api/users/${createdUser.id}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).id).toEqual(createdUser.id);
    });

    it('should return status=404 if user with such id doesn\'t exist', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .get(`/api/users/${wrongID}`);

      expect(result.status).toEqual(404);
      expect(createdUser.id).not.toEqual(wrongID);
      expect(JSON.parse(result.text).message).toEqual(`User with ${wrongID} doesn\'t exist`);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return status=200 if user was deleted', async () => {
      const createdUserResult = await request(app)
        .post('/api/users')
        .send({
          login: 'newUser2',
          password: userPassword,
          age: 15
        });

      createdUser2 = JSON.parse(createdUserResult.text);

      const result = await request(app)
        .delete(`/api/users/${createdUser2.id}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).status).toEqual(true);
    });

    it('should return status=404 if user doesn\'t exist or was deleted', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .delete(`/api/users/${wrongID}`);

      expect(result.status).toEqual(404);
      expect(JSON.parse(result.text).message).toEqual(`User with {id: ${wrongID}} doesn't exist or has been already removed`);
    });
  });

  describe('PUT /users/:id', () => {
    it('should return status=200 if user data is updated', async () => {
      const oldLogin = createdUser.login;

      const result = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          login: 'newLogin'
        });

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).login).not.toEqual(oldLogin);
    });

    it('should return status=400 if user were passed wrong parameters', async () => {
      const result = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          age: '155'
        });

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('You have passed wrong parameters');
    });

    it('should return status=400 if user have passed password without oldPassword or vice versa', async () => {
      const result = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          oldPassword: userPassword
        });

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('Missing parameters for updating password');
    });

    it('should return status=401 if user have passed wrong password', async () => {
      const result = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          oldPassword: `${userPassword}111`,
          password: 'sd1anAnew'
        });

      expect(result.status).toEqual(401);
      expect(JSON.parse(result.text).message).toEqual('Incorrect password');
    });

    it('should return status=404 if user doesn\'t exist', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';
      const result = await request(app)
        .put(`/api/users/${wrongID}`)
        .send({
          oldPassword: userPassword,
          password: 'sd1anAnew'
        });

      expect(result.status).toEqual(404);
      expect(JSON.parse(result.text).message).toEqual(`User with ${wrongID} doesn\'t exist`);
    });

    it('should return status=400 if user is already deleted', async () => {
      const result = await request(app)
        .put(`/api/users/${createdUser2.id}`)
        .send({
          login: 'zzz'
        });

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual(`User with ${createdUser2.id} has been already removed`);
    });

    it('should return status=200 if password was updated', async () => {
      const result = await request(app)
        .put(`/api/users/${createdUser.id}`)
        .send({
          oldPassword: userPassword,
          password: 'sd1anAnew'
        });

      expect(result.status).toEqual(200);
    });
  });
});

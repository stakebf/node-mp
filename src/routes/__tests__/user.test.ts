import { agent as request } from 'supertest';
import express from 'express';
import TestConnection from '@src/testUtils/connection';
import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

import getUserRouter from '@routes/user';
import getLoginRouter from '@routes/login';
import { IUser } from '@src/shared/types/user';
import UserRepository from '@repositories/user';
import UserEntity from '@entities/User';
import validateToken from '@middlewares/accessTokeValidation';

let token: string;

const app = express();
app.use(express.json());
app.use('/api/login', getLoginRouter(TestPostgresDataSource));
app.use('/api/users', validateToken, getUserRouter(TestPostgresDataSource));

const userRepository = new UserRepository(TestPostgresDataSource.getRepository(UserEntity));
const testConnection = new TestConnection(TestPostgresDataSource);

describe('check users routes', () => {
  let createdUser: IUser;
  let createdUser2: IUser;
  const userPassword = 'sd1anAn';

  beforeAll(async () => {
    await testConnection.create();

    const userList = await userRepository.getAllUsers();

    if (userList.length) {
      const ids = userList.map(({ id }) => id);
      await userRepository.deleteAllUsers(ids);
    }

    createdUser = await userRepository.createUser({
      login: 'newUser',
      password: userPassword,
      age: 15
    }) as IUser & { createdAt: Date; updatedAt: Date; };

    createdUser2 = await userRepository.createUser({
      login: 'newUser2',
      password: userPassword,
      age: 15
    }) as IUser & { createdAt: Date; updatedAt: Date; };
  });

  afterAll(async () => {
    await testConnection.destroy();
  });

  describe('POST /login', () => {
    it('should login user and return bearer token', async () => {
      const result = await request(app)
        .post('/api/login')
        .send({
          login: 'newUser',
          password: userPassword
        });

      token = JSON.parse(result.text).token;

      expect(result.status).toEqual(200);
      expect(token).not.toBeUndefined();
    });

    it('should return status=400 if user already exist', async () => {
      const result = await request(app)
        .post('/api/users')
        .set('authorization', `Bearer ${token}`)
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
        .set('authorization', `Bearer ${token}`)
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
        .get(`/api/users/${createdUser.id}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).id).toEqual(createdUser.id);
    });

    it('should return status=404 if user with such id doesn\'t exist', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .get(`/api/users/${wrongID}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(404);
      expect(createdUser.id).not.toEqual(wrongID);
      expect(JSON.parse(result.text).message).toEqual(`User with ${wrongID} doesn\'t exist`);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return status=200 if user was deleted', async () => {
      const result = await request(app)
        .delete(`/api/users/${createdUser2.id}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).status).toEqual(true);
    });

    it('should return status=404 if user doesn\'t exist or was deleted', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .delete(`/api/users/${wrongID}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(404);
      expect(JSON.parse(result.text).message).toEqual(`User with {id: ${wrongID}} doesn't exist or has been already removed`);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should return status=200 if user data is updated', async () => {
      const oldLogin = createdUser.login;

      const result = await request(app)
        .patch(`/api/users/${createdUser.id}`)
        .send({
          login: 'newLogin'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).login).not.toEqual(oldLogin);
    });

    it('should return status=400 if user were passed wrong parameters', async () => {
      const result = await request(app)
        .patch(`/api/users/${createdUser.id}`)
        .send({
          age: '155'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('You have passed wrong parameters');
    });

    it('should return status=400 if user have passed password without oldPassword or vice versa', async () => {
      const result = await request(app)
        .patch(`/api/users/${createdUser.id}`)
        .send({
          oldPassword: userPassword
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('Missing parameters for updating password');
    });

    it('should return status=401 if user have passed wrong password', async () => {
      const result = await request(app)
        .patch(`/api/users/${createdUser.id}`)
        .set('authorization', `Bearer ${token}`)
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
        .patch(`/api/users/${wrongID}`)
        .send({
          oldPassword: userPassword,
          password: 'sd1anAnew'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(404);
      expect(JSON.parse(result.text).message).toEqual(`User with ${wrongID} doesn\'t exist`);
    });

    it('should return status=400 if user is already deleted', async () => {
      const result = await request(app)
        .patch(`/api/users/${createdUser2.id}`)
        .send({
          login: 'zzz'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual(`User with ${createdUser2.id} has been already removed`);
    });

    it('should return status=200 if password was updated', async () => {
      const result = await request(app)
        .patch(`/api/users/${createdUser.id}`)
        .send({
          oldPassword: userPassword,
          password: 'sd1anAnew'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
    });
  });
});

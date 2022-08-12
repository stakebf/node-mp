import { agent as request } from 'supertest';
import express from 'express';
import TestConnection from '@src/testUtils/connection';
import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

import getLoginRouter from '@routes/login';
import getUserRouter from '@routes/group';
import { IUser } from '@src/shared/types/user';
import UserRepository from '@repositories/user';
import UserEntity from '@entities/User';
import GroupRepository from '@repositories/group';
import GroupEntity from '@entities/Group';
import { IGroup } from '@src/shared/types/group';
import validateToken from '@middlewares/accessTokeValidation';

let token: string;

const app = express();
app.use(express.json());
app.use('/api/login', getLoginRouter(TestPostgresDataSource));
app.use('/api/groups', validateToken, getUserRouter(TestPostgresDataSource));

const userRepository = new UserRepository(TestPostgresDataSource.getRepository(UserEntity));
const groupRepository = new GroupRepository(TestPostgresDataSource.getRepository(GroupEntity));
const testConnection = new TestConnection(TestPostgresDataSource);

describe('check users routes', () => {
  let createdUser: IUser;
  let createdUser2: IUser;
  let createdGroup: IGroup;
  let group: IGroup;
  const userPassword = 'sd1anAn';

  beforeAll(async () => {
    await testConnection.create();

    const userList = await userRepository.getAllUsers();
    const groupList = await groupRepository.getAllGroups();

    if (userList.length) {
      const userIds = userList.map(({ id }) => id);
      await userRepository.deleteAllUsers(userIds);
    }

    if (groupList.length) {
      const groupIds = groupList.map(({ id }) => id);
      await groupRepository.deleteAllGroups(groupIds);
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

    createdGroup = await groupRepository.createGroup({
      name: 'created group',
      permissions: []
    }) as IGroup;
  });

  afterAll(async () => {
    await testConnection.destroy();
  });

  describe('POST api/login', () => {
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
  });

  describe('POST api/groups', () => {
    it('should return status=200 if group was created', async () => {
      const result = await request(app)
        .post('/api/groups')
        .send({
          'name': 'new g1',
          'permissions': ['read', 'write']
        })
        .set('authorization', `Bearer ${token}`);

      group = JSON.parse(result.text);

      expect(result.status).toEqual(200);
    });

    it('should return status=400 if passed wrong parameters', async () => {
      const result = await request(app)
        .post('/api/groups')
        .send({
          'permissions': 1
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
    });
  });

  describe('GET /groups/:id', () => {
    it('should return status=200 if group exists', async () => {
      const result = await request(app)
        .get(`/api/groups/${group.id}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).id).toEqual(group.id);
    });

    it('should return status=404 if group with such id doesn\'t exist', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .get(`/api/groups/${wrongID}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(404);
      expect(group.id).not.toEqual(wrongID);
      expect(JSON.parse(result.text).message).toEqual(`Group with ${wrongID} doesn't exist`);
    });
  });

  describe('DELETE /groups/:id', () => {
    it('should return status=200 if group was deleted', async () => {
      const result = await request(app)
        .delete(`/api/groups/${createdGroup.id}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).status).toEqual(true);
    });

    it('should return status=404 if group doesn\'t exist or was deleted', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';

      const result = await request(app)
        .delete(`/api/users/${wrongID}`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(404);
    });
  });

  describe('PATCH /groups/:id', () => {
    it('should return status=200 if group data is updated', async () => {
      const oldGroupName = group.name;

      const result = await request(app)
        .patch(`/api/groups/${group.id}`)
        .send({
          name: 'new group name'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).name).not.toEqual(oldGroupName);
    });

    it('should return status=400 if passed wrong parameters', async () => {
      const result = await request(app)
        .patch(`/api/groups/${group.id}`)
        .send({
          zzz: '155'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
      expect(JSON.parse(result.text).message).toEqual('You have passed wrong parameters');
    });

    it('should return status=404 if group doesn\'t exist', async () => {
      const wrongID = '131c76ae-845c-4f0f-8a91-30630163da41';
      const result = await request(app)
        .patch(`/api/groups/${wrongID}`)
        .send({
          name: 'new group name'
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(400);
    });
  });

  describe('PUT /groups/:id/users', () => {
    it('should return status=200 if users were added', async () => {
      const result = await request(app)
        .put(`/api/groups/${group.id}/users`)
        .send({
          'userIds': [createdUser.id, createdUser2.id]
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).length).not.toEqual(0);
    });
  });

  describe('GET /groups/:id/users', () => {
    it('should return status=200 if users exists in group', async () => {
      const result = await request(app)
        .get(`/api/groups/${group.id}/users`)
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).length).toEqual(2);
    });
  });

  describe('DELETE /groups/:id/users', () => {
    it('should return status=200 if users were removed', async () => {
      const result = await request(app)
        .delete(`/api/groups/${group.id}/users`)
        .send({
          'userIds': [createdUser.id, createdUser2.id]
        })
        .set('authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
      expect(JSON.parse(result.text).length).toEqual(0);
    });
  });
});

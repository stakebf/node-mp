import { Router } from 'express';
import { DataSource } from 'typeorm';
import UserController from '@controllers/user';
import { schemaValidation } from '@middlewares/schemaValidation';
import {
  createUserSchema,
  updateUserSchema,
  checkLoginUserSchema
} from '@shared/schemes/user';
import UserEntity from '@entities/User';
import GroupEntity from '@entities/Group';
import UserRepository from '@repositories/user';
import GroupRepository from '@repositories/group';
import UserService from '@services/user';

const getUserRouter = (dataSource: DataSource) => {
  const userRouter = Router();
  const userRepository = new UserRepository(dataSource.getRepository(UserEntity));
  const groupRepository = new GroupRepository(dataSource.getRepository(GroupEntity));
  const userService = new UserService(
    userRepository,
    groupRepository
  );
  const {
    createUser,
    getUserByID,
    checkLogin,
    softDeleteUser,
    updateUser,
    getUsersByParams
  } = new UserController(userService);

  userRouter
    .route('/')
    .get(getUsersByParams)
    .post(schemaValidation(createUserSchema), createUser);

  userRouter
    .route('/login')
    .post(schemaValidation(checkLoginUserSchema), checkLogin);

  userRouter
    .route('/:id')
    .get(getUserByID)
    .put(schemaValidation(updateUserSchema), updateUser)
    .delete(softDeleteUser);

  return userRouter;
};

export default getUserRouter;

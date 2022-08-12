import { Router } from 'express';
import { DataSource } from 'typeorm';
import LoginController from '@controllers/login';
import { schemaValidation } from '@middlewares/schemaValidation';
import { checkLoginUserSchema } from '@shared/schemes/user';
import UserEntity from '@entities/User';
import GroupEntity from '@entities/Group';
import UserRepository from '@repositories/user';
import GroupRepository from '@repositories/group';
import UserService from '@services/user';

const getLoginRouter = (dataSource: DataSource) => {
  const userRouter = Router();
  const userRepository = new UserRepository(dataSource.getRepository(UserEntity));
  const groupRepository = new GroupRepository(dataSource.getRepository(GroupEntity));
  const userService = new UserService(
    userRepository,
    groupRepository
  );
  const { checkLogin } = new LoginController(userService);

  userRouter
    .route('/')
    .post(schemaValidation(checkLoginUserSchema), checkLogin);

  return userRouter;
};

export default getLoginRouter;

import { Router } from 'express';
import UserController from '@controllers/user';
import { userValidationMiddleware } from '@middlewares/user';
import { userSchemaPost, userSchemaPut, userSchemaCheckLogin } from '@shared/schemes/user';
import { DataSource } from 'typeorm';

const getUserRouter = (dataSource: DataSource) => {
  const userRouter = Router();
  const {
    createUser,
    getUserByID,
    checkLogin,
    softDeleteUser,
    updateUser,
    getUsersByParams
  } = new UserController(dataSource);

  userRouter
    .route('/')
    .get(getUsersByParams)
    .post(userValidationMiddleware(userSchemaPost), createUser);

  userRouter
    .route('/login')
    .post(userValidationMiddleware(userSchemaCheckLogin), checkLogin);

  userRouter
    .route('/:id')
    .get(getUserByID)
    .put(userValidationMiddleware(userSchemaPut), updateUser)
    .delete(softDeleteUser);

  return userRouter;
};

export default getUserRouter;

import { Router } from 'express';
import UserController from '@controllers/user';
import { userValidationMiddleware } from '@middlewares/user';
import { userSchemaPost, userSchemaPut, userSchemaCheckLogin } from '@shared/schemes/user';

const userRouter = Router();
const {
  createUser,
  getUserByID,
  checkLogin,
  softDeleteUser,
  updateUser,
  getUsersByParams
} = new UserController();

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

export default userRouter;

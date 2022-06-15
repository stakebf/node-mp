import { Router } from 'express';
import UserController from '@controllers/user';
import { userValidationMiddleware } from '@middlewares/user';
import { userSchemaPost, userSchemaPut } from '@shared/schemes/user';

const userRouter = Router();
const {
  createUser,
  getUserByID,
  deleteUser,
  getAvailableUserList,
  updateUser,
  getAutoSuggestUsers
} = new UserController();

userRouter
  .route('/')
  .get(getAvailableUserList)
  .post(userValidationMiddleware(userSchemaPost), createUser);

userRouter
  .route('/getAutoSuggestUsers')
  .get(getAutoSuggestUsers);

userRouter
  .route('/:id')
  .get(getUserByID)
  .put(userValidationMiddleware(userSchemaPut), updateUser)
  .delete(deleteUser);

export default userRouter;

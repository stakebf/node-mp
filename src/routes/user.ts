import { Router } from 'express';
import UserController from '@controllers/user';
import { userValidationMiddleware } from '@middlewares/user';

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
  .post(userValidationMiddleware('POST'), createUser);

userRouter
  .route('/:id')
  .get(getUserByID)
  .put(userValidationMiddleware('PUT'), updateUser)
  .delete(deleteUser);

userRouter
  .route('/getAutoSuggestUsers')
  .get(getAutoSuggestUsers);

export default userRouter;

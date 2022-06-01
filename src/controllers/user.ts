import { Request, Response, NextFunction } from 'express';
import UserModel from '@models/user';
import { IUserModel } from '@src/shared/types/user';

class UserController {
  userModel: IUserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  getAvailableUserList = (req: Request, res: Response, next: NextFunction) => {
    const allUsers = this.userModel.getAvailableUserList();

    return res.json(allUsers);
  };

  createUser = (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { login: createdUserLogin } = body;
    const createdUser = this.userModel.createUser(body);

    if (!createdUser) {
      return res.status(400).json({
        message: `Login ${createdUserLogin} already exists`
      });
    }

    return res.json(createdUser);
  };

  getUserByID = (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, query: { loginSubstring, limit } } = req;

    if (loginSubstring || limit) return next();

    if (!id) {
      return res.status(400).json({
        message: 'ID required'
      });
    }

    const user = this.userModel.getUserByID(id);

    if (!user) {
      return res.status(400).json({
        message: `User with ${id} doesn't exist`
      });
    }

    return res.json(user);
  };

  updateUser = (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { params: { id } } = req;

    const updatedUser = this.userModel.updateUser(id, body);

    if (!updatedUser) {
      return res.status(400).json({
        message: `Can\'t find user with ${id} id`
      });
    }

    return res.json(updatedUser);
  };

  deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;

    if (!id) {
      return res.status(400).json({
        message: 'ID required'
      });
    }

    const deletedUser = this.userModel.softDeleteUser(id);

    if (!deletedUser) {
      return res.status(400).json({
        message: `User with ${id} doesn't exist or has been already removed`
      });
    }

    return res.json(deletedUser);
  };

  getAutoSuggestUsers = (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    const { loginSubstring, limit } = query;
    const limitNumber = Number(limit);

    if (!loginSubstring) {
      return res.status(400).json({
        message: 'loginSubstring required'
      });
    }

    if (limit && (!limitNumber || (limitNumber < 0))) {
      return res.status(400).json({
        message: 'limit should be a positive number'
      });
    }

    const autoSuggestUserList = this.userModel.getAutoSuggestUsers(loginSubstring as string, limitNumber);

    return res.json({ autoSuggestUserList });
  };
}

export default UserController;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserService from '@src/services/user';
import logger from '@src/logger';

class LoginController {
  private readonly service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  checkLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { body: {
      login, password
    } } = req;
    const userCreds = await this.service.checkLogin({ login, password });

    if (userCreds === undefined) {
      const message = `User with ${login} doesn't exist`;

      logger.error({
        method: 'checkLogin',
        args: {
          login, password
        },
        message
      });

      return res.status(400).json({ message });
    }

    const { isValid, user: { login: userLogin, age } } = userCreds;

    if (!isValid) {
      const message = 'Incorrect login or password';

      logger.error({
        method: 'checkLogin',
        args: {
          login, password
        },
        message
      });

      return res.status(401).json({ message });
    }

    const token = jwt.sign({
      login: userLogin,
      age
    }, process.env.ACCESS_TOKEN ?? '', { expiresIn: 3600 }); // ! need to figure out for what and how to use this param

    return res.json({ token });
  };
}

export default LoginController;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserEntity from '@src/entities/User';
import UserService from '@src/services/user';
import logger from '@src/logger';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

class UserController {
  private readonly service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  private getPaginatedResponse({
    data,
    count,
    limit,
    offset
  }: {
    data: UserEntity[],
    count: number,
    limit: number,
    offset: number
  }) {
    const currentPage = offset + 1;
    const lastPage = Math.ceil(count / limit);
    const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
    const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;

    return {
      statusCode: 'success',
      data,
      count,
      currentPage,
      nextPage,
      prevPage,
      lastPage
    };
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { login: createdUserLogin } = body;

    const createdUser = await this.service.createUser(body);

    if (!createdUser) {
      const message = `Login ${createdUserLogin} already exists`;

      logger.error({
        method: 'createUser',
        args: {
          body
        },
        message
      });

      return res.status(400).json({ message });
    }

    return res.json(createdUser);
  };

  getUserByID = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;
    const user = await this.service.getUserByID(id);

    if (!user) {
      const message = `User with ${id} doesn't exist`;

      logger.error({
        method: 'getUserByID',
        args: {
          id
        },
        message
      });

      return res.status(404).json({ message });
    }

    return res.json(user);
  };

  getUsersByParams = async (req: Request, res: Response, next: NextFunction) => {
    const { query: {
      loginSubstring = '',
      offset,
      limit,
      order = 'ASC'
    } }: {
      query: {
        loginSubstring?: string,
        offset?: string,
        limit?: string,
        order?: string
      }
    } = req;
    const limitValue  = Number(limit) ? Number(limit) : DEFAULT_LIMIT;
    const offsetValue  = Number(offset) ? Number(offset) : DEFAULT_OFFSET;

    const { data, count } = await this.service.getUsersByParams({
      loginSubstring,
      limit: limitValue,
      offset: offsetValue,
      order
    });

    return res.json(this.getPaginatedResponse({
      data,
      count,
      limit: limitValue,
      offset: offsetValue
    }));
  };

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
    }, process.env.ACCESS_TOKEN ?? '', { expiresIn: 3600 });

    return res.json({ token: `Bearer ${token}` });
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body } = req;

    if ((!body?.password && body?.oldPassword) || (body?.password && !body?.oldPassword)) {
      const message = 'Missing parameters for updating password';

      logger.error({
        method: 'updateUser',
        args: {
          id,
          body
        },
        message
      });

      return res.status(400).json({ message });
    } else if (body?.password && body?.oldPassword) {
      const isCorrectUserCreds = await this.service.checkLogin({ id, password: body.oldPassword });

      if (isCorrectUserCreds === undefined) {
        const message = `User with ${id} doesn't exist`;

        logger.error({
          method: 'updateUser',
          args: {
            id,
            body
          },
          message
        });

        return res.status(404).json({ message });
      }

      if (!isCorrectUserCreds) {
        const message = 'Incorrect password';

        logger.error({
          method: 'updateUser',
          args: {
            id,
            body
          },
          message
        });

        return res.status(401).json({ message });
      }
    }

    const updatedUser = await this.service.updateUser(id, body);

    if (updatedUser === undefined) {
      const message = `User with ${id} has been already removed`;

      logger.error({
        method: 'updateUser',
        args: {
          id,
          body
        },
        message
      });

      return res.status(400).json({ message });
    }

    if (updatedUser === null) {
      const message = `Login ${body?.login} already exists`;

      logger.error({
        method: 'updateUser',
        args: {
          id,
          body
        },
        message
      });

      return res.status(400).json({ message });
    }

    return res.json(updatedUser);
  };

  softDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;

    if (!id) {
      const message = 'ID required';

      logger.error({
        method: 'softDeleteUser',
        args: {
          id
        },
        message
      });

      return res.status(400).json({ message });
    }

    const deletedUser = await this.service.softDeleteUser(id);

    if (!deletedUser) {
      const message = `User with {id: ${id}} doesn't exist or has been already removed`;

      logger.error({
        method: 'softDeleteUser',
        args: {
          id
        },
        message
      });

      return res.status(404).json({ message });
    }

    return res.json({ status: true });
  };
}

export default UserController;

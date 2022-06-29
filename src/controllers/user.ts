import { Request, Response, NextFunction } from 'express';
import UserRepository from '@src/repositories/user';
import UserEntity from '@src/entities/User';
import { DataSource } from 'typeorm';
import User from '@entities/User';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

class UserController {
  private readonly repository: UserRepository;

  constructor(dataSource: DataSource) {
    this.repository = new UserRepository(dataSource.getRepository(User));
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

    const createdUser = await this.repository.createUser(body);

    if (!createdUser) {
      return res.status(400).json({
        message: `Login ${createdUserLogin} already exists`
      });
    }

    return res.json(createdUser);
  };

  getUserByID = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;
    const user = await this.repository.getUserByID(id);

    if (!user) {
      return res.status(404).json({
        message: `User with ${id} doesn't exist`
      });
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

    const { data, count } = await this.repository.getUsersByParams({
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
    const isCorrectUserCreds = await this.repository.checkLogin({ login, password });

    if (isCorrectUserCreds === undefined) {
      return res.status(400).json({
        message: `User with ${login} doesn't exist`
      });
    }

    if (!isCorrectUserCreds) {
      return res.status(401).json({
        message: 'Incorrect login or password'
      });
    }

    return res.json({
      status: 'ok'
    });
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { params: { id } } = req;

    if ((!body?.password && body?.oldPassword) || (body?.password && !body?.oldPassword)) {
      return res.status(400).json({
        message: 'Missing parameters for updating password'
      });
    } else if (body?.password && body?.oldPassword) {
      const isCorrectUserCreds = await this.repository.checkLogin({ id, password: body.oldPassword });

      if (isCorrectUserCreds === undefined) {
        return res.status(404).json({
          message: `User with ${id} doesn't exist`
        });
      }

      if (!isCorrectUserCreds) {
        return res.status(401).json({
          message: 'Incorrect password'
        });
      }
    }

    const updatedUser = await this.repository.updateUser(id, body);

    if (!updatedUser) {
      return res.status(400).json({
        message: `User with ${id} has been already removed`
      });
    }

    return res.json(updatedUser);
  };

  softDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;

    if (!id) {
      return res.status(400).json({
        message: 'ID required'
      });
    }

    const deletedUser = await this.repository.softDeleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: `User with {id: ${id}} doesn't exist or has been already removed`
      });
    }

    return res.json({ status: true });
  };
}

export default UserController;

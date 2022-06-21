import { Repository, Like } from 'typeorm';
import UserEntity from '@entities/User';
import { IUser } from '@src/shared/types/user';
import bcrypt from 'bcrypt';

class UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(repository: Repository<UserEntity>) {
    this.repository = repository;
  }

  createUser = async (user: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser | undefined> => {
    const isUniqueLogin = !!(await this.repository.findOneBy({ login: user.login }));

    if (isUniqueLogin) {
      return undefined;
    }

    const newUser = await this.repository.save(
      this.repository.create(user) // need for BeforeInsert https://github.com/typeorm/typeorm/issues/5493
    );

    return newUser;
  };

  getUserByID = async (id: string): Promise<IUser | undefined> => {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      return undefined;
    }

    return user;
  };

  getUsersByParams = async ({
    loginSubstring,
    offset,
    limit,
    order
  }: {
    loginSubstring: string,
    offset: number,
    limit: number,
    order: string
  }) => {
    const [result, total] = await this.repository.findAndCount({
      where: {
        login: Like(`%${loginSubstring}%`)
      },
      order: {
        login: (order as 'ASC' | 'DESC')
      },
      take: limit,
      skip: offset * limit
    });

    return {
      data: result,
      count: total
    };
  };

  checkLogin = async ({
    login,
    password,
    id
  }: {
    login?: string, password: string, id?: string
  }): Promise<boolean | undefined> => {
    const findBy = id ? { id } : { login };
    const user = await this.repository.findOneBy({ ...findBy });

    if (!user) {
      return undefined;
    }

    const isValid = await bcrypt.compare(password, user.password);

    return isValid;
  };

  updateUser = async (id: string, newUserInfo: Partial<IUser & { oldPassword?: string }>): Promise<IUser | undefined> => {
    const user = await this.repository.findOneBy({ id });
    let newPassword;

    if (!user || user?.deletedAt) {
      return undefined;
    }

    if (newUserInfo?.password) {
      const salt = await bcrypt.genSalt();
      newPassword = await bcrypt.hash(newUserInfo.password!, salt);
    }

    delete newUserInfo.oldPassword;

    const updatedUserInfo = newPassword ?
      { ...user, ...newUserInfo, password: newPassword } :
      { ...user, ...newUserInfo };

    const updatedUser = await this.repository.save(updatedUserInfo);

    return updatedUser;
  };

  softDeleteUser = async (id: string): Promise<IUser | undefined> => {
    const deletedUser = await this.getUserByID(id);

    if (!deletedUser || deletedUser?.deletedAt) {
      console.log('!deletedUser || deletedUser?.deletedAt', !deletedUser || deletedUser?.deletedAt);
      return undefined;
    }

    await this.repository.softDelete(id);

    return deletedUser;
  };
}

export default UserRepository;

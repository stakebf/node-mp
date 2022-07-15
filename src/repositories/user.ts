import { Repository, Like, In } from 'typeorm';
import bcrypt from 'bcrypt';
import UserEntity from '@entities/User';
import { IUser } from '@src/shared/types/user';
import { IGroup } from '@src/shared/types/group';

class UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(repository: Repository<UserEntity>) {
    this.repository = repository;
  }

  getAllUsers = async (): Promise<IUser[]> => {
    const allUsers = await this.repository.find({
      withDeleted: true
    });
    return allUsers;
  };

  createUser = async (user: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser | undefined> => {
    const isUniqueLogin = !!(await this.repository.findOneBy({ login: user.login }));
    const userEntity = new UserEntity();

    if (isUniqueLogin) {
      return undefined;
    }

    const newUser = {
      ...userEntity,
      ...user
    };

    const createdUser = await this.repository.save(
      this.repository.create(newUser) // need for BeforeInsert https://github.com/typeorm/typeorm/issues/5493
    );

    return createdUser;
  };

  getUserByID = async (id: string): Promise<UserEntity | null> => {
    const user = await this.repository.findOne({
      where: {
        id
      },
      relations: ['groups']
    });

    if (!user) {
      return null;
    }

    return user;
  };

  getUserListByIDs = async (userListId: string[]): Promise<UserEntity[] | undefined> => {
    const users = await this.repository.find({
      where: {
        id: In(userListId)
      },
      relations: ['groups']
    });

    if (!users) {
      return undefined;
    }

    return users;
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
      relations: ['groups'],
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

  updateUser = async (id: string, newUserInfo: Partial<IUser & { oldPassword?: string }>, groups: IGroup[] | undefined): Promise<IUser | undefined | null> => {
    if (newUserInfo?.login) {
      const isUniqueLogin = !!(await this.repository.findOneBy({ login: newUserInfo.login }));

      if (isUniqueLogin) {
        return null;
      }
    }

    const user = await this.repository.findOne({
      where: {
        id
      },
      relations: ['groups']
    });

    let newPassword;
    let updatedUserInfo;

    if (!user || user?.deletedAt) {
      return undefined;
    }

    if (newUserInfo?.password) {
      const salt = await bcrypt.genSalt();
      newPassword = await bcrypt.hash(newUserInfo.password!, salt);
    }

    delete newUserInfo.oldPassword;

    updatedUserInfo = newPassword ?
      { ...user, ...newUserInfo, password: newPassword } :
      { ...user, ...newUserInfo };

    if (groups?.length) {
      updatedUserInfo = { ...updatedUserInfo, groups };
    }

    const updatedUser = await this.repository.save(updatedUserInfo);

    return updatedUser;
  };

  softDeleteUser = async (id: string): Promise<IUser | undefined> => {
    const deletedUser = await this.getUserByID(id);

    if (!deletedUser || deletedUser.deletedAt) {
      return undefined;
    }

    await this.repository.softDelete(id);

    return deletedUser;
  };

  deleteAllUsers = async (ids: string[]) => {
    await this.repository.delete(ids);
  };
}

export default UserRepository;

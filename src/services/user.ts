import UserEntity from '@entities/User';
import { IUser } from '@src/shared/types/user';
import UserRepository from '@repositories/user';
import GroupRepository from '@repositories/group';

class UserService {
  private readonly userRepository: UserRepository;
  private readonly groupRepository: GroupRepository;

  constructor(userRepository: UserRepository, groupRepository: GroupRepository) {
    this.userRepository = userRepository;
    this.groupRepository = groupRepository;
  }

  createUser = async (user: Omit<IUser, 'id' | 'createdAt'> & { groups: string[] }): Promise<IUser | undefined> => {
    const groups = await this.groupRepository.getGroupsByID(user.groups ?? []);
    const createdUser = await this.userRepository.createUser({ ...user, groups });

    return createdUser;
  };

  getUserByID = async (userId: string): Promise<UserEntity | null> => {
    const user = await this.userRepository.getUserByID(userId);

    return user;
  };

  softDeleteUser = async (id: string) => {
    const deletedUser = await this.userRepository.softDeleteUser(id);

    return deletedUser;
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
    const users = await this.userRepository.getUsersByParams({
      loginSubstring,
      offset,
      limit,
      order
    });

    return users;
  };

  checkLogin = async ({
    login,
    password,
    id
  }: {
    login?: string, password: string, id?: string
  }): Promise<{isValid: boolean, user: IUser} | undefined> => {
    const userCreds = await this.userRepository.checkLogin({
      login,
      password,
      id
    });

    return userCreds;
  };

  updateUser = async (id: string, newUserInfo: Partial<IUser & { oldPassword?: string, groups?: string[] }>): Promise<IUser | undefined | null> => {
    const groups = await this.groupRepository.getGroupsByID(newUserInfo.groups ?? []);
    const updatedUser = await this.userRepository.updateUser(id, newUserInfo, groups);

    return updatedUser;
  };
}

export default UserService;

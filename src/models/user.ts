import { v4 as uuidv4 } from 'uuid';
import { IUser } from '@src/shared/types/user';

class UserModel {
  userList: IUser[];

  constructor() {
    this.userList = [];
  }

  private updateUserList = (newUserList: IUser[]): void => {
    this.userList = newUserList;
  };

  private getAllUsers = (): IUser[] => {
    return this.userList;
  };

  getAvailableUserList = (): IUser[] => {
    return this.userList.filter(({ isDeleted }) => !isDeleted);
  };

  getUserByID = (id: string): IUser | undefined => {
    return this.userList.find(({ id: userID, isDeleted }) => id === userID && !isDeleted);
  };

  createUser = (user: Omit<IUser, 'id' | 'isDeleted'>): IUser | undefined => {
    const allUsers = this.getAllUsers();
    const isUniqueLogin = allUsers.every(({ login }) => login !== user.login);

    if (!isUniqueLogin) return undefined;

    const newUser = { id: uuidv4(), isDeleted: false,  ...user };
    this.userList.push(newUser);

    return newUser;
  };

  updateUser = (id: string, user: Partial<IUser>): IUser | undefined => {
    let updatedUser;

    const newUserList = this.getAllUsers().reduce((acc: IUser[], availableUser) => {
      if (availableUser.id === id && !availableUser.isDeleted) {
        availableUser = { ...availableUser, ...user };
        updatedUser = availableUser;
      }

      acc.push(availableUser);
      return acc;
    }, []);

    if (!updatedUser) {
      return undefined;
    }

    this.updateUserList(newUserList);

    return updatedUser;
  };

  softDeleteUser = (id: string): IUser | undefined => {
    let deletedUser;

    const newUserList = this.getAllUsers().reduce((acc: IUser[], user) => {
      if (user.id === id && !user.isDeleted) {
        user.isDeleted = true;
        deletedUser = user;
      }

      acc.push(user);
      return acc;
    }, []);

    if (!deletedUser) {
      return undefined;
    }

    this.updateUserList(newUserList);

    return deletedUser;
  };

  getAutoSuggestUsers = (loginSubstring: string, limit?: number) => {
    const filteredUsers = this.getAllUsers()
      .filter(({ login }) =>
        login.toLocaleLowerCase().includes(loginSubstring.toLocaleLowerCase()))
      .map(({ login }) => login);

    return limit ? filteredUsers.sort().slice(0, limit) : filteredUsers.sort();
  };
}

export default UserModel;

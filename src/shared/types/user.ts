export interface IUser {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
}

export interface IUserModel {
  createUser: (user: Omit<IUser, 'id'>) => IUser | undefined;
  getAvailableUserList: () => IUser[];
  getUserByID: (id: string) => IUser | undefined;
  softDeleteUser: (id: string) => IUser | undefined;
  updateUser: (id: string, user: Partial<IUser>) => IUser | undefined;
  getAutoSuggestUsers: (loginSubstring: string, limit?: number) => string[];
}

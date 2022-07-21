import Group from '@entities/Group';

export interface IUser {
  id: string;
  login: string;
  password: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  groups?: Group[];
}

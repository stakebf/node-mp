import User from '@entities/User';

export interface IGroup {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  users?: User[];
}

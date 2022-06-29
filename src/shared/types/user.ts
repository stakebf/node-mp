export interface IUser {
  id: string;
  login: string;
  password: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

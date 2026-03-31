import { Id } from './id';

export enum Role {
  Admin = 'admin',
  Student = 'student',
  Teacher = 'teacher',
}

export interface IUser {
  _id: Id;
  
  role: Role;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  token:string;
  friends: Id[] | IUser[]
}

export type ICreateUser = Pick<
  IUser,
  'role' | 'firstname' | 'lastname' | 'email' | 'password'
>;
export type IUpdateUser = Partial<Omit<IUser, '_id'>>;
export type IUpsertUser = IUser;
export type IUserSchema = Omit<IUser, '_id'>;

export interface ICurrentUser {
  id: string;
  email: string;
  role: Role;
}
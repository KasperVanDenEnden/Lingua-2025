import { Id } from './id';

export enum Role {
  Admin = 'admin',
  Student = 'student',
  Teacher = 'teacher',
}

export interface IUser {
  id?: Id;
  _id: Id;
  
  role: Role;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  token:string;
}

export type ICreateUser = Pick<
  IUser,
  'role' | 'firstname' | 'lastname' | 'email' | 'password'
>;
export type IUpdateUser = Partial<Omit<IUser, 'id'>>;
export type IUpsertUser = IUser;

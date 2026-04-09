import { ICourse } from './course.interface';
import { Id } from './id';
import { IUser } from './user.interface';

export interface IReview {
  _id: Id;

  student: Id | IUser;
  course: Id | ICourse;

  comment: string;
  rating: number;
  createdAt: Date;
}

export interface ICreateReview {
  comment: string;
  rating: number; // 0-5
}

export type IUpdateReview = Partial<Omit<IReview, '_id'>>;
export type IUpsertReview = IReview;
export type IReviewSchema = Omit<IReview, '_id'>;

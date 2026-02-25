import { Id } from './id';
import { IUpsertReview } from './review.interface';
import { IUser } from './user.interface';

export enum CourseStatus {
  Active = 'Active',
  Archived = 'Archived',
}

export enum Language {
  Korean = 'Korean',
  English = 'English',
  Dutch = 'Dutch',
  German = 'German',
  French = 'French',
}

export interface ICourse {
  _id: Id;
  
  title: string;
  description: string;
  status: CourseStatus;
  createdOn: Date;
  language: Language;

  teachers: Id[] | IUser[]; // Array of teacher Ids
  students: Id[] | IUser[]; // Array of student Ids
  reviews: IUpsertReview[]; // Nested reviews
}

export type ICreateCourse = Pick<
ICourse,
  'status' | 'title' | 'description' | 'language' | 'teachers'
>;
export type IUpdateCourse = Partial<Omit<ICourse, 'id'>>;
export type IUpsertCourse = ICourse;

export type IUpdateCourseAssistant = {
  course: string,
  assistant: Id
}

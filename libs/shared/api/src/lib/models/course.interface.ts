import { Id } from './id';
import { IUpsertReview } from './review.interface';
import { IUser } from './user.interface';

export enum CourseStatus {
  Active = 'Active',
  Archived = 'Archived',
  Concept = 'Concept',
}

export enum Language {
  Korean = 'Korean',
  English = 'English',
  Dutch = 'Dutch',
  German = 'German',
  French = 'French',
}

export enum Level {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export interface ICourse {
  _id: Id;
  
  title: string;
  description: string;
  price: number;
  maxStudents:number; 
  starts: Date;
  ends: Date | null;

  // enums
  status: CourseStatus;
  language: Language;
  level: Level;

  teachers: Id[] | IUser[]; // Array of teacher Ids
  students: Id[] | IUser[]; // Array of student Ids
  reviews: IUpsertReview[]; // Nested reviews
}

export type ICreateCourse = Pick<
  ICourse,
  'status' | 'title' | 'description' | 'language' | 'teachers' | 'level' | 'price' | 'maxStudents' | 'starts' | 'ends'
>;
export type IUpdateCourse = Partial<Omit<ICourse, '_id'>>;
export type IUpsertCourse = ICourse;
export type ICourseSchema = Omit<ICourse, '_id'>;
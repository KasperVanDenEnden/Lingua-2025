import { ICourse } from './course.interface';
import { Id } from './id';
import { IUser } from './user.interface';

export enum LessonStatus {
  Open = 'Open',
  Full = 'Full',
  Canceled = 'Canceled',
  Concept = 'Concept'
}

export enum LessonType {
  Other = 'Other',
  Speaking = 'Speaking',
  Listening = 'Listening',
  Grammar = 'Grammar',
  Vocabulary = 'Vocabulary',
  Culture = 'Culture',
  Assessment = 'Assessment',
}

export interface ILesson {
  _id: Id;

  course: Id | ICourse;
  
  teacher: Id | IUser; // Teacher Id
  students: Id[] | IUser[]; // Attending students

  title: string;
  status: LessonStatus;
  type: LessonType;

  day: Date; // Alleen de datum (YYYY-MM-DD)
  startTime: Date; // Inclusief tijd
  endTime: Date; // Inclusief tijd
}

export type ICreateLesson = Pick<
  ILesson,
  'course' | 'teacher' | 'status' | 'title' | 'type' | 'day' | 'startTime' | 'endTime'
>;
export type IUpdateLesson = Partial<Omit<ILesson, '_id'>>;
export type IUpsertLesson = ILesson;
export type ILessonSchema = Omit<ILesson, '_id'>;
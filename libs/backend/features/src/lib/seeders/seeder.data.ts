import { CourseStatus, Language, LessonStatus, Level } from '@lingua/api';
import { Types } from 'mongoose';

export const USER_SEED_DATA = [
  // Admin user
  {
    firstname: 'Bob',
    lastname: 'Johnson',
    email: 'support@lingua.com',
    role: 'admin',
  },
  // Teacher users
  {
    firstname: 'Alice',
    lastname: 'Brown',
    email: 'alice.teacher@lingua.com',
    role: 'teacher',
    password: 'password123',
  },
  {
    firstname: 'Robert',
    lastname: 'Martinez',
    email: 'robert.teacher@lingua.com',
    role: 'teacher',
    password: 'password123',
  },
  {
    firstname: 'Laura',
    lastname: 'Wilson',
    email: 'laura.teacher@lingua.com',
    role: 'teacher',
    password: 'password123',
  },
  // Student users
  {
    firstname: 'Tom',
    lastname: 'Harris',
    email: 'tom.student@lingua.com',
    role: 'student',
    password: 'password123',
  },
  {
    firstname: 'Emma',
    lastname: 'Clark',
    email: 'emma.student@lingua.com',
    role: 'student',
    password: 'password123',
  },
  {
    firstname: 'Lucas',
    lastname: 'Adams',
    email: 'lucas.student@lingua.com',
    role: 'student',
    password: 'password123',
  },
  {
    firstname: 'Mia',
    lastname: 'Scott',
    email: 'mia.student@lingua.com',
    role: 'student',
    password: 'password123',
  },
  {
    firstname: 'Noah',
    lastname: 'Turner',
    email: 'noah.student@lingua.com',
    role: 'student',
    password: 'password123',
  },
];

export const COURSE_SEED_DATA = [
  {
    title: 'English 101',
    description: 'Basic English course',
    language: Language.English,
    level: Level.A1,
    status: CourseStatus.Active,
    starts: new Date(new Date().setDate(new Date().getDate() - 30)),
  },
  {
    title: 'Korean for Beginners',
    description: 'Learn basic Korean',
    language: Language.Korean,
    level: Level.B1,
    status: CourseStatus.Active,
    starts: new Date(new Date().setDate(new Date().getDate() - 14)),
  },
  {
    title: 'Basic Dutch',
    description: 'Basic Dutch course',
    language: Language.Dutch,
    level: Level.C2,
    status: CourseStatus.Active,
    starts: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    title: 'Advanced Dutch',
    description: 'Master Dutch language',
    language: Language.Dutch,
    level: Level.B2,
    status: CourseStatus.Active,
    starts: new Date(),
  },
  {
    title: 'German Conversation',
    description: 'Practice German speaking skills',
    level: Level.A2,
    language: Language.German,
    status: CourseStatus.Active,
    starts: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
  {
    title: 'French Grammar',
    description: 'In-depth French grammar course',
    level: Level.C1,
    language: Language.French,
    status: CourseStatus.Active,
    starts: new Date(new Date().setDate(new Date().getDate() + 7)),
  },
];

export const LESSON_SEED_DATA = [
  {
    title: 'Lesson 1',
    description: 'Introduction',
    day: new Date().setDate(new Date().getDate() + 8),
    startTime: new Date('2024-09-01T10:00:00'),
    endTime: new Date('2024-09-01T11:30:00'),
    status: LessonStatus.Open,
  },
  {
    title: 'Lesson 2',
    description: 'Vocabulary & Grammar',
    day: new Date().setDate(new Date().getDate() + 9),
    startTime: new Date('2024-09-03T10:00:00'),
    endTime: new Date('2024-09-03T11:30:00'),
    status: LessonStatus.Open,
  },
  {
    title: 'Lesson 3',
    description: 'Listening practice',
    day: new Date().setDate(new Date().getDate() + 10),
    startTime: new Date('2024-09-05T10:00:00'),
    endTime: new Date('2024-09-05T11:30:00'),
    status: LessonStatus.Open,
  },
  {
    title: 'Lesson 4',
    description: 'Speaking Practice',
    day: new Date().setDate(new Date().getDate() + 11),
    startTime: new Date('2024-09-07T10:00:00'),
    endTime: new Date('2024-09-07T11:30:00'),
    status: LessonStatus.Open,
  },
  {
    title: 'Lesson 5',
    description: 'Review and Assessment',
    day: new Date().setDate(new Date().getDate() + 12),
    startTime: new Date('2024-09-09T10:00:00'),
    endTime: new Date('2024-09-09T11:30:00'),
    status: LessonStatus.Open,
  },
];

export const REVIEW_COMMENTS = [
  'Great course, learned a lot!',
  'Very well structured and easy to follow.',
  'The instructor explains everything clearly.',
  'Good content but could use more examples.',
  'Highly recommended for beginners.',
  'Some topics were a bit hard to follow.',
  'Excellent course, worth every minute.',
  'Good overview but lacks depth in some areas.',
  'The examples were very practical and helpful.',
  'Would have liked more exercises to practice.',
  'Clear explanations and great pace.',
  'A solid course, nothing groundbreaking though.',
];

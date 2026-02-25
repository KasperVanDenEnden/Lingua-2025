import { CourseStatus, Language, LessonStatus, RoomStatus } from "@lingua/api";
import { Types } from "mongoose";

export const USER_SEED_DATA = [
    // Admin user
    { firstname: 'Bob', lastname: 'Johnson', email: 'bob@example.com', role: 'admin' },
    // Teacher users
    { firstname: 'Alice', lastname: 'Brown', email: 'alice.teacher@lingua.com', role: 'teacher', password: 'password123' },
    { firstname: 'Robert', lastname: 'Martinez', email: 'robert.teacher@lingua.com', role: 'teacher', password: 'password123' },
    { firstname: 'Laura', lastname: 'Wilson', email: 'laura.teacher@lingua.com', role: 'teacher', password: 'password123' },
    // Student users
    { firstname: 'Tom', lastname: 'Harris', email: 'tom.student@lingua.com', role: 'student', password: 'password123' },
    { firstname: 'Emma', lastname: 'Clark', email: 'emma.student@lingua.com', role: 'student', password: 'password123' },
    { firstname: 'Lucas', lastname: 'Adams', email: 'lucas.student@lingua.com', role: 'student', password: 'password123' },
    { firstname: 'Mia', lastname: 'Scott', email: 'mia.student@lingua.com', role: 'student', password: 'password123' },
    { firstname: 'Noah', lastname: 'Turner', email: 'noah.student@lingua.com', role: 'student', password: 'password123' },
];

export const LOCATION_SEED_DATA = [
    {slug: 'breda-centre',floors: 3,rooms: 12,street: 'Markt',number: '12',city: 'Breda',postal: '4811XE',province: 'Noord-Brabant',},
    {slug: 'rotterdam-centrum',floors: 4,rooms: 18,street: 'Coolsingel',number: '45',city: 'Rotterdam',postal: '3012AG',province: 'Zuid-Holland',},
    {slug: 'amsterdam-zuid',floors: 5,rooms: 20,street: 'Pieter Cornelisz Hooftstraat',number: '88',city: 'Amsterdam',postal: '1071BZ',province: 'Noord-Holland',},
    {slug: 'tilburg-campus',floors: 2,rooms: 10,street: 'Heuvelstraat',number: '9',city: 'Tilburg',postal: '5038AA',province: 'Noord-Brabant',},
    {slug: 'eindhoven-learning',floors: 3,rooms: 14,street: 'Dommelstraat',number: '22',city: 'Eindhoven',postal: '5611CJ',province: 'Noord-Brabant',},
];

export const ROOM_SEED_DATA = [
    { number: 101, capacity: 12, floor: 1, hasMonitor: true },
    { number: 102, capacity: 18, floor: 1, hasMonitor: true },
    { number: 201, capacity: 20, floor: 2, hasMonitor: false },
    { number: 301, capacity: 25, floor: 3, hasMonitor: true },
    { number: 401, capacity: 15, floor: 4, hasMonitor: false },
]

export const COURSE_SEED_DATA = [
    { title: 'English 101', description: 'Basic English course', language: Language.English, status: CourseStatus.Active, },
    { title: 'Korean for Beginners', description: 'Learn basic Korean', language: Language.Korean, status: CourseStatus.Active, },
    { title: 'Basic Dutch', description: 'Basic Dutch course', language: Language.Dutch, status: CourseStatus.Active, },
    { title: 'Advanced Dutch', description: 'Master Dutch language', language: Language.Dutch, status: CourseStatus.Active, },
    { title: 'German Conversation', description: 'Practice German speaking skills', language: Language.German, status: CourseStatus.Active, },
    { title: 'French Grammar', description: 'In-depth French grammar course', language: Language.French, status: CourseStatus.Active, },
];

export const LESSON_SEED_DATA = [
    { title: 'Lesson 1', description: 'Introduction', day: new Date('2024-09-01'), startTime: new Date('2024-09-01T10:00:00'), endTime: new Date('2024-09-01T11:30:00'), status: LessonStatus.Open },
    { title: 'Lesson 2', description: 'Vocabulary & Grammar', day: new Date('2024-09-03'), startTime: new Date('2024-09-03T10:00:00'), endTime: new Date('2024-09-03T11:30:00'), status: LessonStatus.Open },
    { title: 'Lesson 3', description: 'Listening practice', day: new Date('2024-09-05'), startTime: new Date('2024-09-05T10:00:00'), endTime: new Date('2024-09-05T11:30:00'), status: LessonStatus.Open},
    { title: 'Lesson 4', description: 'Speaking Practice', day: new Date('2024-09-07'), startTime: new Date('2024-09-07T10:00:00'), endTime: new Date('2024-09-07T11:30:00'), status: LessonStatus.Open },
    { title: 'Lesson 5', description: 'Review and Assessment', day: new Date('2024-09-09'), startTime: new Date('2024-09-09T10:00:00'), endTime: new Date('2024-09-09T11:30:00'), status: LessonStatus.Open },
];
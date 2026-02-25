import { Injectable } from '@nestjs/common';
import { Course, CourseDocument, Lesson, LessonDocument, User, UserDocument } from '@lingua/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
    USER_SEED_DATA,
    COURSE_SEED_DATA,
    LESSON_SEED_DATA
} from './seeder.data';

@Injectable()
export class SeederService {
   
    private TAG = 'SeederService';

    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    ) {}

    async clearCollections(): Promise<void> {
        Logger.log('Clearing collections', this.TAG);
        await this.courseModel.deleteMany({});
        await this.userModel.deleteMany({});
        await this.lessonModel.deleteMany({});
        Logger.log('Cleared collections', this.TAG);
    }

    async seedUsers() {
        Logger.log('Seeding users', this.TAG);
        
        for (const user of USER_SEED_DATA) {
            await this.userModel.create({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                password: await bcrypt.hash('password123', 10)
            });
        }
        Logger.log('Seeding users complete', this.TAG);
    }

    async seedCourses() {
        Logger.log('Seeding courses', this.TAG);
        const teachers = await this.userModel.find({ role: 'teacher' });

        for (const course of COURSE_SEED_DATA) {
            const exists = await this.courseModel.findOne({ title: course.title });
            if (exists) continue;

            // Wijs willekeurig 1-2 docenten toe per course
            const assignedTeachers = teachers.slice(0, 2).map(t => t._id);

            await this.courseModel.create({
                ...course,
                teachers: assignedTeachers,
            });
        }

        Logger.log('Seeding courses complete', this.TAG);
    }

    async seedLessons() {
        Logger.log('Seeding lessons', this.TAG);
        const courses = await this.courseModel.find();
        if (!courses.length) throw new Error('No courses found. Seed courses first.');
        
        for (const course of courses) {
            if (!course.teachers || course.teachers.length === 0) continue; // Skip courses without teachers

            for (const [teacherIndex, teacherId] of course.teachers.entries()) {
                for (const lesson of LESSON_SEED_DATA) {
                    const day = new Date(lesson.day);
                    day.setDate(day.getDate() + teacherIndex); // verschuif per docent
                    
                    await this.lessonModel.create({
                        course: course._id,
                        teacher: teacherId,
                        ...lesson,
                        day,
                    });
                }
            }
        }
        
        Logger.log('Seeding lessons complete', this.TAG);
    }
}

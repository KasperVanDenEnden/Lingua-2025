import { Injectable } from '@nestjs/common';
import { Course, CourseDocument, CourseRegistration, CourseRegistrationDocument, Lesson, LessonDocument, Location, LocationDocument, Room, RoomDocument, User, UserDocument } from '@lingua/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { last } from 'rxjs';

@Injectable()
export class SeederService {
   
    private TAG = 'SeederService';

    constructor(
        @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(CourseRegistration.name) private courseRegistrationModel: Model<CourseRegistrationDocument>,
    ) {}

    async clearCollections(): Promise<void> {
        Logger.log('Clearing collections', this.TAG);
        await this.locationModel.deleteMany({});
        await this.courseModel.deleteMany({});
        await this.userModel.deleteMany({});
        await this.roomModel.deleteMany({});
        await this.lessonModel.deleteMany({});
        await this.courseRegistrationModel.deleteMany({});
        Logger.log('Cleared collections', this.TAG);
    }

    async seedUsers() {
        const rawUsers = [
            { firstname: 'Bob', lastname: 'Johnson', email: 'bob@example.com', role: 'admin' },
            { firstname: 'Alice', lastname: 'Brown', email: 'alice.teacher@lingua.com', role: 'teacher', password: 'password123' },
            { firstname: 'Robert', lastname: 'Martinez', email: 'robert.teacher@lingua.com', role: 'teacher', password: 'password123' },
            { firstname: 'Laura', lastname: 'Wilson', email: 'laura.teacher@lingua.com', role: 'teacher', password: 'password123' },

            { firstname: 'Tom', lastname: 'Harris', email: 'tom.student@lingua.com', role: 'student', password: 'password123' },
            { firstname: 'Emma', lastname: 'Clark', email: 'emma.student@lingua.com', role: 'student', password: 'password123' },
            { firstname: 'Lucas', lastname: 'Adams', email: 'lucas.student@lingua.com', role: 'student', password: 'password123' },
            { firstname: 'Mia', lastname: 'Scott', email: 'mia.student@lingua.com', role: 'student', password: 'password123' },
            { firstname: 'Noah', lastname: 'Turner', email: 'noah.student@lingua.com', role: 'student', password: 'password123' },
        ];

        for (const user of rawUsers) {
            await this.userModel.create({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                password: await bcrypt.hash('password123', 10)
            });
        }
    }
}

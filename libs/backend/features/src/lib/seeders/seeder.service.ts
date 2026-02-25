import { Injectable } from '@nestjs/common';
import { Course, CourseDocument, CourseRegistration, CourseRegistrationDocument, Lesson, LessonDocument, Location, LocationDocument, Room, RoomDocument, User, UserDocument } from '@lingua/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
    USER_SEED_DATA,
    LOCATION_SEED_DATA,
    ROOM_SEED_DATA,
    COURSE_SEED_DATA,
    LESSON_SEED_DATA
} from './seeder.data';
import { RoomStatus } from '@lingua/api';
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
    
    async seedLocations() {
        Logger.log('Seeding locations', this.TAG);

        const admin = await this.userModel.findOne({ role: 'admin' });
        if (!admin) throw new Error('Admin user not found. Seed users first.');
  
        for (const location of LOCATION_SEED_DATA) {
            const exists = await this.locationModel.findOne({
                slug: location.slug,
            });

            if (exists) continue;
            await this.locationModel.create({
                ...location,
                createdBy: admin._id
            });
        }
        Logger.log('Seeding locations complete', this.TAG);
    }


    async seedRooms() {
        Logger.log('Seeding rooms', this.TAG);
        const locations = await this.locationModel.find();
        if (!locations.length) throw new Error('No locations found. Seed locations first.');

        for (const location of locations) {

            const prefix = location.slug.substring(0,2).toUpperCase();
 
            for (const room of ROOM_SEED_DATA) {
                const slug = `${prefix}-${room.number}`;

                const exists = await this.roomModel.findOne({
                    slug,
                    location: location._id
                });

                if (exists) continue;

                await this.roomModel.create({
                    slug,
                    location: location._id,
                    capacity: room.capacity,
                    floor: room.floor,
                    hasMonitor: room.hasMonitor,
                    status: RoomStatus.Available,
                });
            }
        }

        Logger.log('Seeding rooms complete', this.TAG);
    }

    async seedCourses() {
        Logger.log('Seeding courses', this.TAG);
        const teachers = await this.userModel.find({ role: 'teacher' });
        if (teachers.length !== 3) throw new Error('Expected exactly 3 teachers for deterministic seeding.');
        if (COURSE_SEED_DATA.length < 6) throw new Error('Not enough course seed data.');

       for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];

            const assignedCourses = COURSE_SEED_DATA.slice(i * 2, i * 2 + 2);

            for (const course of assignedCourses) {

            const exists = await this.courseModel.findOne({
                title: course.title,
                teacher: teacher._id,
            });

            if (exists) continue;

            await this.courseModel.create({
                ...course,
                teacher: teacher._id,
                assistants: [],
            });
            }
        }
        
        Logger.log('Seeding courses complete', this.TAG);
    }

    async seedLessons() {
        Logger.log('Seeding lessons', this.TAG);
        const courses = await this.courseModel.find();
        if (!courses.length) throw new Error('No courses found. Seed courses first.');
        
        const location = await this.locationModel.findOne();

        if (!location)
        throw new Error('No location found. Seed locations first.');

        const rooms = await this.roomModel.find({ location: location._id });    

        if (!rooms.length)
            throw new Error('No rooms found for location.');

        let roomIndex = 0;

        for (const course of courses) {
            for (const lesson of LESSON_SEED_DATA) {

                const room = rooms[roomIndex % rooms.length];
                roomIndex++;

                await this.lessonModel.create({
                    course: course._id,
                    room: room._id,
                    teacher: course.teacher,
                    ...lesson,
                });
            }
        }
    }

    async seedCourseRegistrations() {
        Logger.log('Seeding course registrations', this.TAG);
        const students = await this.userModel.find({ role: 'student' });
        if (!students.length) throw new Error('No students found. Seed users first.');

        const courses = await this.courseModel.find();
        if (!courses.length) throw new Error('No courses found. Seed courses first.');

        for (const student of students) {
            for (const course of courses) {
                const exists = await this.courseRegistrationModel.findOne({
                    student: student._id,
                    course: course._id,
                });

                if (exists) continue;

                await this.courseRegistrationModel.create({
                    student: student._id,
                    course: course._id,
                    registeredAt: new Date(),
                });
            }
        }

        Logger.log('Seeding course registrations complete', this.TAG);
    }
}

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
                const slug = `${prefix}-room-${room.number}`;

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
}

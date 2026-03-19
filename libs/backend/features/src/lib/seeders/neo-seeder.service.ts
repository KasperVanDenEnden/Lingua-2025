import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '@lingua/neo4j';
import { Course, CourseDocument, User, UserDocument, Lesson, LessonDocument } from '@lingua/schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '@lingua/api';
import {
    MERGE_USER_CYPHER,
    MERGE_COURSE_CYPHER,
    MERGE_LESSON_CYPHER,
    REL_TEACHES_CYPHER,
    REL_ENROLLED_IN_CYPHER,
    REL_HAS_LESSON_CYPHER,
    REL_ATTENDS_CYPHER,
    REL_FOLLOWS_CYPHER,
    REL_REVIEWED_CYPHER
} from '@lingua/api'

@Injectable()
export class NeoSeederService {
    private TAG = 'NeoSeederService';
    
    constructor(
        private readonly neo4jService: Neo4jService,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    ) {}

    async clearNeo4j() {
        Logger.log('Clearing Neo4j graph', this.TAG);
        await this.neo4jService.run(`MATCH (n) DETACH DELETE n`);

        Logger.log('Cleared Neo4j graph', this.TAG);
    }

    async seedAll() {
        await this.seedUsers();
        await this.seedCourses();
        await this.seedLessons();
        // this.seedEnrollments();
        // this.seedReviews();
    }

    async seedUsers() {
        Logger.log('Start seeding user nodes', this.TAG)
        const users = await this.userModel.find().exec();
        
        for (const user of users) {
            await this.neo4jService.run(MERGE_USER_CYPHER,{
                    id:        user._id.toString(),
                    email:     user.email,
                    firstname: user.firstname,
                    lastname:  user.lastname,
                    role:      user.role,
                });
            
            // User -[:FOLLOWS]-> User    
            if (user.role === Role.Student)    
                for (const friendId of user.friends) {
                    await this.neo4jService.run(REL_FOLLOWS_CYPHER, {
                        userId: user._id.toString(),
                        friendId: friendId.toString()
                    })
                }    
        }
        Logger.log('Storing user nodes completed', this.TAG)
    }
    
    async seedCourses() {
        Logger.log('Start seeding course nodes', this.TAG)
        const courses = await this.courseModel.find().exec();

        for (const course of courses) {
            await this.neo4jService.run(MERGE_COURSE_CYPHER,{
                id: course._id.toString(),
                title: course.title,
            })
            
            // Teacher -[:TEACHES]-> Course
            for (const teacherId of course.teachers) {
                await this.neo4jService.run(
                    REL_TEACHES_CYPHER,
                    { userId: teacherId.toString(), courseId: course._id.toString()}
                );
            }

            // Student -[:ENROLLED_IN]-> Course
            for (const studentId of course.students) {
                await this.neo4jService.run(
                    REL_ENROLLED_IN_CYPHER,
                    { userId: studentId.toString(), courseId: course._id.toString()}
                );
            }

            // student -[:REVIEWED]-> COURSE
            for (const review of course.reviews) {
                await this.neo4jService.run(REL_REVIEWED_CYPHER, {
                    id: review._id.toString(),
                    rating: review.rating,
                    userId: review.student.toString(),
                    courseId: review.course.toString()
                })
            }
        }
        Logger.log('Storing course nodes completed', this.TAG)
    }

    async seedLessons() {
        Logger.log('Start seeding lesson nodes', this.TAG)
        const lessons = await this.lessonModel.find().exec();
        
        for (const lesson of lessons) {
            await this.neo4jService.run(MERGE_LESSON_CYPHER,{
                id: lesson._id.toString(),
                title: lesson.title,
            })

            await this.neo4jService.run(REL_HAS_LESSON_CYPHER,{
                courseId: lesson.course.toString(),
                lessonId: lesson._id.toString(),
            })
            
            for (const studentId of lesson.students) {
                await this.neo4jService.run(REL_ATTENDS_CYPHER, {
                    userId: studentId.toString(),
                    lessonId: lesson._id.toString()
                })
            }
        }

        Logger.log('Storing lesson nodes completed', this.TAG)
    }
}

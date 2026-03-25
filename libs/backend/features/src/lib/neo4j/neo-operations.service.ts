import { Neo4jService } from '@lingua/neo4j';
import { Injectable } from '@nestjs/common';
import { Id, IUser, ICourse, ILesson } from '@lingua/api';
import {
  MERGE_USER_CYPHER, REL_FOLLOW_CYPHER,
  MERGE_COURSE_CYPHER, REL_TEACHES_CYPHER, REL_ENROLLED_IN_CYPHER, REL_REVIEWED_CYPHER,
  MERGE_LESSON_CYPHER, REL_HAS_LESSON_CYPHER, REL_ATTENDS_CYPHER, DETACH_LESSON_CYPHER, DETACH_COURSE_CYPHER, DETACH_USER_CYPHER,
  REL_UNENROLL_IN_CYPHER, REL_UNATTENDS_CYPHER, REL_TEACHING_CYPHER, REL_UNFOLLOW_CYPHER, DETACH_REVIEW_CYPHER
} from '@lingua/api';

@Injectable()
export class NeoOperationsService {
   
  
    constructor( private readonly neo4j: Neo4jService) {}

    // === USER ===
    async mergeUser(user: IUser): Promise<void> {
        await this.neo4j.run(MERGE_USER_CYPHER, {
        id: user._id.toString(),
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        });
    }

    async detachUser(id: Id): Promise<void> {
        await this.neo4j.run(DETACH_USER_CYPHER, { id});
    }

    async followUser(userId: Id, friendId: Id): Promise<void> {
        await this.neo4j.run(REL_FOLLOW_CYPHER, { userId, friendId });
    }

    async unfollowUser(userId: Id, friendId: Id): Promise<void> {
        await this.neo4j.run(REL_UNFOLLOW_CYPHER, { userId, friendId });
    }

    // === COURSE ===
    async mergeCourse(course: ICourse): Promise<void> {
        await this.neo4j.run(MERGE_COURSE_CYPHER, {
            id: course._id.toString(),
            title: course.title,
        });
        for (const teacher of course.teachers) {
            await this.teachCourse(teacher.toString(), course._id.toString())
        }
    }

    async detachCourse(id: Id): Promise<void> {
        await this.neo4j.run(DETACH_COURSE_CYPHER, { id});
    }

    async teachCourse(userId: Id, courseId: Id): Promise<void> {
        await this.neo4j.run(REL_TEACHES_CYPHER, { userId, courseId });
    }

    async enrollInCourse(userId: Id, courseId: Id): Promise<void> {
        await this.neo4j.run(REL_ENROLLED_IN_CYPHER, { userId, courseId });
    }

    async unenrollInCourse(id: Id, userId: Id): Promise<void> {
        await this.neo4j.run(REL_UNENROLL_IN_CYPHER, { userId, id})
    }

    async reviewCourse(userId: Id, courseId: Id, reviewId: Id, rating: number): Promise<void> {
        await this.neo4j.run(REL_REVIEWED_CYPHER, { userId, courseId, id: reviewId, rating });
    }

    async deleteReview(userId: string, courseId: string) {
        await this.neo4j.run(DETACH_REVIEW_CYPHER, {userId, courseId});
    }

    // === LESSON ===
    async mergeLesson(lesson: ILesson): Promise<void> {
        await this.neo4j.run(MERGE_LESSON_CYPHER, {
            id: lesson._id.toString(),
            title: lesson.title,
        });
        await this.addLessonToCourse(lesson.course.toString(), lesson._id.toString())
        await this.teachLesson(lesson.teacher.toString(), lesson._id.toString())
    }

    async detachLesson(id: Id): Promise<void> {
        await this.neo4j.run(DETACH_LESSON_CYPHER, { id });
    }

    async addLessonToCourse(courseId: Id, lessonId: Id): Promise<void> {
        await this.neo4j.run(REL_HAS_LESSON_CYPHER, { courseId, lessonId });
    }

    async teachLesson(userId: Id, lessonId: Id): Promise<void> {
        await this.neo4j.run(REL_TEACHING_CYPHER, { userId, lessonId})
    }

    async attendLesson(userId: Id, lessonId: Id): Promise<void> {
        await this.neo4j.run(REL_ATTENDS_CYPHER, { userId, lessonId });
    }

    async unattendLesson(userId: Id, lessonId: Id): Promise<void> {
        await this.neo4j.run(REL_UNATTENDS_CYPHER, {userId, lessonId})
    }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Lesson, LessonSchema } from './lesson.schema';
import { Course, CourseSchema } from './course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema},
      { name: Lesson.name, schema: LessonSchema},
      { name: Course.name, schema: CourseSchema},
    ])
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SchemasModule {}

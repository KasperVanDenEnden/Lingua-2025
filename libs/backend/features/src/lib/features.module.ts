import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { CourseController } from './course/course.controller';
import {
  Course,
  CourseSchema,
  Lesson,
  LessonSchema,
  User,
  UserSchema,
} from '@lingua/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user/user.service';
import { LessonController } from './lesson/lesson.controller';
import { LessonService } from './lesson/lesson.service';
import { CourseService } from './course/course.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '@lingua/util-env';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role-auth.guard';
import { ReviewController } from './review/review.controller';
import { ReviewService } from './review/review.service';
import { SeederController } from './seeders/seeder.controller';
import { MongoSeederService } from './seeders/mongo-seeder.service';
import { NeoSeederService } from './seeders/neo-seeder.service';
import { NeoOperationsService } from './neo4j/neo-operations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    JwtModule.register({
      secret: environment.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    UserController,
    CourseController,
    LessonController,
    ReviewController,
    AuthController,
    SeederController,
  ],
  providers: [
    UserService,
    LessonService,
    CourseService,
    ReviewService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    MongoSeederService,
    NeoSeederService,
    NeoOperationsService,
  ],
  exports: [AuthService],
})
export class FeaturesModule {}

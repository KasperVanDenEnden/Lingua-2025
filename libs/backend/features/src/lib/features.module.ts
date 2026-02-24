import { Module } from '@nestjs/common';
import { LocationController } from './location/location.controller';
import { LocationService } from './location/location.service';
import { UserController } from './user/user.controller';
import { CourseController } from './course/course.controller';
import {
  Course,
  CourseRegistration,
  CourseRegistrationSchema,
  CourseSchema,
  Lesson,
  LessonSchema,
  Location,
  LocationSchema,
  Room,
  RoomSchema,
  User,
  UserSchema,
} from '@lingua/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user/user.service';
import { RoomController } from './room/room.controller';
import { RoomService } from './room/room.service';
import { LessonController } from './lesson/lesson.controller';
import { LessonService } from './lesson/lesson.service';
import { CourseService } from './course/course.service';
import { AssistantController } from './course/assistant/assistant.controller';
import { AssistantService } from './course/assistant/assistant.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '@lingua/util-env';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role-auth.guard';
import { CourseRegistrationController } from './student/course-registration.controller';
import { CourseRegistrationService } from './student/course-registration.service';
import { LessonAttendanceController } from './student/lesson-attendance.controller';
import { LessonAttendanceService } from './student/lesson-attendance.service';
import { ReviewController } from './review/review.controller';
import { ReviewService } from './review/review.service';
import { SeederController } from './seeders/seeder.controller';
import { SeederService } from './seeders/seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Room.name, schema: RoomSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: CourseRegistration.name, schema: CourseRegistrationSchema}
    ]),
    JwtModule.register({
      secret: environment.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    LocationController,
    UserController,
    CourseController,
    RoomController,
    LessonController,
    AssistantController,
    ReviewController,
    AuthController,
    CourseRegistrationController,
    LessonAttendanceController,
    SeederController,
  ],
  providers: [
    LocationService,
    UserService,
    RoomService,
    LessonService,
    CourseService,
    AssistantService,
    ReviewService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    CourseRegistrationService,
    LessonAttendanceService,
    SeederService
  ],
  exports: [AuthService],
})
export class FeaturesModule {}

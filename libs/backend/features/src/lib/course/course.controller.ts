import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  ICourse,
  Id,
  IUpdateCourse,
  Role,
  IUser,
} from '@lingua/api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateCourseDto } from '@lingua/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Types } from 'mongoose';
import { BodyObjectIdsPipe, StringObjectIdPipe } from '@lingua/features';
import { of } from 'rxjs';

@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  private TAG = 'CourseController';
  constructor(private courseService: CourseService) {}
  
  // -- Aggregate --- //
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Get('/dashboard')
  async getStudentDashboard(
    @CurrentUser() user: any,
  ) {
    return await this.courseService.getStudentDashboard(user.id);
  }

  // ----- CRUD Operations ----- //
  @Get()
  async getAll(): Promise<ICourse[]> {
    Logger.log('getAll', this.TAG);
    return await this.courseService.getAll();
  }


  @Get(':id')
  async getOne(@Param('id', StringObjectIdPipe) id: Id): Promise<ICourse> {
    Logger.log('getAll', this.TAG);
    return await this.courseService.getOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Post()
  async create(@Body(BodyObjectIdsPipe) body: CreateCourseDto): Promise<ICourse> {
    Logger.log('create', this.TAG);
    return await this.courseService.create(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Put(':id')
  async update(
    @Param('id', StringObjectIdPipe) id: Id,
    @Body(BodyObjectIdsPipe) body: IUpdateCourse
  ): Promise<ICourse> {
    Logger.log('update', this.TAG);
    return await this.courseService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Delete(':id')
  async delete(@Param('id', StringObjectIdPipe) id: Id) {
    Logger.log('delete', this.TAG);
    return this.courseService.delete(id);
  }
  

  // ----- Business Operations ----- //
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/enroll')
  async enroll(
    @Param('id', StringObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: any,
  ) {
    Logger.log('enroll', this.TAG);
    return this.courseService.enroll(id, Types.ObjectId.createFromHexString(user.id));
  }
  
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/unenroll')
  async unenroll(
    @Param('id', StringObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: any,
  ) {
    Logger.log('unenroll', this.TAG);
    return this.courseService.unenroll(id, Types.ObjectId.createFromHexString(user.id));
  }
}

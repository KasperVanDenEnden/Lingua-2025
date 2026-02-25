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
  stringObjectIdPipe,
  Id,
  BodyObjectIdsPipe,
  IUpdateCourse,
  Role,
} from '@lingua/api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { use } from 'passport';

@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  private TAG = 'CourseController';
  constructor(private courseService: CourseService) {}

  @Get()
  async getAll(): Promise<ICourse[]> {
    Logger.log('getAll', this.TAG);
    return await this.courseService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id', stringObjectIdPipe) id: Id): Promise<ICourse> {
    Logger.log('getAll', this.TAG);
    return await this.courseService.getOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Post()
  async create(@Body(BodyObjectIdsPipe) body: ICourse): Promise<ICourse> {
    Logger.log('create', this.TAG);
    return await this.courseService.create(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Put(':id')
  async update(
    @Param('id', stringObjectIdPipe) id: Id,
    @Body(BodyObjectIdsPipe) body: IUpdateCourse
  ): Promise<ICourse> {
    Logger.log('update', this.TAG);
    return await this.courseService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Delete(':id')
  async delete(@Param('id', stringObjectIdPipe) id: Id) {
    Logger.log('delete', this.TAG);
    return this.courseService.delete(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/enroll/:userId')
  async enroll(
    @Param('id', stringObjectIdPipe) id: Id,
    @Param('userId', stringObjectIdPipe) userId: Id
  ) {
    Logger.log('enroll', this.TAG);
    return this.courseService.enroll(id, userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/unenroll/:userId')
  async unenroll(
    @Param('id', stringObjectIdPipe) id: Id,
    @Param('userId', stringObjectIdPipe) userId: Id
  ) {
    Logger.log('unenroll', this.TAG);
    return this.courseService.unenroll(id, userId);
  }
}

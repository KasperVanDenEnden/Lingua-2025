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
import { LessonService } from './lesson.service';
import {
  Id,
  ILesson,
  IUpdateLesson,
  IUser,
  Role,
} from '@lingua/api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { CreateLessonDto } from '@lingua/dto';
import { BodyObjectIdsPipe, StringObjectIdPipe } from '@lingua/features';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('lesson')
@UseGuards(JwtAuthGuard)
export class LessonController {
  private TAG = 'LessonController';
  constructor(private lessonService: LessonService) {}

  // ----- CRUD Operations ----- //
  @Get()
  async getAll(): Promise<ILesson[]> {
    Logger.log('getAll', this.TAG);
    return await this.lessonService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id', StringObjectIdPipe) id: Id): Promise<ILesson> {
    Logger.log('getAll', this.TAG);
    return await this.lessonService.getOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Post()
  async create(@Body(BodyObjectIdsPipe) body: CreateLessonDto): Promise<ILesson> {
    Logger.log('create', this.TAG);
    return await this.lessonService.create(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Put(':id')
  async update(
    @Param('id', StringObjectIdPipe) id: Id,
    @Body(BodyObjectIdsPipe) body: IUpdateLesson
  ): Promise<ILesson> {
    Logger.log('update', this.TAG);
    return await this.lessonService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Teacher, Role.Admin)
  @Delete(':id')
  async delete(@Param('id', StringObjectIdPipe) id: Id) {
    Logger.log('delete', this.TAG);
    return this.lessonService.delete(id);
  }

  // ----- Business Operations ----- //
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/attend')
  async attend(
    @Param('id', StringObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: any,
  ) {
    Logger.log('attend', this.TAG);
    return await this.lessonService.attend(id, Types.ObjectId.createFromHexString(user.id));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @Post(':id/unattend')
  async unattend(
    @Param('id', StringObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: any,
  ) {
    Logger.log('unattend', this.TAG);
    return await this.lessonService.unattend(id, Types.ObjectId.createFromHexString(user.id));
  }
}

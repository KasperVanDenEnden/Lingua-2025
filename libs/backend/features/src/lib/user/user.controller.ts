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
import { UserService } from './user.service';
import {
  Id,
  IUpdateUser,
  IUser,
  Role,
} from '@lingua/api';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { BodyObjectIdsPipe, StringObjectIdPipe } from '@lingua/features';
import { Types } from 'mongoose';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private TAG = 'UserController';
  constructor(private userService: UserService) {}

  @Get()
  async getAll(): Promise<IUser[]> {
    Logger.log('getAll', this.TAG);
    return await this.userService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id', StringObjectIdPipe) id: Id): Promise<IUser> {
    Logger.log('getAll', this.TAG);
    return await this.userService.getOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() body: IUser): Promise<IUser> {
    Logger.log('create', this.TAG);
    return await this.userService.create(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  async update(
    @Param('id', StringObjectIdPipe) id: Id,
    @Body(BodyObjectIdsPipe) body: IUpdateUser
  ): Promise<IUser> {
    Logger.log('update', this.TAG);
    return await this.userService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id', StringObjectIdPipe) id: Types.ObjectId) {
    Logger.log('delete', this.TAG);
    return this.userService.delete(id);
  }
}

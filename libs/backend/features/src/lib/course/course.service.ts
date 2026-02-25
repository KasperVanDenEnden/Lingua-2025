import { ICourse, Id, IUpdateCourse } from '@lingua/api';
import { Course, CourseDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  private TAG = 'CourseService';
  constructor(
    @InjectModel(Course.name) private classModel: Model<CourseDocument>
  ) {}

  async getAll(): Promise<ICourse[]> {
    Logger.log('getAll', this.TAG);
    return await this.classModel.find();
  }

  async getOne(id: Id): Promise<ICourse> {
    Logger.log('getOne', this.TAG);

    const instance = await this.classModel
      .findById(id)
      .populate(['teacher', 'assistants'])
      .exec();

    if (!instance)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return instance;
  }

  async create(body: ICourse): Promise<ICourse> {
    Logger.log('create', this.TAG);
    return await this.classModel.create(body);
  }

  async update(id: Id, body: IUpdateCourse): Promise<ICourse> {
    Logger.log('update', this.TAG);

    const updatedCourse = await this.classModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updatedCourse)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return updatedCourse;
  }

  async delete(id: Id) {
    Logger.log('delete', this.TAG);

    const deletedCourse = await this.classModel.findByIdAndDelete(id);

    if (!deletedCourse)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return deletedCourse;
  }

  async enroll(id: Id) {
    Logger.log('enroll', this.TAG);
  }

  async unenroll(id: Id) {
    Logger.log('unenroll', this.TAG);
  }
}

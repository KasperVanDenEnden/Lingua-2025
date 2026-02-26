import { ICourse, Id, IUpdateCourse } from '@lingua/api';
import { CreateCourseDto } from '@lingua/dto';
import { Course, CourseDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CourseService {
  private TAG = 'CourseService';
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>
  ) {}

  async getAll(): Promise<ICourse[]> {
    Logger.log('getAll', this.TAG);
    return await this.courseModel.find();
  }

  async getOne(id: Id): Promise<ICourse> {
    Logger.log('getOne', this.TAG);

    const instance = await this.courseModel
      .findById(id)
      .populate('teachers')
      .exec();

    if (!instance)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return instance;
  }

  async create(body: CreateCourseDto): Promise<ICourse> {
    Logger.log('create', this.TAG);
    return await this.courseModel.create(body);
  }

  async update(id: Id, body: IUpdateCourse): Promise<ICourse> {
    Logger.log('update', this.TAG);

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
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

    const deletedCourse = await this.courseModel.findByIdAndDelete(id);

    if (!deletedCourse)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return deletedCourse;
  }

  async enroll(id: Types.ObjectId, userId: Types.ObjectId): Promise<ICourse> {
    Logger.log('enroll', this.TAG);
    
    const course = await this.courseModel.findOne({
      _id: id,
    }).exec();    

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    if (course.students.some(studentId => studentId.toString() === userId.toString())) {
      throw new HttpException('User is already enrolled in this course', HttpStatus.BAD_REQUEST);
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      id,
      { $addToSet: { students: userId } },
      { new: true }
    ).exec();

    return updatedCourse as ICourse;
  }

  async unenroll(id: Types.ObjectId, userId: Types.ObjectId): Promise<ICourse> {
    Logger.log('unenroll', this.TAG);

    const course = await this.courseModel.findOne({
      _id: id,
    }).exec();
    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    
    if (!course.students.some(studentId => studentId.toString() === userId.toString())) {
      throw new HttpException('User is not enrolled in this course', HttpStatus.BAD_REQUEST);
    }

    const updatedCourse  =  await this.courseModel.findByIdAndUpdate(
      { _id: id },
      { $pull: { students: userId } },
      { new: true }
    ).exec();
     
    return updatedCourse as ICourse;
  }
}

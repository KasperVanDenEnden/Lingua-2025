import { ICourse, Id, ILesson, IUpdateLesson } from '@lingua/api';
import { CreateLessonDto } from '@lingua/dto';
import { Lesson, LessonDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';

@Injectable()
export class LessonService {
  private TAG = 'LessonService';
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private neoService: NeoOperationsService
  ) {}

  async getAll(): Promise<ILesson[]> {
    Logger.log('getAll', this.TAG);
    return await this.lessonModel.find()
      .populate('teacher')
      .populate('course')
      .populate('students')
      .exec();
  }

  async getOne(id: Id): Promise<ILesson> {
    Logger.log('getOne', this.TAG);

    const lesson = await this.lessonModel.findById(id)
      .populate('teacher', '-password')
      .populate('course')
      .populate('students', '-password')
      .exec();

    if (!lesson)
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);

    return lesson;
  }

  async create(body: CreateLessonDto): Promise<ILesson> {
    Logger.log('create', this.TAG);

    const mongoLesson = await this.lessonModel.create(body);

    this.neoService.mergeLesson(mongoLesson);

    return mongoLesson;
  }

  async update(id: Id, changes: IUpdateLesson): Promise<ILesson> {
    Logger.log('update', this.TAG);

    const updatedLesson = await this.lessonModel.findByIdAndUpdate(
      id,
      changes,
      { new: true }
    );

    if (!updatedLesson)
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);

    return updatedLesson;
  }

  async delete(id: Id) {
    Logger.log('delete', this.TAG);

    const deletedLesson = await this.lessonModel.findByIdAndDelete(id);

    if (!deletedLesson)
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);

    await this.neoService.detachLesson(id);

    return deletedLesson;
  }

  async attend(id: Types.ObjectId, userId: Types.ObjectId): Promise<ILesson> {
    Logger.log('attend', this.TAG);

    const lesson = await this.lessonModel
      .findById(id)  
      .populate('course')
      .exec();

    if (!lesson) 
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);

    const course = lesson.course as unknown as ICourse;

    // 1. Is the lesson in the past?
    const today = new Date();
    if (lesson.day < today) 
      throw new HttpException('Cannot attend a lesson that has already taken place', HttpStatus.BAD_REQUEST);

    // 3. Is student already attending the lesson?
    if (lesson.students.some(studentId => studentId.toString() === userId.toString())) 
      throw new HttpException('User is already attending this lesson', HttpStatus.BAD_REQUEST);

    // 2. Is student subscribed to the course of the lesson?
    if (!course.students.some(studentId => studentId.toString() === userId.toString())) 
      throw new HttpException('User is not enrolled in the course of this lesson', HttpStatus.BAD_REQUEST);

    // 4. Is de les vol?
    if (lesson.students.length >= course.maxStudents)
      throw new HttpException('Lesson is full', HttpStatus.BAD_REQUEST);

    const updatedLesson = await this.lessonModel.findByIdAndUpdate(
      id,
      { $addToSet: { students: userId } },
      { new: true }
    ).exec();

    await this.neoService.attendLesson(userId.toString(), id.toString());

    return updatedLesson as ILesson;
  }

  async unattend(id: Types.ObjectId, userId: Types.ObjectId): Promise<ILesson> {
    Logger.log('unattend', this.TAG);

    const lesson = await this.lessonModel
      .findById(id)  
      .populate('course')
      .exec();

    if (!lesson) 
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);

    const course = lesson.course as unknown as ICourse;

    // 1. Is the lesson in the past?
    const today = new Date();
    if (lesson.day < today) 
      throw new HttpException('Cannot attend a lesson that has already taken place', HttpStatus.BAD_REQUEST);

    // 2. Is student subscribed to the course of the lesson?
    if (!course.students.some(studentId => studentId.toString() === userId.toString()))
      throw new HttpException('User is not enrolled in the course of this lesson', HttpStatus.BAD_REQUEST);
    
    // 3. Is student already not attending the lesson?
    if (!lesson.students.some(studentId => studentId.toString() === userId.toString()))
      throw new HttpException('User is not attending this lesson', HttpStatus.BAD_REQUEST);

    const updatedLesson = await this.lessonModel.findByIdAndUpdate(
      id,
      { $pull: { students: userId } },
      { new: true }
    ).exec();

    await this.neoService.unattendLesson(userId.toString(), id.toString())

    return updatedLesson as ILesson;
  }
}

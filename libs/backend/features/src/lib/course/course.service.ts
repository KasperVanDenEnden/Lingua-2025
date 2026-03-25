import { ICourse, Id, IUpdateCourse } from '@lingua/api';
import { CreateCourseDto } from '@lingua/dto';
import { Course, CourseDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NeoOperationsService } from '../neo4j/neo-operations.service';

@Injectable()
export class CourseService {
 
  private TAG = 'CourseService';
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private neoService: NeoOperationsService
  ) {}

  async getAll(): Promise<ICourse[]> {
    Logger.log('getAll', this.TAG);
    return await this.courseModel.find();
  }

  async getOne(id: Id): Promise<ICourse> {
    Logger.log('getOne', this.TAG);

    const instance = await this.courseModel
      .findById(id)
      .populate('teachers', '-password')
      .exec();

    if (!instance) 
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return instance;
  }

  async create(body: CreateCourseDto): Promise<ICourse> {
    Logger.log('create', this.TAG);
    
    const mongoCourse = await this.courseModel.create(body);

    await this.neoService.mergeCourse(mongoCourse);
    
    return mongoCourse
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

    const course = await this.courseModel.findById(id);

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    await course.deleteOne();
    await this.neoService.detachCourse(id.toString());

    return new HttpException('Course deleted successfully', HttpStatus.OK);
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
    
    await this.neoService.enrollInCourse(userId.toString(), id.toString());

    return updatedCourse as ICourse;
  }

  async unenroll(id: Types.ObjectId, userId: Types.ObjectId): Promise<ICourse> {
    Logger.log('unenroll', this.TAG);

    const course = await this.courseModel.findOne({
      _id: id,
    }).exec();

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    
    if (!course.students.some(studentId => studentId.toString() === userId.toString())) 
      throw new HttpException('User is not enrolled in this course', HttpStatus.BAD_REQUEST);

    const updatedCourse  =  await this.courseModel.findByIdAndUpdate(
      { _id: id },
      { $pull: { students: userId } },
      { new: true }
    ).exec();

    this.neoService.unenrollInCourse(id.toString(), userId.toString())
     
    return updatedCourse as ICourse;
  }

  async getStudentDashboard(userId: string) {
    Logger.log('Get course suggestions for student dashboard', this.TAG);
    const objectId = new Types.ObjectId(userId);

    return await this.courseModel.aggregate([
      // Alleen courses waar de student inzit
      { $match: { students: objectId }},

      // Lessen ophalen van die course
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: 'course',
          as: 'lessons'
        }
      },

      // Docenteninformatie ophalen
      {
        $lookup: {
          from: 'users',
          localField: 'teachers',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },

      // Bijgewoonde lessen filteren
      {
        $addFields: {
          attendedLessons: {
            $filter: {
              input: '$lessons',
              as: 'lesson',
              cond: { $in: [objectId, '$$lesson.students'] }
            }
          }
        }
      },

      // Alleen relevante velden teruggeven
      {
        $project: {
          title: 1,
          teachers: {
            $map: {
              input: '$teacherInfo',
              as: 't',
              in: { firstname: '$$t.firstname', lastname: '$$t.lastname' }
            }
          },
          totalLessons: { $size: '$lessons' },
          attendedCount: { $size: '$attendedLessons' },
          attendancePercentage: {
            $cond: {
              if: { $gt: [{ $size: '$lessons' }, 0] },
              then: {
                $multiply: [
                  { $divide: [{ $size: '$attendedLessons' }, { $size: '$lessons' }] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      }
    ])
  }
}

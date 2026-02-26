import { ICourse } from '@lingua/api';
import { Course, CourseDocument } from '@lingua/schemas';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateReviewDto } from 'libs/backend/dto/src/lib/review.dto';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReviewService {
  private TAG = 'ReviewService';
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>
  ) {}

  async create(body: CreateReviewDto, id: Types.ObjectId, userId: Types.ObjectId): Promise<ICourse> {
    Logger.log('create', this.TAG);

    const course = await this.courseModel.findOne({
      _id: id,
      students: userId,
    }).exec();

    if (!course) throw new HttpException('Course not found or user not enrolled', HttpStatus.BAD_REQUEST);

    // 1. Check of user al een review heeft geplaatst
    if (course.reviews.some(review => review.student.toString() === userId.toString())) {
      throw new HttpException('User has already reviewed this course', HttpStatus.BAD_REQUEST);
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          reviews: { ...body, student: userId, createdAt: new Date() },
        },
      },
      { new: true, runValidators: true }
    );

    return updatedCourse as ICourse;
  }

  async delete(id: Types.ObjectId, courseId: Types.ObjectId, userId: Types.ObjectId) {
    Logger.log('delete', this.TAG);

    const course = await this.courseModel.findOne({
      _id: courseId,
      'reviews._id': id,
    }).exec();

    if (!course) throw new HttpException('Course or review not found', HttpStatus.NOT_FOUND);

    // Check of de review van de ingelogde user is
    const review = course.reviews.find(r => r._id.toString() === id.toString());
    if (review?.student.toString() !== userId.toString()) {
      throw new HttpException('You can only delete your own reviews', HttpStatus.FORBIDDEN);
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      courseId,
      { $pull: { reviews: { _id: id } } },
      { new: true, runValidators: true }
    );

    return updatedCourse as ICourse;
  }
}

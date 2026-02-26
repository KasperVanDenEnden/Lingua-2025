import { Body, Controller, Delete, Logger, Param, Post, UseGuards} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ICourse } from '@lingua/api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BodyObjectIdsPipe, StringObjectIdPipe } from '@lingua/features';
import { CreateReviewDto } from '@lingua/dto';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  private TAG = 'ReviewController';
  constructor(private reviewService: ReviewService) {}

  @Post(':courseId')
  async create(
    @Body(BodyObjectIdsPipe) body: CreateReviewDto,
    @Param('courseId', StringObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: any,
  ): Promise<ICourse> {
    Logger.log('create', this.TAG);
    return await this.reviewService.create(body, id, Types.ObjectId.createFromHexString(user.id));
  }

  @Delete(':id/:courseId')
  async delete(
    @Param('id', StringObjectIdPipe) id: Types.ObjectId,
    @Param('courseId', StringObjectIdPipe) courseId: Types.ObjectId,
    @CurrentUser() user: any,
  ) {
    Logger.log('delete', this.TAG);
    return this.reviewService.delete(id, courseId, Types.ObjectId.createFromHexString(user.id));
  }
}
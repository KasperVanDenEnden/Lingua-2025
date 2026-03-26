import { ICreateReview, Id } from '@lingua/api';
import { IsNotEmpty, IsString, Min, Max, IsInt, IsMongoId } from 'class-validator';

export class CreateReviewDto implements ICreateReview {
  @IsNotEmpty()
  @IsMongoId({ message: 'student must be a valid ObjectId' })
  student!: Id;

  @IsNotEmpty()
  @IsMongoId({ message: 'course must be a valid ObjectId' })
  course!: Id;

  @IsNotEmpty()
  @IsString()
  comment!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  rating!: number;
}
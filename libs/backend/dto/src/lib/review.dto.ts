import { ICreateReview, Id } from '@lingua/api';
import {
  IsNotEmpty,
  IsString,
  Min,
  Max,
  IsInt,
  IsMongoId,
} from 'class-validator';

export class CreateReviewDto implements ICreateReview {
  @IsNotEmpty()
  @IsString()
  comment!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  rating!: number;
}

import { CourseStatus, ICourse, IsObjectId, IUpsertReview, IUser, Language } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsDate,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { ReviewSchema } from './review.schema';

export type CourseDocument = Course & Document;

@Schema()
export class Course implements ICourse {
  
  @Prop({ default: () => new Types.ObjectId() })
  @IsNotEmpty()
  @IsObjectId()
  _id!: Types.ObjectId;

  @Prop()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Prop({ type: String, enum: Object.values(CourseStatus) })
  @IsNotEmpty()
  @IsEnum(CourseStatus, { message: 'Status must be a valid enum value' })
  status!: CourseStatus;

  @Prop({ default: Date.now() })
  @IsNotEmpty()
  @IsDate()
  createdOn!: Date;

  @Prop({ type: String, enum: Object.values(Language) })
  @IsNotEmpty()
  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  language!: Language;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsObjectId()
  teachers!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  @IsNotEmpty()
  @IsObjectId({
    each: true,
    message: 'Each student must be a valid ObjectId',
  })
  @IsArray()
  @ArrayMinSize(0, { message: 'Students must be an array (can be empty)' })
  students!: Types.ObjectId[];

  @Prop({ type: [ReviewSchema] })
  reviews!: IUpsertReview[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

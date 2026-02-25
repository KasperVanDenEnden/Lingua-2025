import { ILesson, IsObjectId, LessonStatus, LessonType } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsArray,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';

export type LessonDocument = Lesson & Document;

@Schema()
export class Lesson implements ILesson {
  @Prop({ default: () => new Types.ObjectId() })
  @IsObjectId()
  @IsNotEmpty()
  _id!: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  @IsNotEmpty()
  @IsObjectId()
  course!: Types.ObjectId;
  

  @Prop({ type: Types.ObjectId, ref: 'Room' })
  @IsNotEmpty()
  @IsObjectId()
  room!: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsObjectId()
  teacher!: Types.ObjectId;
  
  @Prop({ type: [Types.ObjectId], ref: 'User' })
  @IsNotEmpty()
  @IsObjectId({
    each: true,
    message: 'Each user must be a valid ObjectId',
  })
  @IsArray()
  @ArrayMinSize(0, { message: 'Assistants must be an array (can be empty)' })
  students!: Types.ObjectId[];
  
  @Prop({ type: String, enum: Object.values(LessonStatus) })
  @IsEnum(LessonStatus, { message: 'Status must be a valid enum value'})
  @IsNotEmpty()
  status!: LessonStatus;
  
  @Prop({ type: String, enum: Object.values(LessonType) })
  @IsEnum(LessonType, { message: 'Type must be a valid enum value'})
  @IsNotEmpty()
  type!: LessonType;
  
  @Prop()
  @IsNotEmpty()
  @IsString()
  title!: string;
  
  @Prop()
  @IsNotEmpty()
  @IsDate()
  day!: Date;

  @Prop()
  @IsNotEmpty()
  @IsDate()
  startTime!: Date;

  @Prop()
  @IsNotEmpty()
  @IsDate()
  endTime!: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

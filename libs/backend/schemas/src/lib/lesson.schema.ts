import { ILessonSchema, LessonStatus, LessonType } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export type LessonDocument = Lesson & Document;

@Schema({timestamps: true})
export class Lesson implements ILessonSchema {
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  @IsNotEmpty()
  course!: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  teacher!: Types.ObjectId;
  
  @Prop({ type: [Types.ObjectId], ref: 'User' })
  @IsNotEmpty()
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

  @Prop({default: false})
  @IsNotEmpty()
  @IsBoolean()
  isWorkshop!: boolean;
  
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

import { ICreateLesson, Id, LessonStatus, LessonType } from '@lingua/api';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLessonDto implements ICreateLesson {
  @IsNotEmpty()
  @IsMongoId()
  course!: Id;

  @IsNotEmpty()
  @IsMongoId()
  teacher!: Id;

  @IsEnum(LessonStatus, { message: 'Status must be a valid enum value' })
  @IsNotEmpty()
  status!: LessonStatus;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsEnum(LessonType, { message: 'Type must be a valid enum value' })
  type!: LessonType;

  @IsNotEmpty()
  @IsBoolean()
  isWorkshop!: boolean;

  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  day!: Date;

  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  startTime!: Date;

  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  endTime!: Date;
}

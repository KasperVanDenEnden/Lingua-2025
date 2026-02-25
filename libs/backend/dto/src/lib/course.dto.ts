import { CourseStatus, ICreateCourse, IsObjectId, Language } from '@lingua/api';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Id } from '@lingua/api';

export class CreateCourseDto implements ICreateCourse {
  @IsNotEmpty()
  @IsString()
  status!: CourseStatus;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  @IsNotEmpty()
  language!: Language;

  @IsNotEmpty({ message: 'TeacherId us required' })
  @IsObjectId({
    each: true,
    message: 'Each teacher must be a valid ObjectId',
  })
  teachers!: Id[];
}

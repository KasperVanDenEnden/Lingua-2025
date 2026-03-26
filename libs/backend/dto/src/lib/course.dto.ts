import { CourseStatus, ICreateCourse, Language, Level } from '@lingua/api';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  isMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Id } from '@lingua/api';
import { Transform } from 'class-transformer';

export class CreateCourseDto implements ICreateCourse {
  @IsNotEmpty()
  @IsEnum(CourseStatus, { message: 'Status must be a valid enum value' })
  status!: CourseStatus;
  
  @IsNotEmpty()
  @IsString()
  title!: string;
  
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  @Max(50, { message: 'price cannot exceed 50,00' }) 
  @Min(0, { message: 'price cannot be negative' })
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  @Max(20, { message: 'maxStudents cannot exceed 20' }) 
  maxStudents!: number;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  starts!: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  ends!: Date | null;;
  
  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  @IsNotEmpty()
  language!: Language;

  @IsEnum(Level, { message: 'Language must be a valid enum value' })
  @IsNotEmpty()
  level!: Level;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one teacher is required' })
  @IsMongoId({ each: true, message: 'Each teacher must be a valid ObjectId' })
  teachers!: Id[];
}

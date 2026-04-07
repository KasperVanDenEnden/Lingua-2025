import { CourseStatus, ICourseSchema, IUpsertReview, Language, Level } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsDate,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNumber,
  Max,
  Min,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ReviewSchema } from './review.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Course implements ICourseSchema{
  
  @Prop()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Prop({ default: 0})
  @IsNotEmpty()
  @IsNumber()
  @Max(50, { message: 'price cannot exceed 50,00' }) 
  @Min(0, { message: 'price cannot be negative' }) 
  price!: number;
  
  @Prop({ default: 0})
  @IsNotEmpty()
  @IsNumber()
  @Max(20, { message: 'maxStudents cannot exceed 20' }) 
  maxStudents!: number;

  @Prop({ type: String, enum: Object.values(CourseStatus), default: CourseStatus.Concept })
  @IsNotEmpty()
  @IsEnum(CourseStatus, { message: 'Status must be a valid enum value' })
  status!: CourseStatus;

  @Prop()
  @IsNotEmpty()
  @IsDate()
  starts!: Date;

  @Prop({ type: Date, default: null })
  @IsOptional()
  @ValidateIf((o) => o.ends !== null)
  @IsDate()
  ends!: Date | null;

  @Prop({ type: String, enum: Object.values(Language) })
  @IsNotEmpty()
  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  language!: Language;
  
  @Prop({ type: String, enum: Object.values(Level), default: Level.A1 })
  @IsNotEmpty()
  @IsEnum(Level, { message: 'Level must be a valid enum value' })
  level!: Level;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  @IsNotEmpty()
  teachers!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0, { message: 'Students must be an array (can be empty)' })
  students!: Types.ObjectId[];

  @Prop({ type: [ReviewSchema] })
  reviews!: IUpsertReview[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('averageRating').get(function (this: CourseDocument) {
  if (!this.reviews || this.reviews.length === 0) {
    return 0;
  }
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / this.reviews.length;
});

CourseSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await this.model('Lesson').deleteMany({ course: this._id });
});
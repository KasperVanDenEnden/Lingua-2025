import { IReviewSchema } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsNotEmpty, IsDate, IsInt, IsMongoId } from 'class-validator';

export type ReviewDocument = Review & Document;

@Schema({timestamps: true})
export class Review implements IReviewSchema {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  student!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  @IsNotEmpty()
  @IsMongoId()
  course!: Types.ObjectId;

  @Prop()
  @IsNotEmpty()
  @IsString()
  comment!: string;

  @Prop()
  @IsNotEmpty()
  @IsInt()
  rating!: number;

  @Prop({ default: Date.now() })
  @IsNotEmpty()
  @IsDate()
  createdAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

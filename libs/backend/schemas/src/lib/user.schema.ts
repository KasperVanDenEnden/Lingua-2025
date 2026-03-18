import { IUserSchema, Role } from '@lingua/api';
import { Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsEnum, IsNotEmpty, IsMongoId } from 'class-validator';

export type UserDocument = User & Document;

@Schema({timestamps: true})
export class User implements IUserSchema {
  @Prop({ type: String, enum: Object.values(Role) })
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Role must be a valid enum value' })
  role!: Role;

  @Prop()
  @IsNotEmpty()
  @IsString()
  firstname!: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  lastname!: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  password!: string;

  token!:string;
}

export const UserSchema = SchemaFactory.createForClass(User);
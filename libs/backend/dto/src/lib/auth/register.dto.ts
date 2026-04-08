import { Role } from '@lingua/api';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role, { message: 'Role must be a valid enum value' })
  @IsNotEmpty()
  role!: Role;
}

import { ICreateUser, Role } from '@lingua/api';
import { IsNotEmpty, IsEnum, IsString, IsEmail } from 'class-validator';

export class CreateUserDto implements ICreateUser {
  @IsEnum(Role, { message: 'Role must be a valid enum value' })
  @IsNotEmpty()
  role!: Role;

  @IsNotEmpty()
  @IsString()
  firstname!: string;

  @IsNotEmpty()
  @IsString()
  lastname!: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class ChangePasswordDto {
  oldPassword!: string;
  newPassword!: string;
}

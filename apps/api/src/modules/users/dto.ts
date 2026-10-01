import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@isp/shared';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}

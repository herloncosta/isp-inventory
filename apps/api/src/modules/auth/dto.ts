import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

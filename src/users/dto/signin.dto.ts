import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signinDTO {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

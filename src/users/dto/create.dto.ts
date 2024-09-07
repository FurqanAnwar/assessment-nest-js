import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class CreateUserDTO{
    @IsNotEmpty()
    @IsString()
    fullName: string
    
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}
import { IsEmail, IsString, IsNotEmpty, IsOptional } from "class-validator";
import { Exclude } from "class-transformer";

export class UpdateUserDTO{
    @IsOptional()
    @IsString()
    fullName: string
    
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string

    @Exclude()
    password: string
}
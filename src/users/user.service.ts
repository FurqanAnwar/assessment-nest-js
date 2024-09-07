import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto';
import { UserEntityDTO } from './dto/userEntity.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './schema/user.model';
import { UniqueConstraintError } from 'sequelize';
import { plainToInstance } from 'class-transformer';
import { ResponseDTO } from './dto/response.dto';

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel: typeof User) {}
    
    async signup(requestBody: CreateUserDTO): Promise<ResponseDTO> {
        try{
            const user = await this.userModel.create(requestBody);

            const userPlainObject = user.dataValues;

            const userDto = plainToInstance(UserEntityDTO, userPlainObject);
        
            return { success: true, message: 'signup successfull', user: userDto};
        }catch(err){
            if (err instanceof UniqueConstraintError) {
                throw new HttpException('A user with this email already exists.', HttpStatus.BAD_REQUEST);
            }

            if (err instanceof Error){
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
            }

            throw new HttpException('An unknown error occured', HttpStatus.BAD_REQUEST)
        }
    }
}


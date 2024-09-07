import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto';
import { UserEntityDTO } from './dto/userEntity.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './schema/user.model';
import { UniqueConstraintError } from 'sequelize';
import { plainToInstance } from 'class-transformer';
import { ResponseDTO } from './dto/response.dto';
import { Log } from 'src/logs/schema/log.model';
import { LogAction } from '../logs/actions.enum';
import { UpdateUserDTO } from './dto/update.dto';

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel: typeof User,
                @InjectModel(Log) private readonly logModel: typeof Log ) {}
    
    async signup(requestBody: CreateUserDTO): Promise<ResponseDTO> {
        try{
            const user = await this.userModel.create(requestBody);
            
            const userPlainObject = user.dataValues;
            
            await this.logModel.create({ userId: userPlainObject.id, action: LogAction.SIGNUP })
            
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

    async updateUser(requestBody: UpdateUserDTO, userId: number): Promise<ResponseDTO> {
        try{
            let user = await this.userModel.findByPk(userId);

            if(!user){
                throw new HttpException('Invalid user id, user not found', HttpStatus.BAD_REQUEST)
            }

            const fieldsToUpdate = Object.entries(requestBody);

            if (fieldsToUpdate.length > 0) {
                const [updatedCount, [updatedUser]] = await this.userModel.update(requestBody, {
                    where: {
                        id: userId
                    },
                    returning: true
                });

                const userPlainObject = updatedUser.dataValues;

                await this.logModel.create({ userId: userPlainObject.id, action: LogAction.UPDATE_PROFILE })
                
                const userDto = plainToInstance(UserEntityDTO, userPlainObject);

                return { success: true, message: 'User updated successfully', user: userDto};
            
            }

            return { success: false, message: 'No data to update for user', user};
        }catch(err){
            if (err instanceof UniqueConstraintError){
                throw new HttpException('Email already in use, please choose a different email', HttpStatus.BAD_REQUEST)
            }

            if (err instanceof Error){
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
            }

            throw new HttpException('An unknown error occured', HttpStatus.BAD_REQUEST)
        }
    }

    async deleteUser(userId: number): Promise<ResponseDTO> {
        try{
            const transaction = await this.userModel.sequelize.transaction()
            const user = await this.userModel.findByPk(userId, { transaction });

            if(!user){
                throw new HttpException('Invalid user id, user not found', HttpStatus.BAD_REQUEST)
            }

            const deletedLogs = await this.logModel.destroy({
                where: { userId },
                transaction
            });


            const deletedRows = await this.userModel.destroy({
                where: { id: userId },
                transaction
            });

            await transaction.commit();

            
            return { success: true, message: 'User deleted successfully'}

        }catch(err){
            if (err instanceof Error){
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
            }

            throw new HttpException('An Unknown error occured', HttpStatus.BAD_REQUEST)
        }
    }
}


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
import { signinDTO } from './dto/signin.dto';
import { Sessions } from 'src/sessions/schema/session.model';
import { Request, Response } from 'express';

@Injectable()
export class UserService{
    constructor(@InjectModel(User) private readonly userModel: typeof User,
                @InjectModel(Log) private readonly logModel: typeof Log ) {}
    
    async signup(requestBody: CreateUserDTO): Promise<ResponseDTO> {
        try{
        const user: User = await this.userModel.create(requestBody);
          
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

    async signin(requestBody: signinDTO, session: Record<string, any>, req: Request, res: Response): Promise<ResponseDTO> {
        try {
            const user: User = await this.userModel.findOne({
                where: { email: requestBody.email }
            });
    
            if (!user) {
                throw new HttpException('There is no user against this email address', HttpStatus.BAD_REQUEST);
            }
    
            const currentlyLoggedInUserSession = await Sessions.findOne({ where: { userId: user.dataValues.id } });
    
            if (currentlyLoggedInUserSession && !req.cookies['connect.sid']) {
                const sessionHasExpired = new Date() > new Date(currentlyLoggedInUserSession.dataValues.expires);

                if (sessionHasExpired) {
                    await new Promise((resolve, reject) => {
                        req.sessionStore.destroy(currentlyLoggedInUserSession.dataValues.sid, (err: any) => {
                            if (err) {
                                reject(new Error('Failed to destroy session: ' + err.message));
                            }
                            
                            resolve('Session destroyed');
                        });
                    });

                    session.userId = user.id;
                    session.lastActivity = new Date();

                    return  res.json({ success: true, message: 'Login successful' }) as unknown as ResponseDTO;
                }

                if(!sessionHasExpired){
                    const sessionData = JSON.parse(currentlyLoggedInUserSession.dataValues.data);

                    res.cookie('connect.sid', currentlyLoggedInUserSession.dataValues.sid, {
                        httpOnly: true,
                        sameSite: true,
                        maxAge: new Date(sessionData.cookie.expires).getTime() - Date.now()
                      });
                    
                    session.userId = currentlyLoggedInUserSession.dataValues.userId;
                    session.lastActivity = new Date();
                    
                    return res.json({ success: true, message: 'Session updated, login successful' }) as unknown as ResponseDTO;
                }
            }
    
            const isPasswordCorrect = await User.comparePassword(requestBody.password, user.password);
            if (!isPasswordCorrect) {
                throw new HttpException('email or password is incorrect', HttpStatus.BAD_REQUEST);
            }

            if (currentlyLoggedInUserSession && currentlyLoggedInUserSession.dataValues.userId != req.cookies['connect.sid']['userId']) {
                await Sessions.destroy({
                    where: { userId: user.id },
                });
            }

            session.userId = user.id;
            session.lastActivity = new Date();

            return  res.json({ success: true, message: 'Login successful' }) as unknown as ResponseDTO;
    
        } catch (err) {
            if (err instanceof Error) {
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
            }
    
            throw new HttpException('An unknown error occurred', HttpStatus.BAD_REQUEST);
        }
    }
    
    async updateUser(requestBody: UpdateUserDTO, userId: number): Promise<ResponseDTO> {
        try{
            let user: User = await this.userModel.findByPk(userId);

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
            const user: User = await this.userModel.findByPk(userId, { transaction });

            if(!user){
                throw new HttpException('Invalid user id, user not found', HttpStatus.BAD_REQUEST)
            }

            await this.logModel.destroy({ where: { userId }, transaction });

            await this.userModel.destroy({ where: { id: userId }, transaction });

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


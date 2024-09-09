import { Controller, Post, Body, Param, Delete, Session, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create.dto';
import { ResponseDTO } from './dto/response.dto';
import { UpdateUserDTO } from './dto/update.dto';
import { signinDTO } from './dto/signin.dto';
import { Request, Response } from 'express'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  async signup(@Body() requestBody: CreateUserDTO): Promise<ResponseDTO> {
    return await this.userService.signup(requestBody);
  }

  @Post('auth/signin')
  async signin(
    @Body() requestBody: signinDTO,
    @Session() session: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ResponseDTO> {
    return await this.userService.signin(requestBody, session, req, res);
  }

  @Post('/users/:id')
  async updateUser(@Body() requestBody: UpdateUserDTO, @Param('id') userId: number): Promise<ResponseDTO> {
    return await this.userService.updateUser(requestBody, userId)
  }

  @Delete('/users/:id')
  async deleteUser(@Param('id') userId: number): Promise<ResponseDTO> {
    return await this.userService.deleteUser(userId);
  }

}

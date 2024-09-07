import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create.dto';
import { ResponseDTO } from './dto/response.dto';
import { UpdateUserDTO } from './dto/update.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  async signup(@Body() requestBody: CreateUserDTO): Promise<ResponseDTO> {
    return await this.userService.signup(requestBody);
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

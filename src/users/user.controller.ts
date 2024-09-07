import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create.dto';
import { ResponseDTO } from './dto/response.dto';
import { UpdateUserDTO } from './dto/update.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  signup(@Body() requestBody: CreateUserDTO): Promise<ResponseDTO> {
    return this.userService.signup(requestBody);
  }

  @Post('/users/:id')
  updateUser(@Body() requestBody: UpdateUserDTO, @Param('id') userId: number): Promise<ResponseDTO> {
    return this.userService.updateUser(requestBody, userId)
  }

  @Delete('/users/:id')
  deleteUser(@Param('id') userId: number): Promise<ResponseDTO> {
    return this.userService.deleteUser(userId);
  }
}

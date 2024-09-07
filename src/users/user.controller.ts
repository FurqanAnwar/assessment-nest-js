import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create.dto';
import { ResponseDTO } from './dto/response.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  signup(@Body() requestBody: CreateUserDTO): Promise<ResponseDTO> {
    return this.userService.signup(requestBody);
  }
}

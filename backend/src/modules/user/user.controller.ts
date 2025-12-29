import { Controller, Post, Body, UsePipes, ValidationPipe, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 用户注册接口
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.register(createUserDto);
    return {
      status: HttpStatus.CREATED,
      message: '注册成功',
      data: result,
    };
  }

  // 用户登录接口
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);
    return {
      status: HttpStatus.OK,
      message: '登录成功',
      data: result,
    };
  }
}
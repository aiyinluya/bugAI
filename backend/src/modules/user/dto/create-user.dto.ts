import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: '用户名至少需要3个字符' })
  username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: '密码至少需要6个字符' })
  password: string;
}
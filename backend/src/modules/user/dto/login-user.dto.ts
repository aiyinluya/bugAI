import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
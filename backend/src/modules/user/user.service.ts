import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 用户注册
  async register(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findOne({ where: { username } });
    if (existingUserByUsername) {
      throw new ConflictException('该用户名已被使用');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    // 生成JWT令牌
    const token = this.jwtService.sign({
      sub: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        level: newUser.level,
        exp: newUser.exp,
        totalWhipCount: newUser.totalWhipCount,
        createdAt: newUser.createdAt,
      },
      token,
    };
  }

  // 用户登录
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // 查找用户
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 生成JWT令牌
    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        exp: user.exp,
        totalWhipCount: user.totalWhipCount,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // 根据ID查找用户
  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  // 更新用户鞭打次数
  async updateWhipCount(userId: string, count: number = 1) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.totalWhipCount += count;
      await this.userRepository.save(user);
      return user;
    }
    return null;
  }
}
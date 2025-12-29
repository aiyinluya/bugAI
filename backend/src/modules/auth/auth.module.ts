import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key', // 使用固定密钥，避免类型错误
      signOptions: {
        expiresIn: '7d', // 使用字符串字面量，NestJS JWT模块能够正确识别
      },
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}

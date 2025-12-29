import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './case.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Case, Comment, Like, User]), AuthModule],
  controllers: [CaseController],
  providers: [CaseService],
})
export class CaseModule {}

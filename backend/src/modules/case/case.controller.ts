import { Controller, Get, Post, Body, Param, HttpStatus, Response, UseGuards, Request } from '@nestjs/common';
import { CaseService } from './case.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLikeDto } from './dto/create-like.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  // 创建案例
  @Post('/cases')
  async createCase(@Body() createCaseDto: CreateCaseDto, @Body('userId') userId: string, @Response() res) {
    try {
      const newCase = await this.caseService.createCase(createCaseDto, userId);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: '案例创建成功',
        data: newCase,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 获取所有案例
  @Get('/cases')
  async getAllCases(@Response() res) {
    try {
      const cases = await this.caseService.getAllCases();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '获取案例列表成功',
        data: cases,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  // 获取单个案例
  @Get('/cases/:id')
  async getCaseById(@Param('id') id: string, @Response() res) {
    try {
      const caseEntity = await this.caseService.getCaseById(id);
      // 更新查看次数
      await this.caseService.incrementViewCount(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '获取案例详情成功',
        data: caseEntity,
      });
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }
  }

  // 增加鞭打次数
  @Post('/cases/:id/whip')
  async incrementWhipCount(@Param('id') id: string, @Response() res) {
    try {
      const updatedCase = await this.caseService.incrementWhipCount(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '鞭打成功',
        data: updatedCase,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 愤怒投票
  @Post('/cases/:id/vote-angry')
  async voteAngry(@Param('id') id: string, @Response() res) {
    try {
      const updatedCase = await this.caseService.voteAngry(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '投票成功',
        data: updatedCase,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 学习投票
  @Post('/cases/:id/vote-learn')
  async voteLearn(@Param('id') id: string, @Response() res) {
    try {
      const updatedCase = await this.caseService.voteLearn(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '投票成功',
        data: updatedCase,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 获取评论
  @Get('/comments/case/:caseId')
  async getCommentsByCaseId(@Param('caseId') caseId: string, @Response() res) {
    try {
      const comments = await this.caseService.getCommentsByCaseId(caseId);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '获取评论成功',
        data: comments,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 创建评论
  @Post('/comments')
  // 移除登录保护，允许匿名用户评论
  async createComment(@Body() createCommentDto: CreateCommentDto, @Response() res) {
    try {
      const { caseId, userId, content } = createCommentDto;
      const comment = await this.caseService.createComment(caseId, userId, content);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: '评论创建成功',
        data: comment,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
  
  // 点赞/取消点赞
  @Post('/likes/toggle')
  // 移除登录保护，允许匿名用户点赞
  async toggleLike(@Body() createLikeDto: CreateLikeDto, @Response() res) {
    try {
      const { caseId, userId } = createLikeDto;
      const result = await this.caseService.toggleLike(caseId, userId);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: result.isLiked ? '点赞成功' : '取消点赞成功',
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 分享案例
  @Post('/cases/:id/share')
  async shareCase(@Param('id') id: string, @Response() res) {
    try {
      const updatedCase = await this.caseService.shareCase(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '分享成功',
        data: updatedCase,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 获取用户案例
  @Get('/cases/user/:userId')
  async getUserCases(@Param('userId') userId: string, @Response() res) {
    try {
      const cases = await this.caseService.getUserCases(userId);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '获取用户案例成功',
        data: cases,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  // 获取统计数据
  @Get('/cases/statistics')
  async getStatistics(@Response() res) {
    try {
      const statistics = await this.caseService.getStatistics();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '获取统计数据成功',
        data: statistics,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
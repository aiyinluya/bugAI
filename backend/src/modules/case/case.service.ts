import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Like } from './like.entity';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case) private caseRepository: Repository<Case>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}

  // 创建案例
  async createCase(createCaseDto: CreateCaseDto, userId: string): Promise<Case> {
    let user = null;
    
    // 仅当不是匿名用户时检查用户是否存在
    if (userId !== 'anonymous-user') {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
    }

    const caseEntity = this.caseRepository.create({
      aiName: createCaseDto.aiName,
      aiProvider: createCaseDto.aiProvider,
      originalDialog: createCaseDto.dialogMessages,
      errorType: createCaseDto.errorType,
      highlightedText: createCaseDto.errorDescription,
      correctionSuggest: createCaseDto.correctionSuggestion || '',
      user, // 匿名用户时user为null
    });

    return this.caseRepository.save(caseEntity);
  }

  // 获取所有案例
  async getAllCases(): Promise<Case[]> {
    return this.caseRepository.find({
      relations: ['user', 'comments', 'comments.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // 获取单个案例
  async getCaseById(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
    });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    return caseEntity;
  }

  // 增加鞭打次数
  async incrementWhipCount(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({ where: { id } });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    caseEntity.whipCount += 1;
    return this.caseRepository.save(caseEntity);
  }

  // 增加查看次数
  async incrementViewCount(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({ where: { id } });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    caseEntity.views += 1;
    return this.caseRepository.save(caseEntity);
  }

  // 愤怒投票
  async voteAngry(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({ where: { id } });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    caseEntity.voteAngry += 1;
    return this.caseRepository.save(caseEntity);
  }

  // 学习投票
  async voteLearn(id: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({ where: { id } });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    caseEntity.voteLearn += 1;
    return this.caseRepository.save(caseEntity);
  }

  // 创建评论
  async createComment(caseId: string, userId: string, content: string): Promise<Comment> {
    let user = null;
    
    // 仅当不是匿名用户时检查用户是否存在
    if (userId !== 'anonymous-user') {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
    }

    const caseEntity = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    if (!content.trim()) {
      throw new HttpException('评论内容不能为空', HttpStatus.BAD_REQUEST);
    }

    const comment = this.commentRepository.create({
      content,
      user, // 匿名用户时user为null
      case: caseEntity,
    });

    await this.commentRepository.save(comment);

    // 更新案例的评论数
    caseEntity.commentCount += 1;
    await this.caseRepository.save(caseEntity);

    return comment;
  }

  // 获取案例评论
  async getCommentsByCaseId(caseId: string): Promise<Comment[]> {
    const caseEntity = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    return this.commentRepository.find({
      where: { case: { id: caseId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // 点赞案例
  // 点赞/取消点赞
  async toggleLike(caseId: string, userId: string): Promise<{ like: Like | null; isLiked: boolean }> {
    let user = null;
    
    // 仅当不是匿名用户时检查用户是否存在
    if (userId !== 'anonymous-user') {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
    }

    const caseEntity = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    // 检查是否已经点赞
    const existingLike = await this.likeRepository.findOne({
      where: { 
        ...(user ? { user: { id: userId } } : { userId }),
        case: { id: caseId } 
      },
    });

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      await this.likeRepository.remove(existingLike);
      caseEntity.likeCount -= 1;
      await this.caseRepository.save(caseEntity);
      return { like: existingLike, isLiked: false };
    } else {
      // 如果没有点赞，则添加点赞
      const like = this.likeRepository.create({
        ...(user ? { user } : { userId }),
        case: caseEntity,
      });
      await this.likeRepository.save(like);
      caseEntity.likeCount += 1;
      await this.caseRepository.save(caseEntity);
      return { like, isLiked: true };
    }
  }

  // 分享案例
  async shareCase(caseId: string): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({ where: { id: caseId } });

    if (!caseEntity) {
      throw new HttpException('案例不存在', HttpStatus.NOT_FOUND);
    }

    caseEntity.shareCount += 1;
    return this.caseRepository.save(caseEntity);
  }

  // 获取用户的案例
  async getUserCases(userId: string): Promise<Case[]> {
    return this.caseRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // 获取统计数据
  async getStatistics(): Promise<any> {
    // 按AI提供商统计案例数量
    const casesByProvider = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.aiProvider, COUNT(*) as count')
      .groupBy('case.aiProvider')
      .getRawMany();

    // 按错误类型统计案例数量
    const casesByErrorType = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.errorType, COUNT(*) as count')
      .groupBy('case.errorType')
      .getRawMany();

    // 总案例数
    const totalCases = await this.caseRepository.count();

    // 总鞭打数
    const totalWhipCount = await this.caseRepository
      .createQueryBuilder('case')
      .select('SUM(case.whipCount) as total')
      .getRawOne();

    return {
      totalCases,
      totalWhipCount: totalWhipCount.total || 0,
      casesByProvider,
      casesByErrorType,
    };
  }
}
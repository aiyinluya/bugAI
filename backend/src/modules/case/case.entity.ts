import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

// AI提供商类型
export type AIProvider = 'ChatGPT' | 'Claude' | '文心一言' | '通义千问' | '自定义' | '未知';

// 错误类型
export type ErrorType = '事实错误' | '逻辑混乱' | '答非所问' | '循环重复' | '敷衍应付';

// 对话消息类型
export interface DialogMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cases, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 100 })
  aiName: string;

  @Column({
    type: 'text',
    default: '未知'
  })
  aiProvider: AIProvider;

  @Column({ type: 'json' })
  originalDialog: DialogMessage[];

  @Column({
    type: 'text',
    default: '事实错误'
  })
  errorType: ErrorType;

  @Column({ type: 'text' })
  highlightedText: string;

  @Column({ type: 'text', nullable: true })
  correctionSuggest: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  whipCount: number;

  @Column({ default: 0 })
  voteAngry: number;

  @Column({ default: 0 })
  voteLearn: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @OneToMany(() => Comment, (comment) => comment.case)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.case)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
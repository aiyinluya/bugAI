import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Case } from '../case/case.entity';
import { Comment } from '../case/comment.entity';
import { Like } from '../case/like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  exp: number;

  @Column({ default: 0 })
  totalWhipCount: number;

  // 添加与案例的关系
  @OneToMany(() => Case, (caseEntity) => caseEntity.user)
  cases: Case[];

  // 添加与评论的关系
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // 添加与点赞的关系
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
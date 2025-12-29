import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { Case } from './case.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE', nullable: true })
  user: User | null;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.likes, { onDelete: 'CASCADE' })
  case: Case;

  @CreateDateColumn()
  createdAt: Date;
}
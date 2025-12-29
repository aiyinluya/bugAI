import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

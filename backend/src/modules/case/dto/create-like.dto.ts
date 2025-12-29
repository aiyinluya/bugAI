import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
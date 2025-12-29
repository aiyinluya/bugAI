import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// AI提供商类型
export type AIProvider = 'ChatGPT' | 'Claude' | '文心一言' | '通义千问' | '自定义' | '未知';

// 错误类型
export type ErrorType = '事实错误' | '逻辑混乱' | '答非所问' | '循环重复' | '敷衍应付';

// 对话消息类型
export class DialogMessageDto {
  @IsEnum(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  timestamp: number;
}

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  aiName: string;

  @IsEnum(['ChatGPT', 'Claude', '文心一言', '通义千问', '自定义', '未知'])
  aiProvider: AIProvider;

  @ValidateNested({ each: true })
  @Type(() => DialogMessageDto)
  dialogMessages: DialogMessageDto[];

  @IsEnum(['事实错误', '逻辑混乱', '答非所问', '循环重复', '敷衍应付'])
  errorType: ErrorType;

  @IsString()
  @IsNotEmpty()
  errorDescription: string;

  @IsString()
  @IsOptional()
  correctionSuggestion?: string;

  @IsString()
  @IsOptional()
  screenshot?: string;
}

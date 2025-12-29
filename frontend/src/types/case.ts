// 错误案例类型定义

// AI服务提供商类型
export type AIProvider = 'ChatGPT' | 'Claude' | '文心一言' | '通义千问' | '自定义' | '未知';

// 错误类型
export type ErrorType = '事实错误' | '逻辑混乱' | '答非所问' | '循环重复' | '敷衍应付';

// 对话消息接口
export interface DialogMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 评论接口
export interface Comment {
  id: string;
  content: string;
  userId: string;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

// 点赞接口
export interface Like {
  id: string;
  userId: string;
  caseId: string;
  createdAt: Date;
}

// 案例表单数据接口
export interface CaseFormData {
  aiName: string;
  aiProvider: AIProvider;
  errorType: ErrorType;
  title: string;
  description: string;
  dialogHistory: DialogMessage[];
  imageUrl?: string;
}

// 错误案例接口
export interface Case {
  id: string;
  userId: string;
  aiName: string;
  aiProvider: AIProvider;
  errorType: ErrorType;
  originalDialog: DialogMessage[];
  highlightedText: string;
  correctionSuggest?: string;
  views: number;
  whipCount: number;
  voteAngry: number;
  voteLearn: number;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  likes: Like[];
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  commentCount?: number;
  likeCount?: number;
}

export interface ErrorCase extends Case {}
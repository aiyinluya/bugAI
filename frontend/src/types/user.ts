// 用户类型定义

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  exp: number;
  totalWhipCount: number;
  createdAt: Date;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface UserStoreState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUserInfo: (user: Partial<User>) => void;
}
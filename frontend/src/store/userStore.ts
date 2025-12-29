import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginFormData, RegisterFormData, UserStoreState } from '../types/user';

// 创建用户状态管理
export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // 登录
      login: async (data: LoginFormData) => {
        set(() => ({ loading: true, error: null }));
        try {
          // 调用后端API
          const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '登录失败');
          }

          const result = await response.json();
          
          set(() => ({
            user: result.data.user,
            token: result.data.token,
            loading: false
          }));
        } catch (error) {
          set(() => ({
            error: error instanceof Error ? error.message : '登录失败，请稍后重试',
            loading: false
          }));
          throw error;
        }
      },

      // 注册
      register: async (data: RegisterFormData) => {
        set(() => ({ loading: true, error: null }));
        try {
          // 调用后端API
          const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '注册失败');
          }

          const result = await response.json();
          
          set(() => ({
            user: result.data.user,
            token: result.data.token,
            loading: false
          }));
        } catch (error) {
          set(() => ({
            error: error instanceof Error ? error.message : '注册失败，请稍后重试',
            loading: false
          }));
          throw error;
        }
      },

      // 登出
      logout: () => {
        set(() => ({
          user: null,
          token: null
        }));
      },

      // 更新用户信息
      updateUserInfo: (userInfo: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userInfo } : null
        }));
      }
    }),
    {
      name: 'user-storage', // 存储名称
      storage: createJSONStorage(() => localStorage), // 使用localStorage存储
    }
  )
);
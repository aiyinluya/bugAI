import { create } from 'zustand';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Case, Comment, Like } from '../types/case';

const API_BASE_URL = 'http://localhost:3000/api';

interface CaseStore {
  cases: Case[];
  currentCase: Case | null;
  userCases: Case[];
  comments: Comment[];
  likes: Like[];
  loading: boolean;
  statistics: any;
  formData: any;

  // 案例操作
  getAllCases: () => Promise<void>;
  getCaseById: (id: string) => Promise<void>;
  getUserCases: (userId: string) => Promise<void>;
  submitCase: (userId: string, formData: any) => Promise<void>;
  incrementWhipCount: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  voteAngry: (id: string) => Promise<void>;
  voteLearn: (id: string) => Promise<void>;
  shareCase: (id: string) => Promise<void>;

  // 评论操作
  fetchComments: (caseId: string) => Promise<void>;
  createComment: (caseId: string, userId: string, content: string) => Promise<void>;

  // 点赞操作
  toggleLike: (caseId: string, userId: string) => Promise<boolean | undefined>;
  isLiked: (caseId: string, userId: string) => boolean;
  getLikeCount: (caseId: string) => number;

  // 统计数据
  getStatistics: () => Promise<void>;

  // 表单数据
  updateFormData: (data: any) => void;
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  cases: [],
  currentCase: null,
  userCases: [],
  comments: [],
  likes: [],
  loading: false,
  statistics: null,
  formData: null,
  
  // 表单数据
  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },
  
  // 案例操作
  getAllCases: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/cases`);
      if (response.status === 200 && response.data.data) {
        set({ cases: response.data.data, loading: false });
      }
    } catch (error) {
      console.error('获取案例列表失败:', error);
      toast.error('获取案例列表失败');
      set({ loading: false });
    }
  },

  getCaseById: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/${id}`);
      if (response.status === 200 && response.data.data) {
        set({ currentCase: response.data.data, loading: false });
      }
    } catch (error) {
      console.error('获取案例详情失败:', error);
      toast.error('获取案例详情失败');
      set({ loading: false });
    }
  },

  getUserCases: async (userId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/user/${userId}`);
      if (response.status === 200 && response.data.data) {
        set({ userCases: response.data.data, loading: false });
      }
    } catch (error) {
      console.error('获取用户案例失败:', error);
      toast.error('获取用户案例失败');
      set({ loading: false });
    }
  },

  submitCase: async (userId, formData) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_BASE_URL}/cases`, {
        ...formData,
        userId,
      });

      if (response.status === 201 && response.data.data) {
        set((state) => ({ 
          cases: [response.data.data, ...state.cases],
          loading: false,
          formData: null 
        }));
        toast.success('案例提交成功');
      }
    } catch (error) {
      console.error('提交案例失败:', error);
      toast.error('提交案例失败');
      set({ loading: false });
    }
  },

  incrementWhipCount: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cases/${id}/whip`);
      if (response.status === 200 && response.data.data) {
        set((state) => ({
          cases: state.cases.map((caseItem) => 
            caseItem.id === id ? response.data.data : caseItem
          ),
          currentCase: state.currentCase?.id === id ? response.data.data : state.currentCase,
        }));
        toast.success('鞭打成功！');
      }
    } catch (error) {
      console.error('鞭打失败:', error);
      toast.error('鞭打失败');
    }
  },

  incrementViewCount: async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/cases/${id}/view`);
    } catch (error) {
      console.error('更新查看次数失败:', error);
    }
  },

  voteAngry: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cases/${id}/vote-angry`);
      if (response.status === 200 && response.data.data) {
        set((state) => ({
          cases: state.cases.map((caseItem) => 
            caseItem.id === id ? response.data.data : caseItem
          ),
          currentCase: state.currentCase?.id === id ? response.data.data : state.currentCase,
        }));
        toast.success('投票成功！');
      }
    } catch (error) {
      console.error('投票失败:', error);
      toast.error('投票失败');
    }
  },

  voteLearn: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cases/${id}/vote-learn`);
      if (response.status === 200 && response.data.data) {
        set((state) => ({
          cases: state.cases.map((caseItem) => 
            caseItem.id === id ? response.data.data : caseItem
          ),
          currentCase: state.currentCase?.id === id ? response.data.data : state.currentCase,
        }));
        toast.success('投票成功！');
      }
    } catch (error) {
      console.error('投票失败:', error);
      toast.error('投票失败');
    }
  },
  
  // 评论操作
  fetchComments: async (caseId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/case/${caseId}`);
      if (response.status === 200 && response.data.data) {
        set({ comments: response.data.data, loading: false });
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      toast.error('获取评论失败');
      set({ loading: false });
    }
  },

  createComment: async (caseId, userId, content) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/comments`, {
        caseId,
        userId,
        content,
      });

      if (response.status === 201 && response.data.data) {
        set((state) => ({
          comments: [response.data.data, ...state.comments],
          cases: state.cases.map((caseItem) =>
            caseItem.id === caseId ? { ...caseItem, commentCount: (caseItem.commentCount || 0) + 1 } : caseItem
          ),
        }));
        toast.success('评论成功！');
      }
    } catch (error) {
      console.error('评论失败:', error);
      toast.error('评论失败');
    }
  },
  
  // 点赞操作
  toggleLike: async (caseId, userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/likes/toggle`, {
        caseId,
        userId,
      });

      if (response.status === 200 && response.data.data) {
        set((state) => ({
          likes: response.data.data.isLiked
            ? [...state.likes, response.data.data.like]
            : state.likes.filter((like) => like.id !== response.data.data.like.id),
          cases: state.cases.map((caseItem) =>
            caseItem.id === caseId ? { ...caseItem, likeCount: (caseItem.likeCount || 0) + (response.data.data.isLiked ? 1 : -1) } : caseItem
          ),
        }));
        toast.success(response.data.data.isLiked ? '点赞成功！' : '取消点赞成功！');
        return response.data.data.isLiked;
      }
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('点赞失败');
    }
  },
  
  isLiked: (caseId, userId) => {
    const { likes } = get();
    return likes.some(like => like.caseId === caseId && like.userId === userId);
  },
  
  getLikeCount: (caseId) => {
    const { likes } = get();
    return likes.filter(like => like.caseId === caseId).length;
  },
  
  // 分享操作
  shareCase: async (id) => {
    try {
      // 模拟分享功能 - 实际项目中可以实现分享到社交媒体
      const url = `${window.location.origin}/case/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success('分享链接已复制到剪贴板！');
      
      // 调用后端API记录分享
      await axios.post(`${API_BASE_URL}/cases/${id}/share`);
    } catch (error) {
      console.error('分享失败:', error);
      toast.error('分享失败');
    }
  },

  // 统计数据
  getStatistics: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/statistics`);
      if (response.status === 200 && response.data.data) {
        set({ statistics: response.data.data, loading: false });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast.error('获取统计数据失败');
      set({ loading: false });
    }
  },
}));
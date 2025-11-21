import axios from 'axios';
import type { 
  WordRecord, 
  TranslationResponse, 
  Statistics, 
  WordListResponse,
  UserRating,
  AuthResponse 
} from '../types';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token（JWT）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权时跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    console.error('API 错误:', error);
    throw error;
  }
);

/**
 * 认证服务
 */
export const authAPI = {
  /**
   * 注册（邮箱 + 密码，用户名可选）
   */
  register: async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  /**
   * 登录（邮箱 + 密码）
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

/**
 * 翻译服务
 */
export const translationAPI = {
  /**
   * 翻译单词或短语
   */
  translate: async (text: string, context?: string): Promise<TranslationResponse> => {
    const response = await api.post<TranslationResponse>('/words/translate', {
      text,
      context,
    });
    return response.data;
  },
};

/**
 * 单词服务
 */
export const wordAPI = {
  /**
   * 添加单词到生词本
   */
  addWord: async (
    word: string,
    translation: string,
    userRating: UserRating,
    context?: string
  ): Promise<WordRecord> => {
    const response = await api.post<WordRecord>('/words', {
      word,
      translation,
      userRating,
      context,
    });
    return response.data;
  },

  /**
   * 复习单词
   */
  reviewWord: async (wordId: string, userRating: UserRating): Promise<WordRecord> => {
    const response = await api.post<WordRecord>(`/words/${wordId}/review`, {
      userRating,
    });
    return response.data;
  },

  /**
   * 获取今日待复习单词
   */
  getTodayWords: async (): Promise<WordRecord[]> => {
    const response = await api.get<WordRecord[]>('/words/today');
    return response.data;
  },

  /**
   * 获取用户所有单词
   */
  getWords: async (
    page: number = 1,
    limit: number = 20,
    masteryLevel?: number
  ): Promise<WordListResponse> => {
    const params: any = { page, limit };
    if (masteryLevel !== undefined) {
      params.masteryLevel = masteryLevel;
    }
    const response = await api.get<WordListResponse>('/words', { params });
    return response.data;
  },

  /**
   * 获取学习统计
   */
  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get<Statistics>('/words/statistics');
    return response.data;
  },

  /**
   * 删除单词
   */
  deleteWord: async (wordId: string): Promise<void> => {
    await api.delete(`/words/${wordId}`);
  },
};

export default api;


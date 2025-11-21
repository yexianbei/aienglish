/**
 * 用户评分类型
 */
export type UserRating = 'unknown' | 'vague' | 'mastered';

/**
 * 掌握程度等级 (0-5)
 */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 复习历史记录
 */
export interface ReviewHistory {
  reviewedAt: Date;
  userRating: UserRating;
  nextInterval: number; // 下次复习间隔（天）
}

/**
 * 单词记录接口
 */
export interface IWordRecord {
  userId: string;
  word: string;
  translation: string;
  context?: string;
  partOfSpeech?: string; // 词性
  examples?: string[]; // 例句
  phonetic?: string; // 音标
  createdAt: Date;
  lastReviewedAt?: Date;
  nextReviewAt: Date;
  masteryLevel: MasteryLevel;
  reviewCount: number;
  reviewHistory: ReviewHistory[];
}

/**
 * 用户接口
 */
export interface IUser {
  username: string;
  email: string;
  password: string;
  openaiUserId?: string; // OpenAI 用户 ID（用于 MCP 绑定）
  /**
   * 标记该用户是否最初是通过 MCP / ChatGPT 自动创建的
   * 用于之后在 Web 端完成注册时做账号“补全”
   */
  fromMcp?: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * 翻译请求
 */
export interface TranslationRequest {
  text: string;
  context?: string;
}

/**
 * 翻译响应
 */
export interface TranslationResponse {
  word: string;
  translation: string;
  partOfSpeech?: string;
  phonetic?: string;
  examples: string[];
  definitions: string[];
}

/**
 * 添加单词请求
 */
export interface AddWordRequest {
  word: string;
  translation: string;
  context?: string;
  userRating: UserRating;
}

/**
 * 复习单词请求
 */
export interface ReviewWordRequest {
  wordId: string;
  userRating: UserRating;
}

/**
 * 艾宾浩斯记忆曲线间隔（天）
 */
export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30, 60];


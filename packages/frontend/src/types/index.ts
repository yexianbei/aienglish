/**
 * 用户评分类型
 */
export type UserRating = 'unknown' | 'vague' | 'mastered';

/**
 * 掌握程度等级
 */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 复习历史
 */
export interface ReviewHistory {
  reviewedAt: string;
  userRating: UserRating;
  nextInterval: number;
}

/**
 * 单词记录
 */
export interface WordRecord {
  _id: string;
  userId: string;
  word: string;
  translation: string;
  context?: string;
  partOfSpeech?: string;
  examples?: string[];
  phonetic?: string;
  createdAt: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
  masteryLevel: MasteryLevel;
  reviewCount: number;
  reviewHistory: ReviewHistory[];
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
 * 学习统计
 */
export interface Statistics {
  totalWords: number;
  todayReview: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  masteryDistribution: Record<number, number>;
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 单词列表响应
 */
export interface WordListResponse {
  words: WordRecord[];
  pagination: Pagination;
}


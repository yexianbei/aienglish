import { WordRecord } from '../models/WordRecord';
import { AddWordRequest, ReviewWordRequest, UserRating } from '../types';
import { EbbinghausCalculator } from '../utils/ebbinghaus';
import { Log } from '../utils/logger';

export class WordService {
  /**
   * 添加新单词到生词本
   */
  async addWord(userId: string, request: AddWordRequest) {
    try {
      const { word, translation, context, userRating } = request;

      Log.info('添加单词', { userId, word });

      // 检查是否已存在
      const existing = await WordRecord.findOne({
        userId,
        word: word.toLowerCase()
      });

      if (existing) {
        Log.warn('单词已存在', { userId, word });
        return existing;
      }

      // 根据初始评分计算首次复习时间
      const masteryLevel = this.getInitialMasteryLevel(userRating);
      const nextReviewAt = EbbinghausCalculator.calculateNextReviewDate(0, userRating);

      // 创建新记录
      const wordRecord = new WordRecord({
        userId,
        word: word.toLowerCase(),
        translation,
        context,
        masteryLevel,
        nextReviewAt,
        reviewCount: 0,
        reviewHistory: [{
          reviewedAt: new Date(),
          userRating,
          nextInterval: EbbinghausCalculator.calculateNextInterval(0, userRating)
        }]
      });

      await wordRecord.save();

      Log.success('单词添加成功', { userId, word, wordId: wordRecord._id });

      return wordRecord;
    } catch (error) {
      Log.error('添加单词失败', error);
      throw error;
    }
  }

  /**
   * 复习单词
   */
  async reviewWord(userId: string, request: ReviewWordRequest) {
    try {
      const { wordId, userRating } = request;

      Log.info('复习单词', { userId, wordId, userRating });

      const wordRecord = await WordRecord.findOne({
        _id: wordId,
        userId
      });

      if (!wordRecord) {
        throw new Error('单词记录不存在');
      }

      // 计算新的掌握程度和下次复习时间
      const newMasteryLevel = EbbinghausCalculator.calculateNewMasteryLevel(
        wordRecord.masteryLevel,
        userRating
      );
      const nextReviewAt = EbbinghausCalculator.calculateNextReviewDate(
        wordRecord.masteryLevel,
        userRating
      );
      const nextInterval = EbbinghausCalculator.calculateNextInterval(
        wordRecord.masteryLevel,
        userRating
      );

      // 更新记录
      wordRecord.masteryLevel = newMasteryLevel;
      wordRecord.lastReviewedAt = new Date();
      wordRecord.nextReviewAt = nextReviewAt;
      wordRecord.reviewCount += 1;
      wordRecord.reviewHistory.push({
        reviewedAt: new Date(),
        userRating,
        nextInterval
      });

      await wordRecord.save();

      Log.success('单词复习完成', { 
        userId, 
        wordId, 
        newMasteryLevel,
        nextReviewAt 
      });

      return wordRecord;
    } catch (error) {
      Log.error('复习单词失败', error);
      throw error;
    }
  }

  /**
   * 获取今天需要复习的单词
   */
  async getTodayReviewWords(userId: string) {
    try {
      Log.info('获取今日复习单词', { userId });

      const query = {
        userId,
        ...EbbinghausCalculator.getTodayReviewQuery()
      };

      const words = await WordRecord.find(query)
        .sort({ nextReviewAt: 1 }) // 按复习时间排序
        .limit(50); // 限制数量

      Log.success('获取今日复习单词成功', { userId, count: words.length });

      return words;
    } catch (error) {
      Log.error('获取今日复习单词失败', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有单词
   */
  async getUserWords(userId: string, options?: {
    page?: number;
    limit?: number;
    masteryLevel?: number;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const skip = (page - 1) * limit;

      Log.info('获取用户单词列表', { userId, page, limit });

      const query: any = { userId };
      if (options?.masteryLevel !== undefined) {
        query.masteryLevel = options.masteryLevel;
      }

      const [words, total] = await Promise.all([
        WordRecord.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        WordRecord.countDocuments(query)
      ]);

      Log.success('获取用户单词列表成功', { userId, count: words.length, total });

      return {
        words,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      Log.error('获取用户单词列表失败', error);
      throw error;
    }
  }

  /**
   * 获取学习统计
   */
  async getStatistics(userId: string) {
    try {
      Log.info('获取学习统计', { userId });

      const [
        totalWords,
        todayReview,
        masteredWords,
        learningWords,
        masteryDistribution
      ] = await Promise.all([
        // 总单词数
        WordRecord.countDocuments({ userId }),
        // 今日待复习
        WordRecord.countDocuments({
          userId,
          ...EbbinghausCalculator.getTodayReviewQuery()
        }),
        // 已掌握（等级 5）
        WordRecord.countDocuments({ userId, masteryLevel: 5 }),
        // 学习中（等级 1-4）
        WordRecord.countDocuments({ userId, masteryLevel: { $gte: 1, $lte: 4 } }),
        // 掌握程度分布
        WordRecord.aggregate([
          { $match: { userId } },
          { $group: { _id: '$masteryLevel', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ])
      ]);

      const statistics = {
        totalWords,
        todayReview,
        masteredWords,
        learningWords,
        newWords: totalWords - masteredWords - learningWords,
        masteryDistribution: masteryDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<number, number>)
      };

      Log.success('获取学习统计成功', { userId, statistics });

      return statistics;
    } catch (error) {
      Log.error('获取学习统计失败', error);
      throw error;
    }
  }

  /**
   * 删除单词
   */
  async deleteWord(userId: string, wordId: string) {
    try {
      Log.info('删除单词', { userId, wordId });

      const result = await WordRecord.deleteOne({
        _id: wordId,
        userId
      });

      if (result.deletedCount === 0) {
        throw new Error('单词记录不存在');
      }

      Log.success('删除单词成功', { userId, wordId });

      return { success: true };
    } catch (error) {
      Log.error('删除单词失败', error);
      throw error;
    }
  }

  /**
   * 根据初始评分获取初始掌握程度
   */
  private getInitialMasteryLevel(userRating: UserRating): number {
    switch (userRating) {
      case 'unknown':
        return 0;
      case 'vague':
        return 1;
      case 'mastered':
        return 2;
      default:
        return 0;
    }
  }
}


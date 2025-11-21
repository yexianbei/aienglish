import { EBBINGHAUS_INTERVALS, UserRating, MasteryLevel } from '../types';

/**
 * 艾宾浩斯记忆曲线算法
 * 根据用户评分和当前掌握程度，计算下次复习时间
 */
export class EbbinghausCalculator {
  /**
   * 计算下次复习的间隔天数
   * @param currentLevel 当前掌握程度 (0-5)
   * @param userRating 用户本次复习的评分
   * @returns 下次复习的间隔天数
   */
  static calculateNextInterval(currentLevel: MasteryLevel, userRating: UserRating): number {
    let nextLevel = currentLevel;

    // 根据用户评分调整掌握程度
    switch (userRating) {
      case 'unknown':
        // 不认识，降低掌握程度
        nextLevel = Math.max(0, currentLevel - 1) as MasteryLevel;
        break;
      case 'vague':
        // 模糊，保持当前程度
        nextLevel = currentLevel;
        break;
      case 'mastered':
        // 掌握，提升掌握程度
        nextLevel = Math.min(5, currentLevel + 1) as MasteryLevel;
        break;
    }

    // 根据掌握程度返回对应的复习间隔
    if (nextLevel >= EBBINGHAUS_INTERVALS.length) {
      // 已经达到最高掌握程度，返回最长间隔
      return EBBINGHAUS_INTERVALS[EBBINGHAUS_INTERVALS.length - 1];
    }

    return EBBINGHAUS_INTERVALS[nextLevel];
  }

  /**
   * 计算下次复习的具体日期
   * @param currentLevel 当前掌握程度
   * @param userRating 用户评分
   * @returns 下次复习的日期
   */
  static calculateNextReviewDate(currentLevel: MasteryLevel, userRating: UserRating): Date {
    const intervalDays = this.calculateNextInterval(currentLevel, userRating);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate;
  }

  /**
   * 计算新的掌握程度
   * @param currentLevel 当前掌握程度
   * @param userRating 用户评分
   * @returns 新的掌握程度
   */
  static calculateNewMasteryLevel(currentLevel: MasteryLevel, userRating: UserRating): MasteryLevel {
    switch (userRating) {
      case 'unknown':
        return Math.max(0, currentLevel - 1) as MasteryLevel;
      case 'vague':
        return currentLevel;
      case 'mastered':
        return Math.min(5, currentLevel + 1) as MasteryLevel;
      default:
        return currentLevel;
    }
  }

  /**
   * 获取今天需要复习的单词数量的查询条件
   * @returns MongoDB 查询条件
   */
  static getTodayReviewQuery() {
    const now = new Date();
    return {
      nextReviewAt: { $lte: now }
    };
  }

  /**
   * 获取即将到期的单词查询条件（未来 N 天内）
   * @param days 天数
   * @returns MongoDB 查询条件
   */
  static getUpcomingReviewQuery(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return {
      nextReviewAt: {
        $gte: now,
        $lte: future
      }
    };
  }
}


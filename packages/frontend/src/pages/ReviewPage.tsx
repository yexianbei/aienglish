import React, { useEffect, useState } from 'react';
import { WordCard } from '../components/WordCard';
import { wordAPI } from '../services/api';
import type { WordRecord, UserRating } from '../types';
import { Loader2, PartyPopper } from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const [words, setWords] = useState<WordRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadTodayWords();
  }, []);

  const loadTodayWords = async () => {
    try {
      setLoading(true);
      const data = await wordAPI.getTodayWords();
      setWords(data);
    } catch (error) {
      console.error('加载今日复习单词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (wordId: string, rating: UserRating) => {
    try {
      setReviewing(true);
      await wordAPI.reviewWord(wordId, rating);
      
      // 移动到下一个单词
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 完成所有复习
        setCurrentIndex(words.length);
      }
    } catch (error) {
      console.error('复习单词失败:', error);
      alert('复习失败，请重试');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-12">
          <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            太棒了！今天没有需要复习的单词 🎉
          </h2>
          <p className="text-gray-600">
            继续保持，明天见！
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= words.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-12">
          <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            完成今日复习！🎉
          </h2>
          <p className="text-gray-600 mb-6">
            你已经复习了 {words.length} 个单词，继续加油！
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            复习进度
          </span>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {words.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 单词卡片 */}
      <div className="animate-fade-in">
        <WordCard
          word={currentWord}
          mode="review"
          onReview={handleReview}
        />
      </div>

      {reviewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};


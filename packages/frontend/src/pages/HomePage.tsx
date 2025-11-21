import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatisticsCard } from '../components/StatisticsCard';
import { WordCard } from '../components/WordCard';
import { wordAPI } from '../services/api';
import type { Statistics, WordRecord } from '../types';
import { Loader2, BookOpen, Calendar } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentWords, setRecentWords] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, wordsData] = await Promise.all([
        wordAPI.getStatistics(),
        wordAPI.getWords(1, 6),
      ]);
      setStatistics(stats);
      setRecentWords(wordsData.words);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
      await wordAPI.deleteWord(wordId);
      // 重新加载数据
      await loadData();
    } catch (error) {
      console.error('删除单词失败:', error);
      alert('删除失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      {statistics && <StatisticsCard statistics={statistics} />}

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/review"
          className="group bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">开始复习</h3>
              <p className="text-primary-100">
                今日待复习: {statistics?.todayReview || 0} 个单词
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/words"
          className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">生词本</h3>
              <p className="text-purple-100">
                查看所有 {statistics?.totalWords || 0} 个单词
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* 最近添加的单词 */}
      {recentWords.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">最近添加</h2>
            <Link
              to="/words"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWords.map((word) => (
              <WordCard
                key={word._id}
                word={word}
                mode="list"
                onDelete={handleDeleteWord}
              />
            ))}
          </div>
        </div>
      )}

      {recentWords.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            还没有添加单词
          </h3>
          <p className="text-gray-600 mb-6">
            在 ChatGPT 聊天中翻译单词，然后点击"加入生词本"开始学习
          </p>
        </div>
      )}
    </div>
  );
};


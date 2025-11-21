import React from 'react';
import { BookMarked, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import type { Statistics } from '../types';

interface StatisticsCardProps {
  statistics: Statistics;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics }) => {
  const stats = [
    {
      label: '总单词数',
      value: statistics.totalWords,
      icon: BookMarked,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '今日待复习',
      value: statistics.todayReview,
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: '已掌握',
      value: statistics.masteredWords,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: '学习中',
      value: statistics.learningWords,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">学习统计</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 text-center">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 掌握程度分布 */}
      {statistics.masteryDistribution && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            掌握程度分布
          </h3>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((level) => {
              const count = statistics.masteryDistribution[level] || 0;
              const percentage = statistics.totalWords > 0
                ? (count / statistics.totalWords) * 100
                : 0;

              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">
                    等级 {level}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        level === 0
                          ? 'bg-gray-400'
                          : level === 1
                          ? 'bg-red-400'
                          : level === 2
                          ? 'bg-orange-400'
                          : level === 3
                          ? 'bg-yellow-400'
                          : level === 4
                          ? 'bg-blue-400'
                          : 'bg-green-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { WordCard } from '../components/WordCard';
import { wordAPI } from '../services/api';
import type { WordRecord, MasteryLevel } from '../types';
import { Loader2, Filter } from 'lucide-react';

export const WordsPage: React.FC = () => {
  const [words, setWords] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterLevel, setFilterLevel] = useState<MasteryLevel | undefined>();

  useEffect(() => {
    loadWords();
  }, [page, filterLevel]);

  const loadWords = async () => {
    try {
      setLoading(true);
      const data = await wordAPI.getWords(page, 12, filterLevel);
      setWords(data.words);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('加载单词列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
      await wordAPI.deleteWord(wordId);
      // 重新加载当前页
      await loadWords();
    } catch (error) {
      console.error('删除单词失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleFilterChange = (level: number | undefined) => {
    setFilterLevel(level as MasteryLevel | undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">我的生词本</h1>
        
        {/* 筛选器 */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterLevel ?? ''}
            onChange={(e) => handleFilterChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部等级</option>
            <option value="0">等级 0</option>
            <option value="1">等级 1</option>
            <option value="2">等级 2</option>
            <option value="3">等级 3</option>
            <option value="4">等级 4</option>
            <option value="5">等级 5 (已掌握)</option>
          </select>
        </div>
      </div>

      {/* 单词列表 */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : words.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {words.map((word) => (
              <WordCard
                key={word._id}
                word={word}
                mode="list"
                onDelete={handleDeleteWord}
              />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`
                        w-10 h-10 rounded-lg font-medium
                        ${page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">暂无单词</p>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { BookOpen, Volume2, Trash2 } from 'lucide-react';
import type { WordRecord, UserRating } from '../types';
import { formatRelativeTime, formatTimeUntil } from '../utils/date';

interface WordCardProps {
  word: WordRecord;
  onReview?: (wordId: string, rating: UserRating) => void;
  onDelete?: (wordId: string) => void;
  mode?: 'review' | 'list';
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onReview,
  onDelete,
  mode = 'list',
}) => {
  const [flipped, setFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRating = (rating: UserRating) => {
    if (onReview) {
      onReview(word._id, rating);
      setFlipped(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && confirm(`确定要删除单词 "${word.word}" 吗？`)) {
      setIsDeleting(true);
      try {
        await onDelete(word._id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getMasteryLevelColor = (level: number) => {
    const colors = [
      'bg-gray-100 text-gray-600',
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-yellow-100 text-yellow-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
    ];
    return colors[level] || colors[0];
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-lg p-6 
        transition-all duration-300 hover:shadow-xl
        ${isDeleting ? 'opacity-50' : ''}
        ${flipped ? 'scale-95' : ''}
      `}
    >
      {/* 删除按钮 */}
      {mode === 'list' && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="删除单词"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* 掌握程度标签 */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${getMasteryLevelColor(word.masteryLevel)}
          `}
        >
          等级 {word.masteryLevel}
        </span>
        {word.partOfSpeech && (
          <span className="text-sm text-gray-500">{word.partOfSpeech}</span>
        )}
      </div>

      {/* 单词内容 */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-3xl font-bold text-gray-900">{word.word}</h3>
          <button
            onClick={playAudio}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="发音"
          >
            <Volume2 className="w-5 h-5 text-primary-600" />
          </button>
        </div>

        {word.phonetic && (
          <p className="text-sm text-gray-500 mb-2">{word.phonetic}</p>
        )}

        <div
          className={`
            transition-all duration-300 overflow-hidden
            ${flipped ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}
          `}
        >
          {mode === 'review' && (
            <button
              onClick={() => setFlipped(true)}
              className="w-full py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
            >
              点击显示翻译
            </button>
          )}
        </div>

        <div
          className={`
            transition-all duration-300
            ${flipped || mode === 'list' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <p className="text-xl text-gray-700 mb-4">{word.translation}</p>

          {word.examples && word.examples.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>例句</span>
              </div>
              {word.examples.map((example, index) => (
                <p key={index} className="text-sm text-gray-600 pl-6 italic">
                  {example}
                </p>
              ))}
            </div>
          )}

          {word.context && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">原始上下文</p>
              <p className="text-sm text-gray-700">{word.context}</p>
            </div>
          )}
        </div>
      </div>

      {/* 评分按钮 */}
      {mode === 'review' && flipped && onReview && (
        <div className="grid grid-cols-3 gap-2 animate-slide-up">
          <button
            onClick={() => handleRating('unknown')}
            className="py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            😰 不认识
          </button>
          <button
            onClick={() => handleRating('vague')}
            className="py-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
          >
            🤔 模糊
          </button>
          <button
            onClick={() => handleRating('mastered')}
            className="py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
          >
            ✅ 掌握
          </button>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>添加于 {formatRelativeTime(word.createdAt)}</span>
        <span>
          {word.nextReviewAt && (
            <>下次复习: {formatTimeUntil(word.nextReviewAt)}</>
          )}
        </span>
      </div>
    </div>
  );
};


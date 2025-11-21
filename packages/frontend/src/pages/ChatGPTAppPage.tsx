import React, { useEffect, useState } from 'react';
import { wordAPI, translationAPI } from '../services/api';
import type { UserRating } from '../types';

/**
 * ChatGPT App 页面（前端内联版本）
 * 这个页面将被嵌入到 ChatGPT 的 iframe 中
 */
export const ChatGPTAppPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 从 URL 参数或 postMessage 接收 ChatGPT 传递的上下文
    initializeContext();
  }, []);

  const initializeContext = async () => {
    try {
      // 方式 1: 从 URL 参数获取
      const params = new URLSearchParams(window.location.search);
      const contextParam = params.get('context');
      
      if (contextParam) {
        const contextData = JSON.parse(decodeURIComponent(contextParam));
        await processContext(contextData);
      } else {
        // 方式 2: 监听 postMessage
        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('初始化上下文失败:', error);
      setLoading(false);
    }
  };

  const handleMessage = async (event: MessageEvent) => {
    // 验证消息来源
    if (event.origin !== 'https://chat.openai.com') {
      return;
    }

    const { type, data } = event.data;
    
    if (type === 'context') {
      await processContext(data);
    }
  };

  const processContext = async (contextData: any) => {
    try {
      setContext(contextData);

      // 从上下文中提取单词和翻译
      // 假设 contextData 包含: { text: "单词", aiResponse: "翻译..." }
      const text = contextData.text || contextData.word || '';
      const aiResponse = contextData.aiResponse || '';

      setWord(text);

      // 如果有 AI 回复，尝试从中提取翻译
      if (aiResponse) {
        // 简单的解析逻辑，实际可能需要更复杂的处理
        setTranslation(aiResponse);
      } else if (text) {
        // 如果没有翻译，调用我们的翻译 API
        const result = await translationAPI.translate(text);
        setTranslation(result.translation);
        setExamples(result.examples);
      }

      setLoading(false);
    } catch (error) {
      console.error('处理上下文失败:', error);
      setLoading(false);
    }
  };

  const handleRating = async (rating: UserRating) => {
    try {
      setLoading(true);
      
      await wordAPI.addWord(word, translation, rating, context?.fullContext);
      
      setSubmitted(true);

      // 通知 ChatGPT 操作完成
      window.parent.postMessage(
        {
          type: 'word_added',
          data: { word, rating }
        },
        'https://chat.openai.com'
      );

      // 3 秒后关闭或显示成功消息
      setTimeout(() => {
        window.parent.postMessage(
          { type: 'close_app' },
          'https://chat.openai.com'
        );
      }, 3000);
    } catch (error) {
      console.error('添加单词失败:', error);
      alert('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            添加成功！
          </h2>
          <p className="text-gray-600">
            "{word}" 已加入生词本
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              加入生词本
            </h1>
            <p className="text-sm text-gray-600">
              评估你对这个单词的掌握程度
            </p>
          </div>

          {/* 单词卡片 */}
          <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl">
            <div className="text-center mb-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {word}
              </h2>
              <p className="text-xl text-gray-700">
                {translation}
              </p>
            </div>

            {examples.length > 0 && (
              <div className="space-y-2 text-sm text-gray-600">
                {examples.slice(0, 2).map((example, index) => (
                  <p key={index} className="italic">
                    • {example}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 评分按钮 */}
          <div className="space-y-3">
            <button
              onClick={() => handleRating('unknown')}
              disabled={loading}
              className="w-full py-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-lg disabled:opacity-50"
            >
              😰 不认识 - 需要学习
            </button>
            <button
              onClick={() => handleRating('vague')}
              disabled={loading}
              className="w-full py-4 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors font-medium text-lg disabled:opacity-50"
            >
              🤔 有点模糊 - 需要复习
            </button>
            <button
              onClick={() => handleRating('mastered')}
              disabled={loading}
              className="w-full py-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-lg disabled:opacity-50"
            >
              ✅ 基本掌握 - 偶尔复习
            </button>
          </div>

          {/* 提示 */}
          <p className="text-xs text-gray-500 text-center mt-6">
            根据你的评分，系统会安排合适的复习计划
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTAppPage;



import React, { useEffect, useState } from 'react';
import { wordAPI, translationAPI, authAPI } from '../../frontend/src/services/api';
import type { UserRating, WordRecord } from '../../frontend/src/types';

/**
 * ChatGPT App 页面
 * 这个页面将被嵌入到 ChatGPT 的 iframe 中
 */
export const ChatGPTAppPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<'add' | 'wordbook'>('add'); // add: 加入生词本；wordbook: 查看生词本
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [wordbookLoading, setWordbookLoading] = useState(false);
  const [wordbookError, setWordbookError] = useState<string | null>(null);
  const [wordList, setWordList] = useState<WordRecord[]>([]);

  useEffect(() => {
    // 解析 URL 参数，决定当前模式（添加单词 / 查看生词本）
    const params = new URLSearchParams(window.location.search);
    const view = params.get('mode');
    if (view === 'wordbook') {
      setMode('wordbook');
    } else {
      setMode('add');
    }

    // 先检查是否已经登录（本地是否有 authToken）
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('authToken')
      : null;

    if (token) {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);

    // 只有在“添加单词”模式下才需要上下文
    if (view !== 'wordbook') {
      initializeContext();
    } else {
      // 查看生词本模式下，不依赖上下文，直接结束 loading，由后续拉取单词列表
      setLoading(false);
    }
  }, []);

  /**
   * 在“查看生词本”模式下，登录完成后拉取单词列表
   */
  useEffect(() => {
    if (!isAuthenticated || mode !== 'wordbook') return;

    const fetchWords = async () => {
      try {
        setWordbookError(null);
        setWordbookLoading(true);
        const res = await wordAPI.getWords(1, 50);
        setWordList(res.words);
      } catch (error: any) {
        console.error('获取生词本失败:', error);
        const msg =
          error?.response?.data?.error ||
          error?.message ||
          '获取生词本失败，请稍后重试';
        setWordbookError(msg);
      } finally {
        setWordbookLoading(false);
      }
    };

    fetchWords();
  }, [isAuthenticated, mode]);

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

  /**
   * 处理登录
   * 第一次在 GPT 中使用时，需要先登录拿到 JWT，否则不允许写入生词本
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setLoginError('请输入邮箱和密码');
      return;
    }

    try {
      setLoginError(null);
      setLoading(true);

      const res = await authAPI.login(loginEmail, loginPassword);
      // 约定后端返回 { token, user: { ... } }
      if (res.token) {
        window.localStorage.setItem('authToken', res.token);
        setIsAuthenticated(true);
      } else {
        setLoginError('登录响应异常：未返回 token');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        '登录失败，请检查邮箱和密码';
      setLoginError(msg);
    } finally {
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
      // 未登录时不允许写入生词本
      const token = window.localStorage.getItem('authToken');
      if (!token) {
        alert('请先登录后再加入生词本');
        setIsAuthenticated(false);
        return;
      }

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

  /**
   * 登录界面
   * 在 GPT 中第一次使用本 App 时，需要先登录获取 JWT
   */
  if (!authChecking && !isAuthenticated && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'wordbook' ? '登录以查看生词本' : '登录以使用生词本'}
              </h1>
              <p className="text-sm text-gray-600">
                第一次在 ChatGPT 中使用本应用，需要先登录你的账号
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入密码"
                  required
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-500 mt-2">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录并继续'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              提示：你可以复用 Web 端的账号（同一邮箱和密码），这样在网页生词本中也能看到在 ChatGPT 中添加的单词。
            </p>
          </div>
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

  // 查看生词本模式
  if (mode === 'wordbook') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  我的生词本
                </h1>
                <p className="text-sm text-gray-600">
                  这里展示的是你当前账号下已添加的单词（最多 50 个）
                </p>
              </div>
            </div>

            {wordbookLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : wordbookError ? (
              <div className="py-6 text-center text-red-500 text-sm">
                {wordbookError}
              </div>
            ) : wordList.length === 0 ? (
              <div className="py-10 text-center text-gray-600">
                还没有任何单词，先在对话中使用“加入生词本”来添加一些吧。
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {wordList.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {item.word}
                        </span>
                        {item.partOfSpeech && (
                          <span className="text-xs text-gray-500">
                            {item.partOfSpeech}
                          </span>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                        等级 {item.masteryLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      {item.translation}
                    </p>
                    {item.examples && item.examples.length > 0 && (
                      <p className="text-xs text-gray-500">
                        例句：{item.examples[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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


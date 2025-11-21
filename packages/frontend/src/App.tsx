import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ReviewPage } from './pages/ReviewPage';
import { WordsPage } from './pages/WordsPage';
import { Home, BookOpen, Calendar } from 'lucide-react';
import ChatGPTAppPage from '../../../chatgpt-app/src/ChatGPTAppPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                AI English
              </span>
            </div>

            <div className="flex gap-1">
              <Link
                to="/"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${isActive('/')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">首页</span>
              </Link>

              <Link
                to="/review"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${isActive('/review')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">复习</span>
              </Link>

              <Link
                to="/words"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${isActive('/words')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">生词本</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-500">
        <p>AI English Learning App - 基于 OpenAI Apps SDK</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ChatGPT iframe 专用页面：不需要主站导航布局，避免嵌入时出现多余导航 */}
        <Route path="/chatgpt-app" element={<ChatGPTAppPage />} />

        {/* 其他页面使用带导航的布局 */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/words" element={<WordsPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


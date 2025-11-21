# 开发指南

## 🛠️ 开发环境设置

### 1. 安装必要工具

```bash
# Node.js (使用 nvm 管理版本)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# MongoDB
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# 启动 MongoDB
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod  # Ubuntu
```

### 2. 克隆并安装

```bash
git clone https://github.com/yourusername/aienglish.git
cd aienglish

# 安装所有依赖
npm install
cd packages/backend && npm install
cd ../frontend && npm install
```

### 3. 配置环境变量

创建 `packages/backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aienglish
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

创建 `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## 🏃 运行项目

### 开发模式

```bash
# 方式 1: 同时启动前后端 (推荐)
npm run dev

# 方式 2: 分别启动
# 终端 1 - 后端
cd packages/backend
npm run dev

# 终端 2 - 前端
cd packages/frontend
npm run dev
```

### 构建生产版本

```bash
# 后端
cd packages/backend
npm run build
npm start

# 前端
cd packages/frontend
npm run build
npm run preview
```

## 📁 项目结构详解

### 后端结构

```
packages/backend/
├── src/
│   ├── index.ts              # 服务器入口
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── models/
│   │   ├── User.ts           # 用户模型
│   │   └── WordRecord.ts     # 单词记录模型
│   ├── routes/
│   │   └── word.routes.ts    # 单词相关路由
│   ├── services/
│   │   ├── openai.service.ts # OpenAI 翻译服务
│   │   └── word.service.ts   # 单词业务逻辑
│   ├── utils/
│   │   ├── database.ts       # 数据库连接
│   │   ├── ebbinghaus.ts     # 艾宾浩斯算法
│   │   └── logger.ts         # 日志工具
│   └── middleware/
│       └── error.middleware.ts # 错误处理中间件
├── package.json
└── tsconfig.json
```

### 前端结构

```
packages/frontend/
├── src/
│   ├── main.tsx              # 应用入口
│   ├── App.tsx               # 根组件
│   ├── index.css             # 全局样式
│   ├── types/
│   │   └── index.ts          # TypeScript 类型
│   ├── components/
│   │   ├── WordCard.tsx      # 单词卡片组件
│   │   └── StatisticsCard.tsx # 统计卡片组件
│   ├── pages/
│   │   ├── HomePage.tsx      # 首页
│   │   ├── ReviewPage.tsx    # 复习页面
│   │   └── WordsPage.tsx     # 生词本页面
│   ├── services/
│   │   └── api.ts            # API 调用封装
│   └── utils/
│       └── date.ts           # 日期工具函数
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🔧 核心功能实现

### 1. 艾宾浩斯算法

位置: `packages/backend/src/utils/ebbinghaus.ts`

```typescript
// 间隔天数数组
const INTERVALS = [1, 2, 4, 7, 15, 30, 60];

// 根据当前等级和用户评分计算下次复习间隔
calculateNextInterval(currentLevel, userRating) {
  // 根据评分调整等级
  // 返回对应的间隔天数
}
```

### 2. OpenAI 翻译服务

位置: `packages/backend/src/services/openai.service.ts`

```typescript
async translate(text: string, context?: string) {
  // 构建提示词
  // 调用 GPT-4 API
  // 解析返回结果
  // 返回翻译、音标、例句等
}
```

### 3. 单词管理服务

位置: `packages/backend/src/services/word.service.ts`

```typescript
// 添加单词
async addWord(userId, word, translation, rating)

// 复习单词
async reviewWord(userId, wordId, rating)

// 获取今日复习
async getTodayReviewWords(userId)

// 获取统计数据
async getStatistics(userId)
```

## 🎨 UI 组件开发

### 创建新组件

```tsx
// packages/frontend/src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  // 定义 props 类型
}

export const NewComponent: React.FC<NewComponentProps> = (props) => {
  return (
    <div className="...">
      {/* 组件内容 */}
    </div>
  );
};
```

### TailwindCSS 使用

```tsx
// 基础样式类
<div className="bg-white rounded-xl shadow-lg p-6">

// 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// 悬停效果
<button className="hover:bg-gray-100 transition-colors">

// 动画
<div className="animate-fade-in">
```

## 🧪 测试

### 后端 API 测试

使用 curl 或 Postman 测试：

```bash
# 健康检查
curl http://localhost:3000/health

# 翻译单词
curl -X POST http://localhost:3000/api/words/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "procrastinate"}'

# 获取今日复习
curl http://localhost:3000/api/words/today \
  -H "x-user-id: demo-user"
```

### 前端测试

```bash
# 启动开发服务器
cd packages/frontend
npm run dev

# 在浏览器中访问
open http://localhost:5173
```

## 🔍 调试技巧

### 后端调试

1. **使用 Log 工具**
```typescript
import { Log } from '../utils/logger';

Log.info('开始处理请求', { userId, wordId });
Log.error('处理失败', error);
```

2. **VS Code 调试配置**

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/packages/backend",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 前端调试

1. **使用 React DevTools**
   - 安装浏览器扩展
   - 检查组件状态和 props

2. **Console 调试**
```typescript
console.log('当前状态:', state);
console.table(words);
```

## 📦 添加新功能

### 示例：添加"导出学习数据"功能

#### 1. 后端 - 添加 API

```typescript
// packages/backend/src/routes/word.routes.ts
router.get('/export', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const words = await wordService.getUserWords(userId);
  res.json(words);
});
```

#### 2. 前端 - 调用 API

```typescript
// packages/frontend/src/services/api.ts
export const wordAPI = {
  exportWords: async (): Promise<WordRecord[]> => {
    const response = await api.get('/words/export');
    return response.data;
  }
};
```

#### 3. 前端 - 添加 UI

```tsx
// packages/frontend/src/pages/WordsPage.tsx
const handleExport = async () => {
  const words = await wordAPI.exportWords();
  const json = JSON.stringify(words, null, 2);
  downloadFile(json, 'words.json');
};

<button onClick={handleExport}>导出数据</button>
```

## 🚨 常见问题

### 问题 1: MongoDB 连接失败

```bash
# 检查 MongoDB 是否运行
brew services list  # macOS
sudo systemctl status mongod  # Linux

# 重启 MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

### 问题 2: 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>
```

### 问题 3: OpenAI API 错误

- 检查 API Key 是否正确
- 确认账户有足够的余额
- 检查是否有 GPT-4 访问权限

## 📚 推荐资源

### 学习资源
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [MongoDB 大学](https://university.mongodb.com/)
- [OpenAI API 文档](https://platform.openai.com/docs)

### 工具推荐
- [Postman](https://www.postman.com/) - API 测试
- [MongoDB Compass](https://www.mongodb.com/products/compass) - 数据库可视化
- [VS Code](https://code.visualstudio.com/) - 代码编辑器

## 💡 最佳实践

1. **代码风格**
   - 使用 TypeScript 严格模式
   - 遵循 ESLint 规则
   - 添加必要的注释

2. **Git 提交**
   - 使用有意义的提交信息
   - 每次提交只包含一个功能
   - 提交前测试代码

3. **性能优化**
   - 使用数据库索引
   - 实现 API 缓存
   - 优化前端打包体积

---

Happy Coding! 🚀

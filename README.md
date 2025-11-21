# AI English Learning App

基于 OpenAI Apps SDK 的智能英语学习应用，帮助用户在 ChatGPT 聊天过程中收集生词，并通过艾宾浩斯记忆曲线进行高效复习。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## 🌟 核心功能

- **🔍 智能翻译**：集成 OpenAI GPT-4，提供准确的翻译、音标、词性和例句
- **📝 一键收集**：在 ChatGPT 聊天中一键将生词加入学习本
- **🎴 卡片式学习**：精美的卡片界面，支持翻转效果和交互式学习
- **🧠 科学复习**：基于艾宾浩斯遗忘曲线的智能复习算法
- **📊 进度跟踪**：实时统计学习数据，可视化展示掌握情况
- **🎯 个性化计划**：根据掌握程度自动调整复习间隔

## 🎬 演示

```
用户在 ChatGPT 中：
"翻译 procrastinate"
              ↓
AI 回复翻译内容
              ↓
[📝 加入生词本] ← 点击按钮
              ↓
弹出评估界面
[😰 不认识] [🤔 模糊] [✅ 掌握]
              ↓
自动加入生词本并安排复习计划
```

## 🏗️ 项目架构

```
aienglish/
├── packages/
│   ├── backend/              # Node.js + Express 后端服务
│   │   ├── src/
│   │   │   ├── models/       # MongoDB 数据模型
│   │   │   ├── routes/       # API 路由
│   │   │   ├── services/     # 业务逻辑（翻译、单词管理）
│   │   │   ├── utils/        # 工具类（艾宾浩斯算法、日志）
│   │   │   └── index.ts      # 服务器入口
│   │   └── package.json
│   ├── frontend/             # React + TypeScript 前端应用
│   │   ├── src/
│   │   │   ├── components/   # UI 组件（卡片、统计等）
│   │   │   ├── pages/        # 页面（首页、复习、生词本）
│   │   │   ├── services/     # API 调用
│   │   │   ├── types/        # TypeScript 类型定义
│   │   │   └── App.tsx       # 应用入口
│   │   └── package.json
│   └── chatgpt-app/          # ChatGPT App 集成
│       ├── manifest.json     # App 配置文件
│       ├── src/
│       │   └── ChatGPTAppPage.tsx  # ChatGPT 嵌入页面
│       └── README.md
├── docs/
│   ├── DEPLOYMENT.md         # 部署指南
│   └── USAGE.md              # 使用说明
└── README.md
```

## 💻 技术栈

### 后端
- **Node.js 18+** + **Express** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** + **Mongoose** - 数据存储
- **OpenAI API** - GPT-4 翻译服务
- **node-cron** - 定时任务

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **Lucide React** - 图标库

### ChatGPT 集成
- **OpenAI Apps SDK** - ChatGPT 应用集成
- **Model Context Protocol (MCP)** - 上下文协议

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0 (推荐使用 MongoDB Atlas)
- **OpenAI API Key** (需要 GPT-4 访问权限)

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/aienglish.git
cd aienglish
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd packages/backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入以下配置：
# OPENAI_API_KEY=sk-your-openai-api-key
# MONGODB_URI=mongodb://localhost:27017/aienglish
# JWT_SECRET=your-random-secret-key
# PORT=3000
# FRONTEND_URL=http://localhost:5173
```

### 4. 启动 MongoDB

```bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 或使用本地安装的 MongoDB
mongod --dbpath /path/to/data
```

### 5. 启动开发服务器

```bash
# 在项目根目录，同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend    # 后端: http://localhost:3000
npm run dev:frontend   # 前端: http://localhost:5173
```

### 6. 访问应用

打开浏览器访问：http://localhost:5173

## 📚 详细文档

- [⚡ Vercel 快速部署](VERCEL_QUICKSTART.md) - 5 分钟部署到 Vercel
- [📖 使用指南](docs/USAGE.md) - 如何使用应用
- [🚀 完整部署指南](docs/DEPLOYMENT.md) - 多平台部署方案
- [📘 Vercel 部署详解](docs/VERCEL_DEPLOYMENT.md) - Vercel 完整部署文档
- [🔌 ChatGPT 集成](packages/chatgpt-app/README.md) - 如何集成到 ChatGPT

## 🎯 使用流程

### 1. 在 ChatGPT 中添加生词

```
你: "翻译 procrastinate"
ChatGPT: "拖延、耽搁 v. /prəˈkræstɪneɪt/"
         [📝 加入生词本] ← 点击
```

### 2. 评估掌握程度

```
┌─────────────────────────┐
│   procrastinate        │
│   拖延、耽搁            │
│                        │
│ 你掌握这个单词吗？      │
│ [😰 不认识]            │
│ [🤔 有点模糊]          │
│ [✅ 基本掌握]          │
└─────────────────────────┘
```

### 3. 按计划复习

- 打开应用查看"今日待复习"
- 逐个复习单词
- 根据记忆情况评分
- 系统自动调整下次复习时间

## 🧠 艾宾浩斯记忆曲线

应用采用科学的间隔重复算法：

| 复习次数 | 间隔时间 | 累计天数 |
|---------|---------|---------|
| 第 1 次  | 1 天后   | 1 天    |
| 第 2 次  | 2 天后   | 3 天    |
| 第 3 次  | 4 天后   | 7 天    |
| 第 4 次  | 7 天后   | 14 天   |
| 第 5 次  | 15 天后  | 29 天   |
| 第 6 次  | 30 天后  | 59 天   |
| 第 7 次  | 60 天后  | 119 天  |

## 📊 API 文档

### 后端 API

- `POST /api/words/translate` - 翻译单词
- `POST /api/words` - 添加单词到生词本
- `GET /api/words` - 获取用户所有单词
- `GET /api/words/today` - 获取今日待复习单词
- `POST /api/words/:id/review` - 复习单词
- `GET /api/words/statistics` - 获取学习统计
- `DELETE /api/words/:id` - 删除单词

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 🐛 问题反馈

如果遇到任何问题，请在 [Issues](https://github.com/yourusername/aienglish/issues) 中提交。

## 📝 待办事项

- [ ] 支持语音朗读单词
- [ ] 添加单词测试功能
- [ ] 支持导出学习数据
- [ ] 开发移动端应用
- [ ] 添加社区学习功能
- [ ] 支持多语言（日语、韩语等）
- [ ] AI 生成助记方法
- [ ] 智能推荐相似单词

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 👨‍💻 作者

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your-email@example.com

## 🙏 致谢

- [OpenAI](https://openai.com/) - 提供强大的 AI 能力
- [MongoDB](https://www.mongodb.com/) - 优秀的文档数据库
- [React](https://reactjs.org/) - 强大的 UI 框架
- [TailwindCSS](https://tailwindcss.com/) - 现代化的 CSS 框架

---

⭐ 如果这个项目对你有帮助，请给一个星标！

📚 Happy Learning! ✨


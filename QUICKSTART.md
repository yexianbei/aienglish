# 🚀 快速开始指南

## 5 分钟启动项目

### 步骤 1: 安装依赖（2 分钟）

```bash
# 克隆项目
git clone https://github.com/yourusername/aienglish.git
cd aienglish

# 安装所有依赖
npm install
cd packages/backend && npm install
cd ../frontend && npm install
cd ../..
```

### 步骤 2: 配置环境（1 分钟）

```bash
# 创建后端环境变量文件
cat > packages/backend/.env << EOF
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aienglish
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:5173
EOF
```

**重要**: 将 `your-openai-api-key-here` 替换为你的实际 OpenAI API Key。

### 步骤 3: 启动 MongoDB（1 分钟）

**选项 A: 使用 Docker (推荐)**
```bash
docker run -d -p 27017:27017 --name aienglish-mongodb mongo:latest
```

**选项 B: 使用本地 MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**选项 C: 使用 MongoDB Atlas（云数据库）**
1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 获取连接字符串
4. 更新 `.env` 文件中的 `MONGODB_URI`

### 步骤 4: 启动应用（1 分钟）

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 🔙 后端服务器: http://localhost:3000
- 🎨 前端应用: http://localhost:5173

### 步骤 5: 开始使用

打开浏览器访问: **http://localhost:5173**

## ✅ 验证安装

### 1. 检查后端 API

```bash
curl http://localhost:3000/health
```

期望输出:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. 测试翻译功能

```bash
curl -X POST http://localhost:3000/api/words/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "hello"}'
```

### 3. 访问前端

在浏览器中打开 http://localhost:5173，你应该看到：
- ✅ 首页显示统计信息
- ✅ 导航栏有"首页"、"复习"、"生词本"
- ✅ 界面美观，响应迅速

## 🎯 第一次使用

### 1. 添加第一个单词

由于目前 OpenAI Apps SDK 还在预览阶段，你可以：

**方式 A: 使用 API 直接添加**
```bash
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d '{
    "word": "procrastinate",
    "translation": "拖延、耽搁",
    "userRating": "unknown",
    "context": "Don't procrastinate on your homework."
  }'
```

**方式 B: 在前端界面操作**
1. 打开应用
2. 使用浏览器开发者工具的 Console
3. 运行：
```javascript
fetch('/api/words', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'demo-user'
  },
  body: JSON.stringify({
    word: 'procrastinate',
    translation: '拖延、耽搁',
    userRating: 'unknown'
  })
}).then(r => r.json()).then(console.log);
```

### 2. 查看生词本

- 点击导航栏的"生词本"
- 你应该能看到刚添加的单词卡片
- 卡片显示单词、翻译、掌握等级等信息

### 3. 开始复习

- 点击导航栏的"复习"
- 如果单词到了复习时间，会显示在这里
- 点击"显示翻译"，然后评估你的掌握程度

## 📖 功能演示脚本

复制并在浏览器 Console 中运行以下代码，快速体验功能：

```javascript
// 添加多个示例单词
const words = [
  { word: 'procrastinate', translation: '拖延', rating: 'unknown' },
  { word: 'ambiguous', translation: '模糊的', rating: 'vague' },
  { word: 'facilitate', translation: '促进', rating: 'mastered' }
];

async function addDemoWords() {
  for (const w of words) {
    await fetch('/api/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'demo-user'
      },
      body: JSON.stringify({
        word: w.word,
        translation: w.translation,
        userRating: w.rating
      })
    });
  }
  console.log('✅ 示例单词已添加！刷新页面查看。');
}

addDemoWords();
```

## 🐛 常见问题速查

### 问题 1: MongoDB 连接失败

**错误信息**: `MongoServerError: connect ECONNREFUSED`

**解决方案**:
```bash
# 检查 MongoDB 是否运行
docker ps  # 如果使用 Docker
brew services list  # 如果使用 Homebrew (macOS)

# 启动 MongoDB
docker start aienglish-mongodb  # Docker
brew services start mongodb-community  # Homebrew
```

### 问题 2: 端口已被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 终止进程
kill -9 <PID>

# 或者修改端口
# 编辑 packages/backend/.env，将 PORT 改为其他值
```

### 问题 3: OpenAI API 错误

**错误信息**: `Error: Invalid API key`

**解决方案**:
1. 访问 https://platform.openai.com/api-keys
2. 创建新的 API Key
3. 更新 `packages/backend/.env` 中的 `OPENAI_API_KEY`
4. 重启后端服务

### 问题 4: 前端页面空白

**解决方案**:
```bash
# 清除缓存并重新安装
cd packages/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 下一步

现在你已经成功运行了项目！接下来可以：

1. 📖 阅读 [使用指南](docs/USAGE.md) 了解详细功能
2. 🛠️ 阅读 [开发指南](docs/DEVELOPMENT.md) 学习如何开发
3. 🚀 阅读 [部署指南](docs/DEPLOYMENT.md) 准备上线
4. 🔌 阅读 [ChatGPT 集成文档](packages/chatgpt-app/README.md)

## 💬 需要帮助？

- 📧 发送邮件: support@your-domain.com
- 💬 GitHub Issues: https://github.com/yourusername/aienglish/issues
- 📚 查看完整文档: [README.md](README.md)

---

🎉 祝你使用愉快！如果觉得有用，请给项目一个 ⭐️！


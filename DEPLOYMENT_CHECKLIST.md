# ✅ Vercel 部署检查清单

在部署之前，请确保完成以下步骤：

## 📋 部署前准备

### 1. 代码准备
- [ ] 所有代码已提交到 Git
- [ ] 代码在本地可以正常运行
- [ ] 已测试主要功能
- [ ] 没有明显的 bug

### 2. 账号准备
- [ ] 注册 GitHub 账号
- [ ] 注册 Vercel 账号（使用 GitHub 登录）
- [ ] 注册 MongoDB Atlas 账号
- [ ] 获取 OpenAI API Key

### 3. 数据库准备
- [ ] MongoDB Atlas 集群已创建
- [ ] 数据库用户已创建
- [ ] Network Access 设置为 `0.0.0.0/0`
- [ ] 获取连接字符串
- [ ] 连接字符串格式：`mongodb+srv://username:password@cluster.mongodb.net/aienglish`

### 4. API 准备
- [ ] OpenAI API Key 已获取
- [ ] API Key 有 GPT-4 访问权限（可选，GPT-3.5 也可以）
- [ ] 账户有足够余额

---

## 🚀 后端部署

### 步骤 1: 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/你的用户名/aienglish.git
git push -u origin main
```

- [ ] 代码已推送到 GitHub
- [ ] 仓库可访问

### 步骤 2: Vercel 后端部署
- [ ] 在 Vercel 导入项目
- [ ] 设置 Root Directory: `packages/backend`
- [ ] 设置 Build Command: `npm install && npm run build`
- [ ] 设置 Output Directory: `dist`

### 步骤 3: 配置后端环境变量
在 Vercel Dashboard 添加以下环境变量：

- [ ] `MONGODB_URI` = `mongodb+srv://...`
- [ ] `OPENAI_API_KEY` = `sk-...`
- [ ] `JWT_SECRET` = `随机字符串`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://你的前端域名.vercel.app`

### 步骤 4: 部署并测试后端
- [ ] 点击 Deploy 按钮
- [ ] 等待部署完成（约 1-2 分钟）
- [ ] 记录后端 URL：`https://aienglish-backend-xxx.vercel.app`
- [ ] 测试健康检查：`https://你的后端URL/health`
- [ ] 测试 API：`https://你的后端URL/api`

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎨 前端部署

### 步骤 1: 更新前端配置
- [ ] 编辑 `packages/frontend/vercel.json`
- [ ] 将 `destination` 改为实际的后端 URL

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://你的实际后端URL.vercel.app/api/:path*"
    }
  ]
}
```

- [ ] 提交修改：
```bash
git add packages/frontend/vercel.json
git commit -m "Update backend URL"
git push
```

### 步骤 2: Vercel 前端部署
- [ ] 在 Vercel 再次导入项目（或新建项目）
- [ ] 设置 Root Directory: `packages/frontend`
- [ ] 设置 Framework: `Vite`
- [ ] 自动识别构建命令

### 步骤 3: 配置前端环境变量（可选）
- [ ] `VITE_API_URL` = `https://你的后端URL.vercel.app`

### 步骤 4: 部署并测试前端
- [ ] 点击 Deploy 按钮
- [ ] 等待部署完成
- [ ] 记录前端 URL：`https://aienglish-xxx.vercel.app`

---

## 🧪 功能测试

### 基础测试
- [ ] 访问前端 URL，页面正常加载
- [ ] 首页显示统计信息（即使是 0）
- [ ] 导航栏正常工作
- [ ] 样式显示正常

### API 测试
打开浏览器开发者工具 → Network 标签

- [ ] 刷新页面，API 请求成功（状态码 200）
- [ ] 没有 CORS 错误
- [ ] 没有 404 错误

### 功能测试

#### 方式 1: 使用浏览器 Console
```javascript
// 在前端页面打开 Console，运行：
fetch('/api/words', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'test-user'
  },
  body: JSON.stringify({
    word: 'test',
    translation: '测试',
    userRating: 'unknown'
  })
}).then(r => r.json()).then(console.log);
```

- [ ] 添加单词成功
- [ ] 刷新页面，能看到添加的单词

#### 方式 2: 使用 API 工具
```bash
curl -X POST https://你的后端URL/api/words \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "word": "procrastinate",
    "translation": "拖延",
    "userRating": "unknown"
  }'
```

- [ ] 返回单词对象
- [ ] 包含 `_id`、`word`、`translation` 等字段

### 页面功能测试
- [ ] 复习页面可以访问
- [ ] 生词本页面可以访问
- [ ] 统计数据正确显示
- [ ] 分页功能正常（如有数据）

---

## 🔒 安全检查

- [ ] 所有密钥都在环境变量中
- [ ] 没有在代码中硬编码密钥
- [ ] `.env` 文件已加入 `.gitignore`
- [ ] CORS 正确配置
- [ ] MongoDB 用户权限正确（只有数据库访问权限）

---

## 📊 性能检查

- [ ] 前端首屏加载 < 3 秒
- [ ] API 响应时间 < 1 秒
- [ ] 没有明显的性能问题

---

## 🎯 后续优化（可选）

### 自定义域名
- [ ] 购买域名
- [ ] 在 Vercel 添加域名
- [ ] 配置 DNS
- [ ] 等待 SSL 证书生效

### 监控设置
- [ ] 启用 Vercel Analytics
- [ ] 设置错误告警
- [ ] 定期查看日志

### 性能优化
- [ ] 启用缓存
- [ ] 优化图片
- [ ] 代码分割

---

## 🐛 问题排查

如果遇到问题，按顺序检查：

### 1. 后端问题
```bash
# 检查健康状态
curl https://你的后端URL/health

# 查看 Vercel 日志
vercel logs
```

常见问题：
- MongoDB 连接失败 → 检查连接字符串和 IP 白名单
- OpenAI API 错误 → 检查 API Key 和余额
- 函数超时 → 优化代码或升级 Vercel Pro

### 2. 前端问题
打开浏览器控制台查看：
- Console 错误信息
- Network 请求状态
- 具体错误详情

常见问题：
- CORS 错误 → 检查后端 `FRONTEND_URL` 配置
- 404 错误 → 检查 `vercel.json` 中的 URL
- 白屏 → 检查构建日志

### 3. 获取帮助
- [ ] 查看 [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) 常见问题
- [ ] 在 Vercel Dashboard 查看详细日志
- [ ] 提交 GitHub Issue

---

## ✅ 部署完成

恭喜！如果所有项目都打勾了，你的应用已经成功部署！

**你的应用地址：**
- 🎨 前端：`https://_____.vercel.app`
- 🔧 后端：`https://_____.vercel.app`

**接下来可以：**
1. 📱 分享给朋友试用
2. 📊 监控使用情况
3. 🔧 持续优化功能
4. 📝 准备 ChatGPT App 提交

---

**部署日期**: _____________  
**部署人**: _____________  
**备注**: _____________


# Vercel 部署指南

## 🚀 快速部署

### 方案选择

我们提供两种部署方案：

1. **方案 A：分离部署（推荐）** - 前端和后端分别部署
2. **方案 B：全栈部署** - 前后端在一个项目中部署

推荐使用**方案 A**，更稳定可靠。

---

## 📦 方案 A：分离部署（推荐）

### 第一步：部署后端 API

#### 1. 准备后端项目

```bash
cd packages/backend
```

#### 2. 登录 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login
```

#### 3. 部署后端

```bash
# 在 packages/backend 目录下
vercel

# 按提示操作：
# - Set up and deploy? Y
# - Which scope? 选择你的账号
# - Link to existing project? N
# - Project name? aienglish-backend
# - Directory? ./
# - Override settings? N
```

#### 4. 配置环境变量

在 Vercel Dashboard 中设置：

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aienglish
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-random-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

或使用 CLI：

```bash
vercel env add MONGODB_URI
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add FRONTEND_URL
```

#### 5. 重新部署

```bash
vercel --prod
```

记住你的后端 URL，类似：`https://aienglish-backend.vercel.app`

---

### 第二步：部署前端

#### 1. 更新 API 地址

编辑 `packages/frontend/vercel.json`，将后端 URL 改为你的实际地址：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://aienglish-backend.vercel.app/api/:path*"
    }
  ]
}
```

#### 2. 部署前端

```bash
cd packages/frontend
vercel

# 按提示操作：
# - Project name? aienglish
# - Directory? ./
```

#### 3. 配置环境变量（可选）

```bash
vercel env add VITE_API_URL
# 输入: https://aienglish-backend.vercel.app
```

#### 4. 生产部署

```bash
vercel --prod
```

---

## 🎯 方案 B：Railway 后端 + Vercel 前端（最稳定）

如果你发现 Vercel 的 Serverless Functions 有限制（比如超时），可以：

### 后端部署到 Railway

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 在 packages/backend 目录
cd packages/backend
railway init

# 4. 部署
railway up

# 5. 添加环境变量
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set OPENAI_API_KEY="your-openai-key"

# 6. 获取 Railway URL
railway status
```

### 前端部署到 Vercel

```bash
cd packages/frontend

# 更新 vercel.json 中的后端 URL 为 Railway 地址
# 然后部署
vercel --prod
```

---

## 📋 部署检查清单

### 后端检查

- [ ] MongoDB Atlas 已创建并配置
- [ ] 获取 MongoDB 连接字符串
- [ ] 获取 OpenAI API Key
- [ ] 在 Vercel 中设置所有环境变量
- [ ] 后端部署成功
- [ ] 测试健康检查：`https://your-backend.vercel.app/health`
- [ ] 测试 API：`https://your-backend.vercel.app/api`

### 前端检查

- [ ] 更新 vercel.json 中的后端 URL
- [ ] 前端部署成功
- [ ] 访问前端 URL 正常
- [ ] API 请求正常（检查浏览器 Network）
- [ ] 所有页面功能正常

---

## 🔧 配置自定义域名

### 1. 在 Vercel Dashboard

- 进入项目设置
- 点击 "Domains"
- 添加你的域名
- 按提示配置 DNS

### 2. DNS 配置

在你的域名服务商添加记录：

```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

---

## 🐛 常见问题

### 问题 1: API 请求 CORS 错误

**解决方案**：确保后端的 `FRONTEND_URL` 环境变量设置正确。

```bash
# 在 Vercel Dashboard 或使用 CLI
vercel env add FRONTEND_URL
# 输入: https://your-frontend.vercel.app
```

然后重新部署：

```bash
vercel --prod
```

### 问题 2: 函数超时

**错误信息**：`Function execution timed out after 10s`

**原因**：Vercel 免费版 Serverless Functions 有 10 秒限制。

**解决方案**：
1. 优化代码，减少执行时间
2. 升级 Vercel Pro（60 秒限制）
3. 将后端迁移到 Railway（无限制）

### 问题 3: 环境变量未生效

**解决方案**：
1. 检查环境变量是否正确设置
2. 确保变量名称正确
3. 重新部署项目

```bash
vercel --prod --force
```

### 问题 4: MongoDB 连接失败

**检查**：
1. MongoDB Atlas IP 白名单设置为 `0.0.0.0/0`（允许所有）
2. 连接字符串格式正确
3. 用户名和密码正确

### 问题 5: Build 失败

**常见原因**：
- TypeScript 类型错误
- 缺少依赖包
- Node 版本不匹配

**解决方案**：
```bash
# 本地先测试 build
npm run build

# 确保 package.json 中指定了 Node 版本
"engines": {
  "node": "18.x"
}
```

---

## 📊 监控和日志

### 查看日志

```bash
# 实时日志
vercel logs

# 或在 Vercel Dashboard
# 项目 -> Deployments -> 点击部署 -> Logs
```

### 性能监控

Vercel 自动提供：
- 函数执行时间
- 带宽使用
- 错误率

在 Dashboard 的 Analytics 中查看。

---

## 🔄 持续部署

### 连接 Git（推荐）

1. 在 Vercel Dashboard 导入项目
2. 连接 GitHub 仓库
3. 设置构建配置：
   - **后端项目**：
     - Root Directory: `packages/backend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - **前端项目**：
     - Root Directory: `packages/frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. 每次 `git push` 自动部署

### 预览部署

每个 Pull Request 自动创建预览环境，方便测试。

---

## 💰 费用说明

### Vercel 免费额度

- ✅ 100GB 带宽/月
- ✅ Serverless Functions 执行时间：100 GB-Hours/月
- ✅ 无限请求（有执行时间限制）
- ✅ 自动 HTTPS
- ✅ 全球 CDN

**对于个人项目和小型应用完全够用！**

### 何时需要升级

- 超过 100GB 带宽
- 需要更长的函数执行时间（60秒）
- 需要密码保护
- 需要更多团队成员

---

## 🎯 下一步

部署完成后：

1. ✅ 测试所有功能
2. ✅ 配置自定义域名（可选）
3. ✅ 设置监控和告警
4. ✅ 准备 ChatGPT App 提交

---

## 📞 需要帮助？

- 📚 Vercel 文档: https://vercel.com/docs
- 💬 Vercel 社区: https://github.com/vercel/vercel/discussions
- 📧 项目支持: [提 Issue](https://github.com/yourusername/aienglish/issues)

---

祝部署顺利！🚀


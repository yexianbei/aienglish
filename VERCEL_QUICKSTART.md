# 🚀 Vercel 快速部署（5 分钟）

## 最简单的方法：通过 Dashboard 部署

### 步骤 1: 推送代码到 GitHub（1 分钟）

```bash
# 如果还没有 git 仓库
git init
git add .
git commit -m "Initial commit"

# 在 GitHub 创建仓库，然后
git remote add origin https://github.com/你的用户名/aienglish.git
git push -u origin main
```

### 步骤 2: 准备 MongoDB（1 分钟）

1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 获取连接字符串：`mongodb+srv://username:password@cluster.mongodb.net/aienglish`
4. 在 Network Access 中添加 `0.0.0.0/0`（允许所有 IP）

### 步骤 3: 部署后端到 Vercel（2 分钟）

1. **访问** https://vercel.com/
2. **登录** 使用 GitHub 账号
3. **点击** "Add New" → "Project"
4. **导入** 你的 GitHub 仓库
5. **配置项目**：
   - Project Name: `aienglish-backend`
   - Framework Preset: `Other`
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **添加环境变量**（点击 Environment Variables）：
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/aienglish
   OPENAI_API_KEY = sk-your-openai-api-key
   JWT_SECRET = your-random-secret-key-123456
   NODE_ENV = production
   FRONTEND_URL = https://aienglish.vercel.app
   ```

7. **点击** "Deploy"

8. **等待部署完成**，记住你的后端 URL：
   `https://aienglish-backend.vercel.app`

### 步骤 4: 部署前端到 Vercel（1 分钟）

1. **再次点击** "Add New" → "Project"
2. **导入** 同一个 GitHub 仓库
3. **配置项目**：
   - Project Name: `aienglish`
   - Framework Preset: `Vite`
   - Root Directory: `packages/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **添加环境变量**：
   ```
   VITE_API_URL = https://aienglish-backend.vercel.app
   ```

5. **更新** `packages/frontend/vercel.json`：
   
   将后端 URL 改为你实际的地址：
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

6. **点击** "Deploy"

### 步骤 5: 测试（30 秒）

1. 访问你的前端 URL：`https://aienglish.vercel.app`
2. 检查页面是否正常加载
3. 打开浏览器开发者工具 → Network
4. 刷新页面，检查 API 请求是否成功

---

## ✅ 部署成功！

你的应用现在已经上线了：

- 🎨 前端：`https://aienglish.vercel.app`
- 🔧 后端：`https://aienglish-backend.vercel.app`
- 📊 健康检查：`https://aienglish-backend.vercel.app/health`

---

## 🔄 自动部署

现在每次你 `git push` 到 GitHub，Vercel 会自动部署最新版本！

```bash
# 修改代码后
git add .
git commit -m "Update features"
git push

# Vercel 自动部署 ✨
```

---

## 🐛 如果遇到问题

### 问题 1: 后端部署失败

**检查**：
- 确保 `packages/backend/package.json` 中有 `engines` 字段
- 确保所有依赖都在 `package.json` 中

### 问题 2: 前端无法连接后端

**检查**：
- `vercel.json` 中的后端 URL 是否正确
- 后端的 `FRONTEND_URL` 环境变量是否正确
- 浏览器控制台是否有 CORS 错误

**解决**：
1. 更新后端环境变量 `FRONTEND_URL`
2. 重新部署后端：
   ```bash
   # 在 Vercel Dashboard
   # 项目 → Deployments → ... → Redeploy
   ```

### 问题 3: API 返回 500 错误

**检查**：
- MongoDB 连接字符串是否正确
- OpenAI API Key 是否有效
- 在 Vercel Dashboard 查看 Functions 日志

---

## 📱 配置自定义域名（可选）

1. 在 Vercel Dashboard
2. 进入项目 → Settings → Domains
3. 添加你的域名（如：`aienglish.com`）
4. 按提示配置 DNS：
   ```
   类型: CNAME
   名称: @
   值: cname.vercel-dns.com
   ```

---

## 💡 专业提示

### 1. 使用环境变量

不要在代码中硬编码任何密钥或配置。

### 2. 监控日志

在 Vercel Dashboard 定期检查：
- Functions 执行时间
- 错误日志
- 带宽使用

### 3. 性能优化

- 启用 Vercel Analytics
- 优化图片（使用 `next/image` 或压缩）
- 代码分割和懒加载

### 4. 安全检查

- ✅ 所有密钥都在环境变量中
- ✅ CORS 正确配置
- ✅ API 有速率限制
- ✅ 输入验证

---

## 🎉 恭喜！

你的 AI English Learning App 现在已经部署到生产环境了！

**接下来可以：**
1. 📱 分享给朋友试用
2. 📊 查看使用数据
3. 🔧 持续优化功能
4. 📝 准备 ChatGPT App 提交

---

需要详细文档？查看 [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)


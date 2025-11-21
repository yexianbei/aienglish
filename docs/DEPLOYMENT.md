# 部署指南

## 📦 部署架构

```
┌─────────────────────────────────────────┐
│          前端 (Frontend)                 │
│     Vercel / Netlify / Cloudflare       │
│         https://your-app.com            │
└─────────────────────────────────────────┘
              ↓ API 请求
┌─────────────────────────────────────────┐
│          后端 (Backend)                  │
│      AWS / GCP / 阿里云 / Heroku         │
│      https://api.your-app.com           │
└─────────────────────────────────────────┘
              ↓ 数据存储
┌─────────────────────────────────────────┐
│         数据库 (Database)                │
│    MongoDB Atlas / 自建 MongoDB          │
└─────────────────────────────────────────┘
```

## 🚀 快速部署

### 1. 数据库部署 (MongoDB Atlas)

MongoDB Atlas 提供免费的云数据库服务，非常适合开发和小规模应用。

1. **注册 MongoDB Atlas**
   - 访问 https://www.mongodb.com/cloud/atlas
   - 创建免费账户

2. **创建集群**
   - 选择免费的 M0 集群
   - 选择离你最近的区域（如：AWS Asia Pacific - Hong Kong）
   - 创建集群

3. **配置访问**
   - Database Access: 创建数据库用户和密码
   - Network Access: 添加 IP 地址（开发环境可以使用 0.0.0.0/0）

4. **获取连接字符串**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aienglish
   ```

### 2. 后端部署

#### 方案 A: Railway (推荐，简单快速)

1. **注册 Railway**
   - 访问 https://railway.app/
   - 使用 GitHub 账号登录

2. **部署**
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli

   # 登录
   railway login

   # 在后端目录部署
   cd packages/backend
   railway init
   railway up
   ```

3. **配置环境变量**
   在 Railway Dashboard 中设置：
   - `MONGODB_URI`: MongoDB 连接字符串
   - `OPENAI_API_KEY`: OpenAI API Key
   - `JWT_SECRET`: 随机生成的密钥
   - `NODE_ENV`: production

#### 方案 B: Heroku

```bash
# 安装 Heroku CLI
brew install heroku/brew/heroku

# 登录
heroku login

# 创建应用
cd packages/backend
heroku create your-app-backend

# 设置环境变量
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set OPENAI_API_KEY="your_openai_key"
heroku config:set JWT_SECRET="your_secret"

# 部署
git push heroku main
```

#### 方案 C: Docker + 云服务器

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建和运行
docker build -t aienglish-backend .
docker run -p 3000:3000 --env-file .env aienglish-backend
```

### 3. 前端部署

#### 方案 A: Vercel (推荐)

1. **连接 GitHub**
   - 访问 https://vercel.com/
   - 导入你的 GitHub 仓库

2. **配置项目**
   - Framework Preset: Vite
   - Root Directory: `packages/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **环境变量**
   - `VITE_API_URL`: 后端 API 地址

4. **部署**
   - 点击 Deploy
   - 每次推送代码都会自动部署

#### 方案 B: Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 在前端目录部署
cd packages/frontend
netlify init
netlify deploy --prod
```

#### 方案 C: Cloudflare Pages

1. 访问 https://pages.cloudflare.com/
2. 连接 GitHub 仓库
3. 配置构建设置
4. 部署

### 4. ChatGPT App 提交

1. **准备材料**
   - `manifest.json`: App 配置文件
   - 应用截图和 Logo
   - 隐私政策和服务条款页面

2. **提交流程**
   - 访问 OpenAI 开发者平台
   - 创建新 App
   - 上传 manifest.json
   - 填写应用信息
   - 提交审核

3. **审核要点**
   - 应用功能是否正常
   - 用户体验是否流畅
   - 隐私和安全是否合规
   - 是否遵循 OpenAI 使用政策

## 🔧 环境变量配置

### 后端环境变量

```bash
# .env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aienglish
OPENAI_API_KEY=sk-...
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://your-app.com
```

### 前端环境变量

```bash
# .env.production
VITE_API_URL=https://api.your-app.com
```

## 📊 监控和维护

### 1. 日志监控

使用云服务商提供的日志服务：
- Railway: 内置日志查看
- Heroku: `heroku logs --tail`
- AWS: CloudWatch

### 2. 性能监控

推荐工具：
- Sentry: 错误追踪
- Google Analytics: 用户行为分析
- Vercel Analytics: 性能监控

### 3. 数据库备份

MongoDB Atlas 自动备份功能：
- 启用自动备份
- 设置备份保留期限
- 定期测试恢复流程

## 🔒 安全建议

1. **API 密钥管理**
   - 使用环境变量存储敏感信息
   - 不要将密钥提交到 Git
   - 定期轮换密钥

2. **HTTPS 强制**
   - 所有生产环境必须使用 HTTPS
   - 配置 HSTS 头

3. **CORS 配置**
   - 只允许可信域名访问 API
   - 不要使用 `*` 通配符

4. **速率限制**
   - 实现 API 速率限制
   - 防止滥用和 DDoS

## 🎯 部署检查清单

- [ ] MongoDB 数据库已创建并配置
- [ ] 后端已部署并可访问
- [ ] 前端已部署并可访问
- [ ] 所有环境变量已正确配置
- [ ] HTTPS 已启用
- [ ] CORS 已正确配置
- [ ] API 连接测试通过
- [ ] 用户注册和登录功能正常
- [ ] 单词添加和复习功能正常
- [ ] ChatGPT App manifest 已准备
- [ ] 隐私政策页面已创建
- [ ] 服务条款页面已创建
- [ ] 监控和日志系统已配置

## 📱 域名配置

### 1. 购买域名

推荐服务商：
- Namecheap
- Google Domains
- Cloudflare Registrar

### 2. DNS 配置

```
# 示例 DNS 记录
A     @              your-frontend-ip
CNAME api            your-backend-url.railway.app
CNAME www            your-frontend-url.vercel.app
```

### 3. SSL 证书

大多数云服务商都提供免费的 SSL 证书：
- Vercel: 自动配置
- Cloudflare: 自动配置
- Let's Encrypt: 免费证书

## 🆘 常见问题

### 问题 1: CORS 错误

```javascript
// 确保后端正确配置 CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 问题 2: 环境变量未生效

- 检查变量名是否正确
- 重新部署应用
- 查看部署日志

### 问题 3: 数据库连接失败

- 检查 IP 白名单
- 确认用户名和密码
- 检查连接字符串格式

## 📞 技术支持

如遇到部署问题，可以参考：
- OpenAI 官方文档
- 云服务商的文档和社区
- GitHub Issues

---

祝部署顺利！🚀


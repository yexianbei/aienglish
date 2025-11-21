import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './utils/database';
import { Log } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import wordRoutes from './routes/word.routes';
import authRoutes from './routes/auth.routes';
import { mcpHandler } from './mcp/router';

// 加载环境变量
dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  private initializeMiddlewares() {
    // CORS 配置
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // Body 解析
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 请求日志
    this.app.use((req, res, next) => {
      Log.debug(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body
      });
      next();
    });
  }

  /**
   * 初始化路由
   */
  private initializeRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // MCP Server 路由（供 ChatGPT Apps SDK 使用）
    this.app.all('/mcp', (req, res) => {
      void mcpHandler(req, res);
    });

    // 认证相关路由
    this.app.use('/api/auth', authRoutes);

    // 单词相关 API 路由（需要认证的在路由内部使用中间件）
    this.app.use('/api/words', wordRoutes);

    // API 根路径
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'AI English Learning API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          words: '/api/words',
          translate: '/api/words/translate',
          todayReview: '/api/words/today',
          statistics: '/api/words/statistics'
        }
      });
    });
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      // 连接数据库
      await Database.connect();

      // 启动服务器
      this.app.listen(this.port, () => {
        Log.success(`服务器启动成功`, {
          port: this.port,
          env: process.env.NODE_ENV || 'development',
          url: `http://localhost:${this.port}`
        });
        
        Log.info('API 文档', {
          health: `http://localhost:${this.port}/health`,
          api: `http://localhost:${this.port}/api`
        });
      });
    } catch (error) {
      Log.error('服务器启动失败', error);
      process.exit(1);
    }
  }
}

// 启动服务器
const server = new Server();
server.start();


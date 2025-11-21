import { Request, Response, NextFunction } from 'express';
import { Log } from '../utils/logger';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Log.error('全局错误处理', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // 默认错误响应
  const status = (error as any).status || 500;
  const message = error.message || '服务器内部错误';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * 404 处理中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  });
};


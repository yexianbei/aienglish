import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Log } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * JWT 认证中间件
 * 从 Authorization: Bearer <token> 中解析出 userId
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      Log.error('JWT_SECRET 未配置');
      return res.status(500).json({ error: '服务器配置错误' });
    }

    const payload = jwt.verify(token, secret) as JwtPayload;

    if (!payload?.userId) {
      return res.status(401).json({ error: '无效的令牌' });
    }

    req.userId = payload.userId;

    next();
  } catch (error) {
    Log.error('认证失败', error);
    return res.status(401).json({ error: '认证失败，请重新登录' });
  }
};



import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Log } from '../utils/logger';

const router = Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 未配置');
  }
  return secret;
};

/**
 * POST /api/auth/register
 * 使用邮箱+密码注册（用户名可选，不传则根据邮箱生成）
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body as {
      email?: string;
      password?: string;
      username?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为 6 位' });
    }

    // 检查邮箱是否已注册
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: '该邮箱已注册，请直接登录' });
    }

    // 生成用户名（如果前端没传）
    let finalUsername = username;
    if (!finalUsername) {
      const localPart = email.split('@')[0] || 'user';
      finalUsername = localPart.slice(0, 20);

      // 确保唯一：如果已存在同名用户，则在后面追加数字
      let suffix = 1;
      // eslint-disable-next-line no-constant-condition
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${localPart.slice(0, 18)}${suffix}`;
        suffix += 1;
        if (suffix > 99) break;
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      username: finalUsername,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    Log.success('用户注册成功', { userId: user._id, email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error: any) {
    Log.error('用户注册失败', error);
    res.status(500).json({ error: error.message || '注册失败' });
  }
});

/**
 * POST /api/auth/login
 * 邮箱 + 密码登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    Log.success('用户登录成功', { userId: user._id, email: user.email });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error: any) {
    Log.error('用户登录失败', error);
    res.status(500).json({ error: error.message || '登录失败' });
  }
});

export default router;



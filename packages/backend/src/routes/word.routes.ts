import { Router, Request, Response } from 'express';
import { WordService } from '../services/word.service';
import { OpenAIService } from '../services/openai.service';
import { AddWordRequest, ReviewWordRequest, TranslationRequest } from '../types';
import { Log } from '../utils/logger';

const router = Router();
const wordService = new WordService();
const openaiService = new OpenAIService();

/**
 * POST /api/words/translate
 * 翻译单词或短语
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const request: TranslationRequest = req.body;
    
    if (!request.text) {
      return res.status(400).json({ error: '缺少必需参数：text' });
    }

    const result = await openaiService.translate(request);
    
    res.json(result);
  } catch (error: any) {
    Log.error('翻译接口错误', error);
    res.status(500).json({ error: error.message || '翻译失败' });
  }
});

/**
 * POST /api/words
 * 添加单词到生词本
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string; // 简化版，实际应使用 JWT
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const request: AddWordRequest = req.body;
    
    if (!request.word || !request.translation || !request.userRating) {
      return res.status(400).json({ error: '缺少必需参数' });
    }

    const wordRecord = await wordService.addWord(userId, request);
    
    res.status(201).json(wordRecord);
  } catch (error: any) {
    Log.error('添加单词接口错误', error);
    res.status(500).json({ error: error.message || '添加单词失败' });
  }
});

/**
 * POST /api/words/:wordId/review
 * 复习单词
 */
router.post('/:wordId/review', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { wordId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const request: ReviewWordRequest = {
      wordId,
      userRating: req.body.userRating
    };
    
    if (!request.userRating) {
      return res.status(400).json({ error: '缺少必需参数：userRating' });
    }

    const wordRecord = await wordService.reviewWord(userId, request);
    
    res.json(wordRecord);
  } catch (error: any) {
    Log.error('复习单词接口错误', error);
    res.status(500).json({ error: error.message || '复习单词失败' });
  }
});

/**
 * GET /api/words/today
 * 获取今日待复习单词
 */
router.get('/today', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const words = await wordService.getTodayReviewWords(userId);
    
    res.json(words);
  } catch (error: any) {
    Log.error('获取今日复习单词接口错误', error);
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

/**
 * GET /api/words
 * 获取用户的所有单词
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const masteryLevel = req.query.masteryLevel 
      ? parseInt(req.query.masteryLevel as string) 
      : undefined;

    const result = await wordService.getUserWords(userId, {
      page,
      limit,
      masteryLevel
    });
    
    res.json(result);
  } catch (error: any) {
    Log.error('获取单词列表接口错误', error);
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

/**
 * GET /api/words/statistics
 * 获取学习统计
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const statistics = await wordService.getStatistics(userId);
    
    res.json(statistics);
  } catch (error: any) {
    Log.error('获取学习统计接口错误', error);
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

/**
 * DELETE /api/words/:wordId
 * 删除单词
 */
router.delete('/:wordId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { wordId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    await wordService.deleteWord(userId, wordId);
    
    res.json({ success: true });
  } catch (error: any) {
    Log.error('删除单词接口错误', error);
    res.status(500).json({ error: error.message || '删除失败' });
  }
});

export default router;


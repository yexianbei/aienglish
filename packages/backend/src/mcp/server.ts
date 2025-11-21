import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WordService } from '../services/word.service';
import { Database } from '../utils/database';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { Log } from '../utils/logger';

const wordService = new WordService();

const AddWordInputSchema = z.object({
  word: z.string().min(1),
  translation: z.string().optional(),
  context: z.string().optional(),
  userRating: z.enum(['unknown', 'vague', 'mastered']).default('unknown'),
  /**
   * ChatGPT / Developer Mode 提供的用户唯一标识
   * 在工具调用时需要显式传入（openaiUserId）
   */
  openaiUserId: z.string().min(1),
});

const ViewWordbookInputSchema = z.object({
  /**
   * ChatGPT / Developer Mode 提供的用户唯一标识
   */
  openaiUserId: z.string().min(1),
  /**
   * 第几页（从 1 开始），默认 1
   */
  page: z.number().int().min(1).optional().default(1),
  /**
   * 每页数量，默认 20，最大 50
   */
  limit: z.number().int().min(1).max(50).optional().default(20),
});

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 未配置');
  }
  return secret;
};

/**
 * 根据 openaiUserId 查找或创建本地用户，并生成后端 JWT
 */
const getOrCreateUserAndToken = async (openaiUserId: string) => {
  await Database.connect();

  let user = await User.findOne({ openaiUserId });

  if (!user) {
    const pseudoEmail = `${openaiUserId}@chatgpt.local`;
    const pseudoUsername = `gpt_${openaiUserId.slice(0, 12)}`;

    user = await User.create({
      email: pseudoEmail,
      username: pseudoUsername,
      password: 'mcp-no-login', // 仅占位，不用于登录
      openaiUserId,
    });

    Log.success('为 ChatGPT 用户创建本地账号', {
      openaiUserId,
      userId: user._id,
    });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    getJwtSecret(),
    { expiresIn: '30d' }
  );

  return { user, token };
};

export function createMcpServer() {
  const server = new McpServer({
    name: 'aienglish-app',
    version: '1.0.0',
  });

  /**
   * 工具：添加单词到当前 ChatGPT 用户对应的生词本
   */
  server.registerTool(
    'add_word',
    {
      title: '添加单词到生词本',
      description: '将当前对话中的单词添加到用户的生词本中，并使用间隔重复算法安排复习。',
      inputSchema: AddWordInputSchema,
    },
    async (args) => {
      const input = AddWordInputSchema.parse(args);

      const { user, token } = await getOrCreateUserAndToken(input.openaiUserId);

      Log.info('MCP add_word 调用', {
        openaiUserId: input.openaiUserId,
        userId: user._id,
        word: input.word,
      });

      // 直接调用内部服务层，避免再发 HTTP
      const wordRecord = await wordService.addWord(user._id.toString(), {
        word: input.word,
        translation: input.translation || input.word,
        context: input.context,
        userRating: input.userRating,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: `已为你添加单词 "${wordRecord.word}"，当前掌握等级为 ${wordRecord.masteryLevel}，未来会根据艾宾浩斯记忆曲线提醒你复习。`,
          },
        ],
        // 可选：把 JWT 返回给调用方，用于其他场景复用
        structuredContent: {
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
          },
          authToken: token,
          word: {
            id: wordRecord._id.toString(),
            word: wordRecord.word,
            translation: wordRecord.translation,
          },
        },
      };
    }
  );

  /**
   * 工具：查看当前 ChatGPT 用户对应的生词本
   * 通过 openaiUserId 映射到本地用户，然后列出该用户的单词列表
   */
  server.registerTool(
    'view_wordbook',
    {
      title: '查看生词本',
      description:
        '查看当前 ChatGPT 用户的生词本列表（包含单词、翻译、掌握等级等信息）。',
      inputSchema: ViewWordbookInputSchema,
    },
    async (args) => {
      const input = ViewWordbookInputSchema.parse(args);

      const { user } = await getOrCreateUserAndToken(input.openaiUserId);

      Log.info('MCP view_wordbook 调用', {
        openaiUserId: input.openaiUserId,
        userId: user._id,
        page: input.page,
        limit: input.limit,
      });

      const page = input.page ?? 1;
      const limit = input.limit ?? 20;

      const { words, pagination } = await wordService.getUserWords(
        user._id.toString(),
        {
          page,
          limit,
        }
      );

      // 组织一段人类可读的总结文本，方便 GPT 直接展示
      const summaryLines: string[] = [];
      if (words.length === 0) {
        summaryLines.push('你的生词本目前还是空的，可以先在对话中使用“添加单词到生词本”来收集生词。');
      } else {
        summaryLines.push(
          `为你找到了第 ${pagination.page}/${pagination.totalPages} 页的生词，共 ${pagination.total} 个单词，当前页显示 ${words.length} 个：`
        );
        summaryLines.push('');
        for (const w of words) {
          const level = w.masteryLevel ?? 0;
          const levelText = `等级 ${level}`;
          const line = `- ${w.word}：${w.translation}（${levelText}${
            w.examples && w.examples.length > 0 ? `，例句：${w.examples[0]}` : ''
          }）`;
          summaryLines.push(line);
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: summaryLines.join('\n'),
          },
        ],
        structuredContent: {
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
          },
          pagination,
          words: words.map((w) => ({
            id: w._id.toString(),
            word: w.word,
            translation: w.translation,
            masteryLevel: w.masteryLevel,
            nextReviewAt: w.nextReviewAt,
            examples: w.examples,
          })),
        },
      };
    }
  );

  return server;
}



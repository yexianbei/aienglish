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
   * ChatGPT / Apps SDK 提供的用户唯一标识
   * 具体字段名需要在 Apps SDK 侧按文档配置，这里只要保证能拿到一个稳定的 ID 即可
   */
  openaiUserId: z.string().min(1),
});

const replyMessage = (message: string) => ({
  content: [{ type: 'text' as const, text: message }],
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
        // 可选：把 JWT 返回给 Apps SDK，用于 iframe UI 等场景复用
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

  return server;
}



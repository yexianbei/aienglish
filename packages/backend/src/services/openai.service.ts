import OpenAI from 'openai';
import { TranslationRequest, TranslationResponse } from '../types';
import { Log } from '../utils/logger';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 环境变量未设置');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 翻译单词或短语，并获取详细信息
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const { text, context } = request;
      
      Log.info('开始翻译', { text, hasContext: !!context });

      const prompt = this.buildTranslationPrompt(text, context);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语教学助手。请提供准确的翻译、词性、音标和例句。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('OpenAI 返回空响应');
      }

      const result = JSON.parse(responseContent) as TranslationResponse;
      
      Log.success('翻译完成', { word: result.word });

      return result;
    } catch (error) {
      Log.error('翻译失败', error);
      throw new Error('翻译服务暂时不可用，请稍后再试');
    }
  }

  /**
   * 构建翻译提示词
   */
  private buildTranslationPrompt(text: string, context?: string): string {
    const contextInfo = context ? `\n\n上下文：${context}` : '';
    
    return `请翻译以下英文单词或短语，并提供详细信息。${contextInfo}

单词/短语：${text}

请以 JSON 格式返回以下信息：
{
  "word": "原始单词或短语",
  "translation": "中文翻译",
  "partOfSpeech": "词性（如：n. v. adj. 等）",
  "phonetic": "音标（如：/prəˈkræstɪneɪt/）",
  "examples": ["例句1", "例句2", "例句3"],
  "definitions": ["释义1", "释义2"]
}

注意：
1. translation 应该是最常用的中文翻译
2. examples 至少提供 2-3 个实用的例句
3. definitions 提供 1-2 个清晰的英文释义
4. 如果有上下文，请根据上下文给出最合适的翻译`;
  }

  /**
   * 生成助记方法
   */
  async generateMnemonic(word: string, translation: string): Promise<string> {
    try {
      Log.info('生成助记方法', { word });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个英语学习助手，擅长创造有趣的助记方法。'
          },
          {
            role: 'user',
            content: `请为单词 "${word}"（${translation}）创造一个简单有趣的助记方法，帮助记忆。`
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const mnemonic = completion.choices[0].message.content || '';
      
      Log.success('助记方法生成完成');

      return mnemonic;
    } catch (error) {
      Log.error('生成助记方法失败', error);
      return ''; // 失败时返回空字符串，不影响主流程
    }
  }
}


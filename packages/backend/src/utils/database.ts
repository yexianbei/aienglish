import mongoose from 'mongoose';
import { Log } from './logger';

export class Database {
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aienglish';
      
      Log.info('正在连接数据库...', { uri: mongoUri.replace(/\/\/.*@/, '//<credentials>@') });

      await mongoose.connect(mongoUri);

      Log.success('数据库连接成功');

      // 监听连接事件
      mongoose.connection.on('error', (error) => {
        Log.error('数据库连接错误', error);
      });

      mongoose.connection.on('disconnected', () => {
        Log.warn('数据库连接断开');
      });

      // 优雅关闭
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        Log.info('数据库连接已关闭');
        process.exit(0);
      });

    } catch (error) {
      Log.error('数据库连接失败', error);
      process.exit(1);
    }
  }

  static async disconnect() {
    try {
      await mongoose.connection.close();
      Log.info('数据库连接已关闭');
    } catch (error) {
      Log.error('关闭数据库连接失败', error);
    }
  }
}


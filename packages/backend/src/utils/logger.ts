/**
 * 简单的日志工具类
 * 注意：这里使用的是封装的 Log 类
 */
class Log {
  private static formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  static info(message: string, data?: any) {
    console.log(this.formatMessage('INFO', message, data));
  }

  static error(message: string, error?: any) {
    console.error(this.formatMessage('ERROR', message, error));
  }

  static warn(message: string, data?: any) {
    console.warn(this.formatMessage('WARN', message, data));
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  static success(message: string, data?: any) {
    console.log(this.formatMessage('SUCCESS', message, data));
  }
}

export { Log };


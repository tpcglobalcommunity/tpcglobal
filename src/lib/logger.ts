// Central logger utility for production-safe logging
// In production: debug/info/warn do nothing, error does nothing (silent production)
// In development: logs to console with [TPC] prefix

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMeta = Record<string, any> | undefined;

interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: LogMeta;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // Production: completely silent for all levels
      return false;
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[TPC] [${level.toUpperCase()}] [${timestamp}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: LogMeta): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: LogMeta): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Structured logger for the application
 *
 * Features:
 * - Different log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Environment-aware (verbose in dev, minimal in prod)
 * - Performance timing helpers
 * - Error tracking integration ready
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogMetadata extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;
  private minimumLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.minimumLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isDevelopment ? 'debug' : 'info');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.minimumLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogMetadata {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, context);

    if (this.isDevelopment) {
      // Development: Pretty print with colors
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level];

      const color = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      }[level];

      const reset = '\x1b[0m';

      console.log(`${emoji} ${color}[${level.toUpperCase()}]${reset} ${message}`);
      if (context) {
        console.log('  Context:', context);
      }
    } else {
      // Production: Structured JSON
      console.log(JSON.stringify(formatted));
    }
  }

  /**
   * Log debug information (verbose, only in development by default)
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = { message: String(error) };
    }

    const formatted = this.formatMessage('error', message, errorContext);

    if (this.isDevelopment) {
      console.error('❌ [ERROR]', message);
      if (error instanceof Error) {
        console.error('  Error:', error);
      }
      if (context) {
        console.error('  Context:', context);
      }
    } else {
      console.error(JSON.stringify(formatted));
    }

    // TODO: Send to Sentry or other error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { custom: context } });
    // }
  }

  /**
   * Create a timer to measure performance
   */
  startTimer(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.debug(`⏱️  ${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * Log an API request
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API ${method} ${path}`, context);
  }

  /**
   * Log an API response
   */
  apiResponse(method: string, path: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this.log(level, `API ${method} ${path} ${status}`, {
      ...context,
      status,
      duration: `${duration.toFixed(2)}ms`,
    });
  }

  /**
   * Log database queries (useful for debugging)
   */
  dbQuery(operation: string, table: string, duration?: number, context?: LogContext) {
    this.debug(`DB ${operation} ${table}`, {
      ...context,
      ...(duration && { duration: `${duration.toFixed(2)}ms` }),
    });
  }

  /**
   * Log AI/LLM operations
   */
  aiOperation(operation: string, model: string, tokens?: number, context?: LogContext) {
    this.info(`AI ${operation} (${model})`, {
      ...context,
      ...(tokens && { tokens }),
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = logger.info.bind(logger);
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logDebug = logger.debug.bind(logger);

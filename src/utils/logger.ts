import pino from 'pino';
import type { LoggerOptions } from '../types/index.js';

let loggerInstance: pino.Logger | null = null;

/**
 * Create or get the singleton logger instance
 */
export function createLogger(options: LoggerOptions = {}): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const level = options.level || 'info';
  const pretty = options.pretty !== false; // Default to true

  loggerInstance = pino({
    level,
    ...(pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  });

  return loggerInstance;
}

/**
 * Get the current logger instance or create a new one
 */
export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    return createLogger();
  }
  return loggerInstance;
}

/**
 * Reset the logger instance (useful for testing)
 */
export function resetLogger(): void {
  loggerInstance = null;
}

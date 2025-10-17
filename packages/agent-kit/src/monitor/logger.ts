/**
 * Logger Module with Pino
 * Production-ready logging with colored terminal and JSON output
 */

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'trace', // Map verbose to trace in pino
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  context?: string;
}

export interface LoggerConfig {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  format?: 'json' | 'pretty'; // JSON for production, pretty for development
  enableMemoryStorage?: boolean; // For testing
  telemetry?: any; // TelemetryConfig - avoid circular dependency
}

/**
 * Main Logger class using Pino
 * Supports colored terminal output, JSON format, and file logging
 */
export class Logger {
  private config: LoggerConfig;
  private pinoLogger: PinoLogger;
  private logs: LogEntry[] = []; // Optional memory storage
  private telemetry?: any; // Telemetry instance

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level || this.getDefaultLogLevel(),
      enableConsole: config.enableConsole !== false,
      enableFile: config.enableFile || false,
      filePath: config.filePath || './logs/agent.log',
      format: config.format || (process.env.NODE_ENV === 'production' ? 'json' : 'pretty'),
      enableMemoryStorage: config.enableMemoryStorage || false,
      telemetry: config.telemetry,
    };

    this.pinoLogger = this.createPinoLogger();

    // Initialize telemetry if config provided
    if (config.telemetry) {
      try {
        // Lazy import to avoid circular dependency
        const { Telemetry } = require('./telemetry');
        this.telemetry = new Telemetry(config.telemetry);
      } catch (error) {
        // Telemetry not available, continue without it
      }
    }
  }

  /**
   * Get default log level from environment variable or fallback to 'info'
   */
  private getDefaultLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    switch (envLevel) {
      case 'error':
        return LogLevel.Error;
      case 'warn':
        return LogLevel.Warn;
      case 'info':
        return LogLevel.Info;
      case 'debug':
        return LogLevel.Debug;
      case 'verbose':
      case 'trace':
        return LogLevel.Verbose;
      default:
        return LogLevel.Info;
    }
  }

  /**
   * Create pino logger with appropriate transports
   */
  private createPinoLogger(): PinoLogger {
    const level = this.config.level || LogLevel.Info;

    // Base pino options
    const pinoOptions: any = {
      level: level === LogLevel.Verbose ? 'trace' : level,
    };

    // Configure transport based on format
    if (this.config.enableConsole && this.config.format === 'pretty') {
      pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      };
    }

    // File logging (if enabled)
    if (this.config.enableFile) {
      pinoOptions.transport = {
        targets: [
          // Pretty console output
          ...(this.config.enableConsole && this.config.format === 'pretty'
            ? [
                {
                  target: 'pino-pretty',
                  level,
                  options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                  },
                },
              ]
            : []),
          // File output (JSON)
          {
            target: 'pino/file',
            level,
            options: { destination: this.config.filePath },
          },
        ],
      };
    }

    return pino(pinoOptions);
  }

  /**
   * Log error message
   */
  error(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Error, message, metadata, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Warn, message, metadata, context);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Info, message, metadata, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Debug, message, metadata, context);
  }

  /**
   * Log verbose/trace message
   */
  verbose(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Verbose, message, metadata, context);
  }

  /**
   * Core log method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    context?: string
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      metadata,
      context,
    };

    // Store in memory if enabled (for testing)
    if (this.config.enableMemoryStorage) {
      this.logs.push(entry);
    }

    // Send to telemetry if enabled
    if (this.telemetry) {
      try {
        this.telemetry.send({
          type: 'log',
          timestamp: entry.timestamp,
          data: entry,
        });
      } catch (error) {
        // Ignore telemetry errors
      }
    }

    // Log via pino
    const logData = {
      ...(context && { context }),
      ...(metadata && { metadata }),
    };

    const pinoLevel = level === LogLevel.Verbose ? 'trace' : level;
    this.pinoLogger[pinoLevel](logData, message);
  }

  /**
   * Create child logger with context
   */
  child(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Get all logged entries (only if memory storage is enabled)
   */
  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  /**
   * Filter logs by level
   */
  getLogsByLevel(level: LogLevel, limit?: number): LogEntry[] {
    const filtered = this.logs.filter((log) => log.level === level);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }

  /**
   * Filter logs by context
   */
  getLogsByContext(context: string, limit?: number): LogEntry[] {
    const filtered = this.logs.filter((log) => log.context === context);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }

  /**
   * Filter logs by time range
   */
  getLogsByTimeRange(start: number, end: number): LogEntry[] {
    return this.logs.filter((log) => log.timestamp >= start && log.timestamp <= end);
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log count
   */
  getLogCount(): number {
    return this.logs.length;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.pinoLogger.level = level === LogLevel.Verbose ? 'trace' : level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.config.level || LogLevel.Info;
  }

  /**
   * Check if level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    const levels = [LogLevel.Error, LogLevel.Warn, LogLevel.Info, LogLevel.Debug, LogLevel.Verbose];
    const currentLevelIndex = levels.indexOf(this.config.level || LogLevel.Info);
    const checkLevelIndex = levels.indexOf(level);
    return checkLevelIndex <= currentLevelIndex;
  }

  /**
   * Get pino logger instance (for advanced usage)
   */
  getPinoLogger(): PinoLogger {
    return this.pinoLogger;
  }
}

/**
 * Child Logger with context
 * Uses pino's built-in child logger
 */
export class ChildLogger {
  private parent: Logger;
  private context: string;
  private pinoChild: PinoLogger;

  constructor(parent: Logger, context: string) {
    this.parent = parent;
    this.context = context;
    this.pinoChild = parent.getPinoLogger().child({ context });
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.parent.error(message, metadata, this.context);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.parent.warn(message, metadata, this.context);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.parent.info(message, metadata, this.context);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.parent.debug(message, metadata, this.context);
  }

  verbose(message: string, metadata?: Record<string, any>): void {
    this.parent.verbose(message, metadata, this.context);
  }

  /**
   * Get context string
   */
  getContext(): string {
    return this.context;
  }

  /**
   * Get pino child logger (for advanced usage)
   */
  getPinoLogger(): PinoLogger {
    return this.pinoChild;
  }
}

/**
 * Create default logger instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Default logger instance with pretty format
 */
export const logger = createLogger();

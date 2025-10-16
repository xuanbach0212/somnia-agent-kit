/**
 * Winston-based Structured Logging
 * Provides comprehensive logging for agent operations
 */

export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'verbose',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
  context?: string;
}

export interface LoggerConfig {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level || LogLevel.Info,
      enableConsole: config.enableConsole !== false,
      enableFile: config.enableFile || false,
      filePath: config.filePath || './logs/agent.log',
      maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB
      maxFiles: config.maxFiles || 5,
    };
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
   * Log verbose message
   */
  verbose(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.Verbose, message, metadata, context);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    context?: string
  ): void {
    // Check if level is enabled
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      metadata,
      context,
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File output
    if (this.config.enableFile) {
      this.logToFile(entry);
    }
  }

  /**
   * Check if log level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels = [
      LogLevel.Error,
      LogLevel.Warn,
      LogLevel.Info,
      LogLevel.Debug,
      LogLevel.Verbose,
    ];

    const currentLevelIndex = levels.indexOf(this.config.level!);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const metadata = entry.metadata ? JSON.stringify(entry.metadata) : '';

    const message = `${timestamp} ${entry.level.toUpperCase()} ${context} ${entry.message} ${metadata}`;

    switch (entry.level) {
      case LogLevel.Error:
        console.error(message);
        break;
      case LogLevel.Warn:
        console.warn(message);
        break;
      case LogLevel.Info:
        console.log(message);
        break;
      case LogLevel.Debug:
      case LogLevel.Verbose:
        console.debug(message);
        break;
    }
  }

  /**
   * Log to file (placeholder)
   */
  private logToFile(entry: LogEntry): void {
    // In production: use fs.appendFile or winston file transport
    // For now, just store in memory
  }

  /**
   * Get recent logs
   */
  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel, limit?: number): LogEntry[] {
    const filtered = this.logs.filter((log) => log.level === level);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }

  /**
   * Get logs by context
   */
  getLogsByContext(context: string, limit?: number): LogEntry[] {
    const filtered = this.logs.filter((log) => log.context === context);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }

  /**
   * Get logs in time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Get log level
   */
  getLevel(): LogLevel {
    return this.config.level!;
  }

  /**
   * Create child logger with context
   */
  child(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger with predefined context
 */
export class ChildLogger {
  constructor(private parent: Logger, private context: string) {}

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
}

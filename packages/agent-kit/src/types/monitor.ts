/**
 * Monitor Types
 * Types for logging, metrics, telemetry, and dashboard
 */

import type { Timestamp } from './common';

// =============================================================================
// Logger Types
// =============================================================================

/**
 * Log levels
 */
export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'verbose',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: Timestamp;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Log level */
  level?: LogLevel;

  /** Enable console output */
  enableConsole?: boolean;

  /** Enable file output */
  enableFile?: boolean;

  /** File path for logs */
  filePath?: string;

  /** Output format */
  format?: 'json' | 'pretty';

  /** Enable in-memory storage */
  enableMemoryStorage?: boolean;

  /** Telemetry integration */
  telemetry?: TelemetryConfig;
}

// =============================================================================
// Metrics Types
// =============================================================================

/**
 * Metric structure
 */
export interface Metric {
  name: string;
  value: number;
  timestamp: Timestamp;
  tags?: Record<string, string>;
}

/**
 * Metric summary with statistics
 */
export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  lastValue: number;
  lastTimestamp: Timestamp;
}

/**
 * Metrics configuration
 */
export interface MetricsConfig {
  /** Retention period in milliseconds */
  retentionPeriod?: number;

  /** Maximum metrics to store */
  maxMetrics?: number;

  /** Telemetry integration */
  telemetry?: TelemetryConfig;

  /** Telemetry export interval in milliseconds */
  telemetryInterval?: number;
}

// =============================================================================
// Telemetry Types
// =============================================================================

/**
 * Telemetry format types
 */
export type TelemetryFormat = 'json' | 'prometheus' | 'datadog' | 'opentelemetry';

/**
 * Telemetry data structure
 */
export interface TelemetryData {
  /** Data type */
  type: 'log' | 'metric' | 'event';

  /** Timestamp */
  timestamp: Timestamp;

  /** Data payload */
  data: any;

  /** Data tags */
  tags?: Record<string, string>;
}

/**
 * Telemetry configuration
 */
export interface TelemetryConfig {
  /** Telemetry endpoint URL */
  endpoint?: string;

  /** Data format */
  format?: TelemetryFormat;

  /** Batch size before auto-flush */
  batchSize?: number;

  /** Auto-flush interval in milliseconds */
  flushInterval?: number;

  /** Enable/disable telemetry */
  enabled?: boolean;

  /** Max retry attempts */
  retries?: number;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Custom HTTP headers */
  headers?: Record<string, string>;

  /** Error callback */
  onError?: (error: Error) => void;
}

// =============================================================================
// Dashboard Types
// =============================================================================

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /** Dashboard port */
  port?: number;

  /** Enable HTML UI */
  enableUI?: boolean;

  /** Enable CORS */
  enableCORS?: boolean;

  /** Logger instance */
  logger?: any;

  /** Metrics instance */
  metrics?: any;

  /** Agent instance */
  agent?: any;

  /** Error callback */
  onError?: (error: Error) => void;
}

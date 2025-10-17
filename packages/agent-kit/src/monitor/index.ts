/**
 * Monitor module exports
 * Logging, metrics, event recording, telemetry, and dashboard
 */

// Main API exports (explicit for clarity and documentation)
export { logger, Logger, LogLevel, createLogger, ChildLogger, type LoggerConfig, type LogEntry } from './logger';
export { Metrics, type MetricsConfig, type Metric, type MetricSummary } from './metrics';
export { telemetry, Telemetry, createTelemetry, sendTelemetry, type TelemetryConfig, type TelemetryData } from './telemetry';
export { startDashboard, Dashboard, type DashboardConfig } from './dashboard';
export { EventRecorder } from './eventRecorder';

// Re-export all other types and utilities
export * from './logger';
export * from './metrics';
export * from './eventRecorder';
export * from './telemetry';
export * from './dashboard';

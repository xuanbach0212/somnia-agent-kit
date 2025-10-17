/**
 * Telemetry Module - Remote Observability
 * Send logs and metrics to external monitoring services
 * Supports Prometheus, Grafana, Datadog, and generic JSON endpoints
 */

import type { Metrics, MetricSummary } from './metrics';
import type { LogEntry } from './logger';

export type TelemetryFormat = 'json' | 'prometheus' | 'datadog' | 'opentelemetry';

export interface TelemetryConfig {
  endpoint?: string; // TELEMETRY_ENDPOINT env var
  format?: TelemetryFormat;
  batchSize?: number; // Number of items before auto-flush (default: 100)
  flushInterval?: number; // Auto-flush interval in ms (default: 10s)
  enabled?: boolean; // Enable/disable (auto-detected from endpoint)
  retries?: number; // Max retry attempts (default: 3)
  timeout?: number; // Request timeout in ms (default: 5s)
  headers?: Record<string, string>; // Custom headers (API keys, etc.)
  onError?: (error: Error) => void; // Error callback
}

export interface TelemetryData {
  type: 'log' | 'metric' | 'event';
  timestamp: number;
  data: any;
  tags?: Record<string, string>;
}

/**
 * Telemetry class for remote observability
 * Non-blocking async queue with batch processing
 */
export class Telemetry {
  private config: Required<TelemetryConfig>;
  private queue: TelemetryData[] = [];
  private timer: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;

  constructor(config: TelemetryConfig = {}) {
    // Auto-detect endpoint from env var
    const endpoint = config.endpoint || process.env.TELEMETRY_ENDPOINT || '';

    this.config = {
      endpoint,
      format: config.format || 'json',
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 10000, // 10s
      enabled: config.enabled !== undefined ? config.enabled : !!endpoint,
      retries: config.retries || 3,
      timeout: config.timeout || 5000, // 5s
      headers: config.headers || {},
      onError: config.onError || ((error) => console.error('[Telemetry Error]', error)),
    };

    // Start auto-flush timer if enabled
    if (this.config.enabled && this.config.flushInterval > 0) {
      this.startAutoFlush();
    }
  }

  /**
   * Send data to telemetry (non-blocking, adds to queue)
   */
  send(data: TelemetryData): void {
    if (!this.config.enabled) return;

    this.queue.push(data);

    // Auto-flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch(this.config.onError);
    }
  }

  /**
   * Send metrics snapshot
   */
  async sendMetrics(metrics: Metrics): Promise<void> {
    if (!this.config.enabled) return;

    const snapshot = metrics.getSnapshot();
    this.send({
      type: 'metric',
      timestamp: Date.now(),
      data: snapshot,
    });
  }

  /**
   * Send log entries
   */
  async sendLogs(logs: LogEntry[]): Promise<void> {
    if (!this.config.enabled) return;

    for (const log of logs) {
      this.send({
        type: 'log',
        timestamp: log.timestamp,
        data: log,
      });
    }
  }

  /**
   * Send custom event
   */
  async sendEvent(event: any, tags?: Record<string, string>): Promise<void> {
    if (!this.config.enabled) return;

    this.send({
      type: 'event',
      timestamp: Date.now(),
      data: event,
      tags,
    });
  }

  /**
   * Flush queue to endpoint (async, non-blocking)
   */
  async flush(): Promise<void> {
    if (!this.config.enabled || this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      // Take items from queue
      const batch = this.queue.splice(0, this.config.batchSize);

      // Format data based on config
      const payload = this.formatPayload(batch);

      // Send with retry logic
      await this.sendWithRetry(payload);
    } catch (error) {
      this.config.onError(error as Error);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Format payload based on telemetry format
   */
  private formatPayload(batch: TelemetryData[]): string {
    switch (this.config.format) {
      case 'prometheus':
        return this.toPrometheus(batch);
      case 'datadog':
        return JSON.stringify(this.toDatadog(batch));
      case 'opentelemetry':
        return JSON.stringify(this.toOpenTelemetry(batch));
      case 'json':
      default:
        return JSON.stringify(batch);
    }
  }

  /**
   * Convert to Prometheus text format
   */
  private toPrometheus(batch: TelemetryData[]): string {
    const lines: string[] = [];

    for (const item of batch) {
      if (item.type !== 'metric') continue;

      const data = item.data;

      // Counters
      if (data.counters) {
        for (const [key, value] of Object.entries(data.counters)) {
          const metricName = key.replace(/\./g, '_');
          lines.push(`# TYPE ${metricName} counter`);
          lines.push(`${metricName} ${value} ${item.timestamp}`);
        }
      }

      // Gauges
      if (data.gauges) {
        for (const [key, value] of Object.entries(data.gauges)) {
          const metricName = key.replace(/\./g, '_');
          lines.push(`# TYPE ${metricName} gauge`);
          lines.push(`${metricName} ${value} ${item.timestamp}`);
        }
      }

      // Simplified metrics (tx_sent, tx_success_rate, etc.)
      const simpleMetrics = ['tx_sent', 'tx_success_rate', 'avg_gas_used', 'llm_calls', 'reasoning_time', 'uptime', 'tps'];
      for (const key of simpleMetrics) {
        if (data[key] !== undefined) {
          lines.push(`# TYPE ${key} gauge`);
          lines.push(`${key} ${data[key]} ${item.timestamp}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert to Datadog format
   */
  private toDatadog(batch: TelemetryData[]): any {
    const series: any[] = [];

    for (const item of batch) {
      if (item.type === 'metric') {
        const data = item.data;

        // Convert counters
        if (data.counters) {
          for (const [key, value] of Object.entries(data.counters)) {
            series.push({
              metric: key,
              type: 'count',
              points: [[item.timestamp / 1000, value]],
              tags: item.tags ? Object.entries(item.tags).map(([k, v]) => `${k}:${v}`) : [],
            });
          }
        }

        // Convert gauges
        if (data.gauges) {
          for (const [key, value] of Object.entries(data.gauges)) {
            series.push({
              metric: key,
              type: 'gauge',
              points: [[item.timestamp / 1000, value]],
              tags: item.tags ? Object.entries(item.tags).map(([k, v]) => `${k}:${v}`) : [],
            });
          }
        }
      }
    }

    return { series };
  }

  /**
   * Convert to OpenTelemetry format
   */
  private toOpenTelemetry(batch: TelemetryData[]): any {
    const resourceMetrics: any[] = [];

    for (const item of batch) {
      if (item.type === 'metric') {
        // OpenTelemetry metrics format
        // Simplified implementation
        resourceMetrics.push({
          resource: {
            attributes: item.tags || {},
          },
          scopeMetrics: [{
            metrics: this.convertToOTelMetrics(item.data),
          }],
        });
      }
    }

    return { resourceMetrics };
  }

  /**
   * Convert metrics to OpenTelemetry format
   */
  private convertToOTelMetrics(data: any): any[] {
    const metrics: any[] = [];

    // Convert counters
    if (data.counters) {
      for (const [key, value] of Object.entries(data.counters)) {
        metrics.push({
          name: key,
          unit: '1',
          sum: {
            aggregationTemporality: 2, // CUMULATIVE
            isMonotonic: true,
            dataPoints: [{
              asInt: value,
              timeUnixNano: data.timestamp * 1000000,
            }],
          },
        });
      }
    }

    return metrics;
  }

  /**
   * Send payload with retry logic
   */
  private async sendWithRetry(payload: string, attempt: number = 0): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': this.getContentType(),
          ...this.config.headers,
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Telemetry request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Retry with exponential backoff
      if (attempt < this.config.retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // 1s, 2s, 4s, max 10s
        await this.sleep(delay);
        return this.sendWithRetry(payload, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Get content type based on format
   */
  private getContentType(): string {
    switch (this.config.format) {
      case 'prometheus':
        return 'text/plain';
      case 'datadog':
      case 'opentelemetry':
      case 'json':
      default:
        return 'application/json';
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.timer = setInterval(() => {
      this.flush().catch(this.config.onError);
    }, this.config.flushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Enable telemetry
   */
  enable(): void {
    this.config.enabled = true;
    if (this.config.flushInterval > 0) {
      this.startAutoFlush();
    }
  }

  /**
   * Disable telemetry
   */
  disable(): void {
    this.config.enabled = false;
    this.stopAutoFlush();
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Cleanup and flush remaining data
   */
  async shutdown(): Promise<void> {
    this.stopAutoFlush();
    await this.flush();
  }
}

/**
 * Create telemetry instance with env var config
 */
export function createTelemetry(config?: TelemetryConfig): Telemetry {
  return new Telemetry(config);
}

/**
 * Default telemetry instance (disabled if no TELEMETRY_ENDPOINT)
 */
export const telemetry = createTelemetry();

/**
 * Send telemetry data (convenience function using default instance)
 * @param data Data to send
 * @returns Promise that resolves when data is queued (non-blocking)
 */
export async function sendTelemetry(data: any): Promise<void> {
  if (!process.env.TELEMETRY_ENDPOINT) return;

  telemetry.send({
    type: 'event',
    timestamp: Date.now(),
    data,
  });
}

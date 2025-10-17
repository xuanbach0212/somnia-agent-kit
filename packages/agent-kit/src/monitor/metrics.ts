/**
 * Performance Metrics Collection
 * Tracks agent performance, execution times, success rates, etc.
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  lastValue: number;
  lastTimestamp: number;
}

export interface MetricsConfig {
  retentionPeriod?: number; // milliseconds
  maxMetrics?: number;
  telemetry?: any; // TelemetryConfig - avoid circular dependency
  telemetryInterval?: number; // Auto-export interval in ms (default: 60s)
}

/**
 * Metrics class for performance tracking
 */
export class Metrics {
  private config: MetricsConfig;
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private startTime: number;
  private telemetry?: any; // Telemetry instance
  private telemetryTimer?: NodeJS.Timeout;

  constructor(config: MetricsConfig = {}) {
    this.config = {
      retentionPeriod: config.retentionPeriod || 24 * 60 * 60 * 1000, // 24 hours
      maxMetrics: config.maxMetrics || 10000,
      telemetry: config.telemetry,
      telemetryInterval: config.telemetryInterval || 60000, // 60s
    };

    // Start uptime tracking
    this.startTime = Date.now();

    // Initialize telemetry if config provided
    if (config.telemetry) {
      try {
        // Lazy import to avoid circular dependency
        const { Telemetry } = require('./telemetry');
        this.telemetry = new Telemetry(config.telemetry);

        // Start auto-export to telemetry
        this.telemetryTimer = setInterval(() => {
          this.exportToTelemetry();
        }, this.config.telemetryInterval);
      } catch (error) {
        // Telemetry not available, continue without it
      }
    }

    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Record a metric value
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    let metrics = this.metrics.get(name);
    if (!metrics) {
      metrics = [];
      this.metrics.set(name, metrics);
    }

    metrics.push(metric);

    // Enforce max metrics limit
    if (metrics.length > this.config.maxMetrics!) {
      metrics.shift();
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
    this.record(name, current + value);
  }

  /**
   * Decrement a counter
   */
  decrement(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current - value);
    this.record(name, current - value);
  }

  /**
   * Set a gauge value
   */
  gauge(name: string, value: number): void {
    this.gauges.set(name, value);
    this.record(name, value);
  }

  /**
   * Record a histogram value
   */
  histogram(name: string, value: number): void {
    let values = this.histograms.get(name);
    if (!values) {
      values = [];
      this.histograms.set(name, values);
    }

    values.push(value);
    this.record(name, value);

    // Keep only recent values
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Time an operation
   */
  async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      this.histogram(`${name}.duration`, duration);
    }
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get gauge value
   */
  getGauge(name: string): number | undefined {
    return this.gauges.get(name);
  }

  /**
   * Get histogram values
   */
  getHistogram(name: string): number[] {
    return this.histograms.get(name) || [];
  }

  /**
   * Get metric summary
   */
  getSummary(name: string): MetricSummary | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const count = values.length;
    const avg = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const last = metrics[metrics.length - 1];

    return {
      name,
      count,
      sum,
      avg,
      min,
      max,
      lastValue: last.value,
      lastTimestamp: last.timestamp,
    };
  }

  /**
   * Get all metric summaries
   */
  getAllSummaries(): MetricSummary[] {
    const summaries: MetricSummary[] = [];
    for (const name of this.metrics.keys()) {
      const summary = this.getSummary(name);
      if (summary) {
        summaries.push(summary);
      }
    }
    return summaries;
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string, limit?: number): Metric[] {
    const metrics = this.metrics.get(name) || [];
    if (limit) {
      return metrics.slice(-limit);
    }
    return [...metrics];
  }

  /**
   * Get metrics in time range
   */
  getMetricsByTimeRange(name: string, startTime: number, endTime: number): Metric[] {
    const metrics = this.metrics.get(name) || [];
    return metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Calculate rate (ratio) between two counters
   * Example: rate('tx.success', 'tx.total') returns success rate as percentage
   */
  rate(numerator: string, denominator: string): number {
    const num = this.counters.get(numerator) || 0;
    const denom = this.counters.get(denominator) || 0;
    if (denom === 0) return 0;
    return (num / denom) * 100;
  }

  /**
   * Calculate operations per time window (e.g., TPS)
   * @param metricName Counter name
   * @param windowMs Time window in milliseconds (default: 60s)
   * @returns Rate per second
   */
  calculateRate(metricName: string, windowMs: number = 60000): number {
    const now = Date.now();
    const startTime = now - windowMs;
    const metrics = this.getMetricsByTimeRange(metricName, startTime, now);
    if (metrics.length === 0) return 0;

    const count = metrics.length;
    const windowSeconds = windowMs / 1000;
    return count / windowSeconds;
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Reset uptime counter
   */
  resetUptime(): void {
    this.startTime = Date.now();
  }

  /**
   * Record a blockchain transaction
   * @param success Whether transaction succeeded
   * @param gasUsed Amount of gas used
   */
  recordTransaction(success: boolean, gasUsed?: number): void {
    this.increment('tx.total');
    if (success) {
      this.increment('tx.success');
    } else {
      this.increment('tx.failed');
    }
    if (gasUsed !== undefined) {
      this.histogram('tx.gas_used', gasUsed);
    }
  }

  /**
   * Record an LLM call
   * @param duration Duration in milliseconds
   * @param success Whether call succeeded
   */
  recordLLMCall(duration?: number, success: boolean = true): void {
    this.increment('llm.total');
    if (success) {
      this.increment('llm.success');
    } else {
      this.increment('llm.failed');
    }
    if (duration !== undefined) {
      this.histogram('llm.reasoning_time', duration);
    }
  }

  /**
   * Record gas usage
   * @param amount Amount of gas used
   */
  recordGasUsed(amount: number): void {
    this.histogram('gas.used', amount);
    this.increment('gas.total', amount);
  }

  /**
   * Calculate percentile for histogram
   * @param name Histogram name
   * @param percentile Percentile (0-100), e.g., 50 for median, 95 for p95
   * @returns Value at percentile
   */
  getPercentile(name: string, percentile: number): number | null {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get snapshot of all metrics (alias for export)
   */
  getSnapshot(): Record<string, any> {
    return this.export();
  }

  /**
   * Export metrics to telemetry
   */
  private exportToTelemetry(): void {
    if (!this.telemetry) return;

    try {
      const snapshot = this.export();
      this.telemetry.send({
        type: 'metric',
        timestamp: Date.now(),
        data: snapshot,
      });
    } catch (error) {
      // Ignore telemetry errors
    }
  }

  /**
   * Clear metrics
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
      this.counters.delete(name);
      this.gauges.delete(name);
      this.histograms.delete(name);
    } else {
      this.metrics.clear();
      this.counters.clear();
      this.gauges.clear();
      this.histograms.clear();
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Cleanup old metrics
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.config.retentionPeriod!;

    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => m.timestamp >= cutoff);
      if (filtered.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, filtered);
      }
    }
  }

  /**
   * Export metrics as JSON
   */
  export(): Record<string, any> {
    // Calculate transaction success rate
    const txSuccessRate = this.rate('tx.success', 'tx.total');
    const llmSuccessRate = this.rate('llm.success', 'llm.total');

    // Get gas statistics
    const avgGasUsed = this.getSummary('tx.gas_used')?.avg || 0;
    const p95GasUsed = this.getPercentile('tx.gas_used', 95) || 0;

    // Get LLM statistics
    const avgReasoningTime = this.getSummary('llm.reasoning_time')?.avg || 0;
    const p95ReasoningTime = this.getPercentile('llm.reasoning_time', 95) || 0;

    // Calculate TPS (last 60 seconds)
    const tps = this.calculateRate('tx.total', 60000);

    return {
      // Counters
      counters: Object.fromEntries(this.counters),

      // Gauges
      gauges: Object.fromEntries(this.gauges),

      // Summaries
      summaries: this.getAllSummaries(),

      // Histograms (percentiles)
      histograms: {
        gas_used: {
          p50: this.getPercentile('tx.gas_used', 50),
          p95: this.getPercentile('tx.gas_used', 95),
          p99: this.getPercentile('tx.gas_used', 99),
        },
        reasoning_time: {
          p50: this.getPercentile('llm.reasoning_time', 50),
          p95: this.getPercentile('llm.reasoning_time', 95),
          p99: this.getPercentile('llm.reasoning_time', 99),
        },
      },

      // Calculated metrics (simplified format matching user's example)
      tx_sent: this.counters.get('tx.total') || 0,
      tx_success_rate: txSuccessRate,
      avg_gas_used: avgGasUsed,
      llm_calls: this.counters.get('llm.total') || 0,
      reasoning_time: avgReasoningTime,
      uptime: this.getUptime(),
      tps: tps,

      // Metadata
      timestamp: Date.now(),
    };
  }
}

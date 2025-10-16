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

  constructor(config: MetricsConfig = {}) {
    this.config = {
      retentionPeriod: config.retentionPeriod || 24 * 60 * 60 * 1000, // 24 hours
      maxMetrics: config.maxMetrics || 10000,
    };

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
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      summaries: this.getAllSummaries(),
      timestamp: Date.now(),
    };
  }
}

/**
 * Metrics Collector for monitoring AI agents on Somnia
 */

import { SomniaClient } from '../core/SomniaClient';
import { AgentMetrics } from '../core/types';
import { Logger } from '../utils/logger';

export interface CollectedMetrics {
  agentId: string;
  timestamp: number;
  metrics: AgentMetrics;
  status: 'healthy' | 'warning' | 'critical';
  alerts: string[];
}

export interface MetricsThresholds {
  minSuccessRate?: number;
  maxAverageExecutionTime?: number;
  maxFailureRate?: number;
}

export class MetricsCollector {
  private client: SomniaClient;
  private logger: Logger;
  private thresholds: MetricsThresholds;
  private metricsHistory: Map<string, CollectedMetrics[]> = new Map();

  constructor(client: SomniaClient, thresholds?: MetricsThresholds) {
    this.client = client;
    this.logger = new Logger('MetricsCollector');
    this.thresholds = thresholds || {
      minSuccessRate: 80,
      maxAverageExecutionTime: 5000,
      maxFailureRate: 20,
    };
  }

  /**
   * Collect metrics for a specific agent
   */
  async collectAgentMetrics(agentId: string): Promise<CollectedMetrics> {
    this.logger.info(`Collecting metrics for agent: ${agentId}`);

    const metrics = await this.client.getAgentMetrics(agentId);
    const alerts: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check success rate
    if (
      this.thresholds.minSuccessRate &&
      metrics.successRate < this.thresholds.minSuccessRate
    ) {
      alerts.push(
        `Success rate (${metrics.successRate.toFixed(2)}%) is below threshold (${this.thresholds.minSuccessRate}%)`
      );
      status =
        metrics.successRate < this.thresholds.minSuccessRate / 2 ? 'critical' : 'warning';
    }

    // Check average execution time
    if (
      this.thresholds.maxAverageExecutionTime &&
      metrics.averageExecutionTime > this.thresholds.maxAverageExecutionTime
    ) {
      alerts.push(
        `Average execution time (${metrics.averageExecutionTime}ms) exceeds threshold (${this.thresholds.maxAverageExecutionTime}ms)`
      );
      if (status !== 'critical') status = 'warning';
    }

    // Check failure rate
    const failureRate =
      metrics.totalExecutions > 0
        ? (metrics.failedExecutions / metrics.totalExecutions) * 100
        : 0;
    if (this.thresholds.maxFailureRate && failureRate > this.thresholds.maxFailureRate) {
      alerts.push(
        `Failure rate (${failureRate.toFixed(2)}%) exceeds threshold (${this.thresholds.maxFailureRate}%)`
      );
      status = 'critical';
    }

    const collectedMetrics: CollectedMetrics = {
      agentId,
      timestamp: Date.now(),
      metrics,
      status,
      alerts,
    };

    // Store in history
    if (!this.metricsHistory.has(agentId)) {
      this.metricsHistory.set(agentId, []);
    }
    this.metricsHistory.get(agentId)!.push(collectedMetrics);

    // Keep only last 100 entries per agent
    const history = this.metricsHistory.get(agentId)!;
    if (history.length > 100) {
      history.shift();
    }

    if (alerts.length > 0) {
      this.logger.warn(`Agent ${agentId} has ${alerts.length} alert(s)`);
      alerts.forEach((alert) => this.logger.warn(alert));
    }

    return collectedMetrics;
  }

  /**
   * Collect metrics for multiple agents
   */
  async collectMultipleAgents(agentIds: string[]): Promise<CollectedMetrics[]> {
    this.logger.info(`Collecting metrics for ${agentIds.length} agents`);

    const results = await Promise.allSettled(
      agentIds.map((id) => this.collectAgentMetrics(id))
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<CollectedMetrics>).value);
  }

  /**
   * Get metrics history for an agent
   */
  getMetricsHistory(agentId: string, limit?: number): CollectedMetrics[] {
    const history = this.metricsHistory.get(agentId) || [];
    if (limit) {
      return history.slice(-limit);
    }
    return history;
  }

  /**
   * Get aggregated metrics across all monitored agents
   */
  getAggregatedMetrics(): {
    totalAgents: number;
    healthyAgents: number;
    warningAgents: number;
    criticalAgents: number;
    averageSuccessRate: number;
    totalExecutions: number;
  } {
    const allMetrics: CollectedMetrics[] = [];
    this.metricsHistory.forEach((history) => {
      if (history.length > 0) {
        allMetrics.push(history[history.length - 1]);
      }
    });

    const totalAgents = allMetrics.length;
    const healthyAgents = allMetrics.filter((m) => m.status === 'healthy').length;
    const warningAgents = allMetrics.filter((m) => m.status === 'warning').length;
    const criticalAgents = allMetrics.filter((m) => m.status === 'critical').length;

    const totalSuccessRate = allMetrics.reduce(
      (sum, m) => sum + m.metrics.successRate,
      0
    );
    const averageSuccessRate = totalAgents > 0 ? totalSuccessRate / totalAgents : 0;

    const totalExecutions = allMetrics.reduce(
      (sum, m) => sum + m.metrics.totalExecutions,
      0
    );

    return {
      totalAgents,
      healthyAgents,
      warningAgents,
      criticalAgents,
      averageSuccessRate,
      totalExecutions,
    };
  }

  /**
   * Clear metrics history
   */
  clearHistory(agentId?: string): void {
    if (agentId) {
      this.metricsHistory.delete(agentId);
      this.logger.info(`Cleared metrics history for agent: ${agentId}`);
    } else {
      this.metricsHistory.clear();
      this.logger.info('Cleared all metrics history');
    }
  }
}

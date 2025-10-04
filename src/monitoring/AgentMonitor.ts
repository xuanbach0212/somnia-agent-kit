/**
 * Real-time Agent Monitor with WebSocket support
 */

import { EventEmitter } from 'events';
import { SomniaAgentSDK } from '../sdk/SomniaAgentSDK';
import { Logger } from '../utils/logger';
import { CollectedMetrics, MetricsCollector } from './MetricsCollector';

export interface MonitorConfig {
  updateInterval?: number; // in milliseconds
  agentIds?: string[];
  autoStart?: boolean;
}

export class AgentMonitor extends EventEmitter {
  private sdk: SomniaAgentSDK;
  private metricsCollector: MetricsCollector;
  private logger: Logger;
  private config: MonitorConfig;
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private monitoredAgents: Set<string> = new Set();

  constructor(
    sdk: SomniaAgentSDK,
    metricsCollector: MetricsCollector,
    config?: MonitorConfig
  ) {
    super();
    this.sdk = sdk;
    this.metricsCollector = metricsCollector;
    this.logger = new Logger('AgentMonitor');
    this.config = {
      updateInterval: config?.updateInterval || 30000, // 30 seconds default
      agentIds: config?.agentIds || [],
      autoStart: config?.autoStart || false,
    };

    if (this.config.agentIds) {
      this.config.agentIds.forEach((id) => this.monitoredAgents.add(id));
    }

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Monitor is already running');
      return;
    }

    this.logger.info('Starting agent monitor...');
    this.isRunning = true;

    // Initial collection
    this.collectMetrics();

    // Schedule periodic collection
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.config.updateInterval);

    this.emit('monitor:started');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('Stopping agent monitor...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    this.emit('monitor:stopped');
  }

  /**
   * Add agent to monitoring
   */
  addAgent(agentId: string): void {
    if (!this.monitoredAgents.has(agentId)) {
      this.monitoredAgents.add(agentId);
      this.logger.info(`Added agent ${agentId} to monitoring`);
      this.emit('agent:added', agentId);
    }
  }

  /**
   * Remove agent from monitoring
   */
  removeAgent(agentId: string): void {
    if (this.monitoredAgents.has(agentId)) {
      this.monitoredAgents.delete(agentId);
      this.logger.info(`Removed agent ${agentId} from monitoring`);
      this.emit('agent:removed', agentId);
    }
  }

  /**
   * Get list of monitored agents
   */
  getMonitoredAgents(): string[] {
    return Array.from(this.monitoredAgents);
  }

  /**
   * Collect metrics for all monitored agents
   */
  private async collectMetrics(): Promise<void> {
    if (this.monitoredAgents.size === 0) {
      return;
    }

    try {
      const agentIds = Array.from(this.monitoredAgents);
      const metrics = await this.metricsCollector.collectMultipleAgents(agentIds);

      // Emit events for each agent
      metrics.forEach((metric) => {
        this.emit('metrics:collected', metric);

        // Emit status-specific events
        if (metric.status === 'critical') {
          this.emit('alert:critical', metric);
        } else if (metric.status === 'warning') {
          this.emit('alert:warning', metric);
        }

        // Emit alert events
        if (metric.alerts.length > 0) {
          this.emit('alerts', {
            agentId: metric.agentId,
            alerts: metric.alerts,
            timestamp: metric.timestamp,
          });
        }
      });

      // Emit aggregated metrics
      const aggregated = this.metricsCollector.getAggregatedMetrics();
      this.emit('metrics:aggregated', aggregated);
    } catch (error) {
      this.logger.error(`Error collecting metrics: ${error}`);
      this.emit('error', error);
    }
  }

  /**
   * Get current metrics for an agent
   */
  async getCurrentMetrics(agentId: string): Promise<CollectedMetrics> {
    return this.metricsCollector.collectAgentMetrics(agentId);
  }

  /**
   * Get metrics history for an agent
   */
  getMetricsHistory(agentId: string, limit?: number): CollectedMetrics[] {
    return this.metricsCollector.getMetricsHistory(agentId, limit);
  }

  /**
   * Check if monitor is running
   */
  isMonitorRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Force immediate metrics collection
   */
  async forceCollection(): Promise<void> {
    this.logger.info('Forcing immediate metrics collection');
    await this.collectMetrics();
  }
}


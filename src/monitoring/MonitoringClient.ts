/**
 * Monitoring Client - SDK wrapper for Monitoring Server API
 * Wraps REST API endpoints and WebSocket connections
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Logger } from '../utils/logger';
import { CollectedMetrics } from './MetricsCollector';

export interface MonitoringClientConfig {
  baseUrl?: string;
  wsUrl?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  timeout?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: number;
  monitoring: boolean;
}

export interface AggregatedMetrics {
  totalAgents: number;
  healthyAgents: number;
  warningAgents: number;
  criticalAgents: number;
  averageSuccessRate: number;
  totalExecutions: number;
}

export interface AlertData {
  agentId: string;
  alerts: string[];
  timestamp: number;
  severity?: 'warning' | 'critical';
}

export interface WebSocketMessage {
  type:
    | 'connected'
    | 'metrics'
    | 'aggregated'
    | 'alert'
    | 'subscribe'
    | 'unsubscribe'
    | 'getMetrics';
  data?: any;
  agentId?: string;
  timestamp?: number;
  agents?: string[];
}

/**
 * Monitoring Client - Wraps all monitoring server endpoints
 */
export class MonitoringClient extends EventEmitter {
  private baseUrl: string;
  private wsUrl: string;
  private httpClient: AxiosInstance;
  private ws?: WebSocket;
  private logger: Logger;
  private autoConnect: boolean;
  private reconnectInterval: number;
  private reconnectTimer?: NodeJS.Timeout;
  private isConnecting: boolean = false;

  constructor(config: MonitoringClientConfig = {}) {
    super();
    this.logger = new Logger('MonitoringClient');

    // Configuration
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.wsUrl = config.wsUrl || this.baseUrl.replace('http', 'ws');
    this.autoConnect = config.autoConnect || false;
    this.reconnectInterval = config.reconnectInterval || 5000;

    // Setup HTTP client
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Auto-connect WebSocket if enabled
    if (this.autoConnect) {
      this.connect().catch((error) => {
        this.logger.error(`Auto-connect failed: ${error.message}`);
      });
    }
  }

  // ==================== REST API Methods ====================

  /**
   * 1. Get server health status
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      this.logger.info('Getting server health...');
      const response = await this.httpClient.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get health: ${error}`);
      throw new Error(`Failed to get health: ${error}`);
    }
  }

  /**
   * 2. Get list of monitored agents
   */
  async getMonitoredAgents(): Promise<string[]> {
    try {
      this.logger.info('Getting monitored agents...');
      const response = await this.httpClient.get<{ agents: string[] }>('/api/agents');
      return response.data.agents;
    } catch (error) {
      this.logger.error(`Failed to get monitored agents: ${error}`);
      throw new Error(`Failed to get monitored agents: ${error}`);
    }
  }

  /**
   * 3. Add agent to monitoring
   */
  async addAgent(agentId: string): Promise<void> {
    try {
      this.logger.info(`Adding agent ${agentId} to monitoring...`);
      await this.httpClient.post(`/api/agents/${agentId}`);
      this.logger.info(`Agent ${agentId} added to monitoring`);
    } catch (error) {
      this.logger.error(`Failed to add agent: ${error}`);
      throw new Error(`Failed to add agent: ${error}`);
    }
  }

  /**
   * 4. Remove agent from monitoring
   */
  async removeAgent(agentId: string): Promise<void> {
    try {
      this.logger.info(`Removing agent ${agentId} from monitoring...`);
      await this.httpClient.delete(`/api/agents/${agentId}`);
      this.logger.info(`Agent ${agentId} removed from monitoring`);
    } catch (error) {
      this.logger.error(`Failed to remove agent: ${error}`);
      throw new Error(`Failed to remove agent: ${error}`);
    }
  }

  /**
   * 5. Get current metrics for an agent
   */
  async getAgentMetrics(agentId: string): Promise<CollectedMetrics> {
    try {
      this.logger.info(`Getting metrics for agent ${agentId}...`);
      const response = await this.httpClient.get<CollectedMetrics>(
        `/api/agents/${agentId}/metrics`
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get agent metrics: ${error}`);
      throw new Error(`Failed to get agent metrics: ${error}`);
    }
  }

  /**
   * 6. Get metrics history for an agent
   */
  async getMetricsHistory(agentId: string, limit?: number): Promise<CollectedMetrics[]> {
    try {
      this.logger.info(`Getting metrics history for agent ${agentId}...`);
      const url = limit
        ? `/api/agents/${agentId}/history?limit=${limit}`
        : `/api/agents/${agentId}/history`;
      const response = await this.httpClient.get<{ history: CollectedMetrics[] }>(url);
      return response.data.history;
    } catch (error) {
      this.logger.error(`Failed to get metrics history: ${error}`);
      throw new Error(`Failed to get metrics history: ${error}`);
    }
  }

  /**
   * 7. Get aggregated metrics across all agents
   */
  async getAggregatedMetrics(): Promise<AggregatedMetrics> {
    try {
      this.logger.info('Getting aggregated metrics...');
      const response = await this.httpClient.get<AggregatedMetrics>(
        '/api/metrics/aggregated'
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get aggregated metrics: ${error}`);
      throw new Error(`Failed to get aggregated metrics: ${error}`);
    }
  }

  /**
   * 8. Start monitoring
   */
  async startMonitor(): Promise<void> {
    try {
      this.logger.info('Starting monitor...');
      await this.httpClient.post('/api/monitor/start');
      this.logger.info('Monitor started');
    } catch (error) {
      this.logger.error(`Failed to start monitor: ${error}`);
      throw new Error(`Failed to start monitor: ${error}`);
    }
  }

  /**
   * 9. Stop monitoring
   */
  async stopMonitor(): Promise<void> {
    try {
      this.logger.info('Stopping monitor...');
      await this.httpClient.post('/api/monitor/stop');
      this.logger.info('Monitor stopped');
    } catch (error) {
      this.logger.error(`Failed to stop monitor: ${error}`);
      throw new Error(`Failed to stop monitor: ${error}`);
    }
  }

  /**
   * 10. Force metrics collection
   */
  async forceCollection(): Promise<void> {
    try {
      this.logger.info('Forcing metrics collection...');
      await this.httpClient.post('/api/monitor/collect');
      this.logger.info('Metrics collection triggered');
    } catch (error) {
      this.logger.error(`Failed to force collection: ${error}`);
      throw new Error(`Failed to force collection: ${error}`);
    }
  }

  // ==================== WebSocket Methods ====================

  /**
   * 11. Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.logger.warn('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      this.logger.warn('Connection already in progress');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.logger.info(`Connecting to WebSocket: ${this.wsUrl}`);

        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
          this.isConnecting = false;
          this.logger.info('WebSocket connected');
          this.emit('ws:connected');
          resolve();
        });

        this.ws.on('message', (data: string) => {
          this.handleMessage(data);
        });

        this.ws.on('close', () => {
          this.logger.warn('WebSocket disconnected');
          this.emit('ws:disconnected');
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          this.isConnecting = false;
          this.logger.error(`WebSocket error: ${error}`);
          this.emit('ws:error', error);
          reject(error);
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 12. Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.logger.info('Disconnecting WebSocket...');
      this.ws.close();
      this.ws = undefined;
    }
  }

  /**
   * 13. Subscribe to agent updates
   */
  subscribe(agentId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket not connected. Call connect() first.');
      throw new Error('WebSocket not connected');
    }

    this.logger.info(`Subscribing to agent ${agentId}...`);
    const message: WebSocketMessage = {
      type: 'subscribe',
      agentId,
    };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * 14. Unsubscribe from agent updates
   */
  unsubscribe(agentId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    this.logger.info(`Unsubscribing from agent ${agentId}...`);
    const message: WebSocketMessage = {
      type: 'unsubscribe',
      agentId,
    };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * 15. Request metrics for specific agent
   */
  requestMetrics(agentId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    this.logger.info(`Requesting metrics for agent ${agentId}...`);
    const message: WebSocketMessage = {
      type: 'getMetrics',
      agentId,
    };
    this.ws.send(JSON.stringify(message));
  }

  // ==================== Private Methods ====================

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'connected':
          this.logger.info('Connected to monitoring server');
          this.emit('connected', {
            timestamp: message.timestamp,
            agents: message.agents,
          });
          break;

        case 'metrics':
          this.emit('metrics', message.data);
          break;

        case 'aggregated':
          this.emit('aggregated', message.data);
          break;

        case 'alert':
          this.emit('alert', message.data);
          break;

        default:
          this.logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to parse WebSocket message: ${error}`);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.autoConnect) {
      return;
    }

    this.logger.info(`Scheduling reconnection in ${this.reconnectInterval}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect().catch((error) => {
        this.logger.error(`Reconnection failed: ${error}`);
      });
    }, this.reconnectInterval);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== undefined && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get WebSocket connection state
   */
  getConnectionState(): string {
    if (!this.ws) return 'CLOSED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}


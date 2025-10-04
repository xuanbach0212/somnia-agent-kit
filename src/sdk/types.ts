/**
 * Type definitions for the Somnia AI Agent Framework
 */

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  metadata?: Record<string, any>;
  ipfsMetadata?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  ipfsMetadata: string;
  owner: string;
  isActive: boolean;
  registeredAt: number;
  lastUpdated: number;
  capabilities: string[];
  executionCount: number;
}

export interface AgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  successRate: number;
}

export interface Task {
  taskId: string;
  agentId: string;
  requester: string;
  taskData: string;
  reward: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  result?: string;
}

export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
}

export interface DeploymentConfig {
  rpcUrl: string;
  chainId: number;
  privateKey: string;
  agentRegistryAddress?: string;
  agentManagerAddress?: string;
}

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  gasUsed?: string;
  transactionHash?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  port?: number;
  metricsInterval?: number;
  webhookUrl?: string;
  alertThresholds?: {
    failureRate?: number;
    executionTime?: number;
  };
}

export interface AgentExecutor {
  execute: (input: any) => Promise<ExecutionResult>;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

export interface IPFSConfig {
  host?: string;
  port?: number;
  protocol?: string;
}

export interface CreateTaskParams {
  agentId: string;
  taskData: string | object;
  reward: string; // in wei
}

export interface SomniaConfig {
  rpcUrl?: string;
  chainId?: number;
  privateKey?: string;
  agentRegistryAddress?: string;
  agentManagerAddress?: string;
  ipfsConfig?: IPFSConfig;
  monitoringConfig?: MonitoringConfig;
}


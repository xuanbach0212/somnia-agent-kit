/**
 * Core Type Definitions for Somnia AI Agent Framework
 */

import { LLMProvider } from './LLMProvider';
import { Logger } from '../utils/logger';
import { IPFSManager } from '../utils/ipfs';

// ============================================================================
// Client Configuration
// ============================================================================

export interface ClientConfig {
  rpcUrl: string;
  privateKey?: string;
  contracts: {
    agentRegistry: string;
    agentManager: string;
  };
  ipfs?: {
    gateway?: string;
    uploadUrl?: string;
  };
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  metadata?: Record<string, any>;

  // Task processing settings
  autoStart?: boolean;
  pollingInterval?: number; // ms between task checks
  maxConcurrentTasks?: number;
}

export interface AgentData {
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

export type AgentState = 'idle' | 'running' | 'stopped' | 'error';

// ============================================================================
// Task Types
// ============================================================================

export interface TaskData {
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

export interface CreateTaskParams {
  agentId: string;
  taskData: string | object;
  reward: string; // in wei
}

// ============================================================================
// Execution Types
// ============================================================================

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime?: number;
  gasUsed?: string;
  transactionHash?: string;
}

export interface ExecutorContext {
  llm?: LLMProvider;
  agentId: string;
  logger: Logger;
  ipfs: IPFSManager;
}

export type ExecutorFunction = (
  input: any,
  context: ExecutorContext
) => Promise<ExecutionResult>;

// ============================================================================
// Event Types
// ============================================================================

export interface TaskCreatedEvent {
  taskId: string;
  agentId: string;
  requester: string;
  reward: string;
  timestamp: number;
}

export interface TaskCompletedEvent {
  taskId: string;
  result: string;
  timestamp: number;
}

// ============================================================================
// Contract Interaction Types
// ============================================================================

export interface RegisterAgentParams {
  name: string;
  description: string;
  ipfsMetadata: string;
  capabilities: string[];
}

export interface UpdateAgentParams {
  name?: string;
  description?: string;
  ipfsMetadata?: string;
  capabilities?: string[];
}

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: bigint;
  status: number;
  logs: any[];
}

export interface TransactionRequest {
  to: string;
  data: string;
  value?: bigint;
  gasLimit?: bigint;
}

// ============================================================================
// Event Subscription Types
// ============================================================================

export type EventCallback = (event: any) => void;

export interface Subscription {
  id: string;
  eventName: string;
  callback: EventCallback;
  unsubscribe: () => void;
}

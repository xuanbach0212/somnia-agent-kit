/**
 * Action Types
 * Standardized action definitions for runtime execution
 * This is the "action language" that the runtime understands and executes
 */

import type { Hash, Timestamp } from './common';
import { ActionType } from './llm';

// Re-export ActionType enum for convenience
export { ActionType };

// =============================================================================
// Runtime Action Types
// =============================================================================

/**
 * Runtime action interface
 * This is the standardized format for actions that will be executed by the runtime
 */
export interface RuntimeAction {
  /** Unique action identifier */
  id: string;

  /** Action type (use ActionType enum or custom string) */
  type: string;

  /** Action payload/parameters */
  payload: Record<string, any>;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Execution status flag */
  executed?: boolean;

  /** Action priority (0-100, higher = more urgent) */
  priority?: number;

  /** Agent ID that created this action */
  agentId?: string;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Action execution status
 */
export enum ActionStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Retrying = 'retrying',
}

/**
 * Action metadata for execution control
 */
export interface ActionMetadata {
  /** Action priority (0-100) */
  priority?: number;

  /** Is this action retryable on failure */
  retryable?: boolean;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Dependencies (action IDs that must complete first) */
  dependencies?: string[];

  /** Maximum retry attempts */
  maxRetries?: number;

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Tags for categorization */
  tags?: string[];
}

/**
 * Runtime action with execution metadata
 */
export interface RuntimeActionWithMetadata extends RuntimeAction {
  /** Execution metadata */
  executionMetadata: ActionMetadata;
}

// =============================================================================
// Execution Result Types
// =============================================================================

/**
 * Simplified execution result
 * Core result information from action execution
 */
export interface ExecutionResult {
  /** Execution success flag */
  success: boolean;

  /** Transaction hash (for blockchain operations) */
  txHash?: Hash;

  /** Error message (if failed) */
  error?: string;

  /** Execution duration in milliseconds */
  duration?: number;

  /** Result data */
  data?: any;

  /** Retry count (if applicable) */
  retryCount?: number;
}

/**
 * Execution status enum
 * Tracks the current state of execution
 */
export enum ExecutionStatus {
  Idle = 'idle',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Retrying = 'retrying',
  Cancelled = 'cancelled',
  Timeout = 'timeout',
}

/**
 * Detailed execution result
 * Extended result with status and metadata
 */
export interface DetailedExecutionResult extends ExecutionResult {
  /** Step ID (if part of a plan) */
  stepId?: string;

  /** Execution status */
  status: ExecutionStatus;

  /** Transaction receipt (for blockchain operations) */
  txReceipt?: any;

  /** Dry run flag */
  dryRun?: boolean;

  /** Execution timestamp */
  executedAt?: Timestamp;
}

/**
 * Execution context
 * Tracks execution state across multiple actions
 */
export interface ExecutionContext {
  /** Task ID */
  taskId: string;

  /** Current step ID */
  currentStep?: string;

  /** Results map (stepId -> result) */
  results: Map<string, DetailedExecutionResult>;

  /** Execution start time */
  startTime: Timestamp;

  /** Execution end time */
  endTime?: Timestamp;

  /** Overall execution status */
  status: ExecutionStatus;

  /** Additional context data */
  metadata?: Record<string, any>;
}

// =============================================================================
// Executor Configuration
// =============================================================================

/**
 * Executor configuration
 * Controls executor behavior and constraints
 */
export interface ExecutorConfig {
  /** Maximum retry attempts */
  maxRetries?: number;

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Execution timeout in milliseconds */
  timeout?: number;

  /** Enable parallel execution */
  enableParallel?: boolean;

  /** Dry run mode (simulate without executing) */
  dryRun?: boolean;

  /** Maximum concurrent executions */
  maxConcurrent?: number;
}

// =============================================================================
// Action Handler Types
// =============================================================================

/**
 * Action handler function
 * Executes an action and returns a result
 */
export type ActionHandler = (
  params: Record<string, any>,
  context?: ExecutionContext
) => Promise<any>;

/**
 * Action handler registry entry
 */
export interface ActionHandlerEntry {
  /** Handler name */
  name: string;

  /** Handler function */
  handler: ActionHandler;

  /** Handler description */
  description?: string;

  /** Required parameters */
  requiredParams?: string[];

  /** Optional parameters */
  optionalParams?: string[];
}

// =============================================================================
// Conversion Utilities Types
// =============================================================================

/**
 * Options for converting LLM Action to RuntimeAction
 */
export interface ActionConversionOptions {
  /** Generate ID automatically */
  generateId?: boolean;

  /** Default priority */
  defaultPriority?: number;

  /** Add metadata */
  metadata?: Record<string, any>;

  /** Agent ID */
  agentId?: string;
}

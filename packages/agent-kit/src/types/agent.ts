/**
 * Agent Core Types
 * Central type definitions for AI agent configuration, state, and lifecycle
 */

import type { Address, Timestamp } from './common';

// =============================================================================
// Agent State
// =============================================================================

/**
 * Agent lifecycle states
 */
export enum AgentState {
  Created = 'created',
  Registered = 'registered',
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
  Terminated = 'terminated',
}

/**
 * Runtime agent state with additional information
 */
export interface AgentRuntimeState {
  status: 'idle' | 'running' | 'error' | 'paused';
  lastAction?: string;
  lastUpdated: Timestamp;
  error?: string;
}

// =============================================================================
// Agent Configuration
// =============================================================================

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Unique agent identifier */
  id?: string;

  /** Agent name */
  name: string;

  /** Agent description */
  description: string;

  /** Agent version */
  version?: string;

  /** Owner address */
  owner: string;

  /** LLM model name (e.g., "gpt-4-turbo", "claude-3-opus") */
  model?: string;

  /** Memory limit in entries */
  memoryLimit?: number;

  /** Max retry attempts for failed operations */
  maxRetries?: number;

  /** Auto-deploy agent on registration */
  autoDeploy?: boolean;

  /** Agent capabilities */
  capabilities?: string[];

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Agent Context
// =============================================================================

// Note: AgentContext is defined in runtime/context.ts
// Import from there for the full implementation

// =============================================================================
// Agent Tasks
// =============================================================================

/**
 * Agent task definition
 */
export interface AgentTask {
  /** Unique task ID */
  id: string;

  /** Task type (e.g., "transaction", "query", "analysis") */
  type: string;

  /** Task data/payload */
  data: any;

  /** Task priority (higher = more urgent) */
  priority?: number;

  /** Task creation timestamp */
  createdAt: Timestamp;

  /** Task deadline (optional) */
  deadline?: Timestamp;

  /** Task status */
  status?: 'pending' | 'running' | 'completed' | 'failed';

  /** Task result (if completed) */
  result?: any;

  /** Error information (if failed) */
  error?: string;
}

// =============================================================================
// Agent Options
// =============================================================================

/**
 * Agent initialization options
 */
export interface AgentOptions {
  /** Logger instance */
  logger?: any;

  /** Storage backend type */
  storageBackend?: 'memory' | 'file';

  /** Storage path for file-based storage */
  storagePath?: string;

  /** Memory backend type */
  memoryBackend?: 'memory' | 'file';

  /** Memory storage path */
  memoryPath?: string;

  /** Memory session ID */
  sessionId?: string;

  /** Enable memory tracking */
  enableMemory?: boolean;
}

// =============================================================================
// Agent Events
// =============================================================================

/**
 * Agent event types
 */
export interface AgentEvents {
  /** Agent started */
  started: { agentId: string | null };

  /** Agent stopped */
  stopped: { agentId: string | null };

  /** Event received from trigger */
  'event:received': any;

  /** Tasks planned */
  'tasks:planned': { tasks: any[] };

  /** Tasks executed */
  'tasks:executed': { results: any[] };

  /** Results stored */
  'results:stored': { taskId: string };

  /** Error occurred */
  error: { error: any; event?: any };
}

// =============================================================================
// Agent Status
// =============================================================================

/**
 * Agent status information
 */
export interface AgentStatus {
  /** Current agent state */
  state: AgentState;

  /** On-chain agent address */
  address: Address | null;

  /** Agent configuration summary */
  config: {
    name: string;
    description: string;
    owner: string;
  };

  /** Runtime information */
  runtime: {
    taskCount: number;
    triggerCount: number;
    isActive: boolean;
    isRegistered: boolean;
  };
}

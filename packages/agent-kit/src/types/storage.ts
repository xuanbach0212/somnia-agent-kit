/**
 * Storage Types
 * Types for agent state persistence
 */

import type { Address, Timestamp } from './common';
import type { RuntimeAction, ExecutionResult } from './action';

// =============================================================================
// Storage Backend
// =============================================================================

/**
 * Storage backend types
 */
export enum StorageBackend {
  Memory = 'memory',
  File = 'file',
}

/**
 * Storage type categories
 */
export enum StorageType {
  Memory = 'memory',
  LocalFile = 'local',
  OnChain = 'onchain',
  IPFS = 'ipfs',
}

// =============================================================================
// Event Storage
// =============================================================================

/**
 * Event entry for storage
 */
export interface EventEntry {
  /** Unique event ID */
  id: string;

  /** Event data */
  event: any;

  /** Event timestamp */
  timestamp: Timestamp;

  /** Agent ID that received the event */
  agentId?: Address;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Action Storage
// =============================================================================

/**
 * Action entry for storage
 */
export interface ActionEntry {
  /** Unique action ID */
  id: string;

  /** Action data (can be RuntimeAction or any legacy format) */
  action: RuntimeAction | any;

  /** Action result (can be ExecutionResult or any legacy format) */
  result?: ExecutionResult | any;

  /** Action status */
  status?: 'pending' | 'success' | 'failed';

  /** Action timestamp */
  timestamp: Timestamp;

  /** Agent ID that executed the action */
  agentId?: Address;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Storage Interface
// =============================================================================

/**
 * Base storage interface for agent events and actions
 */
export interface IStorage {
  /**
   * Save an event
   */
  saveEvent(event: any, metadata?: Record<string, any>): Promise<void>;

  /**
   * Save an action with optional result
   */
  saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void>;

  /**
   * Get all events
   */
  getEvents(filter?: any): Promise<EventEntry[]>;

  /**
   * Get all actions
   */
  getActions(filter?: any): Promise<ActionEntry[]>;

  /**
   * Get complete history (events + actions)
   */
  getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }>;

  /**
   * Clear all data
   */
  clear(): Promise<void>;

  /**
   * Get storage size
   */
  size(): Promise<{ events: number; actions: number }>;
}

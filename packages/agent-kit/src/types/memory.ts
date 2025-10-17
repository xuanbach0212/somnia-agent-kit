/**
 * Memory Types
 * Types for agent memory management
 */

import type { Timestamp } from './common';

// =============================================================================
// Memory Entry Types
// =============================================================================

/**
 * Memory entry type
 */
export type MemoryType = 'input' | 'output' | 'state' | 'system';

/**
 * Memory entry structure
 */
export interface MemoryEntry {
  /** Unique entry ID */
  id: string;

  /** Memory session ID */
  sessionId: string;

  /** Entry type */
  type: MemoryType;

  /** Entry content */
  content: any;

  /** Entry timestamp */
  timestamp: Timestamp;

  /** Token count (optional) */
  tokens?: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Memory Filter
// =============================================================================

/**
 * Memory filter options
 */
export interface MemoryFilter {
  /** Filter by memory type */
  type?: MemoryType;

  /** Filter from timestamp */
  fromTimestamp?: Timestamp;

  /** Filter to timestamp */
  toTimestamp?: Timestamp;

  /** Limit number of results */
  limit?: number;
}

// =============================================================================
// Memory Configuration
// =============================================================================

/**
 * Memory configuration
 */
export interface MemoryConfig {
  /** Memory backend instance */
  backend?: MemoryBackend;

  /** Memory session ID */
  sessionId?: string;

  /** Max tokens for context window */
  maxTokens?: number;

  /** Max entries to keep in memory */
  maxEntries?: number;

  /** Summarize old memories */
  summarizeOld?: boolean;
}

// =============================================================================
// Memory Backend Interface
// =============================================================================

/**
 * Memory backend interface
 */
export interface MemoryBackend {
  /**
   * Save memory entry
   */
  save(entry: MemoryEntry): Promise<void>;

  /**
   * Load memory entries
   */
  load(sessionId: string, filter?: MemoryFilter): Promise<MemoryEntry[]>;

  /**
   * Clear memory
   */
  clear(sessionId?: string): Promise<void>;

  /**
   * Get memory count
   */
  count(sessionId: string): Promise<number>;
}

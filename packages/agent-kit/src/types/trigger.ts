/**
 * Trigger Types
 * Types for event triggers and conditions
 */

import type { Timestamp } from './common';

// =============================================================================
// Trigger Types and Status
// =============================================================================

/**
 * Trigger type categories
 */
export enum TriggerType {
  Time = 'time',
  Event = 'event',
  Condition = 'condition',
  Manual = 'manual',
}

/**
 * Trigger status
 */
export enum TriggerStatus {
  Active = 'active',
  Inactive = 'inactive',
  Triggered = 'triggered',
  Expired = 'expired',
}

// =============================================================================
// Trigger Conditions
// =============================================================================

/**
 * Trigger condition
 */
export interface TriggerCondition {
  /** Condition type */
  type: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';

  /** Field to check */
  field: string;

  /** Expected value */
  value: any;
}

// =============================================================================
// Trigger Configuration
// =============================================================================

/**
 * Trigger configuration
 */
export interface TriggerConfig {
  /** Unique trigger ID */
  id: string;

  /** Trigger name */
  name: string;

  /** Trigger type */
  type: TriggerType;

  /** Trigger conditions */
  conditions?: TriggerCondition[];

  /** Schedule for time-based triggers (cron expression) */
  schedule?: string;

  /** Event name for event-based triggers */
  eventName?: string;

  /** Is trigger enabled */
  enabled: boolean;

  /** Action to execute when triggered */
  action: string;

  /** Action parameters */
  params?: Record<string, any>;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Last triggered timestamp */
  lastTriggeredAt?: Timestamp;

  /** Expiration timestamp (optional) */
  expiresAt?: Timestamp;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Trigger Interface
// =============================================================================

/**
 * Base interface for all trigger types
 */
export interface ITrigger {
  /**
   * Start the trigger and begin listening/executing
   * @param callback Function to call when trigger fires
   */
  start(callback: (data: any) => void): Promise<void>;

  /**
   * Stop the trigger and cleanup resources
   */
  stop(): Promise<void>;

  /**
   * Check if trigger is currently running
   */
  isRunning(): boolean;
}

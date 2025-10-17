/**
 * Event Triggers and Conditions
 * Defines conditions that trigger agent actions
 * Includes specialized trigger classes: OnChainTrigger, IntervalTrigger, WebhookTrigger
 */

import type { ChainClient } from '../core/chainClient';
import type { ethers } from 'ethers';
import type {
  ITrigger,
  TriggerCondition,
  TriggerConfig,
} from '../types/trigger';
import { TriggerType, TriggerStatus } from '../types/trigger'; // Import enums as values

// Re-export types for backward compatibility
export { TriggerType, TriggerStatus };
export type { ITrigger, TriggerCondition, TriggerConfig };

// =============================================================================
// Specialized Trigger Classes
// =============================================================================

/**
 * OnChainTrigger - Listens to blockchain events via ChainClient
 *
 * @example
 * const trigger = new OnChainTrigger(
 *   chainClient,
 *   agentRegistry,
 *   'AgentRegistered',
 *   { owner: '0x...' }
 * );
 * await trigger.start((event) => {
 *   console.log('Agent registered:', event.args);
 * });
 */
export class OnChainTrigger implements ITrigger {
  private running: boolean = false;
  private callback?: (data: any) => void;

  constructor(
    private client: ChainClient,
    private contract: ethers.Contract,
    private eventName: string,
    private filter?: any
  ) {}

  async start(callback: (data: any) => void): Promise<void> {
    if (this.running) {
      throw new Error('OnChainTrigger is already running');
    }

    this.callback = callback;
    this.running = true;

    // Listen to contract events
    const listener = (...args: any[]) => {
      const event = args[args.length - 1]; // Last arg is the event object
      if (this.callback) {
        this.callback({
          eventName: this.eventName,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          address: event.address,
        });
      }
    };

    if (this.filter) {
      this.contract.on(this.contract.filters[this.eventName](this.filter), listener);
    } else {
      this.contract.on(this.eventName, listener);
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.contract.removeAllListeners(this.eventName);
    this.running = false;
    this.callback = undefined;
  }

  isRunning(): boolean {
    return this.running;
  }
}

/**
 * IntervalTrigger - Executes callback at regular intervals
 *
 * @example
 * const trigger = new IntervalTrigger(60000, {
 *   startImmediately: true,
 *   maxExecutions: 100
 * });
 * await trigger.start(() => {
 *   console.log('Interval triggered');
 * });
 */
export class IntervalTrigger implements ITrigger {
  private running: boolean = false;
  private interval?: NodeJS.Timeout;
  private executions: number = 0;

  constructor(
    private intervalMs: number,
    private options?: {
      startImmediately?: boolean;
      maxExecutions?: number;
    }
  ) {}

  async start(callback: (data: any) => void): Promise<void> {
    if (this.running) {
      throw new Error('IntervalTrigger is already running');
    }

    this.running = true;
    this.executions = 0;

    // Execute immediately if requested
    if (this.options?.startImmediately) {
      callback({ execution: this.executions++, timestamp: Date.now() });
    }

    // Start interval
    this.interval = setInterval(() => {
      if (this.options?.maxExecutions && this.executions >= this.options.maxExecutions) {
        this.stop();
        return;
      }

      callback({
        execution: this.executions++,
        timestamp: Date.now(),
      });
    }, this.intervalMs);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  getExecutionCount(): number {
    return this.executions;
  }
}

/**
 * WebhookTrigger - Receives HTTP POST webhooks
 *
 * Note: Requires express package. Install with: npm install express @types/express
 *
 * @example
 * const trigger = new WebhookTrigger({
 *   port: 3000,
 *   path: '/webhook',
 *   secret: 'my-secret-key'
 * });
 * await trigger.start((data) => {
 *   console.log('Webhook received:', data.body);
 * });
 */
export class WebhookTrigger implements ITrigger {
  private running: boolean = false;
  private server?: any; // Express app
  private httpServer?: any;

  constructor(
    private options: {
      port: number;
      path: string;
      secret?: string;
      verifySignature?: (body: any, signature: string, secret: string) => boolean;
    }
  ) {}

  async start(callback: (data: any) => void): Promise<void> {
    if (this.running) {
      throw new Error('WebhookTrigger is already running');
    }

    try {
      // Dynamic import of express (optional dependency)
      const express = await import('express').catch(() => {
        throw new Error(
          'WebhookTrigger requires express. Install with: npm install express @types/express'
        );
      });

      const app = express.default();
      app.use(express.json());

      // Webhook endpoint
      app.post(this.options.path, (req: any, res: any) => {
        // Verify signature if secret is provided
        if (this.options.secret && req.headers['x-webhook-signature']) {
          const signature = req.headers['x-webhook-signature'];
          const verifyFn = this.options.verifySignature || this.defaultVerifySignature;

          if (!verifyFn(req.body, signature, this.options.secret)) {
            res.status(401).json({ error: 'Invalid signature' });
            return;
          }
        }

        // Call callback with webhook data
        callback({
          body: req.body,
          headers: req.headers,
          timestamp: Date.now(),
        });

        res.status(200).json({ success: true });
      });

      // Start server
      this.server = app;
      this.httpServer = await new Promise((resolve) => {
        const server = app.listen(this.options.port, () => {
          resolve(server);
        });
      });

      this.running = true;
    } catch (error) {
      throw new Error(`Failed to start WebhookTrigger: ${error}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => resolve());
      });
      this.httpServer = undefined;
    }

    this.server = undefined;
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  private defaultVerifySignature(body: any, signature: string, secret: string): boolean {
    // Simple HMAC verification (can be overridden)
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(body));
    const expected = hmac.digest('hex');
    return signature === expected;
  }

  getPort(): number {
    return this.options.port;
  }

  getPath(): string {
    return this.options.path;
  }
}

// =============================================================================
// Trigger Manager Class
// =============================================================================

/**
 * Trigger class for managing event triggers
 * Can also create specialized trigger instances via factory methods
 */
export class Trigger {
  private triggers: Map<string, TriggerConfig> = new Map();
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a trigger
   */
  register(config: Omit<TriggerConfig, 'id' | 'createdAt'>): string {
    const id = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullConfig: TriggerConfig = {
      id,
      createdAt: Date.now(),
      ...config,
    };

    this.triggers.set(id, fullConfig);

    // Setup trigger based on type
    if (config.enabled) {
      this.setupTrigger(fullConfig);
    }

    return id;
  }

  /**
   * Setup trigger based on type
   */
  private setupTrigger(config: TriggerConfig): void {
    switch (config.type) {
      case TriggerType.Time:
        this.setupTimeTrigger(config);
        break;
      case TriggerType.Event:
        this.setupEventTrigger(config);
        break;
      case TriggerType.Condition:
        // Condition triggers are checked manually
        break;
      case TriggerType.Manual:
        // Manual triggers are triggered explicitly
        break;
    }
  }

  /**
   * Setup time-based trigger
   */
  private setupTimeTrigger(config: TriggerConfig): void {
    if (!config.schedule) {
      return;
    }

    // Simple interval parsing (e.g., "*/5 * * * *" -> every 5 minutes)
    // In production, use a proper cron parser
    const intervalMs = this.parseSchedule(config.schedule);
    if (intervalMs) {
      const interval = setInterval(() => {
        this.fireTrigger(config.id, {});
      }, intervalMs);

      this.intervals.set(config.id, interval);
    }
  }

  /**
   * Parse schedule string to milliseconds
   */
  private parseSchedule(schedule: string): number | null {
    // Simplified schedule parsing
    // Format: "interval:seconds" (e.g., "interval:60" for every 60 seconds)
    const match = schedule.match(/^interval:(\d+)$/);
    if (match) {
      return parseInt(match[1]) * 1000;
    }
    return null;
  }

  /**
   * Setup event-based trigger
   */
  private setupEventTrigger(config: TriggerConfig): void {
    if (!config.eventName) {
      return;
    }

    // Register event listener
    const listener = (data: any) => {
      if (this.checkConditions(config, data)) {
        this.fireTrigger(config.id, data);
      }
    };

    const listeners = this.listeners.get(config.eventName) || [];
    listeners.push(listener);
    this.listeners.set(config.eventName, listeners);
  }

  /**
   * Check if trigger conditions are met
   */
  private checkConditions(config: TriggerConfig, data: any): boolean {
    if (!config.conditions || config.conditions.length === 0) {
      return true;
    }

    return config.conditions.every((condition) => {
      const fieldValue = this.getFieldValue(data, condition.field);

      switch (condition.type) {
        case 'eq':
          return fieldValue === condition.value;
        case 'ne':
          return fieldValue !== condition.value;
        case 'gt':
          return fieldValue > condition.value;
        case 'gte':
          return fieldValue >= condition.value;
        case 'lt':
          return fieldValue < condition.value;
        case 'lte':
          return fieldValue <= condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        default:
          return false;
      }
    });
  }

  /**
   * Get field value from data object
   */
  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Fire a trigger
   */
  private fireTrigger(triggerId: string, data: any): void {
    const config = this.triggers.get(triggerId);
    if (!config || !config.enabled) {
      return;
    }

    config.lastTriggeredAt = Date.now();

    // Emit trigger event
    this.emit('triggered', {
      triggerId,
      action: config.action,
      params: config.params,
      data,
    });
  }

  /**
   * Manually trigger
   */
  async trigger(triggerId: string, data?: any): Promise<void> {
    const config = this.triggers.get(triggerId);
    if (!config) {
      throw new Error(`Trigger not found: ${triggerId}`);
    }

    if (!config.enabled) {
      throw new Error(`Trigger is disabled: ${triggerId}`);
    }

    this.fireTrigger(triggerId, data || {});
  }

  /**
   * Emit event to listeners
   */
  emit(eventName: string, data: any): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Subscribe to events
   */
  on(eventName: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(eventName) || [];
    listeners.push(listener);
    this.listeners.set(eventName, listeners);
  }

  /**
   * Enable trigger
   */
  enable(triggerId: string): void {
    const config = this.triggers.get(triggerId);
    if (config) {
      config.enabled = true;
      this.setupTrigger(config);
    }
  }

  /**
   * Disable trigger
   */
  disable(triggerId: string): void {
    const config = this.triggers.get(triggerId);
    if (config) {
      config.enabled = false;

      // Clear interval if exists
      const interval = this.intervals.get(triggerId);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(triggerId);
      }
    }
  }

  /**
   * Get trigger configuration
   */
  getTrigger(triggerId: string): TriggerConfig | undefined {
    return this.triggers.get(triggerId);
  }

  /**
   * Get all triggers
   */
  getAllTriggers(): TriggerConfig[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Delete trigger
   */
  deleteTrigger(triggerId: string): boolean {
    this.disable(triggerId);
    return this.triggers.delete(triggerId);
  }

  /**
   * Cleanup all triggers
   */
  cleanup(): void {
    // Clear all intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.listeners.clear();
    this.triggers.clear();
  }

  // =============================================================================
  // Factory Methods for Specialized Triggers
  // =============================================================================

  /**
   * Create an OnChainTrigger for listening to blockchain events
   * @param client ChainClient instance
   * @param contract Contract instance
   * @param eventName Event name to listen for
   * @param filter Optional event filter
   * @returns OnChainTrigger instance
   *
   * @example
   * const onChainTrigger = trigger.createOnChainTrigger(
   *   chainClient,
   *   agentRegistry,
   *   'AgentRegistered'
   * );
   * await onChainTrigger.start((event) => {
   *   console.log('New agent:', event.args.agentId);
   * });
   */
  createOnChainTrigger(
    client: ChainClient,
    contract: ethers.Contract,
    eventName: string,
    filter?: any
  ): OnChainTrigger {
    return new OnChainTrigger(client, contract, eventName, filter);
  }

  /**
   * Create an IntervalTrigger for time-based execution
   * @param intervalMs Interval in milliseconds
   * @param options Optional configuration
   * @returns IntervalTrigger instance
   *
   * @example
   * const intervalTrigger = trigger.createIntervalTrigger(60000, {
   *   startImmediately: true
   * });
   * await intervalTrigger.start(() => {
   *   console.log('Every minute');
   * });
   */
  createIntervalTrigger(
    intervalMs: number,
    options?: {
      startImmediately?: boolean;
      maxExecutions?: number;
    }
  ): IntervalTrigger {
    return new IntervalTrigger(intervalMs, options);
  }

  /**
   * Create a WebhookTrigger for receiving HTTP webhooks
   * @param options Webhook configuration
   * @returns WebhookTrigger instance
   *
   * @example
   * const webhookTrigger = trigger.createWebhookTrigger({
   *   port: 3000,
   *   path: '/webhook',
   *   secret: 'my-secret'
   * });
   * await webhookTrigger.start((data) => {
   *   console.log('Webhook:', data.body);
   * });
   */
  createWebhookTrigger(options: {
    port: number;
    path: string;
    secret?: string;
    verifySignature?: (body: any, signature: string, secret: string) => boolean;
  }): WebhookTrigger {
    return new WebhookTrigger(options);
  }
}

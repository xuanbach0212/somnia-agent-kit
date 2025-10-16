/**
 * Event Triggers and Conditions
 * Defines conditions that trigger agent actions
 */

export enum TriggerType {
  Time = 'time',
  Event = 'event',
  Condition = 'condition',
  Manual = 'manual',
}

export enum TriggerStatus {
  Active = 'active',
  Inactive = 'inactive',
  Triggered = 'triggered',
  Expired = 'expired',
}

export interface TriggerCondition {
  type: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  field: string;
  value: any;
}

export interface TriggerConfig {
  id: string;
  name: string;
  type: TriggerType;
  conditions?: TriggerCondition[];
  schedule?: string; // Cron expression for time triggers
  eventName?: string; // Event name for event triggers
  enabled: boolean;
  action: string;
  params?: Record<string, any>;
  createdAt: number;
  lastTriggeredAt?: number;
}

/**
 * Trigger class for managing event triggers
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
}

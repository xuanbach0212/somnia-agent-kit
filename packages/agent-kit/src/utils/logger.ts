/**
 * Logging utilities and EventEmitter
 * @packageDocumentation
 */

// =============================================================================
// Event Emitter
// =============================================================================

export type EventListener<T = any> = (data: T) => void;

/**
 * Simple EventEmitter for custom event handling
 * Type-safe event emitter that can be used as a base class or via composition
 *
 * @example
 * class MyClass extends EventEmitter<{ data: string, status: number }> {
 *   doSomething() {
 *     this.emit('data', 'hello');
 *     this.emit('status', 200);
 *   }
 * }
 *
 * const obj = new MyClass();
 * obj.on('data', (msg) => console.log(msg));
 */
export class EventEmitter<TEvents extends Record<string, any> = Record<string, any>> {
  private listeners: Map<keyof TEvents, EventListener[]> = new Map();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param listener Event handler function
   * @returns Unsubscribe function
   */
  on<K extends keyof TEvents>(
    event: K,
    listener: EventListener<TEvents[K]>
  ): () => void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(listener);
    this.listeners.set(event, listeners);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event (one time only)
   * @param event Event name
   * @param listener Event handler function
   * @returns Unsubscribe function
   */
  once<K extends keyof TEvents>(
    event: K,
    listener: EventListener<TEvents[K]>
  ): () => void {
    const onceListener = (data: TEvents[K]) => {
      listener(data);
      this.off(event, onceListener);
    };
    return this.on(event, onceListener);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param listener Event handler to remove
   */
  off<K extends keyof TEvents>(
    event: K,
    listener: EventListener<TEvents[K]>
  ): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, listeners);
    }
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Event data
   */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Remove all listeners for an event or all events
   * @param event Optional event name (removes all if not provided)
   */
  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   * @param event Event name
   * @returns Number of listeners
   */
  listenerCount<K extends keyof TEvents>(event: K): number {
    const listeners = this.listeners.get(event);
    return listeners ? listeners.length : 0;
  }
}

// =============================================================================
// Logger Shortcuts
// =============================================================================

// Re-export Logger and LogLevel from monitor
export { Logger, LogLevel } from '../monitor/logger';
export type { LoggerConfig, LogEntry } from '../monitor/logger';

/**
 * Create a new logger instance
 * @param context Optional context name for log entries
 * @param config Optional logger configuration
 * @returns Logger instance
 *
 * @example
 * const logger = createLogger('MyService');
 * logger.info('Service started');
 *
 * @example
 * const logger = createLogger('MyService', { level: LogLevel.Debug });
 * logger.debug('Debug message');
 */
export function createLogger(context?: string, config?: any): any {
  const { Logger } = require('../monitor/logger');
  const logger = new Logger(config);

  if (context) {
    // Return a child logger with context
    return logger.child(context);
  }

  return logger;
}

/**
 * Core utility functions
 */

import { ethers } from 'ethers';

// =============================================================================
// Async Utilities
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError!;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get short address format
 */
export function shortAddress(address: string): string {
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// =============================================================================
// Hex and Data Conversion Utilities
// =============================================================================

/**
 * Convert value to hex string
 * @param value Number, bigint, or string to convert
 * @returns Hex string with 0x prefix
 *
 * @example
 * toHex(255) // "0xff"
 * toHex(1000000n) // "0xf4240"
 */
export function toHex(value: number | bigint | string): string {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value;
  }
  return ethers.toBeHex(value);
}

/**
 * Parse hex string to number
 * @param hex Hex string to parse
 * @returns Number value
 *
 * @example
 * fromHex("0xff") // 255
 */
export function fromHex(hex: string): number {
  return Number(ethers.getBigInt(hex));
}

/**
 * Convert bytes to hex string
 * @param bytes Uint8Array to convert
 * @returns Hex string with 0x prefix
 *
 * @example
 * bytesToHex(new Uint8Array([1, 2, 3])) // "0x010203"
 */
export function bytesToHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}

/**
 * Convert hex string to bytes
 * @param hex Hex string to convert
 * @returns Uint8Array
 *
 * @example
 * hexToBytes("0x010203") // Uint8Array([1, 2, 3])
 */
export function hexToBytes(hex: string): Uint8Array {
  return ethers.getBytes(hex);
}

/**
 * Convert string to UTF-8 bytes
 * @param str String to convert
 * @returns Uint8Array
 *
 * @example
 * toUtf8Bytes("hello") // Uint8Array([104, 101, 108, 108, 111])
 */
export function toUtf8Bytes(str: string): Uint8Array {
  return ethers.toUtf8Bytes(str);
}

/**
 * Convert UTF-8 bytes to string
 * @param bytes Uint8Array to convert
 * @returns String
 *
 * @example
 * toUtf8String(new Uint8Array([104, 101, 108, 108, 111])) // "hello"
 */
export function toUtf8String(bytes: Uint8Array): string {
  return ethers.toUtf8String(bytes);
}

/**
 * Compute keccak256 hash
 * @param data Data to hash (string or bytes)
 * @returns Hash as hex string
 *
 * @example
 * keccak256("hello") // "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
 */
export function keccak256(data: string | Uint8Array): string {
  return ethers.keccak256(
    typeof data === 'string' ? ethers.toUtf8Bytes(data) : data
  );
}

// =============================================================================
// Ether and Token Utilities
// =============================================================================

/**
 * Format wei to ether string
 * @param wei Wei amount (bigint or string)
 * @returns Ether string
 *
 * @example
 * formatEther(1000000000000000000n) // "1.0"
 */
export function formatEther(wei: bigint | string): string {
  return ethers.formatEther(wei);
}

/**
 * Parse ether string to wei
 * @param ether Ether amount as string
 * @returns Wei amount as bigint
 *
 * @example
 * parseEther("1.0") // 1000000000000000000n
 */
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
}

/**
 * Format token amount with decimals
 * @param value Token amount in smallest unit
 * @param decimals Token decimals
 * @returns Formatted string
 *
 * @example
 * formatUnits(1000000n, 6) // "1.0" (USDC)
 */
export function formatUnits(value: bigint | string, decimals: number): string {
  return ethers.formatUnits(value, decimals);
}

/**
 * Parse token amount with decimals
 * @param value Token amount as string
 * @param decimals Token decimals
 * @returns Amount in smallest unit as bigint
 *
 * @example
 * parseUnits("1.0", 6) // 1000000n (USDC)
 */
export function parseUnits(value: string, decimals: number): bigint {
  return ethers.parseUnits(value, decimals);
}

// =============================================================================
// Promise Utilities
// =============================================================================

/**
 * Delay execution and optionally return a value
 * @param ms Milliseconds to delay
 * @param value Optional value to return after delay
 * @returns Promise that resolves with value after delay
 *
 * @example
 * await delay(1000, "done") // Waits 1s, returns "done"
 */
export function delay<T = void>(ms: number, value?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
}

/**
 * Add timeout to a promise
 * @param promise Promise to add timeout to
 * @param ms Timeout in milliseconds
 * @param errorMessage Optional custom error message
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * await timeout(fetchData(), 5000, "Request timeout")
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Timeout after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

// =============================================================================
// Event Emitter Helper
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

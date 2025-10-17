/**
 * Shared Utilities
 * Common utilities for retry logic, encoding/decoding, validation, and logging
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * // Import retry utilities
 * import { retry, delay, timeout } from '@somnia/agent-kit/utils';
 *
 * // Import encoding utilities
 * import { toHex, keccak256, parseEther } from '@somnia/agent-kit/utils';
 *
 * // Import validation utilities
 * import { isValidAddress, shortAddress } from '@somnia/agent-kit/utils';
 *
 * // Import logger and event emitter
 * import { createLogger, EventEmitter } from '@somnia/agent-kit/utils';
 * ```
 */

// Retry logic and async utilities
export {
  sleep,
  retry,
  delay,
  timeout,
} from './retry';

// Encoding/decoding utilities
export {
  toHex,
  fromHex,
  bytesToHex,
  hexToBytes,
  toUtf8Bytes,
  toUtf8String,
  keccak256,
  formatEther,
  parseEther,
  formatUnits,
  parseUnits,
} from './encode';

// Validation helpers
export {
  isValidAddress,
  shortAddress,
  isValidHex,
  isValidChainId,
  sanitizeInput,
  isValidUrl,
} from './validate';

// Logger and event emitter
export {
  EventEmitter,
  Logger,
  LogLevel,
  createLogger,
} from './logger';

export type {
  EventListener,
  LoggerConfig,
  LogEntry,
} from './logger';

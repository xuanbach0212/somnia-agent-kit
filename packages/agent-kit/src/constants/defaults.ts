/**
 * Default Constants for Somnia Agent Kit
 * Centralized configuration values to avoid magic numbers
 */

// =============================================================================
// Time Constants
// =============================================================================

/**
 * Time durations in milliseconds
 */
export const TIME = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// =============================================================================
// Limits & Thresholds
// =============================================================================

/**
 * System limits for various operations
 */
export const LIMITS = {
  // Metrics
  MAX_METRICS: 10_000,
  MAX_METRIC_RETENTION: TIME.ONE_DAY,

  // Planning
  MAX_PLAN_STEPS: 50,
  MAX_PARALLEL_STEPS: 10,

  // Execution
  MAX_RETRIES: 3,
  MAX_RETRY_DELAY: 10 * TIME.ONE_SECOND,

  // Memory
  MAX_MEMORY_ENTRIES: 1000,
  MAX_CONVERSATION_LENGTH: 50,

  // Gas
  DEFAULT_GAS_LIMIT: 3_000_000n,
  MAX_GAS_LIMIT: 30_000_000n,
  GAS_BUFFER_PERCENT: 20, // Add 20% buffer to estimates
} as const;

// =============================================================================
// Timeouts
// =============================================================================

/**
 * Timeout durations for various operations
 */
export const TIMEOUTS = {
  // RPC
  DEFAULT_RPC: 10 * TIME.ONE_SECOND,
  FAST_RPC: 5 * TIME.ONE_SECOND,
  SLOW_RPC: 30 * TIME.ONE_SECOND,

  // Execution
  DEFAULT_EXECUTION: 30 * TIME.ONE_SECOND,
  LONG_EXECUTION: 2 * TIME.ONE_MINUTE,

  // LLM
  DEFAULT_LLM: 30 * TIME.ONE_SECOND,
  STREAMING_LLM: 60 * TIME.ONE_SECOND,

  // Monitoring
  DEFAULT_TELEMETRY: 60 * TIME.ONE_SECOND,
  METRICS_EXPORT: 60 * TIME.ONE_SECOND,

  // Network
  HTTP_REQUEST: 30 * TIME.ONE_SECOND,
  WEBSOCKET_RECONNECT: 5 * TIME.ONE_SECOND,
} as const;

// =============================================================================
// Retry Configuration
// =============================================================================

/**
 * Retry strategy defaults
 */
export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: TIME.ONE_SECOND,
  BACKOFF_MULTIPLIER: 2,
  MAX_DELAY: 10 * TIME.ONE_SECOND,
  JITTER_MS: 100, // Random jitter to avoid thundering herd
} as const;

// =============================================================================
// Network Defaults
// =============================================================================

/**
 * Network-related defaults
 */
export const NETWORK = {
  DEFAULT_CONFIRMATION_BLOCKS: 1,
  SAFE_CONFIRMATION_BLOCKS: 3,
  FINALITY_BLOCKS: 12,
  
  DEFAULT_GAS_PRICE_MULTIPLIER: 1.1, // 10% over estimate
  FAST_GAS_PRICE_MULTIPLIER: 1.25, // 25% over estimate
} as const;

// =============================================================================
// Storage Defaults
// =============================================================================

/**
 * Storage configuration defaults
 */
export const STORAGE = {
  DEFAULT_CACHE_TTL: TIME.ONE_HOUR,
  MAX_CACHE_SIZE: 100, // Max items in cache
  FILE_CLEANUP_INTERVAL: TIME.ONE_DAY,
} as const;

// =============================================================================
// Log Levels
// =============================================================================

/**
 * Default log level based on environment
 */
export const LOG = {
  DEFAULT_LEVEL: 'info',
  PRODUCTION_LEVEL: 'warn',
  DEVELOPMENT_LEVEL: 'debug',
  TEST_LEVEL: 'error',
} as const;

// =============================================================================
// API Rate Limits
// =============================================================================

/**
 * API rate limiting defaults
 */
export const RATE_LIMIT = {
  // Requests per time window
  MAX_REQUESTS_PER_SECOND: 10,
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_REQUESTS_PER_HOUR: 1000,

  // Throttle delays
  MIN_REQUEST_INTERVAL: 100, // ms between requests
  BURST_SIZE: 5, // Allow burst of N requests
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate backoff delay with exponential backoff
 */
export function calculateBackoff(
  attempt: number,
  initialDelay: number = RETRY.INITIAL_DELAY,
  multiplier: number = RETRY.BACKOFF_MULTIPLIER,
  maxDelay: number = RETRY.MAX_DELAY,
  jitter: number = RETRY.JITTER_MS
): number {
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  const jitterAmount = Math.random() * jitter;
  return Math.floor(cappedDelay + jitterAmount);
}

/**
 * Convert gas limit to bigint with buffer
 */
export function addGasBuffer(gasEstimate: bigint, bufferPercent = LIMITS.GAS_BUFFER_PERCENT): bigint {
  return (gasEstimate * BigInt(100 + bufferPercent)) / 100n;
}

/**
 * Check if value is within limits
 */
export function isWithinLimit(value: number, limit: number): boolean {
  return value <= limit;
}

/**
 * Get environment-specific log level
 */
export function getDefaultLogLevel(): string {
  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'production':
      return LOG.PRODUCTION_LEVEL;
    case 'test':
      return LOG.TEST_LEVEL;
    default:
      return LOG.DEVELOPMENT_LEVEL;
  }
}


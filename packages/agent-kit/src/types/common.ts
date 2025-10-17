/**
 * Common Shared Types
 * Utility types used across the SDK
 */

/**
 * Standard result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Nullable type (allows null)
 */
export type Nullable<T> = T | null;

/**
 * Optional type (allows undefined)
 */
export type Optional<T> = T | undefined;

/**
 * Unix timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * Ethereum address (0x-prefixed hex string)
 */
export type Address = string;

/**
 * Transaction or block hash (0x-prefixed hex string)
 */
export type Hash = string;

/**
 * Generic key-value record
 */
export type Record<K extends string | number | symbol, V> = { [P in K]: V };

/**
 * Deep partial type (makes all nested properties optional)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

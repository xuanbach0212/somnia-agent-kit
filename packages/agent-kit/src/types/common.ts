/**
 * Common utility types used throughout the SDK
 * These replace unsafe 'any' types with proper TypeScript generics
 */

// =============================================================================
// Primitive Type Aliases
// =============================================================================

/**
 * Ethereum address (0x-prefixed hex string)
 */
export type Address = string;

/**
 * Transaction or block hash (0x-prefixed hex string)
 */
export type Hash = string;

/**
 * Unix timestamp in milliseconds
 */
export type Timestamp = number;

// =============================================================================
// JSON-Serializable Types
// =============================================================================

/**
 * JSON-serializable value
 * Use this instead of 'any' for data that will be serialized
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * JSON-serializable object
 * Use this for configuration objects, API responses, etc.
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * JSON-serializable array
 */
export type JsonArray = JsonValue[];

/**
 * Generic record with string keys and unknown values
 * Use this instead of Record<string, any>
 */
export type StringRecord = Record<string, unknown>;

/**
 * Function that takes any parameters and returns a promise
 * Used for async handlers
 */
export type AsyncHandler<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<TResult>;

/**
 * Function that takes any parameters and returns a value
 * Used for sync handlers
 */
export type SyncHandler<TParams = unknown, TResult = unknown> = (
  params: TParams
) => TResult;

/**
 * Callback function type
 */
export type Callback<TData = unknown> = (data: TData) => void;

/**
 * Async callback function type
 */
export type AsyncCallback<TData = unknown> = (data: TData) => Promise<void>;

/**
 * Error handler function
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Async error handler function
 */
export type AsyncErrorHandler = (error: Error) => Promise<void>;

/**
 * Goal or task data - flexible structure
 */
export type Goal = {
  type?: string;
  data?: JsonObject;
  description?: string;
} & JsonObject;

/**
 * Context data passed to planners and executors
 */
export interface Context {
  [key: string]: JsonValue;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Type guard to check if value is JsonValue
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (type === 'object') {
    return Object.values(value as object).every(isJsonValue);
  }

  return false;
}

/**
 * Type guard to check if value is JsonObject
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isJsonValue)
  );
}

/**
 * Type guard to check if value is Goal
 */
export function isGoal(value: unknown): value is Goal {
  return isJsonObject(value);
}

/**
 * Type guard to check if value is Context
 */
export function isContext(value: unknown): value is Context {
  return isJsonObject(value);
}

/**
 * Safe JSON stringify that handles circular references
 */
export function safeStringify(value: unknown, indent?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    },
    indent
  );
}

/**
 * Deep clone JSON-serializable value
 */
export function deepClone<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Merge two objects deeply
 */
export function deepMerge<T extends JsonObject>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isJsonObject(sourceValue) && isJsonObject(targetValue)) {
      result[key] = deepMerge(
        targetValue as JsonObject,
        sourceValue as JsonObject
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

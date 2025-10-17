/**
 * Configuration for Somnia Agent Kit
 *
 * @deprecated This file is kept for backward compatibility.
 * Please import from '@somnia/agent-kit/config' instead.
 *
 * @example Migration
 * ```typescript
 * // Old (still works):
 * import { loadConfig, DEFAULT_CONFIG } from './core/config';
 *
 * // New (recommended):
 * import { mergeConfig, DEFAULT_CONFIG } from '@somnia/agent-kit/config';
 * ```
 */

// Re-export everything from the new config folder
export * from '../config';

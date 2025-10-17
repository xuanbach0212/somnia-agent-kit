/**
 * Default Configuration Values
 * Built-in defaults for plug-and-play SDK experience
 */

import type { SDKConfig, RuntimeConfig, AgentKitConfig } from '../types/config';

/**
 * Default SDK configuration
 * Optimized for development with safe defaults
 */
export const DEFAULT_SDK_CONFIG: SDKConfig = {
  debug: false,
  telemetry: false,
  logLevel: 'info',
  llmProvider: 'openai',
  defaultTimeout: 30000, // 30 seconds
  maxRetries: 3,
  autoRecover: false,
};

/**
 * Default runtime configuration
 * Balanced for most use cases
 */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  maxConcurrent: 5,
  enableParallel: true,
  dryRun: false,
  memoryLimit: 1000,
  storageBackend: 'memory',
  memoryBackend: 'memory',
  enableMemory: true,
};

/**
 * Default agent kit configuration
 * Partial config with sensible defaults
 */
export const DEFAULT_AGENT_CONFIG = {
  defaultGasLimit: 3000000n,
  logLevel: 'info' as const,
  metricsEnabled: false,
  telemetryEnabled: false,
};

/**
 * Complete default configuration
 * Ready-to-use for quick start (requires network & contracts to be provided)
 *
 * @example
 * ```typescript
 * import { DEFAULT_CONFIG, SOMNIA_NETWORKS } from '@somnia/agent-kit/config';
 *
 * const config = {
 *   ...DEFAULT_CONFIG,
 *   network: SOMNIA_NETWORKS.testnet,
 *   contracts: {
 *     agentRegistry: '0x...',
 *     agentExecutor: '0x...'
 *   }
 * };
 * ```
 */
export const DEFAULT_CONFIG: Partial<AgentKitConfig> = {
  ...DEFAULT_AGENT_CONFIG,
  // Network and contracts must be provided by user or .env
};

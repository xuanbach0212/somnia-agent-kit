/**
 * Configuration Merging
 * Merges configurations with priority: User Config > Environment > Defaults
 */

import type { AgentKitConfig } from '../types/config';
import { DEFAULT_CONFIG } from './defaults';
import { loadAgentConfigFromEnv } from './env';
import { validateAgentConfig } from './validator';

/**
 * Merge options for configuration merging
 */
export interface MergeOptions {
  /**
   * Use deep merge instead of shallow merge
   * Deep merge properly handles nested objects but is slightly slower
   * @default false
   */
  deep?: boolean;
}

/**
 * Merge configurations with priority order:
 * 1. User-provided config (highest priority)
 * 2. Environment variables
 * 3. Default values (lowest priority)
 *
 * @param userConfig Optional user-provided configuration
 * @param options Merge options (deep merge, etc.)
 * @returns Complete validated configuration
 *
 * @example Shallow merge (default, faster)
 * ```typescript
 * const config = mergeConfig({
 *   network: SOMNIA_NETWORKS.testnet,
 *   contracts: {
 *     agentRegistry: '0x...',
 *     agentExecutor: '0x...'
 *   }
 * });
 * ```
 *
 * @example Deep merge (better for nested objects)
 * ```typescript
 * const config = mergeConfig(
 *   {
 *     llmProvider: {
 *       options: {
 *         temperature: 0.7
 *       }
 *     }
 *   },
 *   { deep: true }
 * );
 * ```
 */
export function mergeConfig(
  userConfig?: Partial<AgentKitConfig>,
  options?: MergeOptions
): AgentKitConfig {
  // Use deep merge if requested
  if (options?.deep) {
    const deepmerge = require('deepmerge');
    const envConfig = loadAgentConfigFromEnv();

    const merged = deepmerge.all([
      DEFAULT_CONFIG,
      envConfig,
      userConfig || {},
    ]) as AgentKitConfig;

    validateAgentConfig(merged);
    return merged;
  }
  // Start with defaults
  const config: any = {
    ...DEFAULT_CONFIG,
  };

  // Merge with environment variables (medium priority)
  const envConfig = loadAgentConfigFromEnv();
  if (envConfig.network) {
    config.network = envConfig.network;
  }
  if (envConfig.contracts) {
    config.contracts = { ...config.contracts, ...envConfig.contracts };
  }
  if (envConfig.privateKey) {
    config.privateKey = envConfig.privateKey;
  }
  if (envConfig.llmProvider) {
    config.llmProvider = envConfig.llmProvider;
  }
  if (envConfig.defaultGasLimit !== undefined) {
    config.defaultGasLimit = envConfig.defaultGasLimit;
  }
  if (envConfig.logLevel) {
    config.logLevel = envConfig.logLevel;
  }
  if (envConfig.metricsEnabled !== undefined) {
    config.metricsEnabled = envConfig.metricsEnabled;
  }

  // Merge with user-provided config (highest priority)
  if (userConfig) {
    if (userConfig.network) {
      config.network = { ...config.network, ...userConfig.network };
    }
    if (userConfig.contracts) {
      config.contracts = { ...config.contracts, ...userConfig.contracts };
    }
    if (userConfig.privateKey !== undefined) {
      config.privateKey = userConfig.privateKey;
    }
    if (userConfig.llmProvider) {
      config.llmProvider = {
        ...config.llmProvider,
        ...userConfig.llmProvider,
      };
    }
    if (userConfig.defaultGasLimit !== undefined) {
      config.defaultGasLimit = userConfig.defaultGasLimit;
    }
    if (userConfig.logLevel) {
      config.logLevel = userConfig.logLevel;
    }
    if (userConfig.metricsEnabled !== undefined) {
      config.metricsEnabled = userConfig.metricsEnabled;
    }
  }

  // Validate the final config
  validateAgentConfig(config);

  return config as AgentKitConfig;
}

/**
 * Create configuration from environment variables only
 * Convenience function that loads everything from .env
 *
 * @returns Complete validated configuration from environment
 * @throws Error if required environment variables are missing
 *
 * @example
 * ```typescript
 * // .env file:
 * // SOMNIA_RPC_URL=https://dream-rpc.somnia.network
 * // AGENT_REGISTRY_ADDRESS=0x...
 * // AGENT_EXECUTOR_ADDRESS=0x...
 *
 * const config = createConfigFromEnv();
 * const kit = new SomniaAgentKit(config);
 * ```
 */
export function createConfigFromEnv(): AgentKitConfig {
  const envConfig = loadAgentConfigFromEnv();

  if (!envConfig.network) {
    throw new Error(
      'SOMNIA_RPC_URL environment variable is required when using createConfigFromEnv()'
    );
  }

  if (!envConfig.contracts?.agentRegistry || !envConfig.contracts?.agentExecutor) {
    throw new Error(
      'AGENT_REGISTRY_ADDRESS and AGENT_EXECUTOR_ADDRESS environment variables are required when using createConfigFromEnv()'
    );
  }

  return mergeConfig(envConfig);
}

// Legacy alias for backward compatibility
/** @deprecated Use mergeConfig instead */
export const loadConfig = mergeConfig;

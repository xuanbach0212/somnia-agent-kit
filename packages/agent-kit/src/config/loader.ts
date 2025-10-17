/**
 * Configuration Loader
 * Auto-loads .env and performs deep merge of configurations
 *
 * This module provides automatic configuration loading with:
 * - dotenv integration for .env file loading
 * - deepmerge for proper nested object merging
 * - Validation before returning config
 */

import dotenv from 'dotenv';
import deepmerge from 'deepmerge';
import type {
  AgentKitConfig,
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
} from '../types/config';
import {
  DEFAULT_CONFIG,
  DEFAULT_SDK_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
} from './defaults';
import {
  loadAgentConfigFromEnv,
  loadSDKConfigFromEnv,
  loadRuntimeConfigFromEnv,
} from './env';
import { validateAgentConfig } from './validator';

// Auto-load .env file on module import
dotenv.config();

/**
 * Load complete configuration with automatic .env loading and deep merging
 *
 * Priority (highest to lowest):
 * 1. User-provided config
 * 2. Environment variables (.env file)
 * 3. Default values
 *
 * Features:
 * - Auto-loads .env file
 * - Deep merges nested objects
 * - Validates result before returning
 *
 * @param userConfig Optional user-provided configuration
 * @returns Complete validated configuration
 *
 * @example Basic usage (auto-loads from .env)
 * ```typescript
 * import { loadConfig } from '@somnia/agent-kit';
 *
 * // Automatically loads from .env and merges with defaults
 * const config = loadConfig();
 * ```
 *
 * @example With overrides
 * ```typescript
 * import { loadConfig, SOMNIA_NETWORKS } from '@somnia/agent-kit';
 *
 * const config = loadConfig({
 *   network: SOMNIA_NETWORKS.mainnet,
 *   sdk: { debug: true }
 * });
 * ```
 */
export function loadConfig(
  userConfig?: Partial<AgentKitConfig>
): AgentKitConfig {
  // Load from environment
  const envConfig = loadAgentConfigFromEnv();

  // Deep merge: Defaults <- Env <- User (priority increases →)
  const merged = deepmerge.all([
    DEFAULT_CONFIG,
    envConfig,
    userConfig || {},
  ]) as AgentKitConfig;

  // Validate final configuration
  validateAgentConfig(merged);

  return merged;
}

/**
 * Load complete solution configuration (Agent + SDK + Runtime)
 * with automatic .env loading and deep merging
 *
 * @param userConfig Optional user-provided configuration
 * @returns Complete solution configuration
 *
 * @example Load everything from .env
 * ```typescript
 * import { loadCompleteSolutionConfig } from '@somnia/agent-kit';
 *
 * const config = loadCompleteSolutionConfig();
 *
 * // Access different layers
 * console.log(config.network);        // Agent config
 * console.log(config.sdk.debug);      // SDK config
 * console.log(config.runtime.dryRun); // Runtime config
 * ```
 *
 * @example With custom values
 * ```typescript
 * const config = loadCompleteSolutionConfig({
 *   network: SOMNIA_NETWORKS.testnet,
 *   sdk: {
 *     debug: true,
 *     maxRetries: 5
 *   },
 *   runtime: {
 *     maxConcurrent: 10,
 *     dryRun: true
 *   }
 * });
 * ```
 */
export function loadCompleteSolutionConfig(
  userConfig?: Partial<CompleteSolutionConfig>
): CompleteSolutionConfig {
  // Load from environment
  const agentConfig = loadAgentConfigFromEnv();
  const sdkConfig = loadSDKConfigFromEnv();
  const runtimeConfig = loadRuntimeConfigFromEnv();

  // Combine into complete solution
  const envSolutionConfig: Partial<CompleteSolutionConfig> = {
    ...agentConfig,
    sdk: sdkConfig,
    runtime: runtimeConfig,
  };

  // Default solution config
  const defaultSolutionConfig: Partial<CompleteSolutionConfig> = {
    ...DEFAULT_CONFIG,
    sdk: DEFAULT_SDK_CONFIG,
    runtime: DEFAULT_RUNTIME_CONFIG,
  };

  // Deep merge: Defaults <- Env <- User
  const merged = deepmerge.all([
    defaultSolutionConfig,
    envSolutionConfig,
    userConfig || {},
  ]) as CompleteSolutionConfig;

  // Validate agent config portion
  validateAgentConfig(merged);

  return merged;
}

/**
 * Load SDK configuration from .env with deep merge
 *
 * @param userConfig Optional user-provided SDK configuration
 * @returns Complete SDK configuration
 *
 * @example
 * ```typescript
 * import { loadSDKConfig } from '@somnia/agent-kit';
 *
 * const sdkConfig = loadSDKConfig({
 *   debug: true,
 *   maxRetries: 5
 * });
 * ```
 */
export function loadSDKConfig(userConfig?: Partial<SDKConfig>): SDKConfig {
  const envConfig = loadSDKConfigFromEnv();

  return deepmerge.all([
    DEFAULT_SDK_CONFIG,
    envConfig,
    userConfig || {},
  ]) as SDKConfig;
}

/**
 * Load runtime configuration from .env with deep merge
 *
 * @param userConfig Optional user-provided runtime configuration
 * @returns Complete runtime configuration
 *
 * @example
 * ```typescript
 * import { loadRuntimeConfig } from '@somnia/agent-kit';
 *
 * const runtimeConfig = loadRuntimeConfig({
 *   maxConcurrent: 10,
 *   dryRun: true
 * });
 * ```
 */
export function loadRuntimeConfig(
  userConfig?: Partial<RuntimeConfig>
): RuntimeConfig {
  const envConfig = loadRuntimeConfigFromEnv();

  return deepmerge.all([
    DEFAULT_RUNTIME_CONFIG,
    envConfig,
    userConfig || {},
  ]) as RuntimeConfig;
}

/**
 * Reload .env file (useful for testing or dynamic config changes)
 *
 * By default, dotenv only loads .env once. This function allows
 * reloading with override enabled.
 *
 * @example
 * ```typescript
 * import { reloadEnv, loadConfig } from '@somnia/agent-kit';
 *
 * // Modify .env file programmatically or externally
 * // ...
 *
 * // Reload .env
 * reloadEnv();
 *
 * // Load config with new values
 * const config = loadConfig();
 * ```
 */
export function reloadEnv(): void {
  dotenv.config({ override: true });
}

/**
 * Get current environment variable values (for debugging)
 *
 * @returns Object with all SOMNIA_*, AGENT_*, SDK_*, RUNTIME_* env vars
 *
 * @example
 * ```typescript
 * import { getEnvVars } from '@somnia/agent-kit';
 *
 * const envVars = getEnvVars();
 * console.log('RPC URL:', envVars.SOMNIA_RPC_URL);
 * console.log('Debug mode:', envVars.SDK_DEBUG);
 * ```
 */
export function getEnvVars(): Record<string, string | undefined> {
  const envVars: Record<string, string | undefined> = {};

  // Collect all relevant environment variables
  const prefixes = ['SOMNIA_', 'AGENT_', 'SDK_', 'RUNTIME_', 'OPENAI_', 'OLLAMA_', 'PRIVATE_KEY', 'LOG_LEVEL', 'METRICS_ENABLED'];

  for (const [key, value] of Object.entries(process.env)) {
    if (prefixes.some(prefix => key.startsWith(prefix)) || key === 'PRIVATE_KEY' || key === 'LOG_LEVEL' || key === 'METRICS_ENABLED') {
      envVars[key] = value;
    }
  }

  return envVars;
}

/**
 * Configuration Layer
 * Central configuration management for Somnia Agent Kit
 *
 * @module config
 *
 * @example
 * ```typescript
 * // Import defaults
 * import { DEFAULT_CONFIG, DEFAULT_SDK_CONFIG } from '@somnia/agent-kit/config';
 *
 * // Import networks
 * import { SOMNIA_NETWORKS, getNetwork } from '@somnia/agent-kit/config';
 *
 * // Import loaders
 * import { loadAgentConfigFromEnv, mergeConfig } from '@somnia/agent-kit/config';
 *
 * // Import validators
 * import { validateAgentConfig } from '@somnia/agent-kit/config';
 * ```
 */

// =============================================================================
// Internal Imports (for singleton implementation)
// =============================================================================
import type { AgentKitConfig } from '../types/config';
import { loadConfig as _loadConfig } from './loader';
import { DEFAULT_CONFIG as _DEFAULT_CONFIG } from './defaults';
import { DEFAULT_NETWORK as _DEFAULT_NETWORK } from './networks';

// =============================================================================
// Type Re-exports
// =============================================================================
export type {
  NetworkConfig,
  ContractAddresses,
  LLMProviderConfig,
  AgentKitConfig,
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
} from '../types/config';

// =============================================================================
// Defaults
// =============================================================================
export {
  DEFAULT_CONFIG,
  DEFAULT_SDK_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
  DEFAULT_AGENT_CONFIG,
} from './defaults';

// =============================================================================
// Networks
// =============================================================================
export {
  SOMNIA_NETWORKS,
  DEFAULT_NETWORK,
  getNetwork,
  isValidNetwork,
} from './networks';

// =============================================================================
// Environment Loaders
// =============================================================================
export {
  loadAgentConfigFromEnv,
  loadSDKConfigFromEnv,
  loadRuntimeConfigFromEnv,
  loadFromEnv, // Legacy alias
} from './env';

// =============================================================================
// Validation
// =============================================================================
export {
  validateAgentConfig,
  validateSDKConfig,
  validateRuntimeConfig,
  validateConfig, // Legacy alias
} from './validator';

// =============================================================================
// Merging (Manual Control)
// =============================================================================
export {
  mergeConfig,
  createConfigFromEnv,
  loadConfig as mergeConfigLegacy, // Legacy alias, prefer loader's loadConfig
} from './merger';
export type { MergeOptions } from './merger';

// =============================================================================
// Configuration Loader (Auto dotenv + Deep Merge) - RECOMMENDED
// =============================================================================
export {
  loadConfig,
  loadCompleteSolutionConfig,
  loadSDKConfig as loadSDKConfigAuto,
  loadRuntimeConfig as loadRuntimeConfigAuto,
  reloadEnv,
  getEnvVars,
} from './loader';

// =============================================================================
// Singleton Config Instance (Optional - For Quick Start)
// =============================================================================

/**
 * Global config instance cache
 * @internal
 */
let _globalConfig: AgentKitConfig | null = null;

/**
 * Get global config instance (lazy-loaded)
 *
 * Loads config on first call, then caches for subsequent calls.
 * Use this for better control than direct `config` export.
 *
 * @param reload Force reload config (useful for testing)
 * @returns Global config instance
 *
 * @example Lazy loading
 * ```typescript
 * import { getConfig } from '@somnia/agent-kit/config';
 *
 * // First call loads config
 * const config = getConfig();
 *
 * // Subsequent calls return cached config
 * const sameConfig = getConfig();
 *
 * // Force reload
 * const freshConfig = getConfig(true);
 * ```
 */
export function getConfig(reload = false): AgentKitConfig {
  if (!_globalConfig || reload) {
    try {
      _globalConfig = _loadConfig();
    } catch (error: any) {
      // If env vars missing, return partial config with defaults
      console.warn('⚠️  Failed to load complete config:', error.message);
      console.warn('Using defaults. Set SOMNIA_RPC_URL, AGENT_REGISTRY_ADDRESS, AGENT_EXECUTOR_ADDRESS in .env');

      // Return minimal config with defaults (will fail validation but allows SDK to load)
      _globalConfig = {
        ..._DEFAULT_CONFIG,
        network: _DEFAULT_NETWORK,
        contracts: {
          agentRegistry: '0x0000000000000000000000000000000000000000',
          agentExecutor: '0x0000000000000000000000000000000000000000',
        },
      } as AgentKitConfig;
    }
  }
  return _globalConfig;
}

/**
 * Set global config instance
 *
 * Useful for testing or custom initialization.
 *
 * @param newConfig New config to set
 *
 * @example Testing setup
 * ```typescript
 * import { setConfig, getConfig } from '@somnia/agent-kit/config';
 *
 * // In test setup
 * setConfig({
 *   network: SOMNIA_NETWORKS.devnet,
 *   contracts: {
 *     agentRegistry: '0x...',
 *     agentExecutor: '0x...'
 *   }
 * });
 *
 * // Test code uses global config
 * const config = getConfig();
 * ```
 */
export function setConfig(newConfig: AgentKitConfig): void {
  _globalConfig = newConfig;
}

/**
 * Reset global config (useful for testing)
 *
 * @example Test teardown
 * ```typescript
 * import { resetConfig } from '@somnia/agent-kit/config';
 *
 * afterEach(() => {
 *   resetConfig();
 * });
 * ```
 */
export function resetConfig(): void {
  _globalConfig = null;
}

/**
 * Global config instance (eager-loaded)
 *
 * ⚠️ WARNING: This immediately loads .env when imported!
 *
 * **Use Cases:**
 * - Quick prototyping
 * - Simple scripts
 * - When you're sure .env is properly configured
 *
 * **NOT recommended for:**
 * - Libraries (use loadConfig() instead)
 * - Tests (use getConfig() with resetConfig())
 * - Complex apps (use loadConfig() for control)
 *
 * @example Quick start
 * ```typescript
 * import { config } from '@somnia/agent-kit/config';
 * import { SomniaAgentKit } from '@somnia/agent-kit';
 *
 * const kit = new SomniaAgentKit(config);
 * await kit.initialize();
 * ```
 *
 * @example Better approach (lazy loading)
 * ```typescript
 * import { getConfig } from '@somnia/agent-kit/config';
 *
 * // Lazy-loaded, no side effects on import
 * const config = getConfig();
 * ```
 */
export const config = getConfig();

// =============================================================================
// Usage Examples
// =============================================================================

/**
 * @example Pattern 1: Singleton (Quick Start) ⚡
 * ```typescript
 * import { SomniaAgentKit, config } from '@somnia/agent-kit';
 *
 * // Config auto-loaded from .env
 * const kit = new SomniaAgentKit(config);
 * ```
 *
 * @example Pattern 2: Lazy Singleton (Recommended) ✅
 * ```typescript
 * import { SomniaAgentKit, getConfig } from '@somnia/agent-kit';
 *
 * // Loads on first call, cached afterward
 * const config = getConfig();
 * const kit = new SomniaAgentKit(config);
 * ```
 *
 * @example Pattern 3: Manual Loading (Full Control) 🎛️
 * ```typescript
 * import { SomniaAgentKit, loadConfig, SOMNIA_NETWORKS } from '@somnia/agent-kit';
 *
 * // Full control over loading
 * const config = loadConfig({
 *   network: SOMNIA_NETWORKS.mainnet,
 *   contracts: { agentRegistry: '0x...', agentExecutor: '0x...' }
 * });
 * const kit = new SomniaAgentKit(config);
 * ```
 *
 * @example Pattern 4: Testing 🧪
 * ```typescript
 * import { getConfig, setConfig, resetConfig } from '@somnia/agent-kit/config';
 *
 * describe('My tests', () => {
 *   beforeEach(() => {
 *     setConfig({
 *       network: SOMNIA_NETWORKS.devnet,
 *       contracts: { agentRegistry: '0x...', agentExecutor: '0x...' }
 *     });
 *   });
 *
 *   afterEach(() => {
 *     resetConfig();
 *   });
 *
 *   it('uses global config', () => {
 *     const config = getConfig();
 *     expect(config.network.name).toBe('Somnia Devnet');
 *   });
 * });
 * ```
 */

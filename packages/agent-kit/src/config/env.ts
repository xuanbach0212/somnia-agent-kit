/**
 * Environment Variable Loaders
 * Reads configuration from process.env
 */

import type {
  AgentKitConfig,
  SDKConfig,
  RuntimeConfig,
  ContractAddresses,
  LLMProviderConfig,
} from '../types/config';

/**
 * Load agent kit configuration from environment variables
 *
 * @returns Partial configuration loaded from environment
 *
 * @example
 * ```typescript
 * // Reads from .env file:
 * // SOMNIA_RPC_URL=https://dream-rpc.somnia.network
 * // AGENT_REGISTRY_ADDRESS=0x...
 *
 * const envConfig = loadAgentConfigFromEnv();
 * console.log(envConfig.network?.rpcUrl);
 * ```
 */
export function loadAgentConfigFromEnv(): Partial<AgentKitConfig> {
  const config: Partial<AgentKitConfig> = {};

  // Load network config from env
  if (process.env.SOMNIA_RPC_URL) {
    config.network = {
      rpcUrl: process.env.SOMNIA_RPC_URL,
      chainId: process.env.SOMNIA_CHAIN_ID
        ? parseInt(process.env.SOMNIA_CHAIN_ID)
        : 50311,
      name: process.env.SOMNIA_NETWORK_NAME || 'Somnia Network',
    };
  }

  // Load contract addresses from env
  const contracts: Partial<ContractAddresses> = {};
  if (process.env.AGENT_REGISTRY_ADDRESS) {
    contracts.agentRegistry = process.env.AGENT_REGISTRY_ADDRESS;
  }
  if (process.env.AGENT_EXECUTOR_ADDRESS) {
    contracts.agentExecutor = process.env.AGENT_EXECUTOR_ADDRESS;
  }
  if (process.env.AGENT_MANAGER_ADDRESS) {
    contracts.agentManager = process.env.AGENT_MANAGER_ADDRESS;
  }
  if (process.env.AGENT_VAULT_ADDRESS) {
    contracts.agentVault = process.env.AGENT_VAULT_ADDRESS;
  }

  if (Object.keys(contracts).length > 0) {
    config.contracts = contracts as ContractAddresses;
  }

  // Load private key from env
  if (process.env.PRIVATE_KEY) {
    config.privateKey = process.env.PRIVATE_KEY;
  }

  // Load LLM provider config from env
  const llmProvider: Partial<LLMProviderConfig> = {};
  if (process.env.OPENAI_API_KEY) {
    llmProvider.provider = 'openai';
    llmProvider.apiKey = process.env.OPENAI_API_KEY;
    llmProvider.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  } else if (process.env.OLLAMA_BASE_URL) {
    llmProvider.provider = 'ollama';
    llmProvider.baseUrl = process.env.OLLAMA_BASE_URL;
    llmProvider.model = process.env.OLLAMA_MODEL || 'llama2';
  }

  if (Object.keys(llmProvider).length > 0) {
    config.llmProvider = llmProvider as LLMProviderConfig;
  }

  // Load optional settings from env
  if (process.env.DEFAULT_GAS_LIMIT) {
    config.defaultGasLimit = BigInt(process.env.DEFAULT_GAS_LIMIT);
  }

  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toLowerCase();
    if (['debug', 'info', 'warn', 'error'].includes(level)) {
      config.logLevel = level as 'debug' | 'info' | 'warn' | 'error';
    }
  }

  if (process.env.METRICS_ENABLED !== undefined) {
    config.metricsEnabled = process.env.METRICS_ENABLED === 'true';
  }

  return config;
}

/**
 * Load SDK configuration from environment variables
 *
 * @returns Partial SDK configuration from environment
 *
 * @example
 * ```typescript
 * // Reads from .env file:
 * // SDK_DEBUG=true
 * // SDK_LOG_LEVEL=debug
 *
 * const sdkConfig = loadSDKConfigFromEnv();
 * console.log(sdkConfig.debug); // true
 * ```
 */
export function loadSDKConfigFromEnv(): Partial<SDKConfig> {
  const config: Partial<SDKConfig> = {};

  if (process.env.SDK_DEBUG !== undefined) {
    config.debug = process.env.SDK_DEBUG === 'true';
  }

  if (process.env.SDK_TELEMETRY !== undefined) {
    config.telemetry = process.env.SDK_TELEMETRY === 'true';
  }

  if (process.env.SDK_LOG_LEVEL) {
    const level = process.env.SDK_LOG_LEVEL.toLowerCase();
    if (['debug', 'info', 'warn', 'error'].includes(level)) {
      config.logLevel = level as 'debug' | 'info' | 'warn' | 'error';
    }
  }

  if (process.env.SDK_LLM_PROVIDER) {
    config.llmProvider = process.env.SDK_LLM_PROVIDER as any;
  }

  if (process.env.SDK_DEFAULT_TIMEOUT) {
    config.defaultTimeout = parseInt(process.env.SDK_DEFAULT_TIMEOUT);
  }

  if (process.env.SDK_MAX_RETRIES) {
    config.maxRetries = parseInt(process.env.SDK_MAX_RETRIES);
  }

  if (process.env.SDK_AUTO_RECOVER !== undefined) {
    config.autoRecover = process.env.SDK_AUTO_RECOVER === 'true';
  }

  return config;
}

/**
 * Load runtime configuration from environment variables
 *
 * @returns Partial runtime configuration from environment
 *
 * @example
 * ```typescript
 * // Reads from .env file:
 * // RUNTIME_MAX_CONCURRENT=10
 * // RUNTIME_ENABLE_PARALLEL=true
 *
 * const runtimeConfig = loadRuntimeConfigFromEnv();
 * console.log(runtimeConfig.maxConcurrent); // 10
 * ```
 */
export function loadRuntimeConfigFromEnv(): Partial<RuntimeConfig> {
  const config: Partial<RuntimeConfig> = {};

  if (process.env.RUNTIME_MAX_CONCURRENT) {
    config.maxConcurrent = parseInt(process.env.RUNTIME_MAX_CONCURRENT);
  }

  if (process.env.RUNTIME_ENABLE_PARALLEL !== undefined) {
    config.enableParallel = process.env.RUNTIME_ENABLE_PARALLEL === 'true';
  }

  if (process.env.RUNTIME_DRY_RUN !== undefined) {
    config.dryRun = process.env.RUNTIME_DRY_RUN === 'true';
  }

  if (process.env.RUNTIME_MEMORY_LIMIT) {
    config.memoryLimit = parseInt(process.env.RUNTIME_MEMORY_LIMIT);
  }

  if (process.env.RUNTIME_STORAGE_BACKEND) {
    config.storageBackend = process.env.RUNTIME_STORAGE_BACKEND as 'memory' | 'file';
  }

  if (process.env.RUNTIME_STORAGE_PATH) {
    config.storagePath = process.env.RUNTIME_STORAGE_PATH;
  }

  if (process.env.RUNTIME_MEMORY_BACKEND) {
    config.memoryBackend = process.env.RUNTIME_MEMORY_BACKEND as 'memory' | 'file';
  }

  if (process.env.RUNTIME_MEMORY_PATH) {
    config.memoryPath = process.env.RUNTIME_MEMORY_PATH;
  }

  if (process.env.RUNTIME_ENABLE_MEMORY !== undefined) {
    config.enableMemory = process.env.RUNTIME_ENABLE_MEMORY === 'true';
  }

  if (process.env.RUNTIME_SESSION_ID) {
    config.sessionId = process.env.RUNTIME_SESSION_ID;
  }

  return config;
}

// Legacy aliases for backward compatibility
/** @deprecated Use loadAgentConfigFromEnv instead */
export const loadFromEnv = loadAgentConfigFromEnv;

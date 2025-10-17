/**
 * Configuration for Somnia Agent Kit
 * Type definitions moved to src/types/config.ts
 */

import type {
  NetworkConfig,
  ContractAddresses,
  LLMProviderConfig,
  AgentKitConfig,
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
} from '../types/config';

// Re-export types for backward compatibility
export type {
  NetworkConfig,
  ContractAddresses,
  LLMProviderConfig,
  AgentKitConfig,
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
};

export const SOMNIA_NETWORKS = {
  mainnet: {
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Mainnet',
  },
  testnet: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    name: 'Somnia Dream Testnet',
  },
  devnet: {
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    name: 'Somnia Devnet',
  },
} as const;

export function validateConfig(config: AgentKitConfig): void {
  if (!config.network.rpcUrl) {
    throw new Error('Network RPC URL is required');
  }

  if (!config.contracts.agentRegistry) {
    throw new Error('AgentRegistry contract address is required');
  }

  if (!config.contracts.agentExecutor) {
    throw new Error('AgentExecutor contract address is required');
  }
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  defaultGasLimit: 3000000n,
  logLevel: 'info' as const,
  metricsEnabled: false,
};

/**
 * Default SDK configuration
 */
export const DEFAULT_SDK_CONFIG: SDKConfig = {
  debug: false,
  telemetry: false,
  logLevel: 'info',
  defaultTimeout: 30000, // 30 seconds
  maxRetries: 3,
  autoRecover: false,
};

/**
 * Default runtime configuration
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
 * Load configuration from environment variables
 * @returns Partial configuration from environment
 */
export function loadFromEnv(): Partial<AgentKitConfig> {
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
 * @returns Partial SDK configuration from environment
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
 * @returns Partial runtime configuration from environment
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

/**
 * Load configuration with defaults and environment variable support
 * @param userConfig Optional user-provided configuration
 * @returns Complete validated configuration
 *
 * @example
 * // Load from environment variables only
 * const config = loadConfig();
 *
 * @example
 * // Override specific values
 * const config = loadConfig({
 *   network: SOMNIA_NETWORKS.testnet,
 *   privateKey: '0x...'
 * });
 *
 * @example
 * // Merge env + user config
 * const config = loadConfig({
 *   contracts: {
 *     agentRegistry: '0x...',
 *     agentExecutor: '0x...'
 *   }
 * });
 */
export function loadConfig(
  userConfig?: Partial<AgentKitConfig>
): AgentKitConfig {
  // Start with defaults
  const config: any = {
    ...DEFAULT_CONFIG,
  };

  // Merge with environment variables
  const envConfig = loadFromEnv();
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
  validateConfig(config);

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
 * // Load all config from .env file
 * const config = createConfigFromEnv();
 * const kit = new SomniaAgentKit(config);
 */
export function createConfigFromEnv(): AgentKitConfig {
  const envConfig = loadFromEnv();

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

  return loadConfig(envConfig);
}

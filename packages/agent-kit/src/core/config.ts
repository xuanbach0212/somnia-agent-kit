/**
 * Configuration for Somnia Agent Kit
 */

export interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  name: string;
}

export interface ContractAddresses {
  agentRegistry: string;
  agentExecutor: string;
  agentManager?: string;
  agentVault?: string;
}

export interface LLMProviderConfig {
  provider?: 'openai' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AgentKitConfig {
  network: NetworkConfig;
  contracts: ContractAddresses;
  privateKey?: string;
  llmProvider?: LLMProviderConfig;
  defaultGasLimit?: bigint;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled?: boolean;
}

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

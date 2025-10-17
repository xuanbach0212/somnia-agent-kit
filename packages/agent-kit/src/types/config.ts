/**
 * Configuration Types
 * Central configuration types for Somnia Agent Kit
 */

import type { Address } from './common';

// =============================================================================
// Network Configuration
// =============================================================================

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** RPC endpoint URL */
  rpcUrl: string;

  /** Chain ID */
  chainId: number;

  /** Network name */
  name: string;
}

// =============================================================================
// Contract Addresses
// =============================================================================

/**
 * Contract addresses for agent system
 */
export interface ContractAddresses {
  /** AgentRegistry contract address */
  agentRegistry: Address;

  /** AgentExecutor contract address */
  agentExecutor: Address;

  /** AgentManager contract address (optional) */
  agentManager?: Address;

  /** AgentVault contract address (optional) */
  agentVault?: Address;
}

// =============================================================================
// LLM Provider Configuration
// =============================================================================

/**
 * LLM provider configuration
 */
export interface LLMProviderConfig {
  /** LLM provider type */
  provider?: 'openai' | 'anthropic' | 'ollama' | 'custom';

  /** API key for provider */
  apiKey?: string;

  /** Base URL for API endpoint */
  baseUrl?: string;

  /** Default model to use */
  model?: string;

  /** Additional provider-specific options */
  options?: Record<string, any>;
}

// =============================================================================
// Agent Kit Configuration
// =============================================================================

/**
 * Complete Agent Kit configuration
 */
export interface AgentKitConfig {
  /** Network configuration */
  network: NetworkConfig;

  /** Contract addresses */
  contracts: ContractAddresses;

  /** Private key for signing transactions */
  privateKey?: string;

  /** LLM provider configuration */
  llmProvider?: LLMProviderConfig;

  /** Default gas limit for transactions */
  defaultGasLimit?: bigint;

  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /** Enable metrics collection */
  metricsEnabled?: boolean;

  /** Enable telemetry */
  telemetryEnabled?: boolean;

  /** Additional custom options */
  options?: Record<string, any>;
}

// =============================================================================
// SDK Global Configuration
// =============================================================================

/**
 * SDK-level global configuration
 * Controls SDK-wide behavior separate from agent-specific settings
 */
export interface SDKConfig {
  /** Enable debug mode (verbose logging, detailed errors) */
  debug?: boolean;

  /** Enable telemetry collection and reporting */
  telemetry?: boolean;

  /** Global log level for all SDK operations */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /** Default chain configuration (can be overridden per agent) */
  defaultChain?: import('./chain').ChainConfig;

  /** Preferred LLM provider */
  llmProvider?: 'openai' | 'anthropic' | 'ollama' | 'custom';

  /** Default timeout for operations in milliseconds */
  defaultTimeout?: number;

  /** Maximum retry attempts for failed operations */
  maxRetries?: number;

  /** Enable automatic error recovery */
  autoRecover?: boolean;

  /** Custom SDK-wide options */
  options?: Record<string, any>;
}

// =============================================================================
// Runtime Module Configuration
// =============================================================================

/**
 * Runtime module configuration
 * Controls behavior of executor, planner, and other runtime components
 */
export interface RuntimeConfig {
  /** Maximum concurrent executions */
  maxConcurrent?: number;

  /** Enable parallel execution of independent actions */
  enableParallel?: boolean;

  /** Dry run mode (simulate without actual execution) */
  dryRun?: boolean;

  /** Memory limit in number of entries */
  memoryLimit?: number;

  /** Storage backend type */
  storageBackend?: 'memory' | 'file';

  /** Storage path (for file backend) */
  storagePath?: string;

  /** Memory backend type */
  memoryBackend?: 'memory' | 'file';

  /** Memory path (for file backend) */
  memoryPath?: string;

  /** Enable agent memory */
  enableMemory?: boolean;

  /** Session ID for memory isolation */
  sessionId?: string;
}

// =============================================================================
// Complete Solution Configuration
// =============================================================================

/**
 * Complete solution configuration
 * Combines Agent Kit, SDK, and Runtime configurations
 */
export interface CompleteSolutionConfig extends AgentKitConfig {
  /** SDK-level settings */
  sdk?: SDKConfig;

  /** Runtime module settings */
  runtime?: RuntimeConfig;
}

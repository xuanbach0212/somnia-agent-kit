/**
 * Somnia Agent Kit - Main SDK Entry Point
 * @packageDocumentation
 */

import { ethers } from 'ethers';
import { ChainClient } from './core/chainClient';
import { AgentKitConfig, loadConfig } from './core/config';
import { SomniaContracts } from './core/contracts';
import { SignerManager } from './core/signerManager';

/**
 * Main SDK class for Somnia Agent Kit
 */
export class SomniaAgentKit {
  private config: AgentKitConfig;
  private initialized: boolean = false;
  private chainClient: ChainClient;
  private _contracts: SomniaContracts | null = null;

  /**
   * Create a new SomniaAgentKit instance
   * @param userConfig - Configuration for the agent kit (will be merged with env vars and defaults)
   *
   * @example
   * // Create with manual config
   * const kit = new SomniaAgentKit({
   *   network: SOMNIA_NETWORKS.testnet,
   *   contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
   *   privateKey: '0x...'
   * });
   *
   * @example
   * // Create with partial config (merged with env vars)
   * const kit = new SomniaAgentKit({
   *   network: SOMNIA_NETWORKS.testnet,
   *   contracts: { agentRegistry: '0x...', agentExecutor: '0x...' }
   * });
   */
  constructor(userConfig?: Partial<AgentKitConfig>) {
    // Load and merge config from defaults, env, and user input
    this.config = loadConfig(userConfig);

    // Create ChainClient (includes provider and signer management)
    this.chainClient = new ChainClient(this.config);
  }

  /**
   * Initialize the agent kit
   * Connects to the network and initializes contracts
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Connect to network and validate chain ID
    await this.chainClient.connect();

    // Initialize contracts using ChainClient
    this._contracts = SomniaContracts.fromChainClient(
      this.chainClient,
      this.config.contracts
    );

    await this._contracts.initialize();

    this.initialized = true;
  }

  /**
   * Check if the kit is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get contracts instance
   */
  get contracts(): SomniaContracts {
    if (!this._contracts) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return this._contracts;
  }

  /**
   * Get ChainClient instance
   * Provides access to full blockchain interaction API
   */
  getChainClient(): ChainClient {
    return this.chainClient;
  }

  /**
   * Get SignerManager instance
   * Provides access to transaction signing and sending
   */
  getSignerManager(): SignerManager {
    return this.chainClient.getSignerManager();
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.Provider {
    return this.chainClient.getProvider();
  }

  /**
   * Get signer instance (if available)
   */
  getSigner(): ethers.Signer | ethers.Wallet | null {
    const signerManager = this.chainClient.getSignerManager();
    return signerManager.hasSigner() ? signerManager.getSigner() : null;
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<AgentKitConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      name: this.config.network.name,
      rpcUrl: this.config.network.rpcUrl,
      chainId: this.config.network.chainId,
    };
  }
}

// Re-export types and utilities from config layer
export {
  // Global config instance (for quick start)
  config,
  createConfigFromEnv,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_CONFIG, // Alias for backward compatibility
  DEFAULT_NETWORK,
  DEFAULT_RUNTIME_CONFIG,
  DEFAULT_SDK_CONFIG,
  getConfig,
  getNetwork,
  loadAgentConfigFromEnv,
  loadConfig,
  loadFromEnv,
  loadRuntimeConfigFromEnv,
  loadSDKConfigFromEnv,
  mergeConfig,
  SOMNIA_NETWORKS as NETWORK_CONFIGS,
  resetConfig,
  setConfig,
  SOMNIA_NETWORKS,
  validateAgentConfig,
  validateConfig,
  validateRuntimeConfig,
  validateSDKConfig,
} from './config';
export type {
  AgentKitConfig,
  CompleteSolutionConfig,
  ContractAddresses,
  LLMProviderConfig,
  NetworkConfig,
  RuntimeConfig,
  SDKConfig,
} from './config';
// Version tracking
export {
  BUILD_DATE,
  getVersionInfo,
  getVersionString,
  SDK_NAME,
  SDK_VERSION,
} from './version';

// Utility functions (from utils/ module)
export {
  bytesToHex,
  createLogger,
  delay,
  // Event emitter
  EventEmitter,
  // Ether and token utilities
  formatEther,
  formatUnits,
  fromHex,
  hexToBytes,
  // Address utilities
  isValidAddress,
  keccak256,
  // Logger shortcuts
  Logger,
  LogLevel,
  parseEther,
  parseUnits,
  retry,
  shortAddress,
  // Async utilities
  sleep,
  timeout,
  // Hex and data conversion
  toHex,
  toUtf8Bytes,
  toUtf8String,
} from './utils';
export type { EventListener, LogEntry, LoggerConfig } from './utils';

// Core blockchain layer
export { ChainClient } from './core/chainClient';
export { SomniaContracts } from './core/contracts';
export type { ContractInstances } from './core/contracts';
export * from './core/multicall';
export * from './core/rpcProvider';
export { SignerManager } from './core/signerManager';

// Token management
export * from './tokens';

// Contract deployment
export * from './deployment';

// Wallet connectors
export * from './wallets';

// Storage (IPFS)
export * from './storage';

// Runtime modules
export * from './runtime';

// LLM integration (includes prompt management)
export * from './llm';

// Monitoring
export * from './monitor';

// CLI
export * from './cli';

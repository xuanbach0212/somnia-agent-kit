/**
 * Somnia Agent Kit - Main SDK Entry Point
 * @packageDocumentation
 */

import { ethers } from 'ethers';
import { AgentKitConfig, validateConfig, loadConfig, SOMNIA_NETWORKS } from './core/config';
import { sleep, retry, isValidAddress, shortAddress } from './core/utils';
import { SomniaContracts } from './core/contracts';
import { ChainClient } from './core/chainClient';
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

// Re-export types and utilities
export type {
  AgentKitConfig,
  NetworkConfig,
  ContractAddresses,
  LLMProviderConfig,
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
} from './core/config';
export {
  SOMNIA_NETWORKS,
  validateConfig,
  DEFAULT_CONFIG,
  DEFAULT_SDK_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
  loadFromEnv,
  loadSDKConfigFromEnv,
  loadRuntimeConfigFromEnv,
  loadConfig,
  createConfigFromEnv,
} from './core/config';
// Utility functions
export {
  // Async utilities
  sleep,
  retry,
  delay,
  timeout,
  // Address utilities
  isValidAddress,
  shortAddress,
  // Hex and data conversion
  toHex,
  fromHex,
  bytesToHex,
  hexToBytes,
  toUtf8Bytes,
  toUtf8String,
  keccak256,
  // Ether and token utilities
  formatEther,
  parseEther,
  formatUnits,
  parseUnits,
  // Event emitter
  EventEmitter,
  // Logger shortcuts
  Logger,
  LogLevel,
  createLogger,
} from './core/utils';
export type { EventListener, LoggerConfig, LogEntry } from './core/utils';
export { SomniaContracts } from './core/contracts';
export type { ContractInstances } from './core/contracts';
export { ChainClient } from './core/chainClient';
export { SignerManager } from './core/signerManager';

// Prompt management
export * from './prompt';

// Runtime modules
export * from './runtime';

// LLM adapters
export * from './llm';

// Monitoring
export * from './monitor';

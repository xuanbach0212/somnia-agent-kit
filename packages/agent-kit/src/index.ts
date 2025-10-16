/**
 * Somnia Agent Kit - Main SDK Entry Point
 * @packageDocumentation
 */

import { ethers } from 'ethers';
import { AgentKitConfig, validateConfig, SOMNIA_NETWORKS } from './core/config';
import { sleep, retry, isValidAddress, shortAddress } from './core/utils';
import { SomniaContracts } from './core/contracts';

/**
 * Main SDK class for Somnia Agent Kit
 */
export class SomniaAgentKit {
  private config: AgentKitConfig;
  private initialized: boolean = false;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private _contracts: SomniaContracts | null = null;

  /**
   * Create a new SomniaAgentKit instance
   * @param config - Configuration for the agent kit
   */
  constructor(config: AgentKitConfig) {
    validateConfig(config);
    this.config = config;
  }

  /**
   * Initialize the agent kit
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.config.network.rpcUrl);

    // Initialize signer if private key is provided
    if (this.config.privateKey) {
      this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
    }

    // Initialize contracts
    this._contracts = new SomniaContracts(
      this.provider,
      this.config.contracts,
      this.signer || undefined
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
   * Get provider instance
   */
  getProvider(): ethers.Provider {
    if (!this.provider) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return this.provider;
  }

  /**
   * Get signer instance (if available)
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
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
} from './core/config';
export {
  SOMNIA_NETWORKS,
  validateConfig,
  DEFAULT_CONFIG,
  loadFromEnv,
  loadConfig,
  createConfigFromEnv,
} from './core/config';
export { sleep, retry, isValidAddress, shortAddress } from './core/utils';
export { SomniaContracts } from './core/contracts';
export type { ContractInstances } from './core/contracts';

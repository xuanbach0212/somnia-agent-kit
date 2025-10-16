/**
 * Somnia Agent Kit - Main SDK Entry Point
 * @packageDocumentation
 */

import { AgentKitConfig, validateConfig, SOMNIA_NETWORKS } from './core/config';
import { sleep, retry, isValidAddress, shortAddress } from './core/utils';

/**
 * Main SDK class for Somnia Agent Kit
 */
export class SomniaAgentKit {
  private config: AgentKitConfig;
  private initialized: boolean = false;

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

    // TODO: Initialize blockchain client, contracts, etc.
    this.initialized = true;
  }

  /**
   * Check if the kit is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
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
export type { AgentKitConfig, NetworkConfig, ContractAddresses } from './core/config';
export { SOMNIA_NETWORKS, validateConfig } from './core/config';
export { sleep, retry, isValidAddress, shortAddress } from './core/utils';

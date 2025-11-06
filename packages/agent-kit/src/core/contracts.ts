import { ethers } from 'ethers';
import {
  AGENTEXECUTOR_ABI,
  AGENTMANAGER_ABI,
  AGENTREGISTRY_ABI,
  AGENTVAULT_ABI,
} from '../abis';
import type { ContractAddresses } from '../types/config';
import type {
  IAgentExecutor,
  IAgentManager,
  IAgentRegistry,
  IAgentVault,
} from '../types/contracts';
import {
  asAgentExecutor,
  asAgentManager,
  asAgentRegistry,
  asAgentVault,
} from '../types/contracts';
import type { ChainClient } from './chainClient';

// Contract type aliases (using typed interfaces)
export type AgentRegistry = IAgentRegistry;
export type AgentManager = IAgentManager;
export type AgentExecutor = IAgentExecutor;
export type AgentVault = IAgentVault;

export interface ContractInstances {
  agentRegistry: AgentRegistry;
  agentManager: AgentManager | null;
  agentExecutor: AgentExecutor;
  agentVault: AgentVault | null;
}

// Re-export ContractAddresses for backward compatibility
export type { ContractAddresses } from '../types/config';

/**
 * SomniaContracts
 * Manages contract instances and provides type-safe access to deployed contracts
 */
export class SomniaContracts {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private addresses: ContractAddresses;
  private instances: ContractInstances | null = null;

  constructor(
    provider: ethers.Provider,
    addresses: ContractAddresses,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.addresses = addresses;
    if (signer) {
      this.signer = signer;
    }
  }

  /**
   * Create SomniaContracts from ChainClient
   * Factory method for easier instantiation
   *
   * @param client ChainClient instance
   * @param addresses Contract addresses
   * @returns SomniaContracts instance
   *
   * @example
   * const contracts = SomniaContracts.fromChainClient(chainClient, {
   *   agentRegistry: '0x...',
   *   agentExecutor: '0x...',
   * });
   */
  static fromChainClient(
    client: ChainClient,
    addresses: ContractAddresses
  ): SomniaContracts {
    const signerManager = client.getSignerManager();
    const signer = signerManager.hasSigner() ? signerManager.getSigner() : undefined;

    return new SomniaContracts(client.getProvider(), addresses, signer);
  }

  /**
   * Initialize contract instances
   */
  async initialize(): Promise<void> {
    const signerOrProvider = this.signer || this.provider;

    // Initialize required contracts
    const agentRegistry = asAgentRegistry(
      new ethers.Contract(
        this.addresses.agentRegistry,
        AGENTREGISTRY_ABI,
        signerOrProvider
      )
    );

    const agentExecutor = asAgentExecutor(
      new ethers.Contract(
        this.addresses.agentExecutor,
        AGENTEXECUTOR_ABI,
        signerOrProvider
      )
    );

    // Initialize optional contracts
    let agentManager: AgentManager | null = null;
    if (this.addresses.agentManager) {
      agentManager = asAgentManager(
        new ethers.Contract(
          this.addresses.agentManager,
          AGENTMANAGER_ABI,
          signerOrProvider
        )
      );
    }

    let agentVault: AgentVault | null = null;
    if (this.addresses.agentVault) {
      agentVault = asAgentVault(
        new ethers.Contract(this.addresses.agentVault, AGENTVAULT_ABI, signerOrProvider)
      );
    }

    this.instances = {
      agentRegistry,
      agentManager,
      agentExecutor,
      agentVault,
    };
  }

  /**
   * Get AgentRegistry contract instance
   */
  get AgentRegistry(): AgentRegistry {
    if (!this.instances) {
      throw new Error(
        'Contracts not initialized. Call await contracts.initialize() before accessing contract instances.'
      );
    }
    return this.instances.agentRegistry;
  }

  /**
   * Get AgentRegistry contract instance (lowercase alias)
   */
  get registry(): AgentRegistry {
    return this.AgentRegistry;
  }

  /**
   * Get AgentManager contract instance
   */
  get AgentManager(): AgentManager {
    if (!this.instances) {
      throw new Error(
        'Contracts not initialized. Call await contracts.initialize() before accessing contract instances.'
      );
    }
    if (!this.instances.agentManager) {
      throw new Error(
        'AgentManager contract not configured. Add agentManager address to contract configuration.'
      );
    }
    return this.instances.agentManager;
  }

  /**
   * Get AgentManager contract instance (lowercase alias)
   */
  get manager(): AgentManager {
    return this.AgentManager;
  }

  /**
   * Get AgentExecutor contract instance
   */
  get AgentExecutor(): AgentExecutor {
    if (!this.instances) {
      throw new Error(
        'Contracts not initialized. Call await contracts.initialize() before accessing contract instances.'
      );
    }
    return this.instances.agentExecutor;
  }

  /**
   * Get AgentExecutor contract instance (lowercase alias)
   */
  get executor(): AgentExecutor {
    return this.AgentExecutor;
  }

  /**
   * Get AgentVault contract instance
   */
  get AgentVault(): AgentVault {
    if (!this.instances) {
      throw new Error(
        'Contracts not initialized. Call await contracts.initialize() before accessing contract instances.'
      );
    }
    if (!this.instances.agentVault) {
      throw new Error(
        'AgentVault contract not configured. Add agentVault address to contract configuration.'
      );
    }
    return this.instances.agentVault;
  }

  /**
   * Get AgentVault contract instance (lowercase alias)
   */
  get vault(): AgentVault {
    return this.AgentVault;
  }

  /**
   * Check if contracts are initialized
   */
  isInitialized(): boolean {
    return this.instances !== null;
  }

  /**
   * Get all contract addresses
   */
  getAddresses(): Readonly<ContractAddresses> {
    return Object.freeze({ ...this.addresses });
  }

  /**
   * Update signer (e.g., when switching accounts)
   */
  async updateSigner(signer: ethers.Signer): Promise<void> {
    this.signer = signer;
    // Re-initialize contracts with new signer
    await this.initialize();
  }

  /**
   * Get contract instances (for advanced usage)
   */
  getInstances(): Readonly<ContractInstances> | null {
    return this.instances ? Object.freeze({ ...this.instances }) : null;
  }
}

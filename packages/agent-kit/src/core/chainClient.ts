/**
 * Chain Client - Core blockchain interaction layer
 */

import { ethers } from 'ethers';
import { AgentKitConfig, validateConfig } from './config';
import { SignerManager } from './signerManager';

export class ChainClient {
  private provider: ethers.JsonRpcProvider;
  private signerManager: SignerManager;
  private config: AgentKitConfig;
  private connected: boolean = false;

  // Block number cache
  private currentBlockNumber?: number;
  private blockNumberTimestamp?: number;
  private readonly blockNumberCacheDuration = 2000; // 2 seconds

  constructor(config: AgentKitConfig) {
    validateConfig(config);
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
    this.signerManager = new SignerManager(this.provider, config.privateKey);
  }

  /**
   * Connect to the blockchain network
   */
  async connect(): Promise<void> {
    try {
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.config.network.chainId) {
        throw new Error(
          `Chain ID mismatch: expected ${this.config.network.chainId}, got ${network.chainId}`
        );
      }
      this.connected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect to network: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get signer manager
   */
  getSignerManager(): SignerManager {
    return this.signerManager;
  }

  /**
   * Get signer
   */
  getSigner(): ethers.Wallet | ethers.Signer {
    return this.signerManager.getSigner();
  }

  /**
   * Get current block number (with optional caching)
   */
  async getBlockNumber(useCache: boolean = true): Promise<number> {
    this.ensureConnected();

    // Check cache if enabled
    if (useCache && this.currentBlockNumber && this.blockNumberTimestamp) {
      const cacheAge = Date.now() - this.blockNumberTimestamp;
      if (cacheAge < this.blockNumberCacheDuration) {
        return this.currentBlockNumber;
      }
    }

    // Fetch fresh block number
    const blockNumber = await this.provider.getBlockNumber();
    this.currentBlockNumber = blockNumber;
    this.blockNumberTimestamp = Date.now();

    return blockNumber;
  }

  /**
   * Force refresh block number (bypass cache)
   */
  async refreshBlockNumber(): Promise<number> {
    return await this.getBlockNumber(false);
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    this.ensureConnected();
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || 0n;
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    this.ensureConnected();
    return await this.provider.estimateGas(tx);
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    tx: ethers.TransactionRequest
  ): Promise<ethers.TransactionReceipt> {
    this.ensureConnected();

    const signer = this.getSigner();
    const response = await signer.sendTransaction(tx);
    const receipt = await response.wait();

    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return receipt;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    this.ensureConnected();
    const receipt = await this.provider.waitForTransaction(
      txHash,
      confirmations
    );
    if (!receipt) {
      throw new Error(`Transaction ${txHash} not found`);
    }
    return receipt;
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    this.ensureConnected();
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Get transaction details
   */
  async getTransaction(
    txHash: string
  ): Promise<ethers.TransactionResponse | null> {
    this.ensureConnected();
    return await this.provider.getTransaction(txHash);
  }

  /**
   * Get transaction details (alias for getTransaction)
   */
  async getTx(txHash: string): Promise<ethers.TransactionResponse | null> {
    return await this.getTransaction(txHash);
  }

  /**
   * Get contract instance
   */
  getContract(
    address: string,
    abi: ethers.Interface | ethers.InterfaceAbi
  ): ethers.Contract {
    this.ensureConnected();
    return new ethers.Contract(address, abi, this.getSigner());
  }

  /**
   * Get contract instance (read-only)
   */
  getReadOnlyContract(
    address: string,
    abi: ethers.Interface | ethers.InterfaceAbi
  ): ethers.Contract {
    this.ensureConnected();
    return new ethers.Contract(address, abi, this.provider);
  }

  /**
   * Subscribe to provider events
   * @param event Event name (e.g., 'block', 'pending', 'error')
   * @param handler Event handler function
   *
   * @example
   * chainClient.on('block', (blockNumber) => {
   *   console.log('New block:', blockNumber);
   * });
   */
  on(event: string, handler: ethers.Listener): void {
    this.ensureConnected();
    this.provider.on(event, handler);
  }

  /**
   * Unsubscribe from provider events
   * @param event Event name
   * @param handler Event handler to remove (optional, removes all if not provided)
   */
  off(event: string, handler?: ethers.Listener): void {
    if (handler) {
      this.provider.off(event, handler);
    } else {
      this.provider.removeAllListeners(event);
    }
  }

  /**
   * Subscribe to provider event (one time)
   * @param event Event name
   * @param handler Event handler function
   */
  once(event: string, handler: ethers.Listener): void {
    this.ensureConnected();
    this.provider.once(event, handler);
  }

  /**
   * Remove all event listeners
   * @param event Event name (optional, removes all events if not provided)
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.provider.removeAllListeners(event);
    } else {
      this.provider.removeAllListeners();
    }
  }

  /**
   * Get listener count for an event
   * Note: This method may have type compatibility issues with some ethers.js versions
   * @param event Event name (optional, returns total if not provided)
   */
  listenerCount(event?: string): any {
    if (event) {
      return this.provider.listenerCount(event);
    }
    return this.provider.listenerCount();
  }

  /**
   * Disconnect from network
   */
  disconnect(): void {
    // Remove all event listeners before disconnecting
    this.removeAllListeners();
    this.connected = false;
  }

  /**
   * Ensure client is connected
   */
  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('ChainClient not connected. Call connect() first.');
    }
  }
}

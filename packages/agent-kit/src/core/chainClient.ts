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
  getSigner(): ethers.Wallet {
    return this.signerManager.getSigner();
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    this.ensureConnected();
    return await this.provider.getBlockNumber();
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
   * Disconnect from network
   */
  disconnect(): void {
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

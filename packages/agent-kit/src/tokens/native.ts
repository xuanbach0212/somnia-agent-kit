/**
 * Native Token Manager
 *
 * Utilities for interacting with native tokens (STT on testnet, SOMI on mainnet).
 * Provides helpers for balance queries, transfers, and gas estimations.
 *
 * @example
 * ```typescript
 * const native = new NativeTokenManager(chainClient);
 *
 * // Check balance
 * const balance = await native.getBalance(address);
 *
 * // Transfer native tokens
 * await native.transfer(recipientAddress, ethers.parseEther('1.0'));
 * ```
 */

import { ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Transfer parameters
 */
export interface TransferParams {
  /** Recipient address */
  to: string;
  /** Amount to transfer in wei */
  amount: bigint;
  /** Optional gas limit */
  gasLimit?: bigint;
}

/**
 * Batch transfer parameters
 */
export interface BatchTransferParams {
  /** Recipient address */
  to: string;
  /** Amount to transfer in wei */
  amount: bigint;
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  /** Estimated gas limit */
  gasLimit: bigint;
  /** Gas price */
  gasPrice: bigint;
  /** Total cost in wei */
  totalCost: bigint;
}

// =============================================================================
// NativeTokenManager Class
// =============================================================================

/**
 * Native Token Manager
 *
 * Provides utilities for native token (STT/SOMI) operations on Somnia.
 */
export class NativeTokenManager {
  private chainClient: ChainClient;

  /**
   * Create a new NativeTokenManager instance
   *
   * @param chainClient - ChainClient instance for blockchain interaction
   *
   * @example
   * ```typescript
   * const native = new NativeTokenManager(chainClient);
   * ```
   */
  constructor(chainClient: ChainClient) {
    this.chainClient = chainClient;
  }

  /**
   * Get native token balance for an address
   *
   * @param address - Address to check (optional, defaults to signer address)
   * @returns Balance in wei
   *
   * @example
   * ```typescript
   * const balance = await native.getBalance(address);
   * console.log('Balance:', ethers.formatEther(balance), 'STT');
   * ```
   */
  async getBalance(address?: string): Promise<bigint> {
    const addr = address || (await this.chainClient.getSigner().getAddress());
    return await this.chainClient.getProvider().getBalance(addr);
  }

  /**
   * Get balances for multiple addresses
   *
   * @param addresses - Array of addresses
   * @returns Array of balances
   *
   * @example
   * ```typescript
   * const balances = await native.getBatchBalances([addr1, addr2, addr3]);
   * ```
   */
  async getBatchBalances(addresses: string[]): Promise<bigint[]> {
    const provider = this.chainClient.getProvider();
    return await Promise.all(addresses.map((addr) => provider.getBalance(addr)));
  }

  /**
   * Transfer native tokens to another address
   *
   * @param to - Recipient address
   * @param amount - Amount to transfer in wei
   * @param gasLimit - Optional gas limit
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * const receipt = await native.transfer(
   *   recipientAddress,
   *   ethers.parseEther('1.5')
   * );
   * console.log('Transfer completed:', receipt.hash);
   * ```
   */
  async transfer(
    to: string,
    amount: bigint,
    gasLimit?: bigint
  ): Promise<ethers.TransactionReceipt> {
    const signer = this.chainClient.getSigner();

    const tx: ethers.TransactionRequest = {
      to,
      value: amount,
      gasLimit,
    };

    const response = await signer.sendTransaction(tx);
    const receipt = await response.wait();

    if (!receipt) {
      throw new Error('Transfer transaction failed');
    }

    return receipt;
  }

  /**
   * Transfer native tokens to multiple addresses
   *
   * @param transfers - Array of transfer parameters
   * @returns Array of transaction receipts
   *
   * @example
   * ```typescript
   * const receipts = await native.batchTransfer([
   *   { to: addr1, amount: ethers.parseEther('1') },
   *   { to: addr2, amount: ethers.parseEther('2') },
   *   { to: addr3, amount: ethers.parseEther('3') },
   * ]);
   * ```
   */
  async batchTransfer(
    transfers: BatchTransferParams[]
  ): Promise<ethers.TransactionReceipt[]> {
    const receipts: ethers.TransactionReceipt[] = [];

    for (const transfer of transfers) {
      const receipt = await this.transfer(transfer.to, transfer.amount);
      receipts.push(receipt);
    }

    return receipts;
  }

  /**
   * Estimate gas for a transfer
   *
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @returns Gas estimation
   *
   * @example
   * ```typescript
   * const estimate = await native.estimateTransferGas(
   *   recipientAddress,
   *   ethers.parseEther('1.0')
   * );
   * console.log('Estimated cost:', ethers.formatEther(estimate.totalCost));
   * ```
   */
  async estimateTransferGas(to: string, amount: bigint): Promise<GasEstimate> {
    const provider = this.chainClient.getProvider();
    const signer = this.chainClient.getSigner();

    const tx: ethers.TransactionRequest = {
      to,
      value: amount,
      from: await signer.getAddress(),
    };

    const gasLimit = await provider.estimateGas(tx);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;

    return {
      gasLimit,
      gasPrice,
      totalCost: gasLimit * gasPrice,
    };
  }

  /**
   * Get current gas price
   *
   * @returns Gas price in wei
   *
   * @example
   * ```typescript
   * const gasPrice = await native.getGasPrice();
   * console.log('Gas price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
   * ```
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.chainClient.getProvider().getFeeData();
    return feeData.gasPrice || 0n;
  }

  /**
   * Get fee data (gas price, max fee, max priority fee)
   *
   * @returns Fee data
   *
   * @example
   * ```typescript
   * const feeData = await native.getFeeData();
   * console.log('Gas price:', feeData.gasPrice);
   * console.log('Max fee:', feeData.maxFeePerGas);
   * ```
   */
  async getFeeData(): Promise<ethers.FeeData> {
    return await this.chainClient.getProvider().getFeeData();
  }

  /**
   * Format amount from wei to human-readable string
   *
   * @param amount - Amount in wei
   * @returns Formatted string
   *
   * @example
   * ```typescript
   * const formatted = NativeTokenManager.formatAmount(ethers.parseEther('1.5'));
   * console.log(formatted); // "1.5"
   * ```
   */
  static formatAmount(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  /**
   * Parse human-readable amount to wei
   *
   * @param amount - Amount string (e.g., "1.5")
   * @returns Amount in wei
   *
   * @example
   * ```typescript
   * const amount = NativeTokenManager.parseAmount('1.5');
   * // Returns: 1500000000000000000n
   * ```
   */
  static parseAmount(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  /**
   * Format gas price from wei to gwei
   *
   * @param gasPrice - Gas price in wei
   * @returns Formatted string in gwei
   */
  static formatGasPrice(gasPrice: bigint): string {
    return ethers.formatUnits(gasPrice, 'gwei');
  }

  /**
   * Get network token symbol (STT for testnet, SOMI for mainnet)
   *
   * @returns Token symbol
   *
   * @example
   * ```typescript
   * const symbol = native.getTokenSymbol();
   * console.log('Network token:', symbol);
   * ```
   */
  getTokenSymbol(): string {
    const networkConfig = this.chainClient.getNetworkConfig();
    return networkConfig.token || 'STT';
  }

  /**
   * Get network token name
   *
   * @returns Token name
   */
  getTokenName(): string {
    const symbol = this.getTokenSymbol();
    return symbol === 'SOMI' ? 'Somnia' : 'Somnia Test Token';
  }

  /**
   * Check if address has sufficient balance
   *
   * @param address - Address to check
   * @param required - Required amount
   * @returns true if balance is sufficient
   *
   * @example
   * ```typescript
   * const hasSufficient = await native.hasSufficientBalance(
   *   address,
   *   ethers.parseEther('1.0')
   * );
   * ```
   */
  async hasSufficientBalance(address: string, required: bigint): Promise<boolean> {
    const balance = await this.getBalance(address);
    return balance >= required;
  }

  /**
   * Check if address has sufficient balance including gas
   *
   * @param address - Address to check
   * @param amount - Amount to transfer
   * @param gasEstimate - Estimated gas cost (optional)
   * @returns true if balance is sufficient for transfer + gas
   *
   * @example
   * ```typescript
   * const canTransfer = await native.canAffordTransfer(
   *   address,
   *   ethers.parseEther('1.0')
   * );
   * ```
   */
  async canAffordTransfer(
    address: string,
    amount: bigint,
    gasEstimate?: bigint
  ): Promise<boolean> {
    const balance = await this.getBalance(address);

    if (!gasEstimate) {
      // Estimate gas cost for transfer
      const estimate = await this.estimateTransferGas(address, amount);
      gasEstimate = estimate.totalCost;
    }

    const required = amount + gasEstimate;
    return balance >= required;
  }

  /**
   * Get current block number
   *
   * @returns Block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.chainClient.getBlockNumber();
  }

  /**
   * Get transaction count (nonce) for an address
   *
   * @param address - Address to check (optional, defaults to signer)
   * @returns Transaction count
   *
   * @example
   * ```typescript
   * const nonce = await native.getTransactionCount(address);
   * console.log('Nonce:', nonce);
   * ```
   */
  async getTransactionCount(address?: string): Promise<number> {
    const provider = this.chainClient.getProvider();
    const addr = address || (await this.chainClient.getSigner().getAddress());
    return await provider.getTransactionCount(addr);
  }
}

// =============================================================================
// Exports
// =============================================================================

export { NativeTokenManager as default };

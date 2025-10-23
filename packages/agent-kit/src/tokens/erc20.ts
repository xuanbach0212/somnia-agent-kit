/**
 * ERC20 Token Manager
 *
 * Utilities for interacting with ERC20 tokens on Somnia blockchain.
 * Supports standard ERC20 operations including transfers, approvals, and balance queries.
 *
 * @example
 * ```typescript
 * const erc20 = new ERC20Manager(chainClient);
 *
 * // Check balance
 * const balance = await erc20.balanceOf(tokenAddress, accountAddress);
 *
 * // Transfer tokens
 * await erc20.transfer(tokenAddress, recipientAddress, ethers.parseEther('100'));
 *
 * // Approve spender
 * await erc20.approve(tokenAddress, spenderAddress, ethers.parseEther('1000'));
 * ```
 */

import { Contract, ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * ERC20 token information
 */
export interface TokenInfo {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Number of decimals */
  decimals: number;
  /** Total supply */
  totalSupply: bigint;
}

/**
 * Parameters for deploying a new ERC20 token
 */
export interface DeployTokenParams {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Number of decimals (default: 18) */
  decimals?: number;
  /** Initial supply to mint (default: 0) */
  initialSupply?: bigint;
}

// =============================================================================
// ERC20 ABI (Standard Interface)
// =============================================================================

const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// =============================================================================
// ERC20Manager Class
// =============================================================================

/**
 * ERC20 Token Manager
 *
 * Provides high-level utilities for interacting with ERC20 tokens.
 */
export class ERC20Manager {
  private chainClient: ChainClient;

  /**
   * Create a new ERC20Manager instance
   *
   * @param chainClient - ChainClient instance for blockchain interaction
   *
   * @example
   * ```typescript
   * const erc20 = new ERC20Manager(chainClient);
   * ```
   */
  constructor(chainClient: ChainClient) {
    this.chainClient = chainClient;
  }

  /**
   * Get an ERC20 contract instance
   *
   * @param address - Token contract address
   * @returns Contract instance
   */
  private getERC20Contract(address: string): Contract {
    return this.chainClient.getContract(address, ERC20_ABI);
  }

  /**
   * Get token information
   *
   * @param token - Token contract address
   * @returns Token information
   *
   * @example
   * ```typescript
   * const info = await erc20.getTokenInfo(tokenAddress);
   * console.log(`${info.name} (${info.symbol}) - ${info.decimals} decimals`);
   * ```
   */
  async getTokenInfo(token: string): Promise<TokenInfo> {
    const contract = this.getERC20Contract(token);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply,
    };
  }

  /**
   * Get token balance for an account
   *
   * @param token - Token contract address
   * @param account - Account address
   * @returns Token balance
   *
   * @example
   * ```typescript
   * const balance = await erc20.balanceOf(tokenAddress, accountAddress);
   * console.log('Balance:', ethers.formatEther(balance));
   * ```
   */
  async balanceOf(token: string, account: string): Promise<bigint> {
    const contract = this.getERC20Contract(token);
    return await contract.balanceOf(account);
  }

  /**
   * Get total supply of a token
   *
   * @param token - Token contract address
   * @returns Total supply
   */
  async totalSupply(token: string): Promise<bigint> {
    const contract = this.getERC20Contract(token);
    return await contract.totalSupply();
  }

  /**
   * Transfer tokens to another address
   *
   * @param token - Token contract address
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * const receipt = await erc20.transfer(
   *   tokenAddress,
   *   recipientAddress,
   *   ethers.parseEther('100')
   * );
   * console.log('Transfer completed:', receipt.hash);
   * ```
   */
  async transfer(
    token: string,
    to: string,
    amount: bigint
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC20Contract(token);
    const tx = await contract.transfer(to, amount);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transfer transaction failed');
    }

    return receipt;
  }

  /**
   * Approve spender to spend tokens on behalf of the caller
   *
   * @param token - Token contract address
   * @param spender - Spender address
   * @param amount - Amount to approve
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * // Approve unlimited amount
   * await erc20.approve(
   *   tokenAddress,
   *   spenderAddress,
   *   ethers.MaxUint256
   * );
   * ```
   */
  async approve(
    token: string,
    spender: string,
    amount: bigint
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC20Contract(token);
    const tx = await contract.approve(spender, amount);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Approve transaction failed');
    }

    return receipt;
  }

  /**
   * Transfer tokens from one address to another (requires approval)
   *
   * @param token - Token contract address
   * @param from - Sender address
   * @param to - Recipient address
   * @param amount - Amount to transfer
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * // After approval, transfer on behalf of another account
   * await erc20.transferFrom(
   *   tokenAddress,
   *   fromAddress,
   *   toAddress,
   *   ethers.parseEther('50')
   * );
   * ```
   */
  async transferFrom(
    token: string,
    from: string,
    to: string,
    amount: bigint
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC20Contract(token);
    const tx = await contract.transferFrom(from, to, amount);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('TransferFrom transaction failed');
    }

    return receipt;
  }

  /**
   * Get allowance for a spender
   *
   * @param token - Token contract address
   * @param owner - Token owner address
   * @param spender - Spender address
   * @returns Approved amount
   *
   * @example
   * ```typescript
   * const allowance = await erc20.allowance(
   *   tokenAddress,
   *   ownerAddress,
   *   spenderAddress
   * );
   * console.log('Allowance:', ethers.formatEther(allowance));
   * ```
   */
  async allowance(token: string, owner: string, spender: string): Promise<bigint> {
    const contract = this.getERC20Contract(token);
    return await contract.allowance(owner, spender);
  }

  /**
   * Batch get balances for multiple accounts
   *
   * Note: This uses sequential calls. For better performance,
   * consider using MultiCall for batching.
   *
   * @param token - Token contract address
   * @param accounts - Array of account addresses
   * @returns Array of balances
   *
   * @example
   * ```typescript
   * const balances = await erc20.batchBalanceOf(tokenAddress, [
   *   account1,
   *   account2,
   *   account3,
   * ]);
   * ```
   */
  async batchBalanceOf(token: string, accounts: string[]): Promise<bigint[]> {
    const contract = this.getERC20Contract(token);

    // Sequential calls (could be optimized with MultiCall)
    const balances = await Promise.all(
      accounts.map((account) => contract.balanceOf(account))
    );

    return balances;
  }

  /**
   * Format token amount to human-readable string
   *
   * @param amount - Token amount in wei
   * @param decimals - Token decimals
   * @returns Formatted string
   *
   * @example
   * ```typescript
   * const formatted = ERC20Manager.formatAmount(
   *   ethers.parseEther('1234.56'),
   *   18
   * );
   * console.log(formatted); // "1234.56"
   * ```
   */
  static formatAmount(amount: bigint, decimals: number): string {
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse human-readable amount to wei
   *
   * @param amount - Amount string (e.g., "100.5")
   * @param decimals - Token decimals
   * @returns Amount in wei
   *
   * @example
   * ```typescript
   * const amount = ERC20Manager.parseAmount('100.5', 18);
   * // Returns: 100500000000000000000n
   * ```
   */
  static parseAmount(amount: string, decimals: number): bigint {
    return ethers.parseUnits(amount, decimals);
  }

  /**
   * Check if an address has approved enough tokens
   *
   * @param token - Token contract address
   * @param owner - Token owner address
   * @param spender - Spender address
   * @param amount - Required amount
   * @returns true if approved amount is sufficient
   *
   * @example
   * ```typescript
   * const hasApproval = await erc20.hasApproval(
   *   tokenAddress,
   *   ownerAddress,
   *   spenderAddress,
   *   ethers.parseEther('100')
   * );
   * ```
   */
  async hasApproval(
    token: string,
    owner: string,
    spender: string,
    amount: bigint
  ): Promise<boolean> {
    const allowance = await this.allowance(token, owner, spender);
    return allowance >= amount;
  }

  /**
   * Ensure sufficient approval, approve if needed
   *
   * @param token - Token contract address
   * @param spender - Spender address
   * @param amount - Required amount
   * @returns Transaction receipt if approval was needed, undefined otherwise
   *
   * @example
   * ```typescript
   * // Automatically approve if needed
   * await erc20.ensureApproval(
   *   tokenAddress,
   *   spenderAddress,
   *   ethers.parseEther('100')
   * );
   * ```
   */
  async ensureApproval(
    token: string,
    spender: string,
    amount: bigint
  ): Promise<ethers.TransactionReceipt | undefined> {
    const owner = await this.chainClient.getSigner().getAddress();
    const currentAllowance = await this.allowance(token, owner, spender);

    if (currentAllowance >= amount) {
      return undefined; // Already approved
    }

    // Approve the required amount
    return await this.approve(token, spender, amount);
  }

  /**
   * Get token name
   *
   * @param token - Token contract address
   * @returns Token name
   */
  async name(token: string): Promise<string> {
    const contract = this.getERC20Contract(token);
    return await contract.name();
  }

  /**
   * Get token symbol
   *
   * @param token - Token contract address
   * @returns Token symbol
   */
  async symbol(token: string): Promise<string> {
    const contract = this.getERC20Contract(token);
    return await contract.symbol();
  }

  /**
   * Get token decimals
   *
   * @param token - Token contract address
   * @returns Token decimals
   */
  async decimals(token: string): Promise<number> {
    const contract = this.getERC20Contract(token);
    const decimals = await contract.decimals();
    return Number(decimals);
  }
}

// =============================================================================
// Exports
// =============================================================================

export { ERC20Manager as default };

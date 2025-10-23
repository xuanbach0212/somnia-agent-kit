/**
 * MultiCall - Batch multiple contract calls into a single RPC request
 *
 * This module provides utilities to batch multiple contract calls using the
 * Multicall3 contract, significantly reducing RPC overhead.
 *
 * @example
 * ```typescript
 * const multicall = new MultiCall(chainClient);
 *
 * // Batch 100 balance checks in 1 RPC call
 * const calls = accounts.map(account => ({
 *   target: tokenAddress,
 *   callData: token.interface.encodeFunctionData('balanceOf', [account])
 * }));
 *
 * const results = await multicall.aggregate(calls);
 * // → 80-90% faster than sequential calls
 * ```
 */

import { Contract } from 'ethers';
import type { ChainClient } from './chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * A single call in a multicall batch
 */
export interface Call {
  /** Target contract address */
  target: string;
  /** Encoded function call data */
  callData: string;
  /** Optional gas limit for this call */
  gasLimit?: bigint;
}

/**
 * Result of a multicall operation
 */
export interface Result {
  /** Whether the call succeeded */
  success: boolean;
  /** Returned data (or revert reason if failed) */
  returnData: string;
}

/**
 * Aggregate result with block information
 */
export interface AggregateResult {
  /** Block number when calls were executed */
  blockNumber: bigint;
  /** Block hash */
  blockHash: string;
  /** Results of each call */
  results: string[];
}

// =============================================================================
// MultiCall3 ABI (Minimal)
// =============================================================================

const MULTICALL3_ABI = [
  // aggregate: Execute multiple calls, revert if any fails
  'function aggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes[] returnData)',

  // tryAggregate: Execute multiple calls, allow failures
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',

  // blockAndAggregate: Execute multiple calls and return block info
  'function blockAndAggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',

  // aggregate3: Execute multiple calls with individual gas limits
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',

  // getBlockNumber: Get current block number
  'function getBlockNumber() view returns (uint256 blockNumber)',

  // getBlockHash: Get block hash
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
];

// =============================================================================
// MultiCall Class
// =============================================================================

/**
 * MultiCall utility for batching contract calls
 *
 * Reduces RPC overhead by combining multiple contract read calls into a single request.
 * Uses the Multicall3 contract deployed on Somnia.
 */
export class MultiCall {
  private chainClient: ChainClient;
  private multicallAddress?: string;

  /**
   * Create a new MultiCall instance
   *
   * @param chainClient - ChainClient instance for blockchain interaction
   * @param multicallAddress - Optional custom multicall contract address
   *
   * @example
   * ```typescript
   * const multicall = new MultiCall(chainClient);
   * ```
   */
  constructor(chainClient: ChainClient, multicallAddress?: string) {
    this.chainClient = chainClient;
    this.multicallAddress = multicallAddress;
  }

  /**
   * Get the multicall contract instance
   *
   * @returns Contract instance for Multicall3
   * @throws Error if multicall address is not configured for the network
   */
  private getMulticallContract(): Contract {
    // Get multicall address from network config or constructor
    const address = this.multicallAddress || this.getMulticallAddressFromConfig();

    if (!address) {
      throw new Error(
        'Multicall address not configured for this network. ' +
          'Please ensure network.multicall is set in your configuration.'
      );
    }

    return this.chainClient.getContract(address, MULTICALL3_ABI);
  }

  /**
   * Get multicall address from network configuration
   */
  private getMulticallAddressFromConfig(): string | undefined {
    const networkConfig = this.chainClient.getNetworkConfig();
    return networkConfig.multicall;
  }

  /**
   * Aggregate multiple calls into a single RPC request
   *
   * All calls must succeed or the entire operation reverts.
   *
   * @param calls - Array of calls to execute
   * @returns Array of return data from each call
   * @throws Error if any call fails
   *
   * @example
   * ```typescript
   * const calls = [
   *   {
   *     target: tokenAddress,
   *     callData: token.interface.encodeFunctionData('balanceOf', [account1])
   *   },
   *   {
   *     target: tokenAddress,
   *     callData: token.interface.encodeFunctionData('balanceOf', [account2])
   *   },
   * ];
   *
   * const results = await multicall.aggregate(calls);
   * const balance1 = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], results[0])[0];
   * const balance2 = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], results[1])[0];
   * ```
   */
  async aggregate(calls: Call[]): Promise<string[]> {
    if (calls.length === 0) {
      return [];
    }

    const contract = this.getMulticallContract();

    // Format calls for multicall contract
    const formattedCalls = calls.map((call) => ({
      target: call.target,
      callData: call.callData,
    }));

    // Execute multicall
    const [blockNumber, results] = await contract.aggregate(formattedCalls);

    return results;
  }

  /**
   * Try to aggregate multiple calls, allowing individual failures
   *
   * Each call can fail independently without reverting the entire operation.
   *
   * @param calls - Array of calls to execute
   * @param requireSuccess - If true, revert if any call fails
   * @returns Array of results with success status and return data
   *
   * @example
   * ```typescript
   * const results = await multicall.tryAggregate(calls, false);
   *
   * results.forEach((result, i) => {
   *   if (result.success) {
   *     console.log(`Call ${i} succeeded:`, result.returnData);
   *   } else {
   *     console.log(`Call ${i} failed:`, result.returnData);
   *   }
   * });
   * ```
   */
  async tryAggregate(calls: Call[], requireSuccess: boolean = false): Promise<Result[]> {
    if (calls.length === 0) {
      return [];
    }

    const contract = this.getMulticallContract();

    // Format calls for multicall contract
    const formattedCalls = calls.map((call) => ({
      target: call.target,
      callData: call.callData,
    }));

    // Execute multicall
    const results = await contract.tryAggregate(requireSuccess, formattedCalls);

    return results.map((result: any) => ({
      success: result.success,
      returnData: result.returnData,
    }));
  }

  /**
   * Aggregate calls and return block information
   *
   * Useful when you need to know the exact block when calls were executed.
   *
   * @param calls - Array of calls to execute
   * @returns Aggregate result with block number, hash, and call results
   *
   * @example
   * ```typescript
   * const result = await multicall.blockAndAggregate(calls);
   * console.log('Executed at block:', result.blockNumber);
   * console.log('Block hash:', result.blockHash);
   * ```
   */
  async blockAndAggregate(calls: Call[]): Promise<AggregateResult> {
    if (calls.length === 0) {
      const blockNumber = await this.chainClient.getBlockNumber();
      return {
        blockNumber: BigInt(blockNumber),
        blockHash: '0x',
        results: [],
      };
    }

    const contract = this.getMulticallContract();

    // Format calls for multicall contract
    const formattedCalls = calls.map((call) => ({
      target: call.target,
      callData: call.callData,
    }));

    // Execute multicall
    const [blockNumber, blockHash, results] =
      await contract.blockAndAggregate(formattedCalls);

    return {
      blockNumber,
      blockHash,
      results: results.map((r: any) => r.returnData),
    };
  }

  /**
   * Execute multiple calls with individual failure handling
   *
   * Each call can specify whether it's allowed to fail.
   *
   * @param calls - Array of calls with allowFailure flag
   * @returns Array of results with success status
   *
   * @example
   * ```typescript
   * const calls = [
   *   { target: token, callData: data1, allowFailure: false }, // Must succeed
   *   { target: token, callData: data2, allowFailure: true },  // Can fail
   * ];
   *
   * const results = await multicall.aggregate3(calls);
   * ```
   */
  async aggregate3(calls: (Call & { allowFailure: boolean })[]): Promise<Result[]> {
    if (calls.length === 0) {
      return [];
    }

    const contract = this.getMulticallContract();

    // Format calls for multicall contract
    const formattedCalls = calls.map((call) => ({
      target: call.target,
      allowFailure: call.allowFailure,
      callData: call.callData,
    }));

    // Execute multicall
    const results = await contract.aggregate3(formattedCalls);

    return results.map((result: any) => ({
      success: result.success,
      returnData: result.returnData,
    }));
  }

  /**
   * Get current block number via multicall
   *
   * @returns Current block number
   */
  async getBlockNumber(): Promise<bigint> {
    const contract = this.getMulticallContract();
    return await contract.getBlockNumber();
  }

  /**
   * Get block hash for a specific block number
   *
   * @param blockNumber - Block number to query
   * @returns Block hash
   */
  async getBlockHash(blockNumber: number | bigint): Promise<string> {
    const contract = this.getMulticallContract();
    return await contract.getBlockHash(blockNumber);
  }

  /**
   * Helper: Encode a contract call
   *
   * @param contract - Contract instance
   * @param method - Method name
   * @param args - Method arguments
   * @returns Encoded call data
   *
   * @example
   * ```typescript
   * const callData = MultiCall.encodeCall(tokenContract, 'balanceOf', [accountAddress]);
   * ```
   */
  static encodeCall(contract: Contract, method: string, args: any[] = []): string {
    return contract.interface.encodeFunctionData(method, args);
  }

  /**
   * Helper: Decode call result
   *
   * @param contract - Contract instance
   * @param method - Method name
   * @param returnData - Encoded return data
   * @returns Decoded result
   *
   * @example
   * ```typescript
   * const balance = MultiCall.decodeResult(tokenContract, 'balanceOf', result.returnData);
   * ```
   */
  static decodeResult(contract: Contract, method: string, returnData: string): any {
    return contract.interface.decodeFunctionResult(method, returnData);
  }

  /**
   * Helper: Create a batch of calls for the same contract
   *
   * @param contract - Contract instance
   * @param calls - Array of method calls
   * @returns Formatted calls for multicall
   *
   * @example
   * ```typescript
   * const calls = MultiCall.createBatch(tokenContract, [
   *   { method: 'balanceOf', args: [account1] },
   *   { method: 'balanceOf', args: [account2] },
   *   { method: 'totalSupply', args: [] },
   * ]);
   * ```
   */
  static createBatch(
    contract: Contract,
    calls: { method: string; args?: any[] }[]
  ): Call[] {
    const targetAddress = contract.target as string;

    return calls.map((call) => ({
      target: targetAddress,
      callData: contract.interface.encodeFunctionData(call.method, call.args || []),
    }));
  }
}

// =============================================================================
// Exports
// =============================================================================

export { MultiCall as default };

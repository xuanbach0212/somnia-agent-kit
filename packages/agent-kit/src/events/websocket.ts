/**
 * WebSocket Client for Real-Time Events
 *
 * Utilities for subscribing to real-time blockchain events via WebSocket.
 * Supports block subscriptions, transaction monitoring, and contract events.
 *
 * @example
 * ```typescript
 * const ws = new WebSocketClient(chainClient);
 * await ws.connect();
 *
 * // Subscribe to new blocks
 * await ws.subscribeToBlocks((block) => {
 *   console.log('New block:', block.number);
 * });
 *
 * // Subscribe to contract events
 * await ws.subscribeToContractEvents(
 *   contract,
 *   'Transfer',
 *   (from, to, amount) => {
 *     console.log('Transfer:', from, '→', to, amount);
 *   }
 * );
 * ```
 */

import { Contract, ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /** WebSocket RPC URL (optional, derived from HTTP RPC if not provided) */
  wsUrl?: string;
  /** Reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in milliseconds */
  reconnectDelay?: number;
  /** Maximum reconnect attempts */
  maxReconnectAttempts?: number;
}

/**
 * Subscription ID type
 */
export type SubscriptionId = string;

/**
 * Block data
 */
export interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  parentHash: string;
  transactions: string[];
}

/**
 * Log filter
 */
export interface LogFilter {
  /** Contract address(es) to filter */
  address?: string | string[];
  /** Topics to filter (event signatures) */
  topics?: (string | string[] | null)[];
  /** From block */
  fromBlock?: number | 'latest';
  /** To block */
  toBlock?: number | 'latest';
}

// =============================================================================
// WebSocketClient Class
// =============================================================================

/**
 * WebSocket Client for Real-Time Events
 *
 * Provides real-time blockchain event streaming via WebSocket.
 */
export class WebSocketClient {
  private chainClient: ChainClient;
  private wsProvider: ethers.WebSocketProvider | null = null;
  private config: Required<WebSocketConfig>;
  private connected: boolean = false;
  private subscriptions: Map<SubscriptionId, any> = new Map();
  private reconnectAttempts: number = 0;

  /**
   * Create a new WebSocketClient instance
   *
   * @param chainClient - ChainClient instance
   * @param config - WebSocket configuration
   *
   * @example
   * ```typescript
   * const ws = new WebSocketClient(chainClient, {
   *   wsUrl: 'wss://dream-rpc.somnia.network',
   *   autoReconnect: true,
   * });
   * ```
   */
  constructor(chainClient: ChainClient, config: WebSocketConfig = {}) {
    this.chainClient = chainClient;

    // Derive WebSocket URL from HTTP RPC if not provided
    const networkConfig = chainClient.getNetworkConfig();
    const defaultWsUrl = networkConfig.rpcUrl.replace(/^https?:\/\//, 'wss://');

    this.config = {
      wsUrl: config.wsUrl || defaultWsUrl,
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
    };
  }

  /**
   * Connect to WebSocket
   *
   * @example
   * ```typescript
   * await ws.connect();
   * console.log('WebSocket connected');
   * ```
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      this.wsProvider = new ethers.WebSocketProvider(this.config.wsUrl);

      // Wait for connection
      await this.wsProvider.ready;

      this.connected = true;
      this.reconnectAttempts = 0;

      // Setup auto-reconnect
      if (this.config.autoReconnect) {
        this.setupAutoReconnect();
      }
    } catch (error) {
      throw new Error(
        `Failed to connect WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Setup auto-reconnect on disconnect
   */
  private setupAutoReconnect(): void {
    if (!this.wsProvider) return;

    this.wsProvider.on('error', async (error) => {
      console.error('WebSocket error:', error);

      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);

        await new Promise((resolve) => setTimeout(resolve, this.config.reconnectDelay));

        try {
          await this.reconnect();
        } catch (err) {
          console.error('Reconnect failed:', err);
        }
      }
    });
  }

  /**
   * Reconnect WebSocket
   */
  private async reconnect(): Promise<void> {
    this.connected = false;
    this.wsProvider?.destroy();
    this.wsProvider = null;

    await this.connect();

    // Resubscribe to all active subscriptions
    // Note: Implementations would need to track and restore subscriptions
  }

  /**
   * Disconnect WebSocket
   */
  async disconnect(): Promise<void> {
    if (!this.wsProvider) return;

    // Unsubscribe from all
    await this.unsubscribeAll();

    this.wsProvider.destroy();
    this.wsProvider = null;
    this.connected = false;
  }

  /**
   * Check if connected
   *
   * @returns true if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to new blocks
   *
   * @param callback - Callback function
   * @returns Subscription ID
   *
   * @example
   * ```typescript
   * const subId = await ws.subscribeToBlocks((block) => {
   *   console.log('New block:', block.number);
   * });
   * ```
   */
  async subscribeToBlocks(callback: (block: BlockData) => void): Promise<SubscriptionId> {
    const provider = this.getProvider();

    const listener = (blockNumber: number) => {
      provider.getBlock(blockNumber).then((block) => {
        if (block) {
          callback({
            number: block.number,
            hash: block.hash || '',
            timestamp: block.timestamp,
            parentHash: block.parentHash,
            transactions: block.transactions as string[],
          });
        }
      });
    };

    provider.on('block', listener);

    const subId = this.generateSubId('blocks');
    this.subscriptions.set(subId, { type: 'blocks', listener });

    return subId;
  }

  /**
   * Subscribe to pending transactions
   *
   * @param callback - Callback function
   * @returns Subscription ID
   *
   * @example
   * ```typescript
   * await ws.subscribeToPendingTransactions((txHash) => {
   *   console.log('Pending tx:', txHash);
   * });
   * ```
   */
  async subscribeToPendingTransactions(
    callback: (txHash: string) => void
  ): Promise<SubscriptionId> {
    const provider = this.getProvider();

    // Note: Not all providers support pending transactions
    provider.on('pending', callback);

    const subId = this.generateSubId('pending');
    this.subscriptions.set(subId, { type: 'pending', listener: callback });

    return subId;
  }

  /**
   * Subscribe to contract events
   *
   * @param contract - Contract instance
   * @param eventName - Event name
   * @param callback - Callback function
   * @returns Subscription ID
   *
   * @example
   * ```typescript
   * await ws.subscribeToContractEvents(
   *   tokenContract,
   *   'Transfer',
   *   (from, to, amount) => {
   *     console.log(`Transfer: ${from} → ${to}: ${amount}`);
   *   }
   * );
   * ```
   */
  async subscribeToContractEvents(
    contract: Contract,
    eventName: string,
    callback: (...args: any[]) => void
  ): Promise<SubscriptionId> {
    const provider = this.getProvider();

    // Create contract instance with WebSocket provider
    const wsContract = contract.connect(provider) as Contract;

    wsContract.on(eventName, callback);

    const subId = this.generateSubId(`event_${eventName}`);
    this.subscriptions.set(subId, {
      type: 'event',
      contract: wsContract,
      eventName,
      listener: callback,
    });

    return subId;
  }

  /**
   * Subscribe to logs matching a filter
   *
   * @param filter - Log filter
   * @param callback - Callback function
   * @returns Subscription ID
   *
   * @example
   * ```typescript
   * await ws.subscribeToLogs(
   *   {
   *     address: tokenAddress,
   *     topics: [ethers.id('Transfer(address,address,uint256)')],
   *   },
   *   (log) => {
   *     console.log('Log:', log);
   *   }
   * );
   * ```
   */
  async subscribeToLogs(
    filter: LogFilter,
    callback: (log: ethers.Log) => void
  ): Promise<SubscriptionId> {
    const provider = this.getProvider();

    provider.on(filter, callback as any);

    const subId = this.generateSubId('logs');
    this.subscriptions.set(subId, { type: 'logs', filter, listener: callback });

    return subId;
  }

  /**
   * Unsubscribe from a subscription
   *
   * @param subId - Subscription ID
   *
   * @example
   * ```typescript
   * await ws.unsubscribe(subscriptionId);
   * ```
   */
  async unsubscribe(subId: SubscriptionId): Promise<void> {
    const sub = this.subscriptions.get(subId);
    if (!sub) return;

    const provider = this.getProvider();

    switch (sub.type) {
      case 'blocks':
        provider.off('block', sub.listener);
        break;

      case 'pending':
        provider.off('pending', sub.listener);
        break;

      case 'event':
        sub.contract.off(sub.eventName, sub.listener);
        break;

      case 'logs':
        provider.off(sub.filter, sub.listener);
        break;
    }

    this.subscriptions.delete(subId);
  }

  /**
   * Unsubscribe from all subscriptions
   *
   * @example
   * ```typescript
   * await ws.unsubscribeAll();
   * ```
   */
  async unsubscribeAll(): Promise<void> {
    const subIds = Array.from(this.subscriptions.keys());

    for (const subId of subIds) {
      await this.unsubscribe(subId);
    }
  }

  /**
   * Get active subscription count
   *
   * @returns Number of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get WebSocket provider
   *
   * @returns WebSocket provider instance
   * @throws Error if not connected
   */
  private getProvider(): ethers.WebSocketProvider {
    if (!this.wsProvider || !this.connected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    return this.wsProvider;
  }

  /**
   * Generate subscription ID
   *
   * @param type - Subscription type
   * @returns Subscription ID
   */
  private generateSubId(type: string): SubscriptionId {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get WebSocket URL
   *
   * @returns WebSocket URL
   */
  getWebSocketUrl(): string {
    return this.config.wsUrl;
  }

  /**
   * Get configuration
   *
   * @returns Configuration object
   */
  getConfig(): Required<WebSocketConfig> {
    return { ...this.config };
  }
}

// =============================================================================
// Exports
// =============================================================================

export { WebSocketClient as default };

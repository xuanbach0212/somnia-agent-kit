/**
 * Agent Context Management
 * Aggregates chain state, memory, storage, and config into unified context
 * Used by Agent to build comprehensive context for planning and decision-making
 */

import type { ChainClient } from '../core/chainClient';
import type { IStorage, ActionEntry } from '../types/storage';
import type { Memory } from '../runtime/memoryManager';
import type { AgentConfig } from '../types/agent';

// =============================================================================
// Context Types and Interfaces
// =============================================================================

/**
 * Current blockchain state
 */
export interface ChainState {
  blockNumber: number;
  gasPrice: bigint;
  network: string;
  chainId: number;
  timestamp: number;
}

/**
 * Unified agent context
 * Aggregates all relevant information for agent decision-making
 */
export interface AgentContext {
  chainState: ChainState;
  recentActions: ActionEntry[];
  memory: string;
  config: Readonly<AgentConfig>;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Options for building context
 */
export interface ContextBuildOptions {
  maxMemoryTokens?: number;
  maxActions?: number;
  includeChainState?: boolean;
  includeActions?: boolean;
  includeMemory?: boolean;
  metadata?: Record<string, any>;
}

// =============================================================================
// Context Builder
// =============================================================================

/**
 * Context builder for agents
 * Aggregates chain state, memory, storage, and config into unified context
 */
export class ContextBuilder {
  private chainClient?: ChainClient;
  private storage?: IStorage;
  private memory?: Memory;
  private config: Readonly<AgentConfig>;
  private cachedChainState?: ChainState;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 2000; // 2 seconds

  constructor(
    config: Readonly<AgentConfig>,
    chainClient?: ChainClient,
    storage?: IStorage,
    memory?: Memory
  ) {
    this.config = config;
    this.chainClient = chainClient;
    this.storage = storage;
    this.memory = memory;
  }

  /**
   * Build unified agent context
   * Aggregates all available information sources
   */
  async buildContext(options?: ContextBuildOptions): Promise<AgentContext> {
    const opts = {
      maxMemoryTokens: 1000,
      maxActions: 10,
      includeChainState: true,
      includeActions: true,
      includeMemory: true,
      ...options,
    };

    // Build context components in parallel
    const [chainState, recentActions, memoryContext] = await Promise.all([
      opts.includeChainState && this.chainClient
        ? this.getChainState()
        : this.getEmptyChainState(),
      opts.includeActions && this.storage
        ? this.getRecentActions(opts.maxActions)
        : Promise.resolve([]),
      opts.includeMemory && this.memory
        ? this.getMemoryContext(opts.maxMemoryTokens)
        : Promise.resolve(''),
    ]);

    return {
      chainState,
      recentActions,
      memory: memoryContext,
      config: this.config,
      timestamp: Date.now(),
      metadata: opts.metadata,
    };
  }

  /**
   * Get current chain state
   * Uses cached value if available and not expired
   */
  async getChainState(): Promise<ChainState> {
    if (!this.chainClient) {
      return this.getEmptyChainState();
    }

    // Return cached if fresh
    const now = Date.now();
    if (this.cachedChainState && now - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.cachedChainState;
    }

    try {
      const [blockNumber, gasPrice, network] = await Promise.all([
        this.chainClient.getBlockNumber(),
        this.chainClient.getGasPrice(),
        this.chainClient.getProvider().getNetwork(),
      ]);

      const chainState: ChainState = {
        blockNumber,
        gasPrice,
        network: network.name,
        chainId: Number(network.chainId),
        timestamp: Date.now(),
      };

      // Cache the result
      this.cachedChainState = chainState;
      this.cacheTimestamp = now;

      return chainState;
    } catch (error) {
      // Return empty state on error
      return this.getEmptyChainState();
    }
  }

  /**
   * Get recent actions from storage
   */
  async getRecentActions(limit: number = 10): Promise<ActionEntry[]> {
    if (!this.storage) {
      return [];
    }

    try {
      const actions = await this.storage.getActions();
      // Return most recent N actions
      return actions.slice(-limit);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get memory context as formatted string
   */
  async getMemoryContext(maxTokens?: number): Promise<string> {
    if (!this.memory) {
      return '';
    }

    try {
      return await this.memory.getContext(maxTokens);
    } catch (error) {
      return '';
    }
  }

  /**
   * Format context as string for LLM consumption
   */
  formatContext(context: AgentContext): string {
    const parts: string[] = [];

    // Chain state
    if (context.chainState.blockNumber > 0) {
      parts.push('=== Blockchain State ===');
      parts.push(`Network: ${context.chainState.network} (Chain ID: ${context.chainState.chainId})`);
      parts.push(`Block: ${context.chainState.blockNumber}`);
      parts.push(`Gas Price: ${context.chainState.gasPrice.toString()} wei`);
      parts.push('');
    }

    // Agent config
    parts.push('=== Agent Info ===');
    parts.push(`Name: ${context.config.name}`);
    parts.push(`Description: ${context.config.description}`);
    if (context.config.capabilities && context.config.capabilities.length > 0) {
      parts.push(`Capabilities: ${context.config.capabilities.join(', ')}`);
    }
    parts.push('');

    // Recent actions
    if (context.recentActions.length > 0) {
      parts.push('=== Recent Actions ===');
      for (const action of context.recentActions) {
        const timestamp = new Date(action.timestamp).toISOString();
        const status = action.status || 'unknown';
        const actionType = typeof action.action === 'object' && action.action.type
          ? action.action.type
          : 'action';
        parts.push(`[${timestamp}] ${actionType} - ${status}`);
      }
      parts.push('');
    }

    // Memory context
    if (context.memory) {
      parts.push('=== Memory ===');
      parts.push(context.memory);
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Format context as compact string (for limited token budgets)
   */
  formatCompact(context: AgentContext): string {
    const parts: string[] = [];

    // Chain state (single line)
    if (context.chainState.blockNumber > 0) {
      parts.push(
        `Chain: ${context.chainState.network} | Block: ${context.chainState.blockNumber} | Gas: ${context.chainState.gasPrice}wei`
      );
    }

    // Agent (single line)
    parts.push(`Agent: ${context.config.name} - ${context.config.description}`);

    // Recent actions count
    if (context.recentActions.length > 0) {
      const successCount = context.recentActions.filter((a) => a.status === 'success').length;
      parts.push(`Recent: ${successCount}/${context.recentActions.length} actions succeeded`);
    }

    // Memory (first 200 chars if available)
    if (context.memory) {
      const memoryPreview = context.memory.substring(0, 200);
      parts.push(`Memory: ${memoryPreview}${context.memory.length > 200 ? '...' : ''}`);
    }

    return parts.join(' | ');
  }

  /**
   * Get empty chain state (when chain client not available)
   */
  private getEmptyChainState(): ChainState {
    return {
      blockNumber: 0,
      gasPrice: 0n,
      network: 'unknown',
      chainId: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear cached chain state
   */
  clearCache(): void {
    this.cachedChainState = undefined;
    this.cacheTimestamp = 0;
  }

  /**
   * Update chain client
   */
  setChainClient(chainClient: ChainClient): void {
    this.chainClient = chainClient;
    this.clearCache();
  }

  /**
   * Update storage
   */
  setStorage(storage: IStorage): void {
    this.storage = storage;
  }

  /**
   * Update memory
   */
  setMemory(memory: Memory): void {
    this.memory = memory;
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<AgentConfig> {
    return this.config;
  }
}

/**
 * Create context builder
 */
export function createContextBuilder(
  config: Readonly<AgentConfig>,
  chainClient?: ChainClient,
  storage?: IStorage,
  memory?: Memory
): ContextBuilder {
  return new ContextBuilder(config, chainClient, storage, memory);
}

/**
 * Format chain state as string
 */
export function formatChainState(state: ChainState): string {
  return `Network: ${state.network} (Chain ID: ${state.chainId}), Block: ${state.blockNumber}, Gas: ${state.gasPrice}wei`;
}

/**
 * Format actions as string
 */
export function formatActions(actions: ActionEntry[]): string {
  if (actions.length === 0) {
    return 'No recent actions';
  }

  const lines = actions.map((action) => {
    const timestamp = new Date(action.timestamp).toISOString();
    const status = action.status || 'unknown';
    const actionType = typeof action.action === 'object' && action.action.type
      ? action.action.type
      : 'action';
    return `[${timestamp}] ${actionType} - ${status}`;
  });

  return lines.join('\n');
}

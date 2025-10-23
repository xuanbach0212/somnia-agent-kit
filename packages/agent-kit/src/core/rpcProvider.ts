/**
 * RPC Provider Load Balancer
 *
 * Manages multiple RPC endpoints with automatic failover and load balancing strategies.
 * Improves reliability by distributing requests across multiple providers.
 *
 * @example
 * ```typescript
 * const balancer = new RPCLoadBalancer({
 *   urls: [
 *     'https://dream-rpc.somnia.network/',
 *     'https://backup-rpc.somnia.network/', // If available
 *   ],
 *   strategy: 'round-robin',
 *   timeout: 10000,
 *   retries: 3,
 * });
 *
 * const provider = await balancer.getProvider();
 * const blockNumber = await provider.getBlockNumber();
 * ```
 */

import { ethers } from 'ethers';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Load balancing strategy
 */
export type LoadBalancingStrategy = 'round-robin' | 'fastest' | 'random';

/**
 * Provider status
 */
export interface ProviderStatus {
  /** RPC URL */
  url: string;
  /** Whether provider is healthy */
  healthy: boolean;
  /** Last health check timestamp */
  lastCheck: number;
  /** Average response time in ms */
  avgResponseTime?: number;
  /** Total requests made */
  requestCount: number;
  /** Total failures */
  failureCount: number;
}

/**
 * Configuration for RPC load balancer
 */
export interface RPCLoadBalancerConfig {
  /** Array of RPC endpoint URLs */
  urls: string[];

  /** Load balancing strategy to use */
  strategy?: LoadBalancingStrategy;

  /** Timeout for RPC requests in milliseconds */
  timeout?: number;

  /** Number of retries on failure */
  retries?: number;

  /** Health check interval in milliseconds */
  healthCheckInterval?: number;

  /** Enable automatic health checks */
  enableHealthCheck?: boolean;
}

// =============================================================================
// RPCLoadBalancer Class
// =============================================================================

/**
 * RPC Provider Load Balancer
 *
 * Distributes RPC requests across multiple endpoints with automatic failover.
 * Supports multiple load balancing strategies and health monitoring.
 */
export class RPCLoadBalancer {
  private urls: string[];
  private strategy: LoadBalancingStrategy;
  private timeout: number;
  private retries: number;
  private healthCheckInterval: number;
  private enableHealthCheck: boolean;

  private currentIndex: number = 0;
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private providerStatus: Map<string, ProviderStatus> = new Map();
  private healthCheckTimer?: NodeJS.Timeout;

  /**
   * Create a new RPC load balancer
   *
   * @param config - Load balancer configuration
   *
   * @example
   * ```typescript
   * const balancer = new RPCLoadBalancer({
   *   urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
   *   strategy: 'round-robin',
   * });
   * ```
   */
  constructor(config: RPCLoadBalancerConfig) {
    if (!config.urls || config.urls.length === 0) {
      throw new Error('At least one RPC URL must be provided');
    }

    this.urls = config.urls;
    this.strategy = config.strategy || 'round-robin';
    this.timeout = config.timeout || 10000; // 10 seconds default
    this.retries = config.retries || 3;
    this.healthCheckInterval = config.healthCheckInterval || 60000; // 1 minute default
    this.enableHealthCheck = config.enableHealthCheck ?? true;

    // Initialize provider status
    this.urls.forEach((url) => {
      this.providerStatus.set(url, {
        url,
        healthy: true, // Assume healthy initially
        lastCheck: Date.now(),
        requestCount: 0,
        failureCount: 0,
      });
    });

    // Start health checks if enabled
    if (this.enableHealthCheck && this.urls.length > 1) {
      this.startHealthCheck();
    }
  }

  /**
   * Get a provider instance
   *
   * Returns a provider based on the configured load balancing strategy.
   *
   * @returns ethers.JsonRpcProvider instance
   * @throws Error if no healthy providers are available
   *
   * @example
   * ```typescript
   * const provider = await balancer.getProvider();
   * const blockNumber = await provider.getBlockNumber();
   * ```
   */
  async getProvider(): Promise<ethers.JsonRpcProvider> {
    const url = await this.selectProvider();

    // Return cached provider if exists
    if (this.providers.has(url)) {
      return this.providers.get(url)!;
    }

    // Create new provider
    const provider = new ethers.JsonRpcProvider(url);
    this.providers.set(url, provider);

    return provider;
  }

  /**
   * Select a provider URL based on the configured strategy
   *
   * @returns Selected provider URL
   * @throws Error if no healthy providers available
   */
  private async selectProvider(): Promise<string> {
    // Get healthy providers
    const healthyUrls = this.urls.filter((url) => {
      const status = this.providerStatus.get(url);
      return status && status.healthy;
    });

    if (healthyUrls.length === 0) {
      throw new Error('No healthy RPC providers available');
    }

    // Single provider - return it
    if (healthyUrls.length === 1) {
      return healthyUrls[0];
    }

    // Apply strategy
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin(healthyUrls);

      case 'fastest':
        return await this.fastest(healthyUrls);

      case 'random':
        return this.random(healthyUrls);

      default:
        return healthyUrls[0];
    }
  }

  /**
   * Round-robin strategy: Distribute requests evenly across providers
   */
  private roundRobin(urls: string[]): string {
    const url = urls[this.currentIndex % urls.length];
    this.currentIndex = (this.currentIndex + 1) % urls.length;
    return url;
  }

  /**
   * Fastest strategy: Select provider with best response time
   */
  private async fastest(urls: string[]): Promise<string> {
    // Sort by average response time
    const sortedUrls = urls.sort((a, b) => {
      const statusA = this.providerStatus.get(a)!;
      const statusB = this.providerStatus.get(b)!;
      const timeA = statusA.avgResponseTime || Infinity;
      const timeB = statusB.avgResponseTime || Infinity;
      return timeA - timeB;
    });

    return sortedUrls[0];
  }

  /**
   * Random strategy: Select a random provider
   */
  private random(urls: string[]): string {
    const randomIndex = Math.floor(Math.random() * urls.length);
    return urls[randomIndex];
  }

  /**
   * Check health of a specific provider
   *
   * @param url - Provider URL to check
   * @returns true if provider is healthy
   */
  async checkHealth(url: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const provider = new ethers.JsonRpcProvider(url);

      // Try to get block number with timeout
      const blockNumberPromise = provider.getBlockNumber();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), this.timeout);
      });

      await Promise.race([blockNumberPromise, timeoutPromise]);

      const responseTime = Date.now() - startTime;

      // Update status
      const status = this.providerStatus.get(url);
      if (status) {
        status.healthy = true;
        status.lastCheck = Date.now();
        status.avgResponseTime = status.avgResponseTime
          ? (status.avgResponseTime + responseTime) / 2
          : responseTime;
      }

      return true;
    } catch (error) {
      // Mark as unhealthy
      const status = this.providerStatus.get(url);
      if (status) {
        status.healthy = false;
        status.lastCheck = Date.now();
        status.failureCount++;
      }

      return false;
    }
  }

  /**
   * Check health of all providers
   *
   * @returns Map of URL to health status
   */
  async checkAllHealth(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      this.urls.map(async (url) => {
        const healthy = await this.checkHealth(url);
        results.set(url, healthy);
      })
    );

    return results;
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      return; // Already running
    }

    this.healthCheckTimer = setInterval(async () => {
      await this.checkAllHealth();
    }, this.healthCheckInterval);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Get status of all providers
   *
   * @returns Array of provider statuses
   *
   * @example
   * ```typescript
   * const statuses = balancer.getProviderStatuses();
   * statuses.forEach(status => {
   *   console.log(`${status.url}: ${status.healthy ? 'healthy' : 'unhealthy'}`);
   *   console.log(`  Response time: ${status.avgResponseTime}ms`);
   *   console.log(`  Requests: ${status.requestCount}, Failures: ${status.failureCount}`);
   * });
   * ```
   */
  getProviderStatuses(): ProviderStatus[] {
    return Array.from(this.providerStatus.values());
  }

  /**
   * Get status of a specific provider
   *
   * @param url - Provider URL
   * @returns Provider status or undefined if not found
   */
  getProviderStatus(url: string): ProviderStatus | undefined {
    return this.providerStatus.get(url);
  }

  /**
   * Manually mark a provider as healthy or unhealthy
   *
   * @param url - Provider URL
   * @param healthy - Health status
   */
  setProviderHealth(url: string, healthy: boolean): void {
    const status = this.providerStatus.get(url);
    if (status) {
      status.healthy = healthy;
      status.lastCheck = Date.now();
    }
  }

  /**
   * Add a new RPC endpoint to the pool
   *
   * @param url - RPC endpoint URL
   */
  addProvider(url: string): void {
    if (this.urls.includes(url)) {
      return; // Already exists
    }

    this.urls.push(url);
    this.providerStatus.set(url, {
      url,
      healthy: true,
      lastCheck: Date.now(),
      requestCount: 0,
      failureCount: 0,
    });
  }

  /**
   * Remove an RPC endpoint from the pool
   *
   * @param url - RPC endpoint URL
   */
  removeProvider(url: string): void {
    const index = this.urls.indexOf(url);
    if (index !== -1) {
      this.urls.splice(index, 1);
      this.providerStatus.delete(url);
      this.providers.delete(url);
    }
  }

  /**
   * Get list of healthy provider URLs
   *
   * @returns Array of healthy provider URLs
   */
  getHealthyProviders(): string[] {
    return this.urls.filter((url) => {
      const status = this.providerStatus.get(url);
      return status && status.healthy;
    });
  }

  /**
   * Clean up resources
   *
   * Call this when you're done using the load balancer.
   */
  destroy(): void {
    this.stopHealthCheck();
    this.providers.clear();
    this.providerStatus.clear();
  }
}

// =============================================================================
// Exports
// =============================================================================

export { RPCLoadBalancer as default };

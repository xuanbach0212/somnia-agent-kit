/**
 * Contract Verifier
 *
 * Utilities for verifying smart contracts on Somnia Explorer.
 * Supports source code verification and verification status checking.
 *
 * @example
 * ```typescript
 * const verifier = new ContractVerifier(chainClient, {
 *   apiKey: process.env.EXPLORER_API_KEY,
 *   explorerUrl: 'https://shannon-explorer.somnia.network',
 * });
 *
 * // Verify contract
 * const result = await verifier.verifyContract({
 *   address: contractAddress,
 *   sourceCode: sourceCode,
 *   contractName: 'MyContract',
 *   compilerVersion: 'v0.8.20+commit.a1b79de6',
 * });
 * ```
 */

import type { ChainClient } from '../core/chainClient';
import { TIMEOUTS } from '../constants';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Contract verifier configuration
 */
export interface ContractVerifierConfig {
  /** Explorer API key (optional) */
  apiKey?: string;
  /** Explorer API URL */
  explorerUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Contract verification parameters
 */
export interface VerifyContractParams {
  /** Contract address */
  address: string;
  /** Contract source code */
  sourceCode: string;
  /** Contract name */
  contractName: string;
  /** Compiler version (e.g., 'v0.8.20+commit.a1b79de6') */
  compilerVersion: string;
  /** Constructor arguments (ABI-encoded, optional) */
  constructorArgs?: string;
  /** Optimization enabled (optional) */
  optimization?: boolean;
  /** Optimization runs (optional) */
  runs?: number;
  /** EVM version (optional) */
  evmVersion?: string;
  /** License type (optional) */
  licenseType?: string;
}

/**
 * Verification result
 */
export interface VerificationResult {
  /** Whether verification was successful */
  success: boolean;
  /** Verification GUID (if successful) */
  guid?: string;
  /** Error message (if failed) */
  error?: string;
  /** Status message */
  message?: string;
}

/**
 * Verification status
 */
export type VerificationStatus = 'pending' | 'success' | 'failed' | 'unknown';

/**
 * Verification status result
 */
export interface VerificationStatusResult {
  /** Verification status */
  status: VerificationStatus;
  /** Status message */
  message?: string;
  /** Result data (if success) */
  result?: any;
}

// =============================================================================
// ContractVerifier Class
// =============================================================================

/**
 * Contract Verifier
 *
 * Provides utilities for verifying contracts on Somnia Explorer.
 *
 * Note: This is a basic implementation. Full verification support requires
 * the explorer API to be available and properly configured.
 */
export class ContractVerifier {
  private chainClient: ChainClient;
  private config: Required<ContractVerifierConfig>;

  /**
   * Create a new ContractVerifier instance
   *
   * @param chainClient - ChainClient instance
   * @param config - Verifier configuration
   *
   * @example
   * ```typescript
   * const verifier = new ContractVerifier(chainClient, {
   *   apiKey: process.env.EXPLORER_API_KEY,
   *   explorerUrl: 'https://shannon-explorer.somnia.network',
   * });
   * ```
   */
  constructor(chainClient: ChainClient, config: ContractVerifierConfig = {}) {
    this.chainClient = chainClient;

    // Get explorer URL from network config if not provided
    const networkConfig = chainClient.getNetworkConfig();
    const defaultExplorerUrl =
      networkConfig.explorer || 'https://shannon-explorer.somnia.network';

    this.config = {
      apiKey: config.apiKey || '',
      explorerUrl: config.explorerUrl || defaultExplorerUrl,
      timeout: config.timeout || TIMEOUTS.HTTP_REQUEST,
    };
  }

  /**
   * Verify a smart contract on the explorer
   *
   * @param params - Verification parameters
   * @returns Verification result
   *
   * @example
   * ```typescript
   * const result = await verifier.verifyContract({
   *   address: '0x...',
   *   sourceCode: 'contract MyContract { ... }',
   *   contractName: 'MyContract',
   *   compilerVersion: 'v0.8.20+commit.a1b79de6',
   *   optimization: true,
   *   runs: 200,
   * });
   *
   * if (result.success) {
   *   console.log('Verification GUID:', result.guid);
   * }
   * ```
   */
  async verifyContract(params: VerifyContractParams): Promise<VerificationResult> {
    const {
      address,
      sourceCode,
      contractName,
      compilerVersion,
      constructorArgs = '',
      optimization = false,
      runs = 200,
      evmVersion = 'default',
      licenseType = '1', // No License
    } = params;

    // Validate parameters
    if (!address || !sourceCode || !contractName || !compilerVersion) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }

    // Build verification request
    const verificationData = {
      apikey: this.config.apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: address,
      sourceCode,
      contractname: contractName,
      compilerversion: compilerVersion,
      optimizationUsed: optimization ? '1' : '0',
      runs: runs.toString(),
      constructorArguements: constructorArgs, // Note: Some explorers use this typo
      evmversion: evmVersion,
      licenseType,
    };

    try {
      // Make API request
      const response = await this.makeApiRequest(verificationData);

      if (response.status === '1') {
        return {
          success: true,
          guid: response.result,
          message: response.message || 'Verification submitted successfully',
        };
      } else {
        return {
          success: false,
          error: response.result || 'Verification failed',
          message: response.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check verification status
   *
   * @param guid - Verification GUID from verifyContract
   * @returns Verification status
   *
   * @example
   * ```typescript
   * const status = await verifier.checkStatus(guid);
   *
   * if (status.status === 'success') {
   *   console.log('Contract verified!');
   * } else if (status.status === 'pending') {
   *   console.log('Verification pending...');
   * }
   * ```
   */
  async checkStatus(guid: string): Promise<VerificationStatusResult> {
    try {
      const response = await this.makeApiRequest({
        apikey: this.config.apiKey,
        module: 'contract',
        action: 'checkverifystatus',
        guid,
      });

      if (response.status === '1') {
        return {
          status: 'success',
          message: response.result,
        };
      } else if (response.result === 'Pending in queue') {
        return {
          status: 'pending',
          message: 'Verification pending',
        };
      } else {
        return {
          status: 'failed',
          message: response.result || 'Verification failed',
        };
      }
    } catch (error) {
      return {
        status: 'unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Wait for verification to complete
   *
   * @param guid - Verification GUID
   * @param maxAttempts - Maximum number of status checks
   * @param interval - Interval between checks in milliseconds
   * @returns Final verification status
   *
   * @example
   * ```typescript
   * const result = await verifier.verifyContract({...});
   *
   * if (result.success && result.guid) {
   *   const status = await verifier.waitForVerification(result.guid);
   *   console.log('Final status:', status.status);
   * }
   * ```
   */
  async waitForVerification(
    guid: string,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<VerificationStatusResult> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus(guid);

      if (status.status === 'success' || status.status === 'failed') {
        return status;
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    return {
      status: 'unknown',
      message: 'Verification timeout',
    };
  }

  /**
   * Get verified contract source code
   *
   * @param address - Contract address
   * @returns Contract source code and metadata
   *
   * @example
   * ```typescript
   * const source = await verifier.getVerifiedSource(contractAddress);
   * console.log('Source code:', source.sourceCode);
   * ```
   */
  async getVerifiedSource(address: string): Promise<any> {
    try {
      const response = await this.makeApiRequest({
        apikey: this.config.apiKey,
        module: 'contract',
        action: 'getsourcecode',
        address,
      });

      if (response.status === '1' && response.result) {
        return response.result[0];
      } else {
        throw new Error('Contract not verified or not found');
      }
    } catch (error) {
      throw new Error(
        `Failed to get verified source: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a contract is verified
   *
   * @param address - Contract address
   * @returns true if contract is verified
   *
   * @example
   * ```typescript
   * const isVerified = await verifier.isVerified(contractAddress);
   * console.log('Verified:', isVerified);
   * ```
   */
  async isVerified(address: string): Promise<boolean> {
    try {
      const source = await this.getVerifiedSource(address);
      return source && source.SourceCode !== '';
    } catch {
      return false;
    }
  }

  /**
   * Make API request to explorer
   *
   * @param params - Request parameters
   * @returns API response
   */
  private async makeApiRequest(params: Record<string, string>): Promise<any> {
    const apiUrl = `${this.config.explorerUrl}/api`;

    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = `${apiUrl}?${queryString}`;

    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * Get explorer URL for a contract
   *
   * @param address - Contract address
   * @returns Explorer URL
   *
   * @example
   * ```typescript
   * const url = verifier.getExplorerUrl(contractAddress);
   * console.log('View on explorer:', url);
   * ```
   */
  getExplorerUrl(address: string): string {
    return `${this.config.explorerUrl}/address/${address}`;
  }

  /**
   * Get API endpoint URL
   *
   * @returns API URL
   */
  getApiUrl(): string {
    return `${this.config.explorerUrl}/api`;
  }

  /**
   * Update API key
   *
   * @param apiKey - New API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Get current configuration
   *
   * @returns Current config (with API key redacted)
   */
  getConfig(): Partial<ContractVerifierConfig> {
    return {
      explorerUrl: this.config.explorerUrl,
      timeout: this.config.timeout,
      apiKey: this.config.apiKey ? '***' : undefined,
    };
  }
}

// =============================================================================
// Exports
// =============================================================================

export { ContractVerifier as default };

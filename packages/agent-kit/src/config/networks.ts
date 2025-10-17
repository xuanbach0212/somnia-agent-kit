/**
 * Network Definitions
 * Predefined Somnia networks for easy configuration
 */

import type { NetworkConfig } from '../types/config';

/**
 * Predefined Somnia networks
 *
 * @example
 * ```typescript
 * import { SOMNIA_NETWORKS } from '@somnia/agent-kit/config';
 *
 * const config = {
 *   network: SOMNIA_NETWORKS.testnet,
 *   // ... other config
 * };
 * ```
 */
export const SOMNIA_NETWORKS = {
  mainnet: {
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Mainnet',
  },
  testnet: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    name: 'Somnia Dream Testnet',
  },
  devnet: {
    rpcUrl: 'http://localhost:8545',
    chainId: 50313,
    name: 'Somnia Devnet',
  },
} as const satisfies Record<string, NetworkConfig>;

/**
 * Default network for development
 * Points to testnet for safe testing
 */
export const DEFAULT_NETWORK = SOMNIA_NETWORKS.testnet;

/**
 * Get network configuration by name
 *
 * @param name Network name (mainnet, testnet, or devnet)
 * @returns Network configuration
 *
 * @example
 * ```typescript
 * const network = getNetwork('testnet');
 * console.log(network.chainId); // 50312
 * ```
 */
export function getNetwork(name: keyof typeof SOMNIA_NETWORKS): NetworkConfig {
  return SOMNIA_NETWORKS[name];
}

/**
 * Check if a network name is valid
 *
 * @param name Network name to check
 * @returns true if network name is valid
 */
export function isValidNetwork(name: string): name is keyof typeof SOMNIA_NETWORKS {
  return name in SOMNIA_NETWORKS;
}

/**
 * Preset Configurations for Common Use Cases
 * Ready-to-use configs for shared platform and self-hosted deployments
 */

import type { AgentKitConfig } from '../types/config';

/**
 * Official Somnia Agent Kit Contract Addresses
 * Deployed and maintained by Somnia team
 */
export const OFFICIAL_CONTRACTS = {
  testnet: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  mainnet: {
    // To be deployed on mainnet
    agentRegistry: '',
    agentManager: '',
    agentExecutor: '',
    agentVault: '',
  },
} as const;

/**
 * Somnia Network Configurations
 */
export const SOMNIA_NETWORKS = {
  testnet: {
    name: 'Somnia Dream Testnet',
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    explorer: 'https://explorer.somnia.network',
  },
  mainnet: {
    name: 'Somnia Mainnet',
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    explorer: 'https://explorer.somnia.network',
  },
  localhost: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    explorer: '',
  },
} as const;

/**
 * Preset: Shared Platform (Testnet)
 * Use official contracts deployed by Somnia team
 *
 * Best for:
 * - Individual developers
 * - Prototypes & MVPs
 * - Quick start
 * - Low to medium volume
 *
 * Benefits:
 * - Zero deployment cost
 * - Instant start
 * - Network effects
 * - Maintained by platform
 *
 * Trade-offs:
 * - 2.5% platform fee
 * - Less privacy
 * - Limited customization
 *
 * @example
 * ```typescript
 * import { SomniaAgentKit, SHARED_PLATFORM_TESTNET } from 'somnia-agent-kit;
 *
 * const kit = new SomniaAgentKit(SHARED_PLATFORM_TESTNET);
 * await kit.initialize();
 * ```
 */
export const SHARED_PLATFORM_TESTNET: Partial<AgentKitConfig> = {
  network: SOMNIA_NETWORKS.testnet,
  contracts: OFFICIAL_CONTRACTS.testnet,
  logLevel: 'info',
  metricsEnabled: true,
};

/**
 * Preset: Shared Platform (Mainnet)
 * Use official contracts on Somnia mainnet
 *
 * @example
 * ```typescript
 * import { SomniaAgentKit, SHARED_PLATFORM_MAINNET } from 'somnia-agent-kit;
 *
 * const kit = new SomniaAgentKit(SHARED_PLATFORM_MAINNET);
 * await kit.initialize();
 * ```
 */
export const SHARED_PLATFORM_MAINNET: Partial<AgentKitConfig> = {
  network: SOMNIA_NETWORKS.mainnet,
  contracts: OFFICIAL_CONTRACTS.mainnet,
  logLevel: 'warn',
  metricsEnabled: true,
};

/**
 * Preset: Self-Hosted (from environment variables)
 * Use your own deployed contracts
 *
 * Best for:
 * - Enterprises
 * - Privacy requirements
 * - Custom logic
 * - High volume (saves on fees)
 *
 * Benefits:
 * - Full control
 * - No platform fees
 * - Privacy
 * - Custom features
 *
 * Trade-offs:
 * - Deployment cost (~0.5 STT)
 * - Maintenance burden
 * - No network effects
 *
 * Required .env variables:
 * - SOMNIA_RPC_URL
 * - SOMNIA_CHAIN_ID
 * - AGENT_REGISTRY_ADDRESS
 * - AGENT_MANAGER_ADDRESS
 * - AGENT_EXECUTOR_ADDRESS
 * - AGENT_VAULT_ADDRESS
 *
 * @example
 * ```typescript
 * import { SomniaAgentKit, SELF_HOSTED_CONFIG } from 'somnia-agent-kit;
 *
 * const kit = new SomniaAgentKit(SELF_HOSTED_CONFIG);
 * await kit.initialize();
 * ```
 */
export const SELF_HOSTED_CONFIG: Partial<AgentKitConfig> = {
  network: {
    name: 'self-hosted',
    rpcUrl: process.env.SOMNIA_RPC_URL || '',
    chainId: parseInt(process.env.SOMNIA_CHAIN_ID || '50312'),
  },
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS || '',
    agentManager: process.env.AGENT_MANAGER_ADDRESS,
    agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS || '',
    agentVault: process.env.AGENT_VAULT_ADDRESS,
  },
  logLevel: 'info',
  metricsEnabled: true,
};

/**
 * Preset: Local Development
 * For testing on local Hardhat network
 *
 * Usage:
 * 1. Start local network: `pnpm hardhat node`
 * 2. Deploy contracts: `pnpm hardhat run scripts/deploy.ts --network localhost`
 * 3. Update addresses in .env
 *
 * @example
 * ```typescript
 * import { SomniaAgentKit, LOCAL_DEVELOPMENT } from 'somnia-agent-kit;
 *
 * const kit = new SomniaAgentKit(LOCAL_DEVELOPMENT);
 * await kit.initialize();
 * ```
 */
export const LOCAL_DEVELOPMENT: Partial<AgentKitConfig> = {
  network: SOMNIA_NETWORKS.localhost,
  contracts: {
    agentRegistry: process.env.LOCAL_AGENT_REGISTRY_ADDRESS || '',
    agentManager: process.env.LOCAL_AGENT_MANAGER_ADDRESS,
    agentExecutor: process.env.LOCAL_AGENT_EXECUTOR_ADDRESS || '',
    agentVault: process.env.LOCAL_AGENT_VAULT_ADDRESS,
  },
  logLevel: 'debug',
  metricsEnabled: false,
  telemetryEnabled: false,
};

/**
 * Helper: Create custom config with official contracts
 *
 * @example
 * ```typescript
 * const config = withOfficialContracts('testnet', {
 *   logLevel: 'debug',
 *   metricsEnabled: false,
 * });
 * ```
 */
export function withOfficialContracts(
  network: 'testnet' | 'mainnet',
  overrides?: Partial<AgentKitConfig>
): Partial<AgentKitConfig> {
  return {
    network: SOMNIA_NETWORKS[network],
    contracts: OFFICIAL_CONTRACTS[network],
    ...overrides,
  };
}

/**
 * Helper: Create custom config with your contracts
 *
 * @example
 * ```typescript
 * const config = withCustomContracts({
 *   agentRegistry: '0xYOUR_REGISTRY...',
 *   agentManager: '0xYOUR_MANAGER...',
 *   agentExecutor: '0xYOUR_EXECUTOR...',
 *   agentVault: '0xYOUR_VAULT...',
 * }, {
 *   network: SOMNIA_NETWORKS.testnet,
 *   logLevel: 'info',
 * });
 * ```
 */
export function withCustomContracts(
  contracts: {
    agentRegistry: string;
    agentManager?: string;
    agentExecutor: string;
    agentVault?: string;
  },
  overrides?: Partial<AgentKitConfig>
): Partial<AgentKitConfig> {
  return {
    contracts,
    ...overrides,
  };
}

/**
 * Export all presets
 */
export const PRESETS = {
  SHARED_PLATFORM_TESTNET,
  SHARED_PLATFORM_MAINNET,
  SELF_HOSTED_CONFIG,
  LOCAL_DEVELOPMENT,
} as const;

/**
 * Export helpers
 */
export const helpers = {
  withOfficialContracts,
  withCustomContracts,
} as const;

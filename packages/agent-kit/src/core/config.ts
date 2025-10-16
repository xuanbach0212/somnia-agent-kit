/**
 * Configuration for Somnia Agent Kit
 */

export interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  name: string;
}

export interface ContractAddresses {
  agentRegistry: string;
  agentExecutor: string;
  agentVault?: string;
}

export interface AgentKitConfig {
  network: NetworkConfig;
  contracts: ContractAddresses;
  privateKey?: string;
}

export const SOMNIA_NETWORKS = {
  mainnet: {
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Mainnet',
  },
  testnet: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Dream Testnet',
  },
  devnet: {
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    name: 'Somnia Devnet',
  },
} as const;

export function validateConfig(config: AgentKitConfig): void {
  if (!config.network.rpcUrl) {
    throw new Error('Network RPC URL is required');
  }

  if (!config.contracts.agentRegistry) {
    throw new Error('AgentRegistry contract address is required');
  }

  if (!config.contracts.agentExecutor) {
    throw new Error('AgentExecutor contract address is required');
  }
}

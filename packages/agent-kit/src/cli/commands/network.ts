/**
 * Network Commands
 * View network information and contract addresses
 */

import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface NetworkInfoOptions {
  _positional?: string[];
}

export interface NetworkContractsOptions {
  _positional?: string[];
}

/**
 * Initialize SDK from config
 */
async function initSDK(): Promise<SomniaAgentKit> {
  const config = loadConfig();

  const kit = new SomniaAgentKit({
    network: {
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      name: config.network,
    },
    contracts: {
      agentRegistry: config.contracts.agentRegistry,
      agentManager: config.contracts.agentManager,
      agentExecutor: config.contracts.agentExecutor,
      agentVault: config.contracts.agentVault,
    },
    privateKey: config.privateKey || process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  return kit;
}

/**
 * Network info command
 */
export async function networkInfoCommand(options: NetworkInfoOptions): Promise<void> {
  console.log(`🌐 Fetching network information...\n`);

  // Initialize SDK
  const kit = await initSDK();
  const network = kit.getNetworkInfo();
  const provider = kit.getProvider();

  // Get block number
  const blockNumber = await provider.getBlockNumber();

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  Network Information                                                      ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Name:         ${network.name.padEnd(58)}║`);
  console.log(`║  Chain ID:     ${network.chainId.toString().padEnd(58)}║`);
  console.log(`║  RPC URL:      ${network.rpcUrl.padEnd(58)}║`);
  console.log(`║  Block Number: ${blockNumber.toString().padEnd(58)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();
}

/**
 * Network contracts command
 */
export async function networkContractsCommand(
  options: NetworkContractsOptions
): Promise<void> {
  console.log(`📋 Fetching contract addresses...\n`);

  // Load config
  const config = loadConfig();

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(`║  Contract Addresses (${config.network.padEnd(52)})║`);
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  AgentRegistry:  ${config.contracts.agentRegistry.padEnd(54)}║`);
  console.log(`║  AgentManager:   ${config.contracts.agentManager.padEnd(54)}║`);
  console.log(`║  AgentExecutor:  ${config.contracts.agentExecutor.padEnd(54)}║`);
  console.log(`║  AgentVault:     ${config.contracts.agentVault.padEnd(54)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();

  console.log('💡 You can verify these contracts on the block explorer:');
  if (config.network === 'testnet') {
    console.log('   https://explorer.somnia.network/testnet\n');
  } else if (config.network === 'mainnet') {
    console.log('   https://explorer.somnia.network\n');
  }
}

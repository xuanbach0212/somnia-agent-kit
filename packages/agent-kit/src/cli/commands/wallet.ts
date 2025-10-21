/**
 * Wallet Commands
 * View wallet information and balance
 */

import { ethers } from 'ethers';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface WalletBalanceOptions {
  _positional?: string[];
}

export interface WalletInfoOptions {
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
 * Wallet balance command
 */
export async function walletBalanceCommand(options: WalletBalanceOptions): Promise<void> {
  // Initialize SDK
  const kit = await initSDK();
  const provider = kit.getProvider();

  // Get address
  let address: string;
  if (options._positional && options._positional.length > 0) {
    address = options._positional[0];
  } else {
    const signer = kit.getSigner();
    if (!signer) {
      throw new Error(
        'Private key required. Set PRIVATE_KEY or provide address as argument'
      );
    }
    address = await signer.getAddress();
  }

  console.log(`💰 Fetching balance for ${address}...\n`);

  // Get balance
  const balance = await provider.getBalance(address);
  const balanceInEth = ethers.formatEther(balance);

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  Wallet Balance                                                           ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Address:  ${address.padEnd(61)}║`);
  console.log(`║  Balance:  ${balanceInEth.padEnd(61)}║`);
  console.log(`║  Wei:      ${balance.toString().padEnd(61)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();
}

/**
 * Wallet info command
 */
export async function walletInfoCommand(options: WalletInfoOptions): Promise<void> {
  // Initialize SDK
  const kit = await initSDK();
  const provider = kit.getProvider();

  // Check signer
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const address = await signer.getAddress();

  console.log(`👤 Fetching wallet info...\n`);

  // Get balance
  const balance = await provider.getBalance(address);
  const balanceInEth = ethers.formatEther(balance);

  // Get transaction count
  const txCount = await provider.getTransactionCount(address);

  // Get network
  const network = await provider.getNetwork();

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  Wallet Information                                                       ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Address:     ${address.padEnd(58)}║`);
  console.log(`║  Balance:     ${balanceInEth.padEnd(58)}║`);
  console.log(`║  TX Count:    ${txCount.toString().padEnd(58)}║`);
  console.log(`║  Network:     ${network.name.padEnd(58)}║`);
  console.log(`║  Chain ID:    ${network.chainId.toString().padEnd(58)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();
}

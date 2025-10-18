/**
 * Simple Agent Demo
 * Basic usage example of Somnia Agent Kit with deployed contracts
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaAgentKit } from '../../packages/agent-kit/src';

dotenv.config({ path: '../../.env' });

// Official deployed contracts on Somnia Testnet
const DEPLOYED_CONTRACTS = {
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
};

async function main() {
  console.log('🚀 Somnia Agent Kit - Simple Demo\n');

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  // Create SDK instance with deployed contracts
  const kit = new SomniaAgentKit({
    network: {
      name: 'somnia-testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: 50312,
    },
    contracts: DEPLOYED_CONTRACTS,
    privateKey: process.env.PRIVATE_KEY,
  });

  console.log('📦 SomniaAgentKit instance created');
  console.log('   Network: Somnia Dream Testnet');
  console.log('   Chain ID: 50312');
  console.log();

  // Initialize
  console.log('🔄 Initializing SDK...');
  await kit.initialize();
  console.log('✅ SDK initialized successfully!');
  console.log();

  // Get contract addresses
  const addresses = kit.contracts.getAddresses();
  console.log('📋 Connected to contracts:');
  console.log('   Registry:', addresses.agentRegistry);
  console.log('   Manager:', addresses.agentManager);
  console.log('   Executor:', addresses.agentExecutor);
  console.log('   Vault:', addresses.agentVault);
  console.log();

  // Get wallet info
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  console.log('👛 Wallet Info:');
  console.log('   Address:', address);
  console.log('   Balance:', ethers.formatEther(balance), 'STT');
  console.log();

  // Query registry
  console.log('📊 Querying AgentRegistry...');
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('   Total agents on platform:', totalAgents.toString());
  console.log();

  console.log('✨ Demo complete! SDK is working correctly.');
  console.log();
  console.log('🌐 View contracts on Explorer:');
  console.log(`   https://explorer.somnia.network/address/${addresses.agentRegistry}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

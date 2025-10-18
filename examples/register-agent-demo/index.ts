/**
 * Register Agent Demo
 * Complete example showing how to register an agent on Somnia testnet
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
  console.log('🤖 Register Agent Demo\n');

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  // 1. Initialize SDK
  console.log('📦 Step 1: Initialize SDK...');
  const kit = new SomniaAgentKit({
    network: {
      name: 'somnia-testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: 50312,
    },
    contracts: DEPLOYED_CONTRACTS,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // 2. Check wallet balance
  console.log('💰 Step 2: Check wallet balance...');
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  console.log('   Address:', address);
  console.log('   Balance:', ethers.formatEther(balance), 'STT');

  if (balance === 0n) {
    console.error('\n❌ Error: Insufficient balance. Please get STT tokens from faucet.');
    process.exit(1);
  }
  console.log('✅ Sufficient balance\n');

  // 3. Check existing agents
  console.log('📊 Step 3: Check existing agents...');
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('   Total agents on platform:', totalAgents.toString());

  const ownerAgents = await kit.contracts.registry.getOwnerAgents(address);
  console.log('   Your agents:', ownerAgents.length);
  console.log();

  // 4. Register new agent
  console.log('🚀 Step 4: Registering new agent...');
  console.log('   Name: Demo Trading Agent');
  console.log('   Description: AI-powered trading agent for testing');
  console.log('   Capabilities: trading, analysis, execution');
  console.log();

  const tx = await kit.contracts.registry.registerAgent(
    'Demo Trading Agent',
    'AI-powered trading agent for testing Somnia Agent Kit',
    'ipfs://QmDemoAgentMetadata123',
    ['trading', 'analysis', 'execution', 'demo']
  );

  console.log('   TX submitted:', tx.hash);
  console.log('   Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('✅ Agent registered successfully!');
  console.log('   Gas used:', receipt?.gasUsed.toString());
  console.log('   Block:', receipt?.blockNumber);
  console.log();

  // 5. Get agent details
  console.log('📋 Step 5: Fetching agent details...');
  const newTotalAgents = await kit.contracts.registry.getTotalAgents();
  const agentId = newTotalAgents;

  const agent = await kit.contracts.registry.getAgent(agentId);
  const capabilities = await kit.contracts.registry.getAgentCapabilities(agentId);

  console.log('   Agent ID:', agentId.toString());
  console.log('   Name:', agent.name);
  console.log('   Description:', agent.description);
  console.log('   Owner:', agent.owner);
  console.log('   Active:', agent.isActive);
  console.log(
    '   Registered at:',
    new Date(Number(agent.registeredAt) * 1000).toISOString()
  );
  console.log('   Capabilities:', capabilities.join(', '));
  console.log();

  // 6. Summary
  console.log('🎉 Success! Your agent is live on Somnia testnet!');
  console.log();
  console.log('🌐 View on Explorer:');
  console.log(
    `   Registry: https://explorer.somnia.network/address/${DEPLOYED_CONTRACTS.agentRegistry}`
  );
  console.log(`   Transaction: https://explorer.somnia.network/tx/${tx.hash}`);
  console.log();
  console.log('📊 Platform Stats:');
  console.log(`   Total agents: ${newTotalAgents.toString()}`);
  console.log(`   Your agents: ${ownerAgents.length + 1}`);
  console.log();
  console.log('💡 Next Steps:');
  console.log('   1. Create a vault for your agent');
  console.log('   2. Deposit funds to the vault');
  console.log('   3. Create tasks for your agent');
  console.log('   4. Start earning! (minus 2.5% platform fee)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  });

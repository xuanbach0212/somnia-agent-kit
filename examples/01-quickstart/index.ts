/**
 * Example 1: Quickstart
 *
 * Basic SDK initialization and contract interaction
 */

import * as dotenv from 'dotenv';
import { SOMNIA_NETWORKS, SomniaAgentKit } from '../../packages/agent-kit/src';

dotenv.config();

async function main() {
  console.log('🚀 Somnia Agent Kit - Quickstart\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // Get network info
  const network = kit.getNetworkInfo();
  console.log('📡 Network:', network.name);
  console.log('🔗 Chain ID:', network.chainId);
  console.log('🌐 RPC:', network.rpcUrl);

  // Get signer address
  const signer = kit.getSigner();
  if (signer) {
    const address = await signer.getAddress();
    console.log('👤 Address:', address);

    const balance = await kit.getProvider().getBalance(address);
    console.log('💰 Balance:', balance.toString(), 'wei\n');
  }

  // Query total agents
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('🤖 Total Agents:', totalAgents.toString());

  // Get agent details (if exists)
  if (totalAgents > 0n) {
    const agent = await kit.contracts.registry.getAgent(1);
    console.log('\n📋 Agent #1:');
    console.log('  Name:', agent.name);
    console.log('  Owner:', agent.owner);
    console.log('  Active:', agent.isActive);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);

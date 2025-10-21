/**
 * Example 2: Register Agent
 *
 * Register a new AI agent on-chain
 */

import * as dotenv from 'dotenv';
import { SOMNIA_NETWORKS, SomniaAgentKit } from '../../packages/agent-kit/src';

dotenv.config();

async function main() {
  console.log('🤖 Register AI Agent\n');

  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  // Register agent
  console.log('📝 Registering agent...');

  const tx = await kit.contracts.registry.registerAgent(
    'Trading Bot',
    'AI-powered trading assistant',
    'ipfs://QmExample123', // Metadata URI
    ['trading', 'analysis', 'portfolio-management']
  );

  console.log('⏳ Transaction sent:', tx.hash);
  const receipt = await tx.wait();

  if (!receipt) {
    console.error('❌ Transaction failed');
    return;
  }

  console.log('✅ Transaction confirmed!');

  // Get agent ID from event
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] ===
      kit.contracts.registry.interface.getEvent('AgentRegistered').topicHash
  );

  if (event) {
    const parsed = kit.contracts.registry.interface.parseLog(event);
    const agentId = parsed?.args.agentId;

    console.log('\n🎉 Agent registered!');
    console.log('🆔 Agent ID:', agentId.toString());

    // Query agent details
    const agent = await kit.contracts.registry.getAgent(agentId);
    console.log('\n📋 Agent Details:');
    console.log('  Name:', agent.name);
    console.log('  Description:', agent.description);
    console.log('  Owner:', agent.owner);
    console.log('  Active:', agent.isActive);
    console.log('  Metadata:', agent.ipfsMetadata);

    // Get capabilities
    const capabilities = await kit.contracts.registry.getAgentCapabilities(agentId);
    console.log('  Capabilities:', capabilities);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);

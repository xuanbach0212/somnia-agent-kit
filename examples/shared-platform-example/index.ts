/**
 * Example: Using Shared Platform
 *
 * This example shows how to use the official Somnia Agent Kit contracts
 * deployed by the platform. This is the recommended approach for most users.
 *
 * Benefits:
 * - Zero deployment cost
 * - Instant start
 * - Network effects
 * - Platform maintained
 *
 * Trade-offs:
 * - 2.5% platform fee per task
 * - Agents are publicly visible
 */

import { SHARED_PLATFORM_TESTNET, SomniaAgentKit } from '@somnia/agent-kit';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 Shared Platform Example\n');

  // 1. Initialize SDK with shared platform contracts
  console.log('📦 Initializing SDK with shared platform contracts...');
  const kit = new SomniaAgentKit({
    ...SHARED_PLATFORM_TESTNET,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // 2. Get contract addresses
  const addresses = kit.contracts.getAddresses();
  console.log('📋 Using shared contracts:');
  console.log('   Registry:', addresses.agentRegistry);
  console.log('   Manager:', addresses.agentManager);
  console.log('   Executor:', addresses.agentExecutor);
  console.log('   Vault:', addresses.agentVault);
  console.log();

  // 3. Register an agent
  console.log('🤖 Registering agent on shared platform...');
  const tx = await kit.contracts.registry.registerAgent(
    'Shared Platform Agent',
    'An agent using shared infrastructure',
    'ipfs://QmSharedAgentMetadata',
    ['trading', 'analysis', 'execution']
  );

  await tx.wait();
  console.log('✅ Agent registered!');
  console.log('   TX:', tx.hash);
  console.log();

  // 4. Get total agents on platform
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('📊 Platform Statistics:');
  console.log('   Total agents:', totalAgents.toString());
  console.log('   Your agent ID:', totalAgents.toString());
  console.log();

  // 5. Create a vault for the agent
  console.log('💰 Creating vault on shared platform...');
  const agentAddress = await kit.getChainClient().getSigner().getAddress();

  const vaultTx = await kit.contracts.vault.createVault(
    agentAddress,
    ethers.parseEther('10') // 10 STT daily limit
  );

  await vaultTx.wait();
  console.log('✅ Vault created!');
  console.log('   Daily limit: 10 STT');
  console.log();

  // 6. Check vault status
  const isActive = await kit.contracts.vault.isVaultActive(agentAddress);
  console.log('📊 Vault Status:');
  console.log('   Active:', isActive);
  console.log();

  console.log('🎉 Success! Your agent is live on the shared platform!');
  console.log();
  console.log('🌐 View on Explorer:');
  console.log(`   https://explorer.somnia.network/address/${addresses.agentRegistry}`);
  console.log();
  console.log('💡 Next Steps:');
  console.log('   1. Deposit funds to your vault');
  console.log('   2. Create tasks for your agent');
  console.log('   3. Start earning! (minus 2.5% platform fee)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

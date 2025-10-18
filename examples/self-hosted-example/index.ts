/**
 * Example: Self-Hosted Deployment
 *
 * This example shows how to deploy and use your own contracts.
 * This is recommended for enterprises and projects with specific requirements.
 *
 * Benefits:
 * - Full control over contracts
 * - No platform fees (0%)
 * - Complete privacy
 * - Custom logic possible
 *
 * Trade-offs:
 * - Deployment cost (~0.5 STT one-time)
 * - Maintenance responsibility
 * - No network effects
 *
 * Prerequisites:
 * 1. Deploy contracts: `cd contracts && pnpm hardhat run scripts/deploy.ts --network testnet`
 * 2. Set contract addresses in .env
 */

import { SELF_HOSTED_CONFIG, SomniaAgentKit } from '@somnia/agent-kit';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🏢 Self-Hosted Deployment Example\n');

  // Validate environment variables
  if (!process.env.AGENT_REGISTRY_ADDRESS) {
    console.error('❌ Error: AGENT_REGISTRY_ADDRESS not set in .env');
    console.log('\n📝 Please deploy contracts first:');
    console.log('   cd contracts');
    console.log('   pnpm hardhat run scripts/deploy.ts --network testnet');
    console.log('\n   Then add addresses to .env file');
    process.exit(1);
  }

  // 1. Initialize SDK with your own contracts
  console.log('📦 Initializing SDK with self-hosted contracts...');
  const kit = new SomniaAgentKit({
    ...SELF_HOSTED_CONFIG,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // 2. Get your contract addresses
  const addresses = kit.contracts.getAddresses();
  console.log('📋 Using YOUR contracts:');
  console.log('   Registry:', addresses.agentRegistry);
  console.log('   Manager:', addresses.agentManager);
  console.log('   Executor:', addresses.agentExecutor);
  console.log('   Vault:', addresses.agentVault);
  console.log();

  // 3. Register an agent (on YOUR contracts)
  console.log('🤖 Registering agent on YOUR private contracts...');
  const tx = await kit.contracts.registry.registerAgent(
    'Private Enterprise Agent',
    'Confidential agent on private infrastructure',
    'ipfs://QmPrivateMetadata',
    ['confidential', 'enterprise', 'trading']
  );

  await tx.wait();
  console.log('✅ Agent registered privately!');
  console.log('   TX:', tx.hash);
  console.log();

  // 4. Get total agents (only yours!)
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('📊 Your Private Platform Statistics:');
  console.log('   Total agents (yours only):', totalAgents.toString());
  console.log('   Agent ID:', totalAgents.toString());
  console.log();

  // 5. Create a vault
  console.log('💰 Creating vault on YOUR vault contract...');
  const agentAddress = await kit.getChainClient().getSigner().getAddress();

  const vaultTx = await kit.contracts.vault.createVault(
    agentAddress,
    ethers.parseEther('100') // 100 STT daily limit (you control this!)
  );

  await vaultTx.wait();
  console.log('✅ Vault created!');
  console.log('   Daily limit: 100 STT (customizable)');
  console.log();

  // 6. Check vault status
  const isActive = await kit.contracts.vault.isVaultActive(agentAddress);
  const balance = await kit.contracts.vault.getNativeBalance(agentAddress);

  console.log('📊 Vault Status:');
  console.log('   Active:', isActive);
  console.log('   Balance:', ethers.formatEther(balance), 'STT');
  console.log();

  console.log('🎉 Success! Your private agent infrastructure is live!');
  console.log();
  console.log('🌐 View YOUR contracts on Explorer:');
  console.log(
    `   Registry: https://explorer.somnia.network/address/${addresses.agentRegistry}`
  );
  console.log(
    `   Manager: https://explorer.somnia.network/address/${addresses.agentManager}`
  );
  console.log(
    `   Executor: https://explorer.somnia.network/address/${addresses.agentExecutor}`
  );
  console.log(
    `   Vault: https://explorer.somnia.network/address/${addresses.agentVault}`
  );
  console.log();
  console.log('💡 Benefits:');
  console.log('   ✅ No platform fees (0% instead of 2.5%)');
  console.log('   ✅ Complete privacy - only you see agents');
  console.log('   ✅ Full control - modify contracts as needed');
  console.log('   ✅ Custom logic - add your own features');
  console.log();
  console.log('📊 Cost Analysis:');
  console.log('   Deployment: ~0.5 STT (one-time)');
  console.log('   Break-even: ~200 tasks');
  console.log('   After 200 tasks: Save 2.5% on every transaction!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

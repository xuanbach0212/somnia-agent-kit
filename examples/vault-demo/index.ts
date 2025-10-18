/**
 * Vault Demo
 * Complete example showing how to create and manage agent vaults
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
  console.log('💰 Agent Vault Demo\n');

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

  // 2. Get wallet info
  const signer = kit.getChainClient().getSigner();
  const agentAddress = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(agentAddress);

  console.log('👛 Wallet Info:');
  console.log('   Address:', agentAddress);
  console.log('   Balance:', ethers.formatEther(balance), 'STT\n');

  // 3. Check if vault exists
  console.log('🔍 Step 2: Checking vault status...');
  try {
    const vaultExists = await kit.contracts.vault.isVaultActive(agentAddress);
    console.log('   Vault exists:', vaultExists);

    if (vaultExists) {
      const vaultBalance = await kit.contracts.vault.getNativeBalance(agentAddress);
      const limitInfo = await kit.contracts.vault.getDailyLimitInfo(agentAddress);

      console.log('   Vault balance:', ethers.formatEther(vaultBalance), 'STT');
      console.log('   Daily limit:', ethers.formatEther(limitInfo.limit), 'STT');
      console.log('   Daily spent:', ethers.formatEther(limitInfo.spent), 'STT');
      console.log('   Remaining:', ethers.formatEther(limitInfo.remaining), 'STT');
      console.log('\n✅ Vault already exists\n');
      return;
    }
  } catch (error) {
    console.log('   Vault does not exist yet\n');
  }

  // 4. Create vault
  console.log('🚀 Step 3: Creating vault...');
  const dailyLimit = ethers.parseEther('1.0'); // 1 STT daily limit
  console.log('   Daily limit:', ethers.formatEther(dailyLimit), 'STT');

  const createTx = await kit.contracts.vault.createVault(agentAddress, dailyLimit);
  console.log('   TX submitted:', createTx.hash);
  console.log('   Waiting for confirmation...');

  const createReceipt = await createTx.wait();
  console.log('✅ Vault created successfully!');
  console.log('   Gas used:', createReceipt?.gasUsed.toString());
  console.log();

  // 5. Deposit funds
  console.log('💸 Step 4: Depositing funds to vault...');
  const depositAmount = ethers.parseEther('0.1'); // 0.1 STT
  console.log('   Amount:', ethers.formatEther(depositAmount), 'STT');

  const depositTx = await kit.contracts.vault.depositNative(agentAddress, {
    value: depositAmount,
  });
  console.log('   TX submitted:', depositTx.hash);
  console.log('   Waiting for confirmation...');

  const depositReceipt = await depositTx.wait();
  console.log('✅ Deposit successful!');
  console.log('   Gas used:', depositReceipt?.gasUsed.toString());
  console.log();

  // 6. Check vault status
  console.log('📊 Step 5: Checking vault status...');
  const vaultBalance = await kit.contracts.vault.getNativeBalance(agentAddress);
  const isActive = await kit.contracts.vault.isVaultActive(agentAddress);
  const limitInfo = await kit.contracts.vault.getDailyLimitInfo(agentAddress);

  console.log('   Active:', isActive);
  console.log('   Balance:', ethers.formatEther(vaultBalance), 'STT');
  console.log('   Daily limit:', ethers.formatEther(limitInfo.limit), 'STT');
  console.log('   Daily spent:', ethers.formatEther(limitInfo.spent), 'STT');
  console.log('   Remaining today:', ethers.formatEther(limitInfo.remaining), 'STT');
  console.log(
    '   Resets at:',
    new Date(Number(limitInfo.resetTime) * 1000).toISOString()
  );
  console.log();

  // 7. Summary
  console.log('🎉 Success! Your agent vault is ready!');
  console.log();
  console.log('🌐 View on Explorer:');
  console.log(
    `   Vault Contract: https://explorer.somnia.network/address/${DEPLOYED_CONTRACTS.agentVault}`
  );
  console.log(`   Create TX: https://explorer.somnia.network/tx/${createTx.hash}`);
  console.log(`   Deposit TX: https://explorer.somnia.network/tx/${depositTx.hash}`);
  console.log();
  console.log('💡 What you can do now:');
  console.log('   ✅ Vault has', ethers.formatEther(vaultBalance), 'STT');
  console.log(
    '   ✅ Can withdraw up to',
    ethers.formatEther(limitInfo.remaining),
    'STT today'
  );
  console.log('   ✅ Limit resets every 24 hours');
  console.log('   ✅ Vault is active and ready for agent operations');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  });

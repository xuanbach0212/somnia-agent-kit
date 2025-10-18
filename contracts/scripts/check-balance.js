// Quick script to check wallet balance on Somnia Testnet
const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log('🔍 Checking Somnia Testnet Balance\n');

  const rpcUrl = process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    console.log('\n📝 Please add your private key to .env:');
    console.log('   PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('📋 Network Info:');
    console.log('   RPC URL:', rpcUrl);
    const network = await provider.getNetwork();
    console.log('   Chain ID:', network.chainId.toString());

    console.log('\n👛 Wallet Info:');
    console.log('   Address:', wallet.address);

    const balance = await provider.getBalance(wallet.address);
    const balanceSTT = ethers.formatEther(balance);

    console.log('   Balance:', balanceSTT, 'STT');

    if (balance === 0n) {
      console.log('\n❌ Balance is ZERO! You need test tokens.');
      console.log('\n🚰 How to get STT tokens:');
      console.log('   1. Join Somnia Discord: https://discord.gg/somnia');
      console.log('   2. Go to #dev-chat channel');
      console.log('   3. Tag @emma_odia with this message:');
      console.log('      "@emma_odia Hi, I need STT tokens for testing.');
      console.log(`       My wallet: ${wallet.address}"`);
      console.log('\n⏱️  Usually takes a few minutes to a few hours.');
    } else {
      console.log('\n✅ You have tokens! Ready to deploy.');

      // Estimate deployment cost
      const estimatedCost = 0.01; // ~0.01 STT for all contracts
      if (parseFloat(balanceSTT) >= estimatedCost) {
        console.log(`   Estimated deployment cost: ~${estimatedCost} STT`);
        console.log('   ✅ Sufficient balance for deployment');
      } else {
        console.log(`   ⚠️  Warning: Balance might be low for deployment`);
        console.log(`       Recommended: At least ${estimatedCost} STT`);
      }
    }
  } catch (error) {
    console.error('\n❌ Error checking balance:', error.message);

    if (error.message.includes('invalid private key')) {
      console.log('\n💡 Tip: Make sure your PRIVATE_KEY is valid (without 0x prefix)');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Tip: Check if Somnia RPC is accessible');
      console.log('   Try: curl https://dream-rpc.somnia.network');
    }

    process.exit(1);
  }
}

main();

/**
 * Example 7: Token Management
 *
 * Demonstrates how to interact with ERC20, ERC721, and native tokens
 * using the new token management utilities.
 *
 * Features:
 * - ERC20 token operations
 * - ERC721 NFT operations
 * - Native token (STT) operations
 */

import { ethers } from 'ethers';
import {
  ERC20Manager,
  ERC721Manager,
  NativeTokenManager,
  SOMNIA_NETWORKS,
  SomniaAgentKit,
} from '../../packages/agent-kit/dist';

async function main() {
  console.log('🪙 Token Management Example\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY, // Optional, for write operations
  });

  await kit.initialize();
  const chainClient = kit.getChainClient();

  // =============================================================================
  // Part 1: Native Token (STT) Operations
  // =============================================================================

  console.log('💎 Part 1: Native Token (STT) Operations');
  console.log('===========================================\n');

  const nativeManager = new NativeTokenManager(chainClient);

  try {
    // Get network token info
    const tokenSymbol = nativeManager.getTokenSymbol();
    const tokenName = nativeManager.getTokenName();

    console.log(`📌 Network Token: ${tokenName} (${tokenSymbol})`);

    // Get current signer address
    const signerAddress = await chainClient.getSigner().getAddress();
    console.log(`📌 Your Address: ${signerAddress}\n`);

    // Check balance
    console.log('🔍 Checking native token balance...');
    const balance = await nativeManager.getBalance();
    const formattedBalance = NativeTokenManager.formatAmount(balance);
    console.log(`   Balance: ${formattedBalance} ${tokenSymbol}\n`);

    // Get gas price
    console.log('⛽ Checking gas price...');
    const gasPrice = await nativeManager.getGasPrice();
    const formattedGasPrice = NativeTokenManager.formatGasPrice(gasPrice);
    console.log(`   Gas Price: ${formattedGasPrice} gwei\n`);

    // Estimate transfer gas
    const recipientAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const transferAmount = ethers.parseEther('0.1');

    console.log('📊 Estimating transfer cost...');
    const estimate = await nativeManager.estimateTransferGas(
      recipientAddress,
      transferAmount
    );

    console.log(`   Gas Limit: ${estimate.gasLimit}`);
    console.log(
      `   Gas Price: ${NativeTokenManager.formatGasPrice(estimate.gasPrice)} gwei`
    );
    console.log(
      `   Total Cost: ${NativeTokenManager.formatAmount(estimate.totalCost)} ${tokenSymbol}\n`
    );

    // Check if can afford transfer
    const canAfford = await nativeManager.canAffordTransfer(
      signerAddress,
      transferAmount
    );
    console.log(`   Can afford transfer? ${canAfford ? '✅ Yes' : '❌ No'}\n`);

    // Note: Actual transfer would require sufficient balance
    if (canAfford && process.env.PRIVATE_KEY) {
      console.log('💸 Would transfer here (uncomment to execute):');
      console.log(
        `   // await nativeManager.transfer(recipientAddress, transferAmount);\n`
      );
    }
  } catch (error: any) {
    console.log(`⚠️  ${error.message}\n`);
  }

  // =============================================================================
  // Part 2: ERC20 Token Operations
  // =============================================================================

  console.log('\n🪙 Part 2: ERC20 Token Operations');
  console.log('=====================================\n');

  const erc20Manager = new ERC20Manager(chainClient);

  // Example ERC20 token address (replace with real token)
  const tokenAddress = '0x1234567890123456789012345678901234567890';

  try {
    console.log('🔍 Fetching token information...');
    const tokenInfo = await erc20Manager.getTokenInfo(tokenAddress);

    console.log(`   Name: ${tokenInfo.name}`);
    console.log(`   Symbol: ${tokenInfo.symbol}`);
    console.log(`   Decimals: ${tokenInfo.decimals}`);
    console.log(
      `   Total Supply: ${ERC20Manager.formatAmount(tokenInfo.totalSupply, tokenInfo.decimals)}\n`
    );

    // Check balance
    const signerAddress = await chainClient.getSigner().getAddress();
    console.log('💰 Checking token balance...');
    const tokenBalance = await erc20Manager.balanceOf(tokenAddress, signerAddress);
    console.log(
      `   Balance: ${ERC20Manager.formatAmount(tokenBalance, tokenInfo.decimals)} ${tokenInfo.symbol}\n`
    );

    // Check allowance
    const spenderAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    console.log('🔐 Checking allowance...');
    const allowance = await erc20Manager.allowance(
      tokenAddress,
      signerAddress,
      spenderAddress
    );
    console.log(
      `   Allowance: ${ERC20Manager.formatAmount(allowance, tokenInfo.decimals)} ${tokenInfo.symbol}\n`
    );

    // Example operations (commented out)
    console.log('💡 Available operations:');
    console.log('   • transfer(to, amount) - Transfer tokens');
    console.log('   • approve(spender, amount) - Approve spending');
    console.log('   • transferFrom(from, to, amount) - Transfer on behalf');
    console.log('   • ensureApproval(spender, amount) - Auto-approve if needed');
  } catch (error: any) {
    console.log(
      `ℹ️  Note: Replace tokenAddress with a valid ERC20 token on Somnia testnet`
    );
    console.log(`   Error: ${error.message}\n`);
  }

  // =============================================================================
  // Part 3: ERC721 NFT Operations
  // =============================================================================

  console.log('\n🖼️  Part 3: ERC721 NFT Operations');
  console.log('===================================\n');

  const nftManager = new ERC721Manager(chainClient);

  // Example NFT collection address (replace with real collection)
  const nftAddress = '0x9876543210987654321098765432109876543210';

  try {
    console.log('🔍 Fetching collection information...');
    const collectionInfo = await nftManager.getCollectionInfo(nftAddress);

    console.log(`   Name: ${collectionInfo.name}`);
    console.log(`   Symbol: ${collectionInfo.symbol}`);
    if (collectionInfo.totalSupply !== undefined) {
      console.log(`   Total Supply: ${collectionInfo.totalSupply}\n`);
    }

    // Check NFT balance
    const signerAddress = await chainClient.getSigner().getAddress();
    console.log('💰 Checking NFT balance...');
    const nftBalance = await nftManager.balanceOf(nftAddress, signerAddress);
    console.log(`   Owns ${nftBalance} NFT(s)\n`);

    if (nftBalance > 0n) {
      // Get owned NFTs (if ERC721Enumerable)
      try {
        console.log('📋 Fetching owned NFTs...');
        const ownedTokenIds = await nftManager.getOwnedTokens(nftAddress, signerAddress);
        console.log(`   Token IDs: ${ownedTokenIds.join(', ')}\n`);

        if (ownedTokenIds.length > 0) {
          // Get token URI
          const tokenId = ownedTokenIds[0];
          const tokenURI = await nftManager.tokenURI(nftAddress, tokenId);
          console.log(`   NFT #${tokenId} URI: ${tokenURI}\n`);
        }
      } catch (error: any) {
        console.log('   Note: Collection may not support enumeration\n');
      }
    }

    console.log('💡 Available operations:');
    console.log('   • ownerOf(tokenId) - Get NFT owner');
    console.log('   • transferFrom(from, to, tokenId) - Transfer NFT');
    console.log('   • safeTransferFrom(from, to, tokenId) - Safe transfer');
    console.log('   • approve(to, tokenId) - Approve NFT transfer');
    console.log('   • setApprovalForAll(operator, approved) - Approve all NFTs');
  } catch (error: any) {
    console.log(
      `ℹ️  Note: Replace nftAddress with a valid NFT collection on Somnia testnet`
    );
    console.log(`   Error: ${error.message}\n`);
  }

  // =============================================================================
  // Part 4: Batch Operations
  // =============================================================================

  console.log('\n📦 Part 4: Batch Operations');
  console.log('=============================\n');

  try {
    // Batch balance checks
    const addresses = [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC',
    ];

    console.log('🔍 Batch checking native token balances...');
    const balances = await nativeManager.getBatchBalances(addresses);

    addresses.forEach((address, index) => {
      console.log(
        `   ${address}: ${NativeTokenManager.formatAmount(balances[index])} ${nativeManager.getTokenSymbol()}`
      );
    });
    console.log();
  } catch (error: any) {
    console.log(`⚠️  ${error.message}\n`);
  }

  // =============================================================================
  // Summary
  // =============================================================================

  console.log('\n✨ Token Management Features:');
  console.log('   ✅ Native token (STT) operations');
  console.log('   ✅ ERC20 token management');
  console.log('   ✅ ERC721 NFT management');
  console.log('   ✅ Balance queries');
  console.log('   ✅ Transfer operations');
  console.log('   ✅ Approval management');
  console.log('   ✅ Batch operations');
  console.log('   ✅ Gas estimation');
  console.log('   ✅ Format utilities');

  console.log('\n🎯 Use Cases:');
  console.log('   • Wallet applications');
  console.log('   • Token dashboards');
  console.log('   • NFT marketplaces');
  console.log('   • Portfolio trackers');
  console.log('   • DeFi protocols');
  console.log('   • Payment systems');

  console.log('\n✅ Example completed!');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

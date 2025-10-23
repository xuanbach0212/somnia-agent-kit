/**
 * Example 08: Convenience API Demo
 *
 * This example demonstrates the new convenient getter methods
 * that provide easy access to all SDK modules through the main
 * SomniaAgentKit instance.
 *
 * Before: new ERC20Manager(kit.getChainClient())
 * After:  kit.getERC20Manager()
 */

import { ethers } from 'ethers';
import { SOMNIA_NETWORKS, SomniaAgentKit } from '../../packages/agent-kit/dist';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Example 08: Convenient API Access                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry:
        process.env.AGENT_REGISTRY_ADDRESS ||
        '0x0000000000000000000000000000000000000001',
      agentExecutor:
        process.env.AGENT_EXECUTOR_ADDRESS ||
        '0x0000000000000000000000000000000000000002',
    },
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // ============================================================
  // 1. Token Management
  // ============================================================
  console.log('1️⃣  Token Management Modules');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ERC20 Manager
  const erc20 = kit.getERC20Manager();
  console.log('   ✓ ERC20Manager:', erc20.constructor.name);

  // ERC721 Manager
  const nft = kit.getERC721Manager();
  console.log('   ✓ ERC721Manager:', nft.constructor.name);

  // Native Token Manager
  const native = kit.getNativeTokenManager();
  console.log('   ✓ NativeTokenManager:', native.constructor.name);

  try {
    const balance = await native.getBalance();
    console.log(`   ✓ Native Balance: ${ethers.formatEther(balance)} STT\n`);
  } catch (error) {
    console.log('   ⚠ Could not fetch balance (no signer configured)\n');
  }

  // ============================================================
  // 2. Blockchain Operations
  // ============================================================
  console.log('2️⃣  Blockchain Operations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // MultiCall for batch operations
  const multicall = kit.getMultiCall();
  console.log('   ✓ MultiCall:', multicall.constructor.name);

  try {
    const blockNumber = await multicall.getBlockNumber();
    console.log(`   ✓ Current Block: ${blockNumber}\n`);
  } catch (error) {
    console.log('   ⚠ Could not fetch block number\n');
  }

  // ============================================================
  // 3. Storage & Events
  // ============================================================
  console.log('3️⃣  Storage & Real-time Events');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // IPFS Manager
  const ipfs = kit.getIPFSManager();
  console.log('   ✓ IPFSManager:', ipfs.constructor.name);

  // Test IPFS hash validation
  const validHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
  const isValid = (ipfs.constructor as any).isValidHash(validHash);
  console.log(`   ✓ IPFS Hash Validation: ${isValid ? '✓' : '✗'}`);

  // WebSocket Client
  const ws = kit.getWebSocketClient();
  console.log('   ✓ WebSocketClient:', ws.constructor.name);
  console.log('   ℹ WebSocket ready for real-time event subscriptions\n');

  // ============================================================
  // 4. Contract Deployment & Verification
  // ============================================================
  console.log('4️⃣  Contract Deployment & Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Contract Deployer
  const deployer = kit.getContractDeployer();
  console.log('   ✓ ContractDeployer:', deployer.constructor.name);

  // Contract Verifier
  const verifier = kit.getContractVerifier();
  console.log('   ✓ ContractVerifier:', verifier.constructor.name);
  console.log('   ℹ Ready to deploy and verify contracts on Somnia\n');

  // ============================================================
  // 5. Wallet Integration
  // ============================================================
  console.log('5️⃣  Wallet Integration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // MetaMask Connector
  const metamask = kit.getMetaMaskConnector();
  console.log('   ✓ MetaMaskConnector:', metamask.constructor.name);

  const isInstalled = await metamask.isInstalled();
  console.log(
    `   ${isInstalled ? '✓' : 'ℹ'} MetaMask ${isInstalled ? 'detected' : 'not detected (browser only)'}\n`
  );

  // ============================================================
  // 6. Existing Modules (Already Available)
  // ============================================================
  console.log('6️⃣  Core Modules (Already Available)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Smart Contracts
  const contracts = kit.contracts;
  console.log('   ✓ Contracts:', contracts.constructor.name);

  // Chain Client
  const chainClient = kit.getChainClient();
  console.log('   ✓ ChainClient:', chainClient.constructor.name);

  // Provider & Signer
  const provider = kit.getProvider();
  console.log('   ✓ Provider:', provider.constructor.name);

  const signer = kit.getSigner();
  console.log(
    `   ${signer ? '✓' : 'ℹ'} Signer: ${signer ? signer.constructor.name : 'Not configured'}\n`
  );

  // ============================================================
  // Summary
  // ============================================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary: All Modules Accessible via Convenience API      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('✅ All modules are now easily accessible through getter methods!');
  console.log('');
  console.log('Benefits:');
  console.log('  • No need to manually instantiate managers');
  console.log('  • Lazy loading - only created when needed');
  console.log('  • Cached instances - same object returned on multiple calls');
  console.log('  • Type-safe with full TypeScript support');
  console.log('  • Backward compatible - old code still works');
  console.log('');
}

main()
  .then(() => {
    console.log('✅ Example completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });

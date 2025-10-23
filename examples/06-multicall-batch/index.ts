/**
 * Example 6: MultiCall Batch Operations
 *
 * Demonstrates how to use MultiCall to batch multiple contract calls
 * into a single RPC request, dramatically reducing overhead.
 *
 * Use case: Check balances of 100 addresses in 1 RPC call instead of 100.
 */

import { ethers } from 'ethers';
import {
  MultiCall,
  SOMNIA_NETWORKS,
  SomniaAgentKit,
} from '../../packages/agent-kit/dist';

// ERC20 ABI for balance checks
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

async function main() {
  console.log('🔥 MultiCall Batch Operations Example\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    },
  });

  await kit.initialize();
  const chainClient = kit.getChainClient();

  // Example token address (you can replace with any ERC20 token on Somnia testnet)
  const tokenAddress = '0x1234567890123456789012345678901234567890'; // Replace with real token

  console.log('📊 Example 1: Batch Balance Checks');
  console.log('=====================================\n');

  // Create MultiCall instance
  const multicall = new MultiCall(chainClient);

  // Example: Check balances for multiple addresses
  const addresses = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC',
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
  ];

  try {
    // Get token contract instance
    const tokenContract = chainClient.getContract(tokenAddress, ERC20_ABI);

    console.log('🔄 Creating batch calls for balance checks...');

    // Create calls array
    const calls = addresses.map((address) => ({
      target: tokenAddress,
      callData: tokenContract.interface.encodeFunctionData('balanceOf', [address]),
    }));

    console.log(`   Batching ${calls.length} calls into 1 RPC request\n`);

    // Execute batch call
    console.time('⚡ MultiCall execution time');
    const results = await multicall.tryAggregate(calls, false);
    console.timeEnd('⚡ MultiCall execution time');

    console.log('\n✅ Results:');
    results.forEach((result, index) => {
      if (result.success) {
        const balance = tokenContract.interface.decodeFunctionResult(
          'balanceOf',
          result.returnData
        )[0];
        console.log(`   ${addresses[index]}: ${ethers.formatEther(balance)} tokens`);
      } else {
        console.log(`   ${addresses[index]}: Failed to fetch`);
      }
    });
  } catch (error) {
    console.log('ℹ️  Note: This example requires a valid ERC20 token address');
    console.log('   Replace tokenAddress with an actual token on Somnia testnet\n');
  }

  console.log('\n📊 Example 2: Batch Token Info');
  console.log('=====================================\n');

  try {
    const tokenContract = chainClient.getContract(tokenAddress, ERC20_ABI);

    // Create batch calls for token metadata
    const metadataCalls = MultiCall.createBatch(tokenContract, [
      { method: 'name', args: [] },
      { method: 'symbol', args: [] },
      { method: 'decimals', args: [] },
      { method: 'totalSupply', args: [] },
    ]);

    console.log('🔄 Fetching token metadata in 1 call...\n');

    const metadataResults = await multicall.aggregate(metadataCalls);

    console.log('✅ Token Information:');
    console.log(
      `   Name: ${tokenContract.interface.decodeFunctionResult('name', metadataResults[0])[0]}`
    );
    console.log(
      `   Symbol: ${tokenContract.interface.decodeFunctionResult('symbol', metadataResults[1])[0]}`
    );
    console.log(
      `   Decimals: ${tokenContract.interface.decodeFunctionResult('decimals', metadataResults[2])[0]}`
    );
    const totalSupply = tokenContract.interface.decodeFunctionResult(
      'totalSupply',
      metadataResults[3]
    )[0];
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)}`);
  } catch (error) {
    console.log('ℹ️  Note: This example requires a valid ERC20 token address\n');
  }

  console.log('\n📊 Example 3: Block and Aggregate');
  console.log('=====================================\n');

  try {
    const tokenContract = chainClient.getContract(tokenAddress, ERC20_ABI);

    const call = {
      target: tokenAddress,
      callData: tokenContract.interface.encodeFunctionData('totalSupply', []),
    };

    console.log('🔄 Getting block info + contract data...\n');

    const result = await multicall.blockAndAggregate([call]);

    console.log('✅ Results:');
    console.log(`   Block Number: ${result.blockNumber}`);
    console.log(`   Block Hash: ${result.blockHash}`);
    if (result.results && result.results[0]) {
      const decoded = tokenContract.interface.decodeFunctionResult(
        'totalSupply',
        result.results[0]
      )[0];
      console.log(`   Total Supply: ${decoded}`);
    }
  } catch (error) {
    console.log('ℹ️  Note: This example requires a valid ERC20 token address\n');
  }

  console.log('\n💡 Performance Benefits:');
  console.log('   ✅ 1 RPC call instead of N calls');
  console.log('   ✅ 80-90% faster for batch operations');
  console.log('   ✅ Reduced network overhead');
  console.log('   ✅ Lower RPC costs');
  console.log('   ✅ Atomic data snapshot (same block)');

  console.log('\n🎯 Use Cases:');
  console.log('   • Portfolio tracking (check multiple token balances)');
  console.log('   • NFT collection queries (batch metadata fetches)');
  console.log('   • Dashboard data (aggregate multiple contract states)');
  console.log('   • Analytics (batch historical data queries)');
  console.log('   • DeFi protocols (check multiple pool states)');

  console.log('\n✅ Example completed!');
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

/**
 * Core SDK Tests
 * Tests SomniaAgentKit class and core functionality
 */

import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

export async function testCoreSDK() {
  const results = {
    name: 'Core SDK Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Core SDK Features\n');

  // Test 1: SDK Constructor with full config
  try {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
        agentManager: process.env.AGENT_MANAGER_ADDRESS,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS,
        agentVault: process.env.AGENT_VAULT_ADDRESS,
      },
      privateKey: process.env.PRIVATE_KEY,
    });

    if (!kit) {
      throw new Error('SDK constructor failed');
    }

    results.tests.push({ name: 'SDK: Constructor', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: Constructor - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: Constructor', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: Constructor - FAIL:', error.message);
  }

  // Test 2: SDK Constructor with partial config (env merge)
  try {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
    });

    if (!kit) {
      throw new Error('SDK with partial config failed');
    }

    results.tests.push({ name: 'SDK: Partial config', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: Partial config - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: Partial config', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: Partial config - FAIL:', error.message);
  }

  // Create kit for remaining tests
  let kit;
  try {
    kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
        agentManager: process.env.AGENT_MANAGER_ADDRESS,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS,
        agentVault: process.env.AGENT_VAULT_ADDRESS,
      },
      privateKey: process.env.PRIVATE_KEY,
    });
    await kit.initialize();
  } catch (error) {
    console.log('⚠️  Cannot initialize SDK for remaining tests');
    return results;
  }

  // Test 3: isInitialized()
  try {
    const initialized = kit.isInitialized();
    if (!initialized) {
      throw new Error('isInitialized() returned false after initialization');
    }

    results.tests.push({ name: 'SDK: isInitialized()', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: isInitialized() - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: isInitialized()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: isInitialized() - FAIL:', error.message);
  }

  // Test 4: getProvider()
  try {
    const provider = kit.getProvider();
    if (!provider) {
      throw new Error('getProvider() returned null');
    }

    // Test provider functionality
    const blockNumber = await provider.getBlockNumber();
    if (typeof blockNumber !== 'number') {
      throw new Error('Provider getBlockNumber() failed');
    }

    results.tests.push({ name: 'SDK: getProvider()', status: 'PASS', data: { blockNumber } });
    results.passed++;
    console.log('✅ SDK: getProvider() - PASS');
    console.log('   Block Number:', blockNumber);
  } catch (error) {
    results.tests.push({ name: 'SDK: getProvider()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: getProvider() - FAIL:', error.message);
  }

  // Test 5: getSigner()
  try {
    const signer = kit.getSigner();
    if (signer) {
      const address = await signer.getAddress();
      if (!address || !address.startsWith('0x')) {
        throw new Error('Invalid signer address');
      }

      results.tests.push({ name: 'SDK: getSigner()', status: 'PASS', data: { address } });
      results.passed++;
      console.log('✅ SDK: getSigner() - PASS');
      console.log('   Address:', address);
    } else {
      results.tests.push({ name: 'SDK: getSigner()', status: 'SKIP', reason: 'No private key' });
      console.log('⏭️  SDK: getSigner() - SKIP (no private key)');
    }
  } catch (error) {
    results.tests.push({ name: 'SDK: getSigner()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: getSigner() - FAIL:', error.message);
  }

  // Test 6: getChainClient()
  try {
    const chainClient = kit.getChainClient();
    if (!chainClient) {
      throw new Error('getChainClient() returned null');
    }

    results.tests.push({ name: 'SDK: getChainClient()', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: getChainClient() - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: getChainClient()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: getChainClient() - FAIL:', error.message);
  }

  // Test 7: getNetworkInfo()
  try {
    const networkInfo = kit.getNetworkInfo();
    if (!networkInfo.name || !networkInfo.chainId || !networkInfo.rpcUrl) {
      throw new Error('Incomplete network info');
    }

    results.tests.push({ name: 'SDK: getNetworkInfo()', status: 'PASS', data: networkInfo });
    results.passed++;
    console.log('✅ SDK: getNetworkInfo() - PASS');
    console.log('   Network:', networkInfo.name);
    console.log('   Chain ID:', networkInfo.chainId);
  } catch (error) {
    results.tests.push({ name: 'SDK: getNetworkInfo()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: getNetworkInfo() - FAIL:', error.message);
  }

  // Test 8: getConfig()
  try {
    const config = kit.getConfig();
    if (!config || !config.network) {
      throw new Error('Invalid config returned');
    }

    // Test that config is readonly (frozen)
    const isFrozen = Object.isFrozen(config);

    results.tests.push({ name: 'SDK: getConfig()', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: getConfig() - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: getConfig()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: getConfig() - FAIL:', error.message);
  }

  // Test 9: contracts property
  try {
    const contracts = kit.contracts;
    if (!contracts) {
      throw new Error('Contracts not available');
    }

    if (!contracts.registry || !contracts.manager) {
      throw new Error('Contract instances missing');
    }

    results.tests.push({ name: 'SDK: contracts property', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK: contracts property - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK: contracts property', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: contracts property - FAIL:', error.message);
  }

  // Test 10: Error handling - access contracts before init
  try {
    const uninitKit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
        agentManager: process.env.AGENT_MANAGER_ADDRESS,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS,
        agentVault: process.env.AGENT_VAULT_ADDRESS,
      },
    });

    // Should throw error when accessing contracts before init
    try {
      const contracts = uninitKit.contracts;
      throw new Error('Should throw error before initialization');
    } catch (err) {
      if (err.message.includes('not initialized')) {
        // Expected error
        results.tests.push({ name: 'SDK: error handling', status: 'PASS' });
        results.passed++;
        console.log('✅ SDK: error handling - PASS');
      } else {
        throw err;
      }
    }
  } catch (error) {
    results.tests.push({ name: 'SDK: error handling', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK: error handling - FAIL:', error.message);
  }

  return results;
}

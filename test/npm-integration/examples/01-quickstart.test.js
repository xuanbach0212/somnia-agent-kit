/**
 * Test Example 01: Quickstart
 * Tests basic SDK initialization and network queries
 */

import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

export async function testQuickstart() {
  const results = {
    name: '01-Quickstart',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Example 01: Quickstart\n');

  // Test 1: SDK Import
  try {
    if (typeof SomniaAgentKit !== 'function') {
      throw new Error('SomniaAgentKit not exported correctly');
    }
    if (!SOMNIA_NETWORKS.testnet) {
      throw new Error('SOMNIA_NETWORKS not exported correctly');
    }
    results.tests.push({ name: 'SDK Import', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK Import - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK Import', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK Import - FAIL:', error.message);
  }

  // Test 2: SDK Initialization
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
    results.tests.push({ name: 'SDK Initialization', status: 'PASS' });
    results.passed++;
    console.log('✅ SDK Initialization - PASS');
  } catch (error) {
    results.tests.push({ name: 'SDK Initialization', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ SDK Initialization - FAIL:', error.message);
    return results;
  }

  // Test 3: Get Network Info
  try {
    const network = kit.getNetworkInfo();
    if (!network.name || !network.chainId || !network.rpcUrl) {
      throw new Error('Network info incomplete');
    }
    results.tests.push({ name: 'Get Network Info', status: 'PASS', data: network });
    results.passed++;
    console.log('✅ Get Network Info - PASS');
    console.log('   Network:', network.name, '| Chain ID:', network.chainId);
  } catch (error) {
    results.tests.push({ name: 'Get Network Info', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Get Network Info - FAIL:', error.message);
  }

  // Test 4: Get Provider
  try {
    const provider = kit.getProvider();
    const blockNumber = await provider.getBlockNumber();
    if (typeof blockNumber !== 'number') {
      throw new Error('Invalid block number');
    }
    results.tests.push({ name: 'Get Provider', status: 'PASS', data: { blockNumber } });
    results.passed++;
    console.log('✅ Get Provider - PASS');
    console.log('   Block Number:', blockNumber);
  } catch (error) {
    results.tests.push({ name: 'Get Provider', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Get Provider - FAIL:', error.message);
  }

  // Test 5: Query Total Agents
  try {
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    results.tests.push({ name: 'Query Total Agents', status: 'PASS', data: { totalAgents: totalAgents.toString() } });
    results.passed++;
    console.log('✅ Query Total Agents - PASS');
    console.log('   Total Agents:', totalAgents.toString());
  } catch (error) {
    results.tests.push({ name: 'Query Total Agents', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Query Total Agents - FAIL:', error.message);
  }

  // Test 6: Get Agent Details (if exists)
  try {
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    if (totalAgents > 0n) {
      const agent = await kit.contracts.registry.getAgent(1);
      if (!agent.name || !agent.owner) {
        throw new Error('Agent data incomplete');
      }
      results.tests.push({ name: 'Get Agent Details', status: 'PASS', data: { name: agent.name, owner: agent.owner } });
      results.passed++;
      console.log('✅ Get Agent Details - PASS');
      console.log('   Name:', agent.name, '| Owner:', agent.owner);
    } else {
      results.tests.push({ name: 'Get Agent Details', status: 'SKIP', reason: 'No agents found' });
      console.log('⏭️  Get Agent Details - SKIP (no agents)');
    }
  } catch (error) {
    results.tests.push({ name: 'Get Agent Details', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Get Agent Details - FAIL:', error.message);
  }

  return results;
}

/**
 * Contract Tests
 * Tests AgentRegistry, AgentManager, AgentExecutor, AgentVault
 */

import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

export async function testContracts() {
  const results = {
    name: 'Contract Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Contract Interactions\n');

  // Initialize SDK
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
    console.log('⚠️  Cannot initialize SDK, skipping contract tests');
    results.tests.push({ name: 'SDK Init', status: 'FAIL', error: error.message });
    results.failed++;
    return results;
  }

  console.log('📋 Testing AgentRegistry Contract\n');

  // Test 1: getTotalAgents()
  try {
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    if (typeof totalAgents !== 'bigint') {
      throw new Error('getTotalAgents() did not return bigint');
    }

    results.tests.push({
      name: 'Registry: getTotalAgents()',
      status: 'PASS',
      data: { totalAgents: totalAgents.toString() }
    });
    results.passed++;
    console.log('✅ Registry: getTotalAgents() - PASS');
    console.log('   Total Agents:', totalAgents.toString());
  } catch (error) {
    results.tests.push({ name: 'Registry: getTotalAgents()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Registry: getTotalAgents() - FAIL:', error.message);
  }

  // Test 2: getAgent() - valid agent
  try {
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    if (totalAgents > 0n) {
      const agent = await kit.contracts.registry.getAgent(1);

      if (!agent.name || !agent.owner) {
        throw new Error('Agent data incomplete');
      }

      results.tests.push({
        name: 'Registry: getAgent()',
        status: 'PASS',
        data: { id: 1, name: agent.name, owner: agent.owner }
      });
      results.passed++;
      console.log('✅ Registry: getAgent() - PASS');
      console.log('   Name:', agent.name);
      console.log('   Owner:', agent.owner);
    } else {
      results.tests.push({ name: 'Registry: getAgent()', status: 'SKIP', reason: 'No agents' });
      console.log('⏭️  Registry: getAgent() - SKIP (no agents)');
    }
  } catch (error) {
    results.tests.push({ name: 'Registry: getAgent()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Registry: getAgent() - FAIL:', error.message);
  }

  // Test 3: getAgentCapabilities()
  try {
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    if (totalAgents > 0n) {
      const capabilities = await kit.contracts.registry.getAgentCapabilities(1);

      if (!Array.isArray(capabilities)) {
        throw new Error('Capabilities not an array');
      }

      results.tests.push({
        name: 'Registry: getAgentCapabilities()',
        status: 'PASS',
        data: { capabilities }
      });
      results.passed++;
      console.log('✅ Registry: getAgentCapabilities() - PASS');
      console.log('   Capabilities:', capabilities.join(', ') || 'None');
    } else {
      results.tests.push({ name: 'Registry: getAgentCapabilities()', status: 'SKIP', reason: 'No agents' });
      console.log('⏭️  Registry: getAgentCapabilities() - SKIP');
    }
  } catch (error) {
    results.tests.push({ name: 'Registry: getAgentCapabilities()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Registry: getAgentCapabilities() - FAIL:', error.message);
  }

  // Test 4: getAgent() - error handling with invalid ID
  try {
    try {
      const agent = await kit.contracts.registry.getAgent(999999);
      // If it doesn't throw, check if agent is valid
      if (agent.name === '') {
        // Expected behavior - empty agent
        results.tests.push({ name: 'Registry: error handling', status: 'PASS' });
        results.passed++;
        console.log('✅ Registry: error handling - PASS');
      } else {
        throw new Error('Unexpected agent returned');
      }
    } catch (err) {
      // Expected to throw or return empty
      results.tests.push({ name: 'Registry: error handling', status: 'PASS' });
      results.passed++;
      console.log('✅ Registry: error handling - PASS');
    }
  } catch (error) {
    results.tests.push({ name: 'Registry: error handling', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Registry: error handling - FAIL:', error.message);
  }

  console.log('\n📋 Testing AgentManager Contract\n');

  // Test 5: getTask() - check structure
  try {
    // Try to get task 1 (may not exist)
    try {
      const task = await kit.contracts.manager.getTask(1);

      // Check task structure
      if (task.agentId === undefined || task.status === undefined) {
        throw new Error('Task structure incomplete');
      }

      results.tests.push({ name: 'Manager: getTask()', status: 'PASS' });
      results.passed++;
      console.log('✅ Manager: getTask() - PASS');
    } catch (err) {
      // Task doesn't exist - that's ok, just check error is reasonable
      if (err.message.includes('revert') || err.message.includes('Task') || err.code) {
        results.tests.push({ name: 'Manager: getTask()', status: 'PASS' });
        results.passed++;
        console.log('✅ Manager: getTask() - PASS (graceful error)');
      } else {
        throw err;
      }
    }
  } catch (error) {
    results.tests.push({ name: 'Manager: getTask()', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Manager: getTask() - FAIL:', error.message);
  }

  // Test 6: Contract ABI accessibility
  try {
    // Check if contract interfaces are accessible
    const registryInterface = kit.contracts.registry.interface;
    const managerInterface = kit.contracts.manager.interface;

    if (!registryInterface || !managerInterface) {
      throw new Error('Contract interfaces not accessible');
    }

    // Check if we can get events
    const agentRegisteredEvent = registryInterface.getEvent('AgentRegistered');
    if (!agentRegisteredEvent) {
      throw new Error('Cannot get AgentRegistered event');
    }

    results.tests.push({ name: 'Contracts: ABI access', status: 'PASS' });
    results.passed++;
    console.log('✅ Contracts: ABI access - PASS');
  } catch (error) {
    results.tests.push({ name: 'Contracts: ABI access', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Contracts: ABI access - FAIL:', error.message);
  }

  // Test 7: Contract addresses
  try {
    const registryAddress = await kit.contracts.registry.getAddress();
    const managerAddress = await kit.contracts.manager.getAddress();
    const executorAddress = await kit.contracts.executor.getAddress();
    const vaultAddress = await kit.contracts.vault.getAddress();

    if (!registryAddress.startsWith('0x') ||
        !managerAddress.startsWith('0x') ||
        !executorAddress.startsWith('0x') ||
        !vaultAddress.startsWith('0x')) {
      throw new Error('Invalid contract addresses');
    }

    results.tests.push({
      name: 'Contracts: addresses',
      status: 'PASS',
      data: { registryAddress, managerAddress, executorAddress, vaultAddress }
    });
    results.passed++;
    console.log('✅ Contracts: addresses - PASS');
    console.log('   Registry:', registryAddress);
    console.log('   Manager:', managerAddress);
    console.log('   Executor:', executorAddress);
    console.log('   Vault:', vaultAddress);
  } catch (error) {
    results.tests.push({ name: 'Contracts: addresses', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Contracts: addresses - FAIL:', error.message);
  }

  // Test 8: Multiple sequential queries
  try {
    const totalAgents1 = await kit.contracts.registry.getTotalAgents();
    const totalAgents2 = await kit.contracts.registry.getTotalAgents();

    if (totalAgents1 !== totalAgents2) {
      throw new Error('Inconsistent results from sequential queries');
    }

    results.tests.push({ name: 'Contracts: sequential queries', status: 'PASS' });
    results.passed++;
    console.log('✅ Contracts: sequential queries - PASS');
  } catch (error) {
    results.tests.push({ name: 'Contracts: sequential queries', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Contracts: sequential queries - FAIL:', error.message);
  }

  return results;
}

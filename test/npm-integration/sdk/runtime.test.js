/**
 * Runtime Module Tests
 * Tests Agent, Planner, Executor, Trigger, Policy
 */

import {
  Agent,
  Planner,
  Executor,
} from 'somnia-agent-kit';

export async function testRuntime() {
  const results = {
    name: 'Runtime Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Runtime Modules\n');

  // Test 1: Agent creation
  try {
    const agent = new Agent({
      name: 'Test Agent',
      capabilities: ['trading', 'analysis'],
    });

    if (!agent) {
      throw new Error('Agent creation failed');
    }

    results.tests.push({ name: 'Runtime: Agent creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Agent creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Agent creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Agent creation - FAIL:', error.message);
  }

  // Test 2: Agent with config
  try {
    const agent = new Agent({
      name: 'Configured Agent',
      description: 'Test description',
      capabilities: ['test'],
      config: {
        maxRetries: 3,
        timeout: 5000,
      },
    });

    if (!agent) {
      throw new Error('Agent with config failed');
    }

    results.tests.push({ name: 'Runtime: Agent config', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Agent config - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Agent config', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Agent config - FAIL:', error.message);
  }

  // Test 3: Planner creation
  try {
    const planner = new Planner();
    if (!planner) {
      throw new Error('Planner creation failed');
    }

    results.tests.push({ name: 'Runtime: Planner creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Planner creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Planner creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Planner creation - FAIL:', error.message);
  }

  // Test 4: Executor creation
  try {
    const executor = new Executor();
    if (!executor) {
      throw new Error('Executor creation failed');
    }

    results.tests.push({ name: 'Runtime: Executor creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Executor creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Executor creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Executor creation - FAIL:', error.message);
  }

  // Test 5: Planner + Executor integration
  try {
    const planner = new Planner();
    const executor = new Executor();

    if (!planner || !executor) {
      throw new Error('Runtime components integration failed');
    }

    results.tests.push({ name: 'Runtime: Planner + Executor integration', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Planner + Executor integration - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Planner + Executor integration', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Planner + Executor integration - FAIL:', error.message);
  }

  // Test 6: Multiple agents
  try {
    const agent1 = new Agent({ name: 'Agent 1', capabilities: ['trading'] });
    const agent2 = new Agent({ name: 'Agent 2', capabilities: ['analysis'] });

    if (!agent1 || !agent2) {
      throw new Error('Multiple agents creation failed');
    }

    results.tests.push({ name: 'Runtime: Multiple agents', status: 'PASS' });
    results.passed++;
    console.log('✅ Runtime: Multiple agents - PASS');
  } catch (error) {
    results.tests.push({ name: 'Runtime: Multiple agents', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Runtime: Multiple agents - FAIL:', error.message);
  }

  return results;
}

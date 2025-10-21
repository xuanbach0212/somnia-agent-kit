/**
 * CLI Integration Tests
 * Tests all CLI commands
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.join(__dirname, '../node_modules/.bin/somnia-agent');
const CLI_ALT = path.join(__dirname, '../node_modules/.bin/sak');

export async function testCLI() {
  const results = {
    name: 'CLI Commands',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing CLI Commands\n');

  // Helper function to run CLI command
  async function runCLI(command, timeout = 10000) {
    try {
      const { stdout, stderr } = await execAsync(`${CLI_PATH} ${command}`, { timeout });
      return { stdout, stderr, success: true };
    } catch (error) {
      return { stdout: error.stdout, stderr: error.stderr, success: false, error: error.message };
    }
  }

  // Test 1: Version command
  try {
    const result = await runCLI('version');
    if (!result.success || !result.stdout.includes('somnia-agent-kit')) {
      throw new Error('Version command failed or invalid output');
    }
    results.tests.push({ name: 'CLI: version', status: 'PASS', output: result.stdout.trim() });
    results.passed++;
    console.log('✅ CLI: version - PASS');
    console.log('   Output:', result.stdout.trim());
  } catch (error) {
    results.tests.push({ name: 'CLI: version', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: version - FAIL:', error.message);
  }

  // Test 2: Help command
  try {
    const result = await runCLI('help');
    if (!result.success || !result.stdout.includes('Usage')) {
      throw new Error('Help command failed or invalid output');
    }
    results.tests.push({ name: 'CLI: help', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: help - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: help', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: help - FAIL:', error.message);
  }

  // Test 3: Command-specific help
  try {
    const result = await runCLI('help agent:list');
    if (!result.success) {
      throw new Error('Command-specific help failed');
    }
    results.tests.push({ name: 'CLI: help agent:list', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: help agent:list - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: help agent:list', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: help agent:list - FAIL:', error.message);
  }

  // Test 4: Network info
  try {
    const result = await runCLI('network:info', 15000);
    if (!result.success || !result.stdout.includes('Network Information')) {
      throw new Error('Network info command failed');
    }
    results.tests.push({ name: 'CLI: network:info', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: network:info - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: network:info', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: network:info - FAIL:', error.message);
  }

  // Test 5: Contract addresses
  try {
    const result = await runCLI('network:contracts', 15000);
    if (!result.success || !result.stdout.includes('Contract Addresses')) {
      throw new Error('Network contracts command failed');
    }
    results.tests.push({ name: 'CLI: network:contracts', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: network:contracts - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: network:contracts', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: network:contracts - FAIL:', error.message);
  }

  // Test 6: Agent list
  try {
    const result = await runCLI('agent:list', 15000);
    if (!result.success) {
      throw new Error('Agent list command failed');
    }
    results.tests.push({ name: 'CLI: agent:list', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:list - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:list', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:list - FAIL:', error.message);
  }

  // Test 7: Agent info
  try {
    const result = await runCLI('agent:info 1', 15000);
    if (!result.success) {
      throw new Error('Agent info command failed');
    }
    results.tests.push({ name: 'CLI: agent:info', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:info - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:info', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:info - FAIL:', error.message);
  }

  // Test 8: Alternative CLI alias (sak)
  try {
    const { stdout } = await execAsync(`${CLI_ALT} version`, { timeout: 10000 });
    if (!stdout.includes('somnia-agent-kit')) {
      throw new Error('Alternative CLI alias failed');
    }
    results.tests.push({ name: 'CLI: sak alias', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: sak alias - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: sak alias', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: sak alias - FAIL:', error.message);
  }

  // Test 9: Invalid command handling
  try {
    const result = await runCLI('invalid-command');
    // Should fail gracefully with error message
    if (result.success) {
      throw new Error('Invalid command should fail');
    }
    results.tests.push({ name: 'CLI: error handling', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: error handling - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: error handling', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: error handling - FAIL:', error.message);
  }

  return results;
}

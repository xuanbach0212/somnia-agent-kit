/**
 * Complete CLI Integration Tests
 * Tests ALL CLI commands comprehensively
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.join(__dirname, '../node_modules/.bin/somnia-agent');
const CLI_ALT = path.join(__dirname, '../node_modules/.bin/sak');
const CONFIG_DIR = path.join(os.homedir(), '.somnia-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function testCompleteCLI() {
  const results = {
    name: 'Complete CLI Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Complete CLI Commands\n');

  // Helper function to run CLI command
  async function runCLI(command, timeout = 15000) {
    try {
      const { stdout, stderr } = await execAsync(`${CLI_PATH} ${command}`, { timeout });
      return { stdout, stderr, success: true };
    } catch (error) {
      return { stdout: error.stdout || '', stderr: error.stderr || '', success: false, error: error.message };
    }
  }

  // ========== INIT COMMANDS ==========
  console.log('📦 Testing Init Commands\n');

  // Test 1: Init with testnet
  try {
    // Backup existing config
    let backupConfig = null;
    if (fs.existsSync(CONFIG_FILE)) {
      backupConfig = fs.readFileSync(CONFIG_FILE, 'utf-8');
    }

    const result = await runCLI('init --network testnet');
    if (!result.success) {
      throw new Error('Init command failed');
    }

    // Verify config file created
    if (!fs.existsSync(CONFIG_FILE)) {
      throw new Error('Config file not created');
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (config.network !== 'testnet') {
      throw new Error('Config network incorrect');
    }

    results.tests.push({ name: 'CLI: init --network testnet', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: init --network testnet - PASS');

    // Restore backup
    if (backupConfig) {
      fs.writeFileSync(CONFIG_FILE, backupConfig);
    }
  } catch (error) {
    results.tests.push({ name: 'CLI: init --network testnet', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: init --network testnet - FAIL:', error.message);
  }

  // Test 2: Init with mainnet
  try {
    const result = await runCLI('init --network mainnet');
    if (!result.success) {
      throw new Error('Init mainnet failed');
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (config.network !== 'mainnet') {
      throw new Error('Mainnet config incorrect');
    }

    results.tests.push({ name: 'CLI: init --network mainnet', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: init --network mainnet - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: init --network mainnet', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: init --network mainnet - FAIL:', error.message);
  }

  // Test 3: Init with devnet
  try {
    const result = await runCLI('init --network devnet');
    if (!result.success) {
      throw new Error('Init devnet failed');
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (config.network !== 'devnet') {
      throw new Error('Devnet config incorrect');
    }

    results.tests.push({ name: 'CLI: init --network devnet', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: init --network devnet - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: init --network devnet', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: init --network devnet - FAIL:', error.message);
  }

  // Test 4: Init with custom RPC URL
  try {
    const customRPC = 'https://custom-rpc.example.com';
    const result = await runCLI(`init --network testnet --rpc-url ${customRPC}`);
    if (!result.success) {
      throw new Error('Init with custom RPC failed');
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (config.rpcUrl !== customRPC) {
      throw new Error('Custom RPC not set');
    }

    results.tests.push({ name: 'CLI: init --rpc-url', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: init --rpc-url - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: init --rpc-url', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: init --rpc-url - FAIL:', error.message);
  }

  // Restore testnet config for other tests
  await runCLI('init --network testnet');

  // ========== AGENT COMMANDS ==========
  console.log('\n🤖 Testing Agent Commands\n');

  // Test 5: Agent list with limit
  try {
    const result = await runCLI('agent:list --limit 5');
    if (!result.success) {
      throw new Error('Agent list with limit failed');
    }

    results.tests.push({ name: 'CLI: agent:list --limit', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:list --limit - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:list --limit', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:list --limit - FAIL:', error.message);
  }

  // Test 6: Agent list with JSON format
  try {
    const result = await runCLI('agent:list --format json');
    if (!result.success) {
      throw new Error('Agent list JSON format failed');
    }

    // Verify JSON output
    const jsonOutput = JSON.parse(result.stdout);
    if (!jsonOutput.agents) {
      throw new Error('Invalid JSON structure');
    }

    results.tests.push({ name: 'CLI: agent:list --format json', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:list --format json - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:list --format json', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:list --format json - FAIL:', error.message);
  }

  // Test 7: Agent info with JSON format
  try {
    const result = await runCLI('agent:info 1 --format json');
    if (!result.success) {
      throw new Error('Agent info JSON format failed');
    }

    // Verify JSON output
    const jsonOutput = JSON.parse(result.stdout);
    if (!jsonOutput.id || !jsonOutput.name) {
      throw new Error('Invalid JSON structure');
    }

    results.tests.push({ name: 'CLI: agent:info --format json', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:info --format json - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:info --format json', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:info --format json - FAIL:', error.message);
  }

  // Test 8: Agent info with invalid ID
  try {
    const result = await runCLI('agent:info 999999');
    // Should fail or return error message
    if (result.success && !result.stderr && !result.stdout.includes('error')) {
      throw new Error('Should fail with invalid agent ID');
    }

    results.tests.push({ name: 'CLI: agent:info invalid ID', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:info invalid ID - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:info invalid ID', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:info invalid ID - FAIL:', error.message);
  }

  // Test 9: Agent list with active filter
  try {
    const result = await runCLI('agent:list --active');
    if (!result.success) {
      throw new Error('Agent list with active filter failed');
    }

    results.tests.push({ name: 'CLI: agent:list --active', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: agent:list --active - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: agent:list --active', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: agent:list --active - FAIL:', error.message);
  }

  // ========== TASK COMMANDS ==========
  console.log('\n⚡ Testing Task Commands\n');

  // Test 10: Task status error handling
  try {
    const result = await runCLI('task:status');
    // Should fail - missing task ID
    if (result.success) {
      throw new Error('Should fail without task ID');
    }

    results.tests.push({ name: 'CLI: task:status error handling', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: task:status error handling - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: task:status error handling', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: task:status error handling - FAIL:', error.message);
  }

  // Test 11: Task create error handling
  try {
    const result = await runCLI('task:create');
    // Should fail - missing agent ID
    if (result.success) {
      throw new Error('Should fail without agent ID');
    }

    results.tests.push({ name: 'CLI: task:create error handling', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: task:create error handling - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: task:create error handling', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: task:create error handling - FAIL:', error.message);
  }

  // ========== WALLET COMMANDS ==========
  console.log('\n💰 Testing Wallet Commands\n');

  // Test 12: Wallet balance with address
  try {
    const testAddress = '0x0000000000000000000000000000000000000000';
    const result = await runCLI(`wallet:balance ${testAddress}`);
    if (!result.success) {
      throw new Error('Wallet balance with address failed');
    }

    results.tests.push({ name: 'CLI: wallet:balance <address>', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: wallet:balance <address> - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: wallet:balance <address>', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: wallet:balance <address> - FAIL:', error.message);
  }

  // ========== HELP COMMANDS ==========
  console.log('\n📚 Testing Help Commands\n');

  // Test 13-18: Help for all command groups
  const helpCommands = [
    'help init',
    'help agent:register',
    'help agent:list',
    'help task:create',
    'help task:status',
    'help wallet:balance',
    'help wallet:info',
  ];

  for (const cmd of helpCommands) {
    try {
      const result = await runCLI(cmd);
      if (!result.success) {
        throw new Error(`${cmd} failed`);
      }

      results.tests.push({ name: `CLI: ${cmd}`, status: 'PASS' });
      results.passed++;
      console.log(`✅ CLI: ${cmd} - PASS`);
    } catch (error) {
      results.tests.push({ name: `CLI: ${cmd}`, status: 'FAIL', error: error.message });
      results.failed++;
      console.log(`❌ CLI: ${cmd} - FAIL:`, error.message);
    }
  }

  // ========== EDGE CASES ==========
  console.log('\n⚠️  Testing Edge Cases\n');

  // Test: Multiple flags
  try {
    const result = await runCLI('agent:list --limit 3 --format json');
    if (!result.success) {
      throw new Error('Multiple flags failed');
    }

    const jsonOutput = JSON.parse(result.stdout);
    if (!jsonOutput.agents) {
      throw new Error('Invalid output with multiple flags');
    }

    results.tests.push({ name: 'CLI: multiple flags', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: multiple flags - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: multiple flags', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: multiple flags - FAIL:', error.message);
  }

  // Test: Invalid network
  try {
    const result = await runCLI('init --network invalidnet');
    // Should fail
    if (result.success && !result.stderr) {
      throw new Error('Should fail with invalid network');
    }

    results.tests.push({ name: 'CLI: invalid network', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI: invalid network - PASS');
  } catch (error) {
    results.tests.push({ name: 'CLI: invalid network', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI: invalid network - FAIL:', error.message);
  }

  return results;
}

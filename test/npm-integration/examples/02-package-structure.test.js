/**
 * Test: Package Structure & Exports
 * Verifies npm package structure, types, and exports
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function testPackageStructure() {
  const results = {
    name: '02-Package Structure',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Package Structure & Exports\n');

  // Test 1: Package.json exists
  try {
    const packagePath = path.join(__dirname, '../node_modules/somnia-agent-kit/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageJson.name || !packageJson.version) {
      throw new Error('Invalid package.json');
    }

    results.tests.push({
      name: 'Package.json',
      status: 'PASS',
      data: { name: packageJson.name, version: packageJson.version }
    });
    results.passed++;
    console.log('✅ Package.json - PASS');
    console.log('   Name:', packageJson.name, '| Version:', packageJson.version);
  } catch (error) {
    results.tests.push({ name: 'Package.json', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Package.json - FAIL:', error.message);
  }

  // Test 2: Main exports exist
  try {
    const mainExports = await import('somnia-agent-kit');
    const requiredExports = [
      'SomniaAgentKit',
      'SOMNIA_NETWORKS',
      'Logger',
      'Metrics',
      'Dashboard',
      'Agent',
    ];

    const missing = [];
    for (const exp of requiredExports) {
      if (!mainExports[exp]) {
        missing.push(exp);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing exports: ${missing.join(', ')}`);
    }

    results.tests.push({ name: 'Main Exports', status: 'PASS', data: { exports: requiredExports } });
    results.passed++;
    console.log('✅ Main Exports - PASS');
    console.log('   Found:', requiredExports.length, 'exports');
  } catch (error) {
    results.tests.push({ name: 'Main Exports', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Main Exports - FAIL:', error.message);
  }

  // Test 3: TypeScript types
  try {
    const typesPath = path.join(__dirname, '../node_modules/somnia-agent-kit/dist/index.d.ts');
    if (!fs.existsSync(typesPath)) {
      throw new Error('TypeScript definitions not found');
    }

    const typesContent = fs.readFileSync(typesPath, 'utf8');
    if (!typesContent.includes('SomniaAgentKit')) {
      throw new Error('Main class type definition missing');
    }

    results.tests.push({ name: 'TypeScript Types', status: 'PASS' });
    results.passed++;
    console.log('✅ TypeScript Types - PASS');
  } catch (error) {
    results.tests.push({ name: 'TypeScript Types', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ TypeScript Types - FAIL:', error.message);
  }

  // Test 4: CLI binaries
  try {
    const binPath1 = path.join(__dirname, '../node_modules/.bin/somnia-agent');
    const binPath2 = path.join(__dirname, '../node_modules/.bin/sak');

    if (!fs.existsSync(binPath1) && !fs.existsSync(binPath2)) {
      throw new Error('CLI binaries not found');
    }

    results.tests.push({ name: 'CLI Binaries', status: 'PASS' });
    results.passed++;
    console.log('✅ CLI Binaries - PASS');
    console.log('   Found: somnia-agent, sak');
  } catch (error) {
    results.tests.push({ name: 'CLI Binaries', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ CLI Binaries - FAIL:', error.message);
  }

  // Test 5: LLM Adapters
  try {
    const { OllamaAdapter, OpenAIAdapter } = await import('somnia-agent-kit');

    if (!OllamaAdapter || !OpenAIAdapter) {
      throw new Error('LLM adapters not exported');
    }

    results.tests.push({ name: 'LLM Adapters', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM Adapters - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM Adapters', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM Adapters - FAIL:', error.message);
  }

  // Test 6: Monitoring exports
  try {
    const { Logger, Metrics, Dashboard } = await import('somnia-agent-kit');

    const logger = new Logger();
    const metrics = new Metrics();

    if (!logger || !metrics) {
      throw new Error('Monitoring classes not instantiable');
    }

    results.tests.push({ name: 'Monitoring Exports', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitoring Exports - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitoring Exports', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitoring Exports - FAIL:', error.message);
  }

  return results;
}

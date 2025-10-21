/**
 * Test Example 05: Monitoring
 * Tests Logger, Metrics, and Dashboard functionality
 */

import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';

export async function testMonitoring() {
  const results = {
    name: '03-Monitoring',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Monitoring Features\n');

  // Test 1: Logger functionality
  try {
    const logger = new Logger();

    logger.info('Test info message', { data: 'test' });
    logger.warn('Test warning', { code: 123 });
    logger.error('Test error', { error: 'test' });
    logger.debug('Test debug', { debug: true });

    results.tests.push({ name: 'Logger Functionality', status: 'PASS' });
    results.passed++;
    console.log('✅ Logger Functionality - PASS');
  } catch (error) {
    results.tests.push({ name: 'Logger Functionality', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Logger Functionality - FAIL:', error.message);
  }

  // Test 2: Metrics recording
  try {
    const metrics = new Metrics();

    // Record various metrics
    metrics.recordLLMCall(150, true);
    metrics.recordLLMCall(200, true);
    metrics.recordLLMCall(180, false);

    metrics.recordTransaction(true, 50000);
    metrics.recordTransaction(true, 45000);
    metrics.recordTransaction(false, 60000);

    metrics.histogram('agent.execution.duration', 500);
    metrics.histogram('agent.execution.duration', 300);

    const summary = metrics.export();

    if (!summary.llm || !summary.transactions) {
      throw new Error('Metrics summary incomplete');
    }

    results.tests.push({ name: 'Metrics Recording', status: 'PASS', data: summary });
    results.passed++;
    console.log('✅ Metrics Recording - PASS');
    console.log('   LLM calls:', summary.llm.total);
    console.log('   Transactions:', summary.transactions.total);
  } catch (error) {
    results.tests.push({ name: 'Metrics Recording', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Metrics Recording - FAIL:', error.message);
  }

  // Test 3: Dashboard creation
  try {
    const logger = new Logger();
    const metrics = new Metrics();
    const dashboard = new Dashboard({
      port: 3002, // Use different port to avoid conflicts
      logger,
      metrics,
    });

    if (!dashboard) {
      throw new Error('Dashboard creation failed');
    }

    results.tests.push({ name: 'Dashboard Creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Dashboard Creation - PASS');
    console.log('   Port: 3002');
  } catch (error) {
    results.tests.push({ name: 'Dashboard Creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Dashboard Creation - FAIL:', error.message);
  }

  // Test 4: Metrics export format
  try {
    const metrics = new Metrics();
    metrics.recordLLMCall(100, true);

    const summary = metrics.export();
    const jsonString = JSON.stringify(summary);

    if (!jsonString || jsonString === '{}') {
      throw new Error('Invalid metrics export format');
    }

    results.tests.push({ name: 'Metrics Export Format', status: 'PASS' });
    results.passed++;
    console.log('✅ Metrics Export Format - PASS');
  } catch (error) {
    results.tests.push({ name: 'Metrics Export Format', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Metrics Export Format - FAIL:', error.message);
  }

  return results;
}

/**
 * Comprehensive Monitoring Tests
 * Tests Logger, Metrics, Dashboard, EventRecorder, Telemetry
 */

import { Logger, Metrics, Dashboard, EventRecorder, Telemetry } from 'somnia-agent-kit';

export async function testMonitoringComplete() {
  const results = {
    name: 'Monitoring Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing Monitoring Features\n');

  // Test 1: Logger creation
  try {
    const logger = new Logger();
    if (!logger) {
      throw new Error('Logger creation failed');
    }

    results.tests.push({ name: 'Monitor: Logger creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Logger creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Logger creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Logger creation - FAIL:', error.message);
  }

  // Test 2: Logger all levels
  try {
    const logger = new Logger();
    logger.info('Info message', { data: 'test' });
    logger.warn('Warning message', { code: 123 });
    logger.error('Error message', { error: 'test' });
    logger.debug('Debug message', { debug: true });

    results.tests.push({ name: 'Monitor: Logger levels', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Logger levels - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Logger levels', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Logger levels - FAIL:', error.message);
  }

  // Test 3: Logger with different data types
  try {
    const logger = new Logger();
    logger.info('String data', { message: 'hello' });
    logger.info('Number data', { count: 42 });
    logger.info('Boolean data', { enabled: true });
    logger.info('Object data', { nested: { key: 'value' } });
    logger.info('Array data', { items: [1, 2, 3] });

    results.tests.push({ name: 'Monitor: Logger data types', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Logger data types - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Logger data types', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Logger data types - FAIL:', error.message);
  }

  // Test 4: Metrics creation
  try {
    const metrics = new Metrics();
    if (!metrics) {
      throw new Error('Metrics creation failed');
    }

    results.tests.push({ name: 'Monitor: Metrics creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Metrics creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Metrics creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Metrics creation - FAIL:', error.message);
  }

  // Test 5: Metrics recording LLM calls
  try {
    const metrics = new Metrics();
    metrics.recordLLMCall(150, true);
    metrics.recordLLMCall(200, true);
    metrics.recordLLMCall(180, false);
    metrics.recordLLMCall(120, true);

    results.tests.push({ name: 'Monitor: Metrics LLM calls', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Metrics LLM calls - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Metrics LLM calls', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Metrics LLM calls - FAIL:', error.message);
  }

  // Test 6: Metrics recording transactions
  try {
    const metrics = new Metrics();
    metrics.recordTransaction(true, 50000);
    metrics.recordTransaction(true, 45000);
    metrics.recordTransaction(false, 60000);
    metrics.recordTransaction(true, 52000);

    results.tests.push({ name: 'Monitor: Metrics transactions', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Metrics transactions - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Metrics transactions', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Metrics transactions - FAIL:', error.message);
  }

  // Test 7: Metrics histogram
  try {
    const metrics = new Metrics();
    metrics.histogram('agent.execution.duration', 500);
    metrics.histogram('agent.execution.duration', 300);
    metrics.histogram('agent.execution.duration', 700);
    metrics.histogram('task.processing.time', 1000);

    results.tests.push({ name: 'Monitor: Metrics histogram', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Metrics histogram - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Metrics histogram', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Metrics histogram - FAIL:', error.message);
  }

  // Test 8: Metrics export
  try {
    const metrics = new Metrics();
    metrics.recordLLMCall(100, true);
    metrics.recordTransaction(true, 50000);
    metrics.histogram('test.metric', 500);

    const summary = metrics.export();

    if (typeof summary !== 'object') {
      throw new Error('Export did not return object');
    }

    results.tests.push({ name: 'Monitor: Metrics export', status: 'PASS', data: summary });
    results.passed++;
    console.log('✅ Monitor: Metrics export - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Metrics export', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Metrics export - FAIL:', error.message);
  }

  // Test 9: Dashboard creation
  try {
    const logger = new Logger();
    const metrics = new Metrics();
    const dashboard = new Dashboard({
      port: 3003,
      logger,
      metrics,
    });

    if (!dashboard) {
      throw new Error('Dashboard creation failed');
    }

    results.tests.push({ name: 'Monitor: Dashboard creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Dashboard creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Dashboard creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Dashboard creation - FAIL:', error.message);
  }

  // Test 10: EventRecorder creation
  try {
    const recorder = new EventRecorder();
    if (!recorder) {
      throw new Error('EventRecorder creation failed');
    }

    results.tests.push({ name: 'Monitor: EventRecorder creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: EventRecorder creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: EventRecorder creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: EventRecorder creation - FAIL:', error.message);
  }

  // Test 11: EventRecorder recording events
  try {
    const recorder = new EventRecorder();
    recorder.recordEvent('agent.created', { agentId: 1, name: 'Test' });
    recorder.recordEvent('task.started', { taskId: 1, agentId: 1 });
    recorder.recordEvent('task.completed', { taskId: 1, result: 'success' });

    results.tests.push({ name: 'Monitor: EventRecorder events', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: EventRecorder events - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: EventRecorder events', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: EventRecorder events - FAIL:', error.message);
  }

  // Test 12: Telemetry creation
  try {
    const telemetry = new Telemetry();
    if (!telemetry) {
      throw new Error('Telemetry creation failed');
    }

    results.tests.push({ name: 'Monitor: Telemetry creation', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Telemetry creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Telemetry creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Telemetry creation - FAIL:', error.message);
  }

  // Test 13: Integration - Logger + Metrics
  try {
    const logger = new Logger();
    const metrics = new Metrics();

    logger.info('Starting operation');
    metrics.recordLLMCall(100, true);
    logger.info('Operation completed');

    const summary = metrics.export();

    results.tests.push({ name: 'Monitor: Logger + Metrics integration', status: 'PASS' });
    results.passed++;
    console.log('✅ Monitor: Logger + Metrics integration - PASS');
  } catch (error) {
    results.tests.push({ name: 'Monitor: Logger + Metrics integration', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Monitor: Logger + Metrics integration - FAIL:', error.message);
  }

  return results;
}

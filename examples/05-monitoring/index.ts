/**
 * Example 5: Monitoring
 *
 * Use Logger, Metrics, and Dashboard
 */

import { Dashboard, Logger, Metrics } from '../../packages/agent-kit/src';

async function main() {
  console.log('📊 Monitoring Demo\n');

  // 1. Logger
  console.log('📝 Logger Example:');
  const logger = new Logger();

  logger.info('Agent started', { agentId: 1 });
  logger.warn('Low balance', { balance: 0.1 });
  logger.error('Task failed', { error: 'timeout' });
  logger.debug('Debug info', { data: { foo: 'bar' } });

  // 2. Metrics
  console.log('\n📈 Metrics Example:');
  const metrics = new Metrics();

  // Record operations
  metrics.recordLLMCall(150, true);
  metrics.recordLLMCall(200, true);
  metrics.recordLLMCall(180, false);

  metrics.recordTransaction(true, 50000);
  metrics.recordTransaction(true, 45000);

  metrics.histogram('agent.trade.duration', 500);
  metrics.histogram('agent.analyze.duration', 300);

  // Get summary
  const summary = metrics.export();
  console.log('Metrics Summary:', JSON.stringify(summary, null, 2));

  // 3. Dashboard
  console.log('\n🖥️  Dashboard Example:');
  const dashboard = new Dashboard({
    port: 3001,
    logger,
    metrics,
  });

  console.log('Starting dashboard...');
  await dashboard.start();
  console.log('✅ Dashboard running at http://localhost:3001');
  console.log('\nPress Ctrl+C to stop');

  // Keep running
  await new Promise(() => {});
}

main().catch(console.error);

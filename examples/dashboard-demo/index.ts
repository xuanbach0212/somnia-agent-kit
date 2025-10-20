/**
 * Dashboard Demo
 * Start a web dashboard to monitor agents in real-time
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaAgentKit } from '../../packages/agent-kit/src';
import { OllamaAdapter } from '../../packages/agent-kit/src/llm/adapters/ollamaAdapter';
import { Dashboard, Logger, Metrics } from '../../packages/agent-kit/src/monitor';

dotenv.config({ path: '../../.env' });

// Official deployed contracts on Somnia Testnet
const DEPLOYED_CONTRACTS = {
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
};

async function main() {
  console.log('🎨 Dashboard Demo - Real-time Agent Monitoring\n');

  // 1. Initialize Logger
  console.log('📝 Step 1: Initialize Logger...');
  const logger = new Logger({
    level: 'info' as any,
    format: 'pretty',
    enableConsole: true,
    enableMemoryStorage: true,
  });

  logger.info('Dashboard demo started');
  console.log('✅ Logger ready\n');

  // 2. Initialize Metrics
  console.log('📈 Step 2: Initialize Metrics...');
  const metrics = new Metrics();
  logger.info('Metrics initialized');
  console.log('✅ Metrics ready\n');

  // 3. Initialize SDK
  console.log('📦 Step 3: Initialize SDK...');
  const kit = new SomniaAgentKit({
    network: {
      name: 'somnia-testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: 50312,
    },
    contracts: DEPLOYED_CONTRACTS,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  logger.info('SDK initialized');
  console.log('✅ SDK initialized\n');

  // 4. Initialize LLM
  console.log('🧠 Step 4: Initialize LLM...');
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  const isConnected = await llm.testConnection();
  if (!isConnected) {
    logger.warn('Ollama not connected, continuing without LLM');
    console.log('⚠️  Ollama not running (optional)\n');
  } else {
    logger.info('LLM connected');
    console.log('✅ LLM connected\n');
  }

  // 5. Start Dashboard
  console.log('🎨 Step 5: Starting Dashboard...');
  const dashboard = new Dashboard({
    port: 3001,
    enableUI: true,
    enableCORS: true,
    logger,
    metrics,
  });

  await dashboard.start();
  logger.info('Dashboard started', { port: 3001 });
  console.log('✅ Dashboard started\n');

  console.log('🌐 Dashboard URLs:');
  console.log('   Web UI:    http://localhost:3001');
  console.log('   Health:    http://localhost:3001/health');
  console.log('   Metrics:   http://localhost:3001/metrics');
  console.log('   Logs:      http://localhost:3001/logs');
  console.log('   Status:    http://localhost:3001/status');
  console.log();

  console.log('📊 Open http://localhost:3001 in your browser!\n');

  // 6. Simulate agent activity
  console.log('🤖 Step 6: Simulating agent activity...\n');
  console.log('   (Dashboard will update in real-time)\n');

  // Get wallet info
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  logger.info('Wallet connected', {
    address,
    balance: ethers.formatEther(balance),
  });

  // Simulate periodic activity
  let activityCount = 0;

  const simulateActivity = async () => {
    activityCount++;

    try {
      // 1. Query blockchain
      logger.info('Querying blockchain', { activity: activityCount });
      const startTime = Date.now();

      const totalAgents = await kit.contracts.registry.getTotalAgents();
      const duration = Date.now() - startTime;

      metrics.recordTransaction(true);
      metrics.increment('blockchain.queries');
      metrics.histogram('blockchain.query_time', duration);

      logger.info('Blockchain query successful', {
        totalAgents: totalAgents.toString(),
        duration: `${duration}ms`,
      });

      // 2. Simulate LLM call (if connected)
      if (isConnected) {
        logger.info('Calling LLM', { activity: activityCount });
        const llmStart = Date.now();

        try {
          const response = await llm.generate('Count to 3', {
            maxTokens: 20,
            temperature: 0.7,
          });

          const llmDuration = Date.now() - llmStart;
          metrics.recordLLMCall(llmDuration, true);
          metrics.increment('llm.calls');

          logger.info('LLM call successful', {
            duration: `${llmDuration}ms`,
            tokens: response.usage?.totalTokens || 0,
          });
        } catch (error: any) {
          metrics.recordLLMCall(undefined, false);
          logger.error('LLM call failed', { error: error.message });
        }
      }

      // 3. Random events
      if (Math.random() > 0.8) {
        logger.warn('Random warning event', { activity: activityCount });
      }

      if (Math.random() > 0.95) {
        logger.error('Random error event', { activity: activityCount });
        metrics.increment('errors');
      }

      // 4. Update gauges
      metrics.gauge('active_connections', Math.floor(Math.random() * 10) + 1);
      metrics.gauge('memory_usage_mb', Math.floor(Math.random() * 100) + 50);

      console.log(
        `   [${new Date().toLocaleTimeString()}] Activity ${activityCount} completed`
      );
    } catch (error: any) {
      logger.error('Activity failed', { error: error.message });
      metrics.recordTransaction(false);
    }
  };

  // Run initial activity
  await simulateActivity();

  // Schedule periodic activity
  console.log('\n⏰ Running activity every 10 seconds...');
  console.log('   (Check dashboard for real-time updates)\n');

  const activityInterval = setInterval(async () => {
    await simulateActivity();
  }, 10000); // Every 10 seconds

  // Display metrics every 30 seconds
  const metricsInterval = setInterval(() => {
    const snapshot = metrics.export();
    console.log('\n📊 Current Metrics:');
    console.log(`   LLM calls: ${snapshot.counters['llm.total'] || 0}`);
    console.log(`   Blockchain queries: ${snapshot.counters['blockchain.queries'] || 0}`);
    console.log(`   Transactions: ${snapshot.tx_sent}`);
    console.log(`   Success rate: ${snapshot.tx_success_rate.toFixed(2)}%`);
    console.log(`   Uptime: ${(snapshot.uptime / 1000).toFixed(0)}s`);
    console.log();
  }, 30000); // Every 30 seconds

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    clearInterval(activityInterval);
    clearInterval(metricsInterval);

    logger.info('Dashboard shutting down');
    await dashboard.stop();

    console.log('✅ Dashboard stopped');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });

  // Keep running
  console.log('💡 Tips:');
  console.log('   - Open http://localhost:3001 to see the dashboard');
  console.log('   - Dashboard updates automatically every 5 seconds');
  console.log('   - Press Ctrl+C to stop\n');

  console.log('🚀 Dashboard is running...\n');
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message || error);
  process.exit(1);
});

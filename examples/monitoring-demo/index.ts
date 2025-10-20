/**
 * Monitoring Demo
 * Shows how to use Logger and Metrics to monitor agent performance
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaAgentKit } from '../../packages/agent-kit/src';
import { OllamaAdapter } from '../../packages/agent-kit/src/llm/adapters/ollamaAdapter';
import { Logger, Metrics } from '../../packages/agent-kit/src/monitor';

dotenv.config({ path: '../../.env' });

// Official deployed contracts on Somnia Testnet
const DEPLOYED_CONTRACTS = {
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
};

async function main() {
  console.log('📊 Monitoring Demo - Logger & Metrics\n');

  // 1. Initialize Logger
  console.log('📝 Step 1: Initialize Logger...');
  const logger = new Logger({
    level: 'info' as any,
    format: 'pretty',
    enableConsole: true,
    enableMemoryStorage: true, // Store logs in memory for demo
  });

  logger.info('Logger initialized', { component: 'monitoring-demo' });
  console.log('✅ Logger ready\n');

  // 2. Initialize Metrics
  console.log('📈 Step 2: Initialize Metrics...');
  const metrics = new Metrics({
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    maxMetrics: 10000,
  });

  logger.info('Metrics collector initialized');
  console.log('✅ Metrics ready\n');

  // 3. Initialize SDK with monitoring
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
  logger.info('SDK initialized', { network: 'somnia-testnet' });
  console.log('✅ SDK initialized\n');

  // 4. Initialize LLM
  console.log('🧠 Step 4: Initialize LLM...');
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  const isConnected = await llm.testConnection();
  if (!isConnected) {
    logger.error('Ollama connection failed');
    console.error('❌ Ollama not running');
    process.exit(1);
  }

  logger.info('LLM connected', { provider: 'ollama', model: 'llama3.2' });
  console.log('✅ LLM connected\n');

  // 5. Get wallet info
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  logger.info('Wallet info retrieved', {
    address,
    balance: ethers.formatEther(balance),
  });

  console.log('👛 Wallet Info:');
  console.log('   Address:', address);
  console.log('   Balance:', ethers.formatEther(balance), 'STT\n');

  // 6. Demo: Monitor LLM calls
  console.log('🧠 Step 5: Testing LLM with monitoring...\n');

  for (let i = 1; i <= 3; i++) {
    console.log(`   Test ${i}/3: Calling LLM...`);

    // Start timing
    const startTime = Date.now();

    try {
      // Call LLM
      const response = await llm.generate(`Say hello in ${i} words`, {
        maxTokens: 20,
        temperature: 0.7,
      });

      // Calculate duration
      const duration = Date.now() - startTime;

      // Record metrics
      metrics.recordLLMCall(duration, true);
      metrics.increment('llm.requests');
      metrics.histogram('llm.duration', duration);

      // Log success
      logger.info('LLM call successful', {
        test: i,
        duration: `${duration}ms`,
        tokens: response.usage?.totalTokens || 0,
        response: response.content.substring(0, 50),
      });

      console.log(`   ✅ Success (${duration}ms)`);
      console.log(`      Response: ${response.content.substring(0, 50)}...`);
      console.log(`      Tokens: ${response.usage?.totalTokens || 0}\n`);
    } catch (error: any) {
      // Record failure
      metrics.recordLLMCall(undefined, false);
      metrics.increment('llm.errors');

      logger.error('LLM call failed', {
        test: i,
        error: error.message,
      });

      console.log(`   ❌ Failed: ${error.message}\n`);
    }

    // Small delay between calls
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 7. Demo: Monitor blockchain transactions
  console.log('⛓️  Step 6: Testing blockchain with monitoring...\n');

  try {
    console.log('   Getting agent info from registry...');

    // Start timing
    const startTime = Date.now();

    // Query blockchain
    const totalAgents = await kit.contracts.registry.getTotalAgents();
    const duration = Date.now() - startTime;

    // Record metrics
    metrics.recordTransaction(true);
    metrics.increment('blockchain.reads');
    metrics.histogram('blockchain.query_time', duration);

    // Log success
    logger.info('Blockchain query successful', {
      query: 'getTotalAgents',
      result: totalAgents.toString(),
      duration: `${duration}ms`,
    });

    console.log(`   ✅ Success (${duration}ms)`);
    console.log(`      Total agents: ${totalAgents}\n`);

    // Get agent details if any exist
    if (totalAgents > 0n) {
      console.log('   Getting agent #1 details...');
      const agentStartTime = Date.now();

      const agent = await kit.contracts.registry.getAgent(1n);
      const agentDuration = Date.now() - agentStartTime;

      metrics.recordTransaction(true);
      metrics.histogram('blockchain.query_time', agentDuration);

      logger.info('Agent details retrieved', {
        agentId: 1,
        name: agent.name,
        owner: agent.owner,
        duration: `${agentDuration}ms`,
      });

      console.log(`   ✅ Success (${agentDuration}ms)`);
      console.log(`      Name: ${agent.name}`);
      console.log(`      Owner: ${agent.owner}`);
      console.log(`      Active: ${agent.isActive}\n`);
    }
  } catch (error: any) {
    metrics.recordTransaction(false);
    metrics.increment('blockchain.errors');

    logger.error('Blockchain query failed', {
      error: error.message,
    });

    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  // 8. Display metrics summary
  console.log('📊 Step 7: Metrics Summary\n');

  const metricsSnapshot = metrics.export();

  console.log('   📈 LLM Metrics:');
  console.log(`      Total calls: ${metricsSnapshot.counters['llm.total'] || 0}`);
  console.log(`      Success: ${metricsSnapshot.counters['llm.success'] || 0}`);
  console.log(`      Failed: ${metricsSnapshot.counters['llm.failed'] || 0}`);
  console.log(`      Success rate: ${metricsSnapshot.tx_success_rate.toFixed(2)}%`);
  console.log(`      Avg duration: ${metricsSnapshot.reasoning_time.toFixed(0)}ms`);
  console.log(
    `      P95 duration: ${metricsSnapshot.histograms.reasoning_time.p95?.toFixed(0) || 0}ms`
  );
  console.log();

  console.log('   ⛓️  Blockchain Metrics:');
  console.log(`      Total transactions: ${metricsSnapshot.tx_sent}`);
  console.log(`      Success: ${metricsSnapshot.counters['tx.success'] || 0}`);
  console.log(`      Failed: ${metricsSnapshot.counters['tx.failed'] || 0}`);
  console.log(`      Reads: ${metricsSnapshot.counters['blockchain.reads'] || 0}`);
  console.log();

  console.log('   ⏱️  Performance:');
  console.log(`      Uptime: ${(metricsSnapshot.uptime / 1000).toFixed(2)}s`);
  console.log(`      TPS: ${metricsSnapshot.tps.toFixed(2)}`);
  console.log();

  // 9. Display logs summary
  console.log('📝 Step 8: Logs Summary\n');

  const allLogs = logger.getLogs();
  const errorLogs = logger.getLogsByLevel('error' as any);
  const infoLogs = logger.getLogsByLevel('info' as any);

  console.log(`   Total logs: ${allLogs.length}`);
  console.log(`   Info: ${infoLogs.length}`);
  console.log(`   Errors: ${errorLogs.length}`);
  console.log();

  console.log('   Recent logs (last 5):');
  const recentLogs = logger.getLogs(5);
  recentLogs.forEach((log, i) => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    console.log(`   ${i + 1}. [${time}] ${log.level.toUpperCase()}: ${log.message}`);
    if (log.metadata) {
      console.log(`      Metadata:`, JSON.stringify(log.metadata, null, 2));
    }
  });
  console.log();

  // 10. Export metrics to JSON
  console.log('💾 Step 9: Exporting metrics...\n');

  const exportPath = './monitoring-metrics.json';
  const fs = require('fs');
  fs.writeFileSync(exportPath, JSON.stringify(metricsSnapshot, null, 2));

  logger.info('Metrics exported', { path: exportPath });
  console.log(`   ✅ Metrics exported to: ${exportPath}\n`);

  // 11. Demo: Child logger with context
  console.log('🔍 Step 10: Child Logger Demo...\n');

  const agentLogger = logger.child('AgentMonitor');
  agentLogger.info('Agent monitoring started');
  agentLogger.debug('Checking agent health', { agentId: 1 });
  agentLogger.info('Agent is healthy', { status: 'active', uptime: 3600 });

  console.log('   ✅ Child logger demo complete\n');

  // 12. Final summary
  console.log('🎉 Monitoring Demo Complete!\n');

  console.log('📊 What we demonstrated:');
  console.log('   1. ✅ Logger initialization and usage');
  console.log('   2. ✅ Metrics collection (counters, histograms)');
  console.log('   3. ✅ LLM call monitoring');
  console.log('   4. ✅ Blockchain transaction monitoring');
  console.log('   5. ✅ Performance metrics (duration, success rate)');
  console.log('   6. ✅ Metrics export to JSON');
  console.log('   7. ✅ Child logger with context');
  console.log();

  console.log('💡 Key Features:');
  console.log('   - 📝 Structured logging with Pino');
  console.log('   - 📈 Performance metrics collection');
  console.log('   - ⏱️  Timing and duration tracking');
  console.log('   - 📊 Success rate calculation');
  console.log('   - 🎯 Percentile statistics (P50, P95, P99)');
  console.log('   - 💾 Memory storage for testing');
  console.log('   - 🔍 Context-based logging');
  console.log();

  console.log('🔗 Check the exported file:');
  console.log(`   cat ${exportPath}`);
  console.log();

  console.log('🚀 Use this in production to:');
  console.log('   - Monitor agent performance');
  console.log('   - Track LLM costs and latency');
  console.log('   - Debug issues with detailed logs');
  console.log('   - Optimize gas usage');
  console.log('   - Alert on failures');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  });

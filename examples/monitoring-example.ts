/**
 * Example: Agent Monitoring
 * This example demonstrates how to monitor AI agents
 */

import * as dotenv from 'dotenv';
import { AgentMonitor } from '../src/monitoring/AgentMonitor';
import { MetricsCollector } from '../src/monitoring/MetricsCollector';
import { SomniaAgentSDK } from '../src/sdk/SomniaAgentSDK';

dotenv.config();

async function main() {
  console.log('📊 Starting Agent Monitoring Example\n');

  // Initialize SDK
  const sdk = new SomniaAgentSDK({
    rpcUrl: process.env.SOMNIA_RPC_URL,
    chainId: Number(process.env.SOMNIA_CHAIN_ID),
    privateKey: process.env.PRIVATE_KEY,
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
    agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
  });

  // Initialize metrics collector with custom thresholds
  const metricsCollector = new MetricsCollector(sdk, {
    minSuccessRate: 80,
    maxAverageExecutionTime: 5000,
    maxFailureRate: 20,
  });

  // Initialize monitor
  const monitor = new AgentMonitor(sdk, metricsCollector, {
    updateInterval: 10000, // 10 seconds for demo
    autoStart: false,
  });

  // Set up event listeners
  monitor.on('metrics:collected', (metrics) => {
    console.log(`\n📈 Metrics collected for agent ${metrics.agentId}:`);
    console.log(`  Status: ${metrics.status.toUpperCase()}`);
    console.log(`  Success Rate: ${metrics.metrics.successRate.toFixed(2)}%`);
    console.log(`  Total Executions: ${metrics.metrics.totalExecutions}`);
    console.log(`  Avg Execution Time: ${metrics.metrics.averageExecutionTime}ms`);
    
    if (metrics.alerts.length > 0) {
      console.log(`  ⚠️  Alerts:`);
      metrics.alerts.forEach((alert) => console.log(`    - ${alert}`));
    }
  });

  monitor.on('alert:critical', (metrics) => {
    console.log(`\n🚨 CRITICAL ALERT for agent ${metrics.agentId}:`);
    metrics.alerts.forEach((alert) => console.log(`  - ${alert}`));
  });

  monitor.on('alert:warning', (metrics) => {
    console.log(`\n⚠️  WARNING for agent ${metrics.agentId}:`);
    metrics.alerts.forEach((alert) => console.log(`  - ${alert}`));
  });

  monitor.on('metrics:aggregated', (aggregated) => {
    console.log('\n📊 Aggregated Metrics:');
    console.log(`  Total Agents: ${aggregated.totalAgents}`);
    console.log(`  Healthy: ${aggregated.healthyAgents}`);
    console.log(`  Warning: ${aggregated.warningAgents}`);
    console.log(`  Critical: ${aggregated.criticalAgents}`);
    console.log(`  Average Success Rate: ${aggregated.averageSuccessRate.toFixed(2)}%`);
    console.log(`  Total Executions: ${aggregated.totalExecutions}`);
  });

  // Get your agents
  console.log('🔍 Finding your agents...');
  const signerAddress = await sdk.getSignerAddress();
  if (!signerAddress) {
    throw new Error('No signer configured');
  }

  const agentIds = await sdk.getOwnerAgents(signerAddress);
  console.log(`Found ${agentIds.length} agent(s)`);

  if (agentIds.length === 0) {
    console.log('\n⚠️  No agents found. Please create some agents first using the examples.');
    console.log('Run: ts-node examples/simple-agent.ts');
    return;
  }

  // Add agents to monitoring
  console.log('\n📡 Adding agents to monitoring...');
  agentIds.forEach((agentId) => {
    monitor.addAgent(agentId);
    console.log(`  Added agent ${agentId}`);
  });

  // Start monitoring
  console.log('\n🚀 Starting monitor...');
  monitor.start();

  // Keep running for demo
  console.log('\n⏳ Monitoring agents (will run for 60 seconds)...');
  console.log('Press Ctrl+C to stop\n');

  // Run for 60 seconds
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // Stop monitoring
  console.log('\n🛑 Stopping monitor...');
  monitor.stop();

  // Display final aggregated metrics
  const finalMetrics = metricsCollector.getAggregatedMetrics();
  console.log('\n📊 Final Aggregated Metrics:');
  console.log(JSON.stringify(finalMetrics, null, 2));

  console.log('\n✨ Monitoring example completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });


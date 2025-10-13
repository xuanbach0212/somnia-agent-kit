/**
 * Example: Monitoring Client - SDK Wrapper Usage
 * Demonstrates how to use MonitoringClient to interact with monitoring server
 */

import * as dotenv from 'dotenv';
import { AgentBuilder, MonitoringClient, SomniaAgentSDK } from '../src';

dotenv.config();

async function main() {
  console.log('🔌 Monitoring Client SDK Example\n');

  // 1. Create Monitoring Client
  console.log('📡 Creating Monitoring Client...');
  const monitoring = new MonitoringClient({
    baseUrl: process.env.MONITORING_URL || 'http://localhost:3001',
    autoConnect: true,
    reconnectInterval: 5000,
  });

  // Wait for WebSocket connection
  await new Promise((resolve) => {
    monitoring.on('ws:connected', resolve);
  });
  console.log('✅ Connected to monitoring server\n');

  // 2. Check Health
  console.log('🏥 Checking server health...');
  const health = await monitoring.getHealth();
  console.log('Health:', health);
  console.log();

  // 3. Get Aggregated Metrics
  console.log('📊 Getting aggregated metrics...');
  const aggregated = await monitoring.getAggregatedMetrics();
  console.log('Aggregated Metrics:');
  console.log('  Total Agents:', aggregated.totalAgents);
  console.log('  Healthy:', aggregated.healthyAgents);
  console.log('  Warning:', aggregated.warningAgents);
  console.log('  Critical:', aggregated.criticalAgents);
  console.log('  Average Success Rate:', aggregated.averageSuccessRate.toFixed(2) + '%');
  console.log();

  // 4. Create an agent to monitor
  console.log('🤖 Creating test agent...');
  const sdk = new SomniaAgentSDK({
    rpcUrl: process.env.SOMNIA_RPC_URL!,
    chainId: Number(process.env.SOMNIA_CHAIN_ID),
    privateKey: process.env.PRIVATE_KEY!,
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS!,
  });

  // Check if we have existing agents
  const signerAddress = await sdk.getSignerAddress();
  if (!signerAddress) {
    throw new Error('No signer configured');
  }

  const agentIds = await sdk.getOwnerAgents(signerAddress);
  console.log(`Found ${agentIds.length} existing agent(s)\n`);

  let testAgentId: string;

  if (agentIds.length > 0) {
    testAgentId = agentIds[0];
    console.log(`Using existing agent: ${testAgentId}`);
  } else {
    console.log('Creating new agent...');
    const agent = await AgentBuilder.quick('Test Agent', 'For monitoring demo', {
      execute: async () => ({ success: true, result: 'Done' }),
    })
      .connectSDK(sdk)
      .build();
    testAgentId = agent.getAgentId();
    console.log(`Created agent: ${testAgentId}`);
  }
  console.log();

  // 5. Add Agent to Monitoring
  console.log('➕ Adding agent to monitoring...');
  await monitoring.addAgent(testAgentId);
  console.log('✅ Agent added to monitoring\n');

  // 6. Subscribe to Real-time Updates
  console.log('🔔 Subscribing to real-time updates...');
  monitoring.on('metrics', (data) => {
    console.log('\n📈 Metrics Update:');
    console.log('  Agent ID:', data.agentId);
    console.log('  Status:', data.status.toUpperCase());
    console.log('  Success Rate:', data.metrics.successRate.toFixed(2) + '%');
    console.log('  Total Executions:', data.metrics.totalExecutions);
    if (data.alerts.length > 0) {
      console.log('  ⚠️  Alerts:', data.alerts.length);
    }
  });

  monitoring.on('aggregated', (data) => {
    console.log('\n📊 System Update:');
    console.log('  Total Agents:', data.totalAgents);
    console.log('  Healthy:', data.healthyAgents);
    console.log('  Warning:', data.warningAgents);
    console.log('  Critical:', data.criticalAgents);
  });

  monitoring.on('alert', (data) => {
    console.log('\n🚨 ALERT:');
    console.log('  Agent:', data.agentId);
    console.log('  Severity:', data.severity || 'unknown');
    console.log('  Alerts:', data.alerts);
  });

  monitoring.subscribe(testAgentId);
  console.log('✅ Subscribed to agent updates\n');

  // 7. Get Current Metrics
  console.log('📊 Getting current metrics...');
  const metrics = await monitoring.getAgentMetrics(testAgentId);
  console.log('Current Metrics:');
  console.log('  Status:', metrics.status);
  console.log('  Total Executions:', metrics.metrics.totalExecutions);
  console.log('  Success Rate:', metrics.metrics.successRate.toFixed(2) + '%');
  console.log('  Average Execution Time:', metrics.metrics.averageExecutionTime + 'ms');
  console.log();

  // 8. Get Metrics History
  console.log('📚 Getting metrics history (last 5)...');
  const history = await monitoring.getMetricsHistory(testAgentId, 5);
  console.log(`History entries: ${history.length}`);
  if (history.length > 0) {
    console.log('Latest entry:', new Date(history[0].timestamp).toLocaleString());
  }
  console.log();

  // 9. Get Monitored Agents List
  console.log('📋 Getting monitored agents list...');
  const monitoredAgents = await monitoring.getMonitoredAgents();
  console.log('Monitored agents:', monitoredAgents);
  console.log();

  // 10. Force Collection
  console.log('🔄 Forcing metrics collection...');
  await monitoring.forceCollection();
  console.log('✅ Collection triggered\n');

  // 11. Monitor for 30 seconds
  console.log('⏳ Monitoring for 30 seconds...');
  console.log('(You will see real-time updates if monitoring is active)\n');

  await new Promise((resolve) => setTimeout(resolve, 30000));

  // 12. Cleanup
  console.log('\n🧹 Cleaning up...');
  monitoring.unsubscribe(testAgentId);
  console.log('✅ Unsubscribed from agent');

  await monitoring.removeAgent(testAgentId);
  console.log('✅ Agent removed from monitoring');

  monitoring.disconnect();
  console.log('✅ Disconnected from monitoring server');

  console.log('\n✨ Example completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

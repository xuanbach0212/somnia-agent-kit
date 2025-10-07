/**
 * Example 4: Event-Driven Agent
 * Demonstrates lifecycle management and event handling
 */

import * as dotenv from 'dotenv';
import { SomniaClient, SomniaAgent, MockProvider } from '../src';

dotenv.config();

async function main() {
  console.log('🎯 Example 4: Event-Driven Agent\n');

  // 1. Initialize client
  const client = new SomniaClient();
  await client.connect({
    rpcUrl: process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network',
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    },
  });

  console.log('✅ Connected to Somnia network\n');

  // 2. Create agent with event handlers
  const agent = new SomniaAgent(client)
    .configure({
      name: 'Event-Driven Agent',
      description: 'Demonstrates lifecycle and event handling',
      capabilities: ['event-handling', 'lifecycle-management'],
      autoStart: true,
      pollingInterval: 10000, // 10 seconds
    })
    .withLLM(new MockProvider()) // Use mock for testing
    .withExecutor(async (input, context) => {
      context.logger.info(`Processing input: ${JSON.stringify(input)}`);

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        result: {
          processed: true,
          timestamp: Date.now(),
          input,
        },
      };
    });

  // 3. Set up comprehensive event listeners
  console.log('📡 Setting up event listeners...\n');

  agent.on('agent:registered', (agentId) => {
    console.log(`✅ Event: Agent registered with ID ${agentId}`);
  });

  agent.on('agent:started', () => {
    console.log('✅ Event: Agent started and listening for tasks');
  });

  agent.on('agent:stopped', () => {
    console.log('⏹️  Event: Agent stopped');
  });

  agent.on('task:created', (task) => {
    console.log(`📨 Event: New task created - ${JSON.stringify(task)}`);
  });

  agent.on('task:started', (taskId) => {
    console.log(`🔄 Event: Task ${taskId} started processing`);
  });

  agent.on('task:completed', ({ taskId, result }) => {
    console.log(`✅ Event: Task ${taskId} completed successfully`);
    console.log(`   Result: ${JSON.stringify(result.result, null, 2)}`);
    console.log(`   Execution time: ${result.executionTime}ms`);
  });

  agent.on('task:failed', ({ taskId, error }) => {
    console.error(`❌ Event: Task ${taskId} failed - ${error}`);
  });

  agent.on('metrics:updated', (metrics) => {
    console.log(`📊 Event: Metrics updated`);
    console.log(`   Total executions: ${metrics.totalExecutions}`);
    console.log(`   Success rate: ${metrics.successRate.toFixed(2)}%`);
  });

  agent.on('error', (error) => {
    console.error(`❌ Event: Error occurred - ${error.message}`);
  });

  // 4. Register agent
  console.log('📝 Registering agent...');
  const agentId = await agent.register();
  console.log(`Agent ID: ${agentId}\n`);

  // 5. Start agent (will trigger agent:started event)
  console.log('🚀 Starting agent...');
  await agent.start();
  console.log(`State: ${agent.getState()}\n`);

  // 6. Simulate task processing
  console.log('🧪 Simulating task processing...\n');

  const testTasks = [
    { action: 'process', data: 'task 1' },
    { action: 'analyze', data: 'task 2' },
    { action: 'compute', data: 'task 3' },
  ];

  for (const task of testTasks) {
    console.log(`\n📤 Processing task: ${task.action}`);
    await agent.processTask(JSON.stringify(task));
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 7. Get current metrics
  console.log('\n📈 Current Metrics:');
  const metrics = await agent.getMetrics();
  console.log({
    totalExecutions: metrics.totalExecutions,
    successfulExecutions: metrics.successfulExecutions,
    failedExecutions: metrics.failedExecutions,
    successRate: `${metrics.successRate.toFixed(2)}%`,
    averageExecutionTime: `${metrics.averageExecutionTime}ms`,
  });

  // 8. Demonstrate lifecycle management
  console.log('\n🔄 Testing lifecycle management...');

  console.log('\n⏸️  Stopping agent...');
  await agent.stop();
  console.log(`State after stop: ${agent.getState()}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('\n🔄 Restarting agent...');
  await agent.restart();
  console.log(`State after restart: ${agent.getState()}`);

  // 9. Final cleanup
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('\n🛑 Stopping agent for final cleanup...');
  await agent.stop();

  console.log('\n✨ Example completed successfully!');
  client.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

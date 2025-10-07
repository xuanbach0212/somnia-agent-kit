/**
 * Example 1: Basic Agent
 * Demonstrates how to create a simple agent with basic executor logic
 */

import * as dotenv from 'dotenv';
import { SomniaClient, SomniaAgent } from '../src';

dotenv.config();

async function main() {
  console.log('🚀 Example 1: Basic Agent\n');

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

  // 2. Create agent
  const agent = new SomniaAgent(client)
    .configure({
      name: 'Simple Calculator',
      description: 'A basic calculator agent that performs arithmetic operations',
      capabilities: ['math', 'arithmetic', 'calculator'],
      metadata: {
        version: '1.0.0',
        author: 'Somnia Developer',
      },
    })
    .withExecutor(async (input, context) => {
      context.logger.info(`Processing calculation: ${JSON.stringify(input)}`);

      const { operation, a, b } = input;

      let result: number;
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            return {
              success: false,
              error: 'Division by zero',
            };
          }
          result = a / b;
          break;
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
          };
      }

      return {
        success: true,
        result: {
          operation,
          a,
          b,
          answer: result,
        },
      };
    });

  // 3. Register agent
  console.log('📝 Registering agent on-chain...');
  const agentId = await agent.register();
  console.log(`✅ Agent registered with ID: ${agentId}\n`);

  // 4. Test direct execution
  console.log('🧪 Testing agent execution...');
  const testResult = await agent.processTask('test-task-1');
  console.log('Result:', testResult);

  // 5. Get agent details and metrics
  const details = await agent.getDetails();
  console.log('\n📊 Agent Details:', {
    id: details.id,
    name: details.name,
    owner: details.owner,
    isActive: details.isActive,
    executionCount: details.executionCount,
  });

  const metrics = await agent.getMetrics();
  console.log('\n📈 Agent Metrics:', {
    totalExecutions: metrics.totalExecutions,
    successRate: `${metrics.successRate.toFixed(2)}%`,
    averageExecutionTime: `${metrics.averageExecutionTime}ms`,
  });

  console.log('\n✨ Example completed successfully!');
  client.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

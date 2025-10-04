/**
 * Example: Simple AI Agent
 * This example demonstrates how to create and deploy a basic AI agent
 */

import * as dotenv from 'dotenv';
import { AgentBuilder, SomniaAgentSDK } from '../src';

dotenv.config();

async function main() {
  // Initialize SDK
  const sdk = new SomniaAgentSDK({
    rpcUrl: process.env.SOMNIA_RPC_URL,
    chainId: Number(process.env.SOMNIA_CHAIN_ID),
    privateKey: process.env.PRIVATE_KEY,
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
    agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
  });

  console.log('🤖 Creating a simple AI agent...\n');

  // Create agent using AgentBuilder
  const agent = await AgentBuilder.quick(
    'Simple Calculator Agent',
    'A simple agent that performs basic arithmetic operations',
    {
      execute: async (input: { operation: string; a: number; b: number }) => {
        console.log('Executing calculation:', input);
        
        let result: number;
        switch (input.operation) {
          case 'add':
            result = input.a + input.b;
            break;
          case 'subtract':
            result = input.a - input.b;
            break;
          case 'multiply':
            result = input.a * input.b;
            break;
          case 'divide':
            result = input.a / input.b;
            break;
          default:
            throw new Error('Unknown operation');
        }

        return {
          success: true,
          result: { answer: result },
        };
      },
    }
  )
    .addCapability('arithmetic')
    .addCapability('calculator')
    .withMetadata({
      version: '1.0.0',
      author: 'Your Name',
      supportedOperations: ['add', 'subtract', 'multiply', 'divide'],
    })
    .connectSDK(sdk)
    .build();

  console.log('✅ Agent created with ID:', agent.getAgentId());

  // Test the agent
  console.log('\n🧪 Testing agent execution...');
  const testResult = await agent.execute({
    operation: 'add',
    a: 10,
    b: 5,
  });

  console.log('Test result:', testResult);

  // Get agent details
  const details = await agent.getDetails();
  console.log('\n📊 Agent details:', details);

  // Get agent metrics
  const metrics = await agent.getMetrics();
  console.log('\n📈 Agent metrics:', metrics);

  console.log('\n✨ Example completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });


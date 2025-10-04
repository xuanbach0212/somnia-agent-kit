/**
 * Example: AI Agent with OpenAI Integration
 * This example shows how to create an AI agent that uses OpenAI
 */

import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { AgentBuilder, SomniaAgentSDK } from '../src';

dotenv.config();

async function main() {
  // Initialize OpenAI (optional - only if you have an API key)
  let openai: OpenAI | undefined;
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Initialize SDK
  const sdk = new SomniaAgentSDK({
    rpcUrl: process.env.SOMNIA_RPC_URL,
    chainId: Number(process.env.SOMNIA_CHAIN_ID),
    privateKey: process.env.PRIVATE_KEY,
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
    agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
  });

  console.log('🤖 Creating AI agent with language understanding...\n');

  // Create agent
  const agent = await new AgentBuilder()
    .withName('Language Assistant Agent')
    .withDescription('An AI agent that helps with text processing and language tasks')
    .withCapabilities([
      'text-processing',
      'language-understanding',
      'question-answering',
    ])
    .withMetadata({
      version: '1.0.0',
      model: openai ? 'gpt-3.5-turbo' : 'mock',
      provider: 'openai',
    })
    .withExecutor({
      initialize: async () => {
        console.log('🔧 Initializing language model...');
      },
      execute: async (input: { prompt: string; task?: string }) => {
        console.log('💭 Processing prompt:', input.prompt);

        try {
          // If OpenAI is configured, use it
          if (openai) {
            const completion = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful AI assistant on the Somnia blockchain network.',
                },
                {
                  role: 'user',
                  content: input.prompt,
                },
              ],
              max_tokens: 500,
            });

            const response = completion.choices[0]?.message?.content || '';

            return {
              success: true,
              result: {
                response,
                model: 'gpt-3.5-turbo',
                tokensUsed: completion.usage?.total_tokens,
              },
            };
          } else {
            // Mock response if OpenAI is not configured
            return {
              success: true,
              result: {
                response: `Mock response to: "${input.prompt}". Configure OPENAI_API_KEY to use real AI.`,
                model: 'mock',
              },
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
      cleanup: async () => {
        console.log('🧹 Cleaning up resources...');
      },
    })
    .connectSDK(sdk)
    .build();

  console.log('✅ AI Agent created with ID:', agent.getAgentId());

  // Test the agent
  console.log('\n🧪 Testing AI agent...');
  const testResult = await agent.execute({
    prompt: 'What is Somnia blockchain and why is it fast?',
    task: 'question-answering',
  });

  console.log('\n📝 AI Response:');
  console.log(testResult.result?.response);
  console.log('\n⏱️  Execution time:', testResult.executionTime, 'ms');

  // Get metrics
  const metrics = await agent.getMetrics();
  console.log('\n📈 Agent metrics:', {
    totalExecutions: metrics.totalExecutions,
    successRate: `${metrics.successRate.toFixed(2)}%`,
    averageExecutionTime: `${metrics.averageExecutionTime}ms`,
  });

  console.log('\n✨ Example completed successfully!');
  
  // Cleanup
  await agent.cleanup();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });


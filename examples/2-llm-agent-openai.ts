/**
 * Example 2: LLM Agent with OpenAI
 * Demonstrates how to create an AI agent powered by GPT
 */

import * as dotenv from 'dotenv';
import { SomniaClient, SomniaAgent, OpenAIProvider } from '../src';

dotenv.config();

async function main() {
  console.log('🤖 Example 2: LLM Agent with OpenAI\n');

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

  console.log('✅ Connected to Somnia network');

  // 2. Initialize OpenAI LLM
  const llm = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
  });

  console.log(`✅ OpenAI configured: ${llm.getModel()}\n`);

  // 3. Create AI agent
  const agent = new SomniaAgent(client)
    .configure({
      name: 'GPT Assistant',
      description:
        'An intelligent AI assistant powered by GPT that can answer questions and help with tasks',
      capabilities: [
        'question-answering',
        'chat',
        'analysis',
        'code-generation',
        'creative-writing',
      ],
      metadata: {
        version: '1.0.0',
        modelProvider: 'openai',
      },
    })
    .withLLM(llm)
    .withExecutor(async (input, context) => {
      const { prompt, task } = input;
      context.logger.info(`Processing AI task: ${task || 'general'}`);

      try {
        // Use LLM from context
        const response = await context.llm!.chat([
          {
            role: 'system',
            content:
              'You are a helpful AI assistant running on Somnia blockchain. Provide clear, concise, and helpful responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ]);

        return {
          success: true,
          result: {
            prompt,
            response,
            model: context.llm!.getModel(),
            tokensEstimated: context.llm!.estimateTokens(prompt + response),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

  // 4. Set up event listeners
  agent.on('agent:registered', (agentId) => {
    console.log(`📝 Agent registered: ${agentId}`);
  });

  agent.on('task:completed', ({ taskId, result }) => {
    console.log(`✅ Task ${taskId} completed`);
    console.log(`Response: ${result.result?.response?.substring(0, 100)}...`);
  });

  agent.on('metrics:updated', (metrics) => {
    console.log(`📊 Metrics updated: ${metrics.totalExecutions} executions`);
  });

  // 5. Register agent
  console.log('📝 Registering AI agent...');
  const agentId = await agent.register();
  console.log(`✅ Agent registered with ID: ${agentId}\n`);

  // 6. Test AI agent
  console.log('🧪 Testing AI agent with sample prompts...\n');

  const testPrompts = [
    {
      prompt: 'What is Somnia blockchain and why is it fast?',
      task: 'question-answering',
    },
    {
      prompt: 'Write a haiku about blockchain technology',
      task: 'creative-writing',
    },
    {
      prompt: 'Explain smart contracts in simple terms',
      task: 'explanation',
    },
  ];

  for (const testInput of testPrompts) {
    console.log(`\n💭 Prompt: "${testInput.prompt}"`);
    console.log('⏳ Processing...');

    // In real usage, this would be called when a task is created on-chain
    // For demo purposes, we're calling it directly
    const result = await agent.processTask(JSON.stringify(testInput));

    if (result.success) {
      console.log(`\n✅ Response:`);
      console.log(result.result?.response);
      console.log(`\n⏱️  Execution time: ${result.executionTime}ms`);
      console.log(`📊 Estimated tokens: ${result.result?.tokensEstimated || 'N/A'}`);
    } else {
      console.error(`❌ Error: ${result.error}`);
    }
  }

  // 7. Get final metrics
  console.log('\n📈 Final Agent Metrics:');
  const metrics = await agent.getMetrics();
  console.log({
    totalExecutions: metrics.totalExecutions,
    successfulExecutions: metrics.successfulExecutions,
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

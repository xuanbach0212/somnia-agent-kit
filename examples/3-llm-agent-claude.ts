/**
 * Example 3: LLM Agent with Anthropic Claude
 * Demonstrates how to create an AI agent powered by Claude
 */

import * as dotenv from 'dotenv';
import { SomniaClient, SomniaAgent, AnthropicProvider } from '../src';

dotenv.config();

async function main() {
  console.log('🤖 Example 3: LLM Agent with Anthropic Claude\n');

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

  // 2. Initialize Anthropic LLM
  const llm = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20240620', // Latest Claude model
  });

  console.log(`✅ Claude configured: ${llm.getModel()}\n`);

  // 3. Create AI agent
  const agent = new SomniaAgent(client)
    .configure({
      name: 'Claude Assistant',
      description:
        'An advanced AI assistant powered by Anthropic Claude with strong reasoning and analysis capabilities',
      capabilities: [
        'analysis',
        'reasoning',
        'creative-writing',
        'code-review',
        'research',
      ],
      metadata: {
        version: '1.0.0',
        modelProvider: 'anthropic',
      },
    })
    .withLLM(llm)
    .withExecutor(async (input, context) => {
      const { prompt, task, systemPrompt } = input;
      context.logger.info(`Processing Claude task: ${task || 'general'}`);

      try {
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

        // Add system prompt if provided
        if (systemPrompt) {
          messages.push({
            role: 'system',
            content: systemPrompt,
          });
        } else {
          messages.push({
            role: 'system',
            content:
              'You are Claude, an AI assistant created by Anthropic. You are running on Somnia blockchain. Provide thoughtful, detailed, and accurate responses.',
          });
        }

        messages.push({
          role: 'user',
          content: prompt,
        });

        const response = await context.llm!.chat(messages, {
          maxTokens: 2000,
        });

        return {
          success: true,
          result: {
            prompt,
            response,
            model: context.llm!.getModel(),
            provider: 'anthropic',
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

  // 4. Register agent
  console.log('📝 Registering Claude agent...');
  const agentId = await agent.register();
  console.log(`✅ Agent registered with ID: ${agentId}\n`);

  // 5. Test with complex reasoning tasks
  console.log('🧪 Testing Claude with complex reasoning tasks...\n');

  const testCases = [
    {
      prompt:
        'Analyze the benefits and challenges of running AI agents on blockchain networks like Somnia.',
      task: 'analysis',
    },
    {
      prompt:
        'Compare traditional cloud-based AI agents vs blockchain-based AI agents. What are the key differences?',
      task: 'comparison',
    },
    {
      prompt:
        'Write a technical explanation of how decentralized AI agents could revolutionize autonomous systems.',
      task: 'technical-writing',
    },
  ];

  for (const testInput of testCases) {
    console.log(`\n💭 Task: ${testInput.task}`);
    console.log(`📝 Prompt: "${testInput.prompt.substring(0, 80)}..."`);
    console.log('⏳ Processing with Claude...');

    const result = await agent.processTask(JSON.stringify(testInput));

    if (result.success) {
      console.log(`\n✅ Claude's Response:`);
      console.log('─'.repeat(80));
      console.log(result.result?.response);
      console.log('─'.repeat(80));
      console.log(`\n⏱️  Execution time: ${result.executionTime}ms`);
      console.log(
        `📊 Estimated tokens: ${result.result?.tokensEstimated || 'N/A'}`
      );
    } else {
      console.error(`❌ Error: ${result.error}`);
    }
  }

  // 6. Get final metrics
  console.log('\n📈 Final Agent Metrics:');
  const metrics = await agent.getMetrics();
  console.log({
    totalExecutions: metrics.totalExecutions,
    successfulExecutions: metrics.successfulExecutions,
    successRate: `${metrics.successRate.toFixed(2)}%`,
    averageExecutionTime: `${metrics.averageExecutionTime}ms`,
  });

  // 7. Display model info
  console.log('\n🔍 Model Information:');
  const modelInfo = llm.getModelInfo();
  console.log({
    provider: modelInfo.provider,
    model: modelInfo.model,
    contextWindow: `${modelInfo.contextWindow.toLocaleString()} tokens`,
    maxOutputTokens: `${modelInfo.maxOutputTokens.toLocaleString()} tokens`,
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

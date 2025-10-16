/**
 * On-chain Chatbot Agent
 * An AI-powered chatbot that responds to messages and executes blockchain actions
 */

import { SomniaAgentKit, Agent, OpenAIAdapter, Logger, SOMNIA_NETWORKS } from '@somnia/agent-kit';

async function main() {
  console.log('🤖 Starting On-chain Chatbot Agent\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS || '0x...',
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS || '0x...',
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized');

  // Create LLM adapter
  const llm = new OpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: 'gpt-3.5-turbo',
  });

  // Create logger
  const logger = new Logger({ level: 'info' });
  const agentLogger = logger.child('ChatbotAgent');

  // Create agent
  const agent = new Agent({
    name: 'ChatbotAgent',
    description: 'AI chatbot with blockchain capabilities',
    owner: await kit.getSigner()!.getAddress(),
    capabilities: ['chat', 'transfer', 'query'],
  });

  await agent.initialize(
    kit.contracts.AgentRegistry,
    kit.contracts.AgentExecutor
  );

  agentLogger.info('Agent created');

  // Register agent on-chain
  const agentAddress = await agent.register(kit.getSigner()!);
  agentLogger.info('Agent registered', { address: agentAddress });

  // Start agent
  await agent.start();
  agentLogger.info('Agent started');

  // Main chat loop
  console.log('\n💬 Chatbot ready! Type your message:\n');

  process.stdin.on('data', async (data) => {
    const userMessage = data.toString().trim();

    if (userMessage.toLowerCase() === 'exit') {
      await agent.stop();
      agentLogger.info('Agent stopped');
      process.exit(0);
    }

    try {
      agentLogger.info('Processing message', { message: userMessage });

      // Generate response using LLM
      const response = await llm.chat([
        {
          role: 'system',
          content:
            'You are a helpful AI assistant with blockchain capabilities. You can help users check balances, send transactions, and answer questions about their on-chain activities.',
        },
        { role: 'user', content: userMessage },
      ]);

      console.log(`\n🤖 Bot: ${response}\n`);
      agentLogger.info('Response generated', { response });
    } catch (error) {
      agentLogger.error('Error processing message', { error });
      console.error('❌ Error:', error);
    }
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

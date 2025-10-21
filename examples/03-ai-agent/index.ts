/**
 * Example 3: AI Agent with Ollama
 *
 * Create an AI agent using FREE local LLM (Ollama)
 *
 * Setup:
 * 1. Install Ollama: brew install ollama
 * 2. Start Ollama: ollama serve
 * 3. Pull model: ollama pull llama3.2
 */

import * as dotenv from 'dotenv';
import {
  OllamaAdapter,
  SOMNIA_NETWORKS,
  SomniaAgentKit,
} from '../../packages/agent-kit/src';

dotenv.config();

async function main() {
  console.log('🤖 AI Agent with Ollama\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  // Initialize Ollama (FREE local AI)
  console.log('🧠 Initializing Ollama...');
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  // Test LLM
  console.log('\n💬 Testing AI...');
  const response = await llm.generate(
    'Analyze the current crypto market in 2 sentences.'
  );
  console.log('AI Response:', response.content);

  // Use AI to generate agent description
  console.log('\n🤖 Creating AI-powered agent...');
  const descResponse = await llm.generate(
    'Write a professional 1-sentence description for an AI trading bot.'
  );

  // Register agent with AI-generated description
  const tx = await kit.contracts.registry.registerAgent(
    'AI Trading Bot',
    descResponse.content.trim(),
    'ipfs://QmAI123',
    ['trading', 'ai-analysis']
  );

  console.log('⏳ Registering agent...');
  const receipt = await tx.wait();

  if (!receipt) {
    console.error('❌ Transaction failed');
    return;
  }

  console.log('✅ AI agent registered!');

  // Use AI for decision making
  console.log('\n🎯 AI Decision Making:');
  const decisionResponse = await llm.generate(
    'Should I buy ETH now? Answer with YES or NO and explain in 1 sentence.'
  );
  console.log('Decision:', decisionResponse.content);

  console.log('\n✨ Done!');
}

main().catch(console.error);

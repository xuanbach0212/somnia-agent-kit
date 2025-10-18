/**
 * AI Agent with Ollama (Local LLM)
 * Complete example showing AI agent with FREE local LLM on Somnia blockchain
 *
 * Setup:
 * 1. Install Ollama: brew install ollama (or download from https://ollama.ai)
 * 2. Start Ollama: ollama serve
 * 3. Pull a model: ollama pull llama3.2
 * 4. Run this example: npx ts-node index.ts
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaAgentKit } from '../../packages/agent-kit/src';
import { OllamaAdapter } from '../../packages/agent-kit/src/llm/adapters/ollamaAdapter';

dotenv.config({ path: '../../.env' });

// Official deployed contracts on Somnia Testnet
const DEPLOYED_CONTRACTS = {
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
};

async function main() {
  console.log('🤖 AI Agent with Ollama (Local LLM) Demo\n');

  // Validate environment
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  // 1. Initialize SDK
  console.log('📦 Step 1: Initialize Somnia SDK...');
  const kit = new SomniaAgentKit({
    network: {
      name: 'somnia-testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: 50312,
    },
    contracts: DEPLOYED_CONTRACTS,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // 2. Initialize Ollama LLM (Local, FREE!)
  console.log('🧠 Step 2: Initialize Ollama (Local LLM)...');
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2', // or 'qwen2.5:3b', 'phi3:mini', etc.
  });

  // Test LLM connection
  console.log('   Testing Ollama connection...');
  try {
    const isConnected = await llm.testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to Ollama');
      console.log('\n💡 Make sure Ollama is running:');
      console.log('   1. Install: brew install ollama');
      console.log('   2. Start: ollama serve');
      console.log('   3. Pull model: ollama pull llama3.2');
      process.exit(1);
    }
    console.log('✅ Ollama connected (running locally, FREE!)\n');
  } catch (error: any) {
    console.error('❌ Ollama connection failed:', error.message);
    console.log('\n💡 Setup Ollama:');
    console.log('   1. Install: brew install ollama');
    console.log('   2. Start: ollama serve');
    console.log('   3. Pull model: ollama pull llama3.2');
    process.exit(1);
  }

  // 3. Get wallet info
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  console.log('👛 Wallet Info:');
  console.log('   Address:', address);
  console.log('   Balance:', ethers.formatEther(balance), 'STT\n');

  // 4. AI Agent Planning - Use local LLM to decide what to do
  console.log('🤔 Step 3: AI Agent Planning (using local Ollama)...');
  console.log('   Task: "Register a new AI trading agent on Somnia blockchain"\n');

  const planningPrompt = `You are an AI agent operating on the Somnia blockchain. 
Your task is to register a new AI trading agent.

Context:
- You have access to AgentRegistry contract at ${DEPLOYED_CONTRACTS.agentRegistry}
- You have ${ethers.formatEther(balance)} STT tokens
- Current wallet: ${address}

Please provide:
1. A suitable name for the trading agent
2. A description (1-2 sentences)
3. List of capabilities (3-5 items)
4. IPFS metadata hash suggestion

Format your response as JSON:
{
  "name": "...",
  "description": "...",
  "capabilities": ["...", "..."],
  "ipfsHash": "ipfs://Qm..."
}`;

  console.log('   🧠 Asking Ollama (local LLM) for agent details...');
  const planResponse = await llm.generate(planningPrompt, {
    temperature: 0.8,
    maxTokens: 500,
  });

  console.log('\n   💡 Ollama Response:');
  console.log('   ' + planResponse.content.substring(0, 200) + '...\n');

  // Parse LLM response
  let agentDetails;
  try {
    // Extract JSON from response
    const jsonMatch = planResponse.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      agentDetails = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    console.log('   ⚠️  Could not parse JSON, using defaults');
    agentDetails = {
      name: 'AI Trading Agent',
      description: 'Autonomous AI agent for cryptocurrency trading on Somnia',
      capabilities: ['trading', 'analysis', 'risk-management', 'portfolio-optimization'],
      ipfsHash: 'ipfs://QmAIAgentMetadata',
    };
  }

  console.log('📋 Agent Details (from local AI):');
  console.log('   Name:', agentDetails.name);
  console.log('   Description:', agentDetails.description);
  console.log('   Capabilities:', agentDetails.capabilities.join(', '));
  console.log('   IPFS Hash:', agentDetails.ipfsHash);
  console.log();

  // 5. AI Decision Making - Should we register?
  console.log('🤔 Step 4: AI Decision Making...');
  const decisionPrompt = `You are an AI agent. You need to decide whether to register this agent on-chain.

Agent Details:
- Name: ${agentDetails.name}
- Description: ${agentDetails.description}
- Capabilities: ${agentDetails.capabilities.join(', ')}
- Cost: ~0.003 STT (gas)
- Current Balance: ${ethers.formatEther(balance)} STT

Should we proceed with registration? Consider:
1. Is the balance sufficient?
2. Are the capabilities appropriate?
3. Is the name professional?

Respond with: YES or NO, followed by a brief reason.`;

  console.log('   🧠 Asking Ollama for decision...');
  const decision = await llm.generate(decisionPrompt, {
    temperature: 0.3,
    maxTokens: 100,
  });

  console.log('\n   💡 Ollama Decision:');
  console.log('   ' + decision.content);
  console.log();

  const shouldProceed = decision.content.toUpperCase().includes('YES');

  if (!shouldProceed) {
    console.log('❌ AI decided not to proceed with registration');
    console.log('   Reason:', decision.content);
    return;
  }

  // 6. Register agent on-chain
  console.log('🚀 Step 5: Registering agent on-chain...');
  console.log('   AI has approved the registration!');
  console.log();

  const tx = await kit.contracts.registry.registerAgent(
    agentDetails.name,
    agentDetails.description,
    agentDetails.ipfsHash,
    agentDetails.capabilities
  );

  console.log('   TX submitted:', tx.hash);
  console.log('   Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('✅ Agent registered successfully!');
  console.log('   Gas used:', receipt?.gasUsed.toString());
  console.log('   Block:', receipt?.blockNumber);
  console.log();

  // 7. Get agent details
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  const agentId = totalAgents;
  const agent = await kit.contracts.registry.getAgent(agentId);

  console.log('📊 Registered Agent:');
  console.log('   Agent ID:', agentId.toString());
  console.log('   Name:', agent.name);
  console.log('   Owner:', agent.owner);
  console.log('   Active:', agent.isActive);
  console.log();

  // 8. AI Summary
  console.log('📝 Step 6: AI Summary...');
  const summaryPrompt = `Summarize what we just accomplished:

We registered an AI agent on Somnia blockchain with these details:
- Agent ID: ${agentId}
- Name: ${agent.name}
- Description: ${agent.description}
- Capabilities: ${agentDetails.capabilities.join(', ')}
- Transaction: ${tx.hash}
- Gas used: ${receipt?.gasUsed.toString()}

Provide a brief, enthusiastic summary (2-3 sentences) of what this means for AI agents on blockchain.`;

  console.log('   🧠 Asking Ollama for summary...');
  const summary = await llm.generate(summaryPrompt, {
    temperature: 0.9,
    maxTokens: 200,
  });

  console.log('\n   💡 AI Summary:');
  console.log('   ' + summary.content);
  console.log();

  // 9. Final stats
  console.log('🎉 Success! AI Agent is live on Somnia!');
  console.log();
  console.log('🌐 View on Explorer:');
  console.log(
    `   Registry: https://explorer.somnia.network/address/${DEPLOYED_CONTRACTS.agentRegistry}`
  );
  console.log(`   Transaction: https://explorer.somnia.network/tx/${tx.hash}`);
  console.log();
  console.log('📊 LLM Usage:');
  console.log('   Model: llama3.2 (Local, FREE!)');
  console.log('   Running on: Your computer');
  console.log('   Cost: $0.00 (completely free!)');
  console.log();
  console.log('💡 What happened:');
  console.log('   1. ✅ Local Ollama LLM planned agent details');
  console.log('   2. ✅ AI made decision to register');
  console.log('   3. ✅ Agent registered on Somnia blockchain');
  console.log('   4. ✅ AI generated summary');
  console.log();
  console.log('🚀 This is an AI agent with FREE local reasoning on-chain!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  });

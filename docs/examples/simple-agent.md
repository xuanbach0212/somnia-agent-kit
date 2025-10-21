# 🤖 Simple Agent Demo

Learn how to create a basic AI agent using Somnia Agent Kit.

## 🎯 Overview

This example demonstrates:
- ✅ Creating an agent with minimal configuration
- ✅ Registering agent on-chain
- ✅ Integrating with LLM (Ollama - FREE)
- ✅ Executing tasks
- ✅ Handling responses

## 📋 Prerequisites

- Somnia Agent Kit installed
- Wallet with testnet tokens
- Ollama installed (or OpenAI API key)
- Basic TypeScript knowledge

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install somnia-agent-kit dotenv
npm install -D typescript ts-node @types/node
```

### Step 2: Setup Environment

Create `.env`:

```bash
PRIVATE_KEY=your_private_key
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129
```

### Step 3: Create Simple Agent

Create `simple-agent.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS, OllamaAdapter } from 'somnia-agent-kit';
import 'dotenv/config';

async function main() {
  console.log('🤖 Starting Simple Agent Demo\n');

  // 1. Initialize SDK
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
  console.log('✅ SDK initialized\n');

  // 2. Setup LLM (Ollama - FREE local AI)
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2',
  });
  console.log('✅ LLM configured (Ollama)\n');

  // 3. Register Agent
  console.log('📝 Registering agent on-chain...');
  const tx = await kit.contracts.registry.registerAgent(
    'Simple AI Assistant',
    'A helpful AI agent for answering questions',
    'ipfs://QmExample',
    ['chat', 'qa', 'assistance']
  );

  const receipt = await tx.wait();
  console.log('✅ Agent registered!');
  console.log('   Transaction:', receipt.hash);

  // Get agent ID
  const myAddress = await kit.getSigner()?.getAddress();
  const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
  const agentId = myAgents[myAgents.length - 1];
  console.log('   Agent ID:', agentId.toString(), '\n');

  // 4. Execute Tasks
  const tasks = [
    'What is blockchain technology?',
    'Explain smart contracts in simple terms',
    'What are the benefits of decentralization?',
  ];

  for (const task of tasks) {
    console.log(`💬 Task: "${task}"`);
    
    const response = await llm.generate(task, {
      temperature: 0.7,
      maxTokens: 200,
    });

    console.log(`🤖 Response: ${response.content.substring(0, 150)}...`);
    console.log(`📊 Tokens: ${response.usage.totalTokens}\n`);
  }

  console.log('🎉 Demo complete!');
}

main().catch(console.error);
```

## ▶️ Run the Demo

```bash
# Make sure Ollama is running
ollama serve

# In another terminal
npx ts-node simple-agent.ts
```

## 📊 Expected Output

```
🤖 Starting Simple Agent Demo

✅ SDK initialized

✅ LLM configured (Ollama)

📝 Registering agent on-chain...
✅ Agent registered!
   Transaction: 0xabc123...
   Agent ID: 5

💬 Task: "What is blockchain technology?"
🤖 Response: Blockchain technology is a decentralized, distributed ledger system that records transactions across multiple computers in a secure and transparent way...
📊 Tokens: 156

💬 Task: "Explain smart contracts in simple terms"
🤖 Response: Smart contracts are self-executing programs stored on a blockchain that automatically execute when predetermined conditions are met...
📊 Tokens: 142

💬 Task: "What are the benefits of decentralization?"
🤖 Response: Decentralization offers several key benefits: 1) No single point of failure, 2) Increased security, 3) Transparency, 4) Censorship resistance...
📊 Tokens: 178

🎉 Demo complete!
```

## 🎨 Customization

### Use Different LLM Providers

**OpenAI:**

```typescript
import { OpenAIAdapter } from 'somnia-agent-kit';

const llm = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4',
  temperature: 0.7,
});
```

**DeepSeek:**

```typescript
import { DeepSeekAdapter } from 'somnia-agent-kit';

const llm = new DeepSeekAdapter({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  model: 'deepseek-chat',
});
```

### Add More Capabilities

```typescript
const tx = await kit.contracts.registry.registerAgent(
  'Advanced Assistant',
  'Multi-capability AI agent',
  'ipfs://QmExample',
  [
    'chat',
    'analysis',
    'coding',
    'translation',
    'summarization',
  ]
);
```

### Customize LLM Parameters

```typescript
const response = await llm.generate(prompt, {
  temperature: 0.9,      // More creative (0.0 - 1.0)
  maxTokens: 500,        // Longer responses
  topP: 0.95,           // Nucleus sampling
  frequencyPenalty: 0.5, // Reduce repetition
  presencePenalty: 0.5,  // Encourage diversity
});
```

## 🔧 Advanced Features

### Error Handling

```typescript
async function executeWithRetry(llm: OllamaAdapter, prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await llm.generate(prompt);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Streaming Responses

```typescript
import { OllamaAdapter } from 'somnia-agent-kit';

const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2',
});

// Stream response token by token
const stream = await llm.generateStream('Tell me a story');

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Agent with Memory

```typescript
import { Agent, Memory } from 'somnia-agent-kit';

const agent = new Agent({
  name: 'Memory Agent',
  capabilities: ['chat'],
});

// Initialize with memory
await agent.initialize(
  kit.contracts.registry,
  kit.contracts.executor,
  { enableMemory: true }
);

// Agent remembers conversation
await agent.chat('My name is Alice');
await agent.chat('What is my name?'); // Will remember "Alice"
```

## 📊 Monitoring

Add monitoring to track performance:

```typescript
import { Logger, Metrics } from 'somnia-agent-kit';

const logger = new Logger({ level: 'info' });
const metrics = new Metrics();

// Log events
logger.info('Agent started', { agentId });

// Track metrics
const startTime = Date.now();
const response = await llm.generate(prompt);
const duration = Date.now() - startTime;

metrics.recordLLMCall(duration, true);
metrics.recordTokenUsage(response.usage.totalTokens);

// View metrics
console.log('Metrics:', metrics.getStats());
```

## 🧪 Testing

Create `simple-agent.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

describe('Simple Agent', () => {
  it('should initialize SDK', async () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentManager: process.env.AGENT_MANAGER_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
        agentVault: process.env.AGENT_VAULT_ADDRESS!,
      },
    });

    await kit.initialize();
    expect(kit.isInitialized()).toBe(true);
  });

  it('should query agents', async () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentManager: process.env.AGENT_MANAGER_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
        agentVault: process.env.AGENT_VAULT_ADDRESS!,
      },
    });

    await kit.initialize();
    const count = await kit.contracts.registry.agentCount();
    expect(count).toBeGreaterThanOrEqual(0n);
  });
});
```

Run tests:

```bash
npm test
```

## 🎓 Key Learnings

1. ✅ **SDK Initialization** - Connect to Somnia blockchain
2. ✅ **LLM Integration** - Use Ollama for FREE local AI
3. ✅ **Agent Registration** - Store agent metadata on-chain
4. ✅ **Task Execution** - Generate AI responses
5. ✅ **Error Handling** - Handle failures gracefully

## 🚀 Next Steps

- **[On-chain Chatbot](./onchain-chatbot.md)** - Build a chatbot with conversation history
- **[Monitoring Demo](./monitoring.md)** - Add comprehensive monitoring
- **[Vault Demo](./vault.md)** - Manage agent funds
- **[API Reference](../../API_REFERENCE.md)** - Full API documentation

## 📚 Related Documentation

- **[Quick Start](../quickstart.md)** - Get started guide
- **[Installation](../installation.md)** - Setup instructions
- **[LLM Architecture](../LLM_ARCHITECTURE.md)** - Understanding AI integration
- **[Troubleshooting](../troubleshooting.md)** - Common issues

---

**Congratulations!** 🎉 You've created your first AI agent on Somnia blockchain!

# 🚀 Quick Start Guide

Get your first AI agent running in **5 minutes**!

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 16+** installed
- ✅ **npm** or **pnpm** package manager
- ✅ A **wallet with testnet tokens** (for blockchain transactions)
- ✅ An **LLM API key** (OpenAI, Anthropic, or local Ollama)

## 📦 Step 1: Installation

Choose your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add @somnia/agent-kit

# Using npm
npm install @somnia/agent-kit

# Using yarn
yarn add @somnia/agent-kit
```

## 🔑 Step 2: Environment Setup

Create a `.env` file in your project root:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL=https://dream-rpc.somnia.network

# Smart Contract Addresses (Somnia Testnet)
AGENT_REGISTRY_ADDRESS=0x1234...
AGENT_EXECUTOR_ADDRESS=0x5678...
AGENT_MANAGER_ADDRESS=0x9abc...
AGENT_VAULT_ADDRESS=0xdef0...

# LLM Provider (choose one or more)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...

# Optional: Monitoring
MONITORING_ENABLED=true
MONITORING_PORT=3001
```

{% hint style="info" %}
**Getting Testnet Tokens**: Visit the [Somnia Faucet](https://faucet.somnia.network) to get free testnet tokens.
{% endhint %}

{% hint style="warning" %}
**Security**: Never commit your `.env` file to version control! Add it to `.gitignore`.
{% endhint %}

## 🎯 Step 3: Create Your First Agent

Create a new file `my-first-agent.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';
import { OpenAIAdapter } from '@somnia/agent-kit/llm';

async function main() {
  // 1. Initialize the SDK
  console.log('🔧 Initializing Somnia Agent Kit...');
  
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();
  console.log('✅ SDK initialized successfully!');

  // 2. Create an LLM provider
  console.log('🤖 Setting up AI provider...');
  
  const llm = new OpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7,
  });

  // 3. Register your agent on-chain
  console.log('📝 Registering agent on blockchain...');
  
  const agentMetadata = {
    name: 'My First AI Agent',
    description: 'A helpful AI assistant that can answer questions',
    capabilities: ['chat', 'analysis', 'reasoning'],
    version: '1.0.0',
    llm: {
      recommended: {
        provider: 'openai',
        model: 'gpt-4',
      },
    },
  };

  // Upload metadata to IPFS
  const metadataUri = await kit.uploadToIPFS(agentMetadata);
  
  // Register on-chain
  const tx = await kit.contracts.AgentRegistry.registerAgent(
    agentMetadata.name,
    agentMetadata.description,
    metadataUri,
    agentMetadata.capabilities
  );
  
  await tx.wait();
  console.log('✅ Agent registered! Transaction:', tx.hash);

  // 4. Get your agent's ID
  const agents = await kit.contracts.AgentRegistry.getAgentsByOwner(
    await kit.signer.getAddress()
  );
  const myAgentId = agents[agents.length - 1]; // Latest agent
  console.log('🎉 Your Agent ID:', myAgentId.toString());

  // 5. Execute a task with your agent
  console.log('💬 Testing agent...');
  
  const prompt = 'What is blockchain technology and how does it work?';
  const response = await llm.generate({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant specialized in explaining technical concepts clearly.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    maxTokens: 500,
  });

  console.log('\n📤 Prompt:', prompt);
  console.log('📥 Response:', response.content);
  console.log('\n💰 Tokens used:', response.usage);

  // 6. Create a vault for your agent (optional)
  console.log('\n💰 Creating agent vault...');
  
  const vaultTx = await kit.contracts.AgentVault.createVault(
    myAgentId,
    ethers.utils.parseEther('1.0') // Daily limit: 1 token
  );
  await vaultTx.wait();
  
  console.log('✅ Vault created!');
  
  // 7. Deposit funds to vault
  const depositTx = await kit.contracts.AgentVault.depositNative(
    myAgentId,
    { value: ethers.utils.parseEther('0.1') } // Deposit 0.1 tokens
  );
  await depositTx.wait();
  
  console.log('✅ Deposited 0.1 tokens to vault');

  console.log('\n🎊 Setup complete! Your agent is ready to use.');
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
```

## ▶️ Step 4: Run Your Agent

```bash
# Install ts-node if you haven't
npm install -D ts-node typescript @types/node

# Run your agent
npx ts-node my-first-agent.ts
```

## 📊 Expected Output

```
🔧 Initializing Somnia Agent Kit...
✅ SDK initialized successfully!
🤖 Setting up AI provider...
📝 Registering agent on blockchain...
✅ Agent registered! Transaction: 0xabc123...
🎉 Your Agent ID: 1
💬 Testing agent...

📤 Prompt: What is blockchain technology and how does it work?
📥 Response: Blockchain technology is a decentralized, distributed ledger 
system that records transactions across multiple computers...

💰 Tokens used: { promptTokens: 45, completionTokens: 234, totalTokens: 279 }

💰 Creating agent vault...
✅ Vault created!
✅ Deposited 0.1 tokens to vault

🎊 Setup complete! Your agent is ready to use.
```

## 🎯 What Just Happened?

1. ✅ **Initialized SDK** - Connected to Somnia blockchain
2. ✅ **Created LLM Provider** - Set up OpenAI GPT-4
3. ✅ **Registered Agent** - Stored agent metadata on-chain
4. ✅ **Executed Task** - Agent answered a question
5. ✅ **Created Vault** - Set up fund management
6. ✅ **Deposited Funds** - Added tokens for agent operations

## 🚀 Next Steps

Now that you have a working agent, explore more advanced features:

### 📚 Learn More
- **[Architecture Overview](./architecture.md)** - Understand how everything works
- **[Smart Contracts](./contracts-overview.md)** - Deep dive into on-chain logic
- **[LLM Architecture](./LLM_ARCHITECTURE.md)** - Learn about AI integration
- **[SDK Design](./sdk-design.md)** - Explore SDK capabilities

### 💡 Try Examples
- **[Simple Agent Demo](../examples/simple-agent.md)** - Basic agent usage
- **[On-chain Chatbot](../examples/onchain-chatbot.md)** - Build a chatbot
- **[Monitoring Demo](../examples/monitoring.md)** - Track agent performance
- **[Vault Demo](../examples/vault.md)** - Advanced fund management

### 🛠️ Advanced Topics
- **[Agent Builder](./sdk/agent-builder.md)** - Use the builder pattern
- **[Monitoring & Metrics](./monitoring/overview.md)** - Production monitoring
- **[Security Best Practices](./security/best-practices.md)** - Keep agents secure
- **[Deployment Guide](./deployment/production.md)** - Deploy to production

## 🆘 Troubleshooting

### Common Issues

**Problem: "Insufficient funds" error**
```bash
# Solution: Get testnet tokens from faucet
# Visit: https://faucet.somnia.network
```

**Problem: "Contract not deployed" error**
```bash
# Solution: Check contract addresses in .env
# Make sure you're using the correct network
```

**Problem: "LLM API key invalid"**
```bash
# Solution: Verify your API key
# OpenAI keys start with 'sk-'
# Anthropic keys start with 'sk-ant-'
```

**Problem: TypeScript errors**
```bash
# Solution: Install type definitions
npm install -D @types/node
```

### Need Help?

- 📖 Check the [FAQ](./faq.md)
- 🐛 [Report an issue](https://github.com/your-repo/somnia-ai/issues)
- 💬 [Join our Discord](https://discord.gg/somnia-ai)
- 📧 Email: support@somnia.network

## 🎓 Quick Reference

### Essential Commands

```bash
# Install SDK
pnpm add @somnia/agent-kit

# Run TypeScript
npx ts-node script.ts

# Check balance
npx hardhat run scripts/check-balance.js

# Deploy contracts
cd contracts && npx hardhat run scripts/deploy.ts
```

### Essential Imports

```typescript
// Core SDK
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

// LLM Providers
import { OpenAIAdapter } from '@somnia/agent-kit/llm';
import { AnthropicAdapter } from '@somnia/agent-kit/llm';
import { OllamaAdapter } from '@somnia/agent-kit/llm';

// Monitoring
import { AgentMonitor } from '@somnia/agent-kit/monitoring';
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | An AI entity registered on-chain |
| **Registry** | Smart contract storing agent metadata |
| **Executor** | Handles agent task execution |
| **Vault** | Manages agent funds |
| **LLM** | Language model (OpenAI, Claude, etc.) |
| **IPFS** | Decentralized storage for metadata |

---

**Ready to build something amazing?** 🚀 Your agent is live and ready to help users!

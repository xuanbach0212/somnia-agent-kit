# 🚀 Quick Start Guide

Get your first AI agent running in **5 minutes** with Somnia Agent Kit!

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** installed
- ✅ **npm** or **pnpm** package manager
- ✅ A **wallet with testnet tokens** (for blockchain transactions)
- ✅ An **LLM API key** (OpenAI, DeepSeek) or **Ollama** installed locally

## 📦 Step 1: Installation

```bash
# Using npm
npm install somnia-agent-kit

# Using pnpm (recommended)
pnpm add somnia-agent-kit

# Using yarn
yarn add somnia-agent-kit
```

## 🔑 Step 2: Environment Setup

Create a `.env` file in your project root:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Smart Contract Addresses (Somnia Testnet)
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# LLM Provider (choose one)
OPENAI_API_KEY=sk-...
# OR
DEEPSEEK_API_KEY=sk-...
# OR use Ollama (no API key needed)
```

{% hint style="info" %}
**Getting Testnet Tokens**: Visit the [Somnia Faucet](https://faucet.somnia.network) to get free testnet tokens.
{% endhint %}

{% hint style="warning" %}
**Security**: Never commit your `.env` file to version control! Add it to `.gitignore`.
{% endhint %}

## 🎯 Step 3: Your First Agent

Create a file `my-first-agent.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import 'dotenv/config';

async function main() {
  console.log('🔧 Initializing Somnia Agent Kit...');
  
  // Initialize SDK with testnet
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
  console.log('✅ SDK initialized successfully!');

  // Get network info
  const networkInfo = kit.getNetworkInfo();
  console.log('📡 Network:', networkInfo);

  // Query existing agents
  const agentCount = await kit.contracts.registry.agentCount();
  console.log(`📊 Total agents registered: ${agentCount}`);

  // Get agent details (if any exist)
  if (agentCount > 0n) {
    const agent = await kit.contracts.registry.getAgent(1);
    console.log('🤖 First agent:', {
      id: agent.id.toString(),
      name: agent.name,
      owner: agent.owner,
      isActive: agent.isActive,
    });
  }

  console.log('\n🎉 Setup complete!');
}

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
📡 Network: {
  name: 'Somnia Dream Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network',
  chainId: 50312
}
📊 Total agents registered: 5
🤖 First agent: {
  id: '1',
  name: 'Trading Bot',
  owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  isActive: true
}

🎉 Setup complete!
```

## 🚀 Step 5: Register Your Own Agent

Now let's register your own agent:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import 'dotenv/config';

async function registerAgent() {
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  console.log('📝 Registering new agent...');

  // Register agent on-chain
  const tx = await kit.contracts.registry.registerAgent(
    'My AI Assistant',
    'A helpful AI agent powered by Somnia',
    'ipfs://QmExample', // Metadata URI (can be empty for now)
    ['chat', 'analysis'] // Capabilities
  );

  console.log('⏳ Waiting for transaction...');
  const receipt = await tx.wait();
  
  console.log('✅ Agent registered!');
  console.log('📄 Transaction:', receipt.hash);

  // Get your agent ID
  const myAddress = await kit.getSigner()?.getAddress();
  const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
  const myAgentId = myAgents[myAgents.length - 1];

  console.log('🎉 Your Agent ID:', myAgentId.toString());
}

registerAgent();
```

## 🧠 Step 6: Add AI with LLM

Let's add AI capabilities using Ollama (FREE local AI):

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS, OllamaAdapter } from 'somnia-agent-kit';
import 'dotenv/config';

async function aiAgent() {
  // Initialize SDK
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

  // Initialize Ollama (FREE local LLM)
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2',
  });

  console.log('🤖 AI Agent ready!');

  // Generate response
  const response = await llm.generate(
    'What is blockchain technology in simple terms?'
  );

  console.log('💬 AI Response:', response.content);
  console.log('📊 Tokens used:', response.usage);
}

aiAgent();
```

{% hint style="info" %}
**Using Ollama (FREE)**:
```bash
# Install Ollama
brew install ollama  # macOS
# or download from https://ollama.ai

# Start Ollama
ollama serve

# Pull a model
ollama pull llama3.2
```
{% endhint %}

## 🎯 What Just Happened?

1. ✅ **Installed SDK** - Added `somnia-agent-kit` package
2. ✅ **Initialized SDK** - Connected to Somnia blockchain
3. ✅ **Queried Agents** - Read data from smart contracts
4. ✅ **Registered Agent** - Created your own agent on-chain
5. ✅ **Added AI** - Integrated LLM for intelligent responses

## 🚀 Next Steps

Now that you have a working setup, explore more:

### 📚 Learn Core Concepts
- **[Architecture](./architecture.md)** - Understand how everything works
- **[Smart Contracts](./contracts-overview.md)** - Deep dive into contracts
- **[LLM Architecture](./LLM_ARCHITECTURE.md)** - Learn about AI integration

### 💡 Try Examples

**Working Code Examples:**
- **[01-quickstart](../examples/01-quickstart/)** - SDK initialization
- **[02-register-agent](../examples/02-register-agent/)** - Register agent on-chain
- **[03-ai-agent](../examples/03-ai-agent/)** - FREE local AI with Ollama
- **[04-task-execution](../examples/04-task-execution/)** - Execute tasks
- **[05-monitoring](../examples/05-monitoring/)** - Logging & metrics

**Detailed Guides:**
- **[Simple Agent Demo](./examples/simple-agent.md)** - Basic agent usage
- **[On-chain Chatbot](./examples/onchain-chatbot.md)** - Build a chatbot
- **[Monitoring Demo](./examples/monitoring.md)** - Track performance

### 🛠️ Advanced Topics
- **[Agent Runtime](./sdk/agent-runtime.md)** - Autonomous agents
- **[LLM Integration](./sdk/llm-providers.md)** - Multiple LLM providers
- **[Production Deployment](./deployment/production.md)** - Deploy to production

## 🆘 Troubleshooting

### Common Issues

**Problem: "Insufficient funds" error**
```bash
# Solution: Get testnet tokens
# Visit: https://faucet.somnia.network
```

**Problem: "Contract not deployed" error**
```bash
# Solution: Check contract addresses in .env
# Verify you're using testnet addresses
```

**Problem: "Ollama connection failed"**
```bash
# Solution: Start Ollama service
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

**Problem: TypeScript errors**
```bash
# Solution: Install type definitions
npm install -D typescript @types/node ts-node
```

### Need Help?

- 📖 Check the [FAQ](./faq.md)
- 🐛 [Report an issue](https://github.com/xuanbach0212/somnia-agent-kit/issues)
- 💬 [Join Discord](https://discord.gg/somnia)
- 📧 Email: support@somnia.network

## 🎓 Quick Reference

### Essential Commands

```bash
# Install SDK
npm install somnia-agent-kit

# Run TypeScript
npx ts-node script.ts

# Install Ollama (macOS)
brew install ollama
ollama serve
ollama pull llama3.2
```

### Essential Imports

```typescript
// Core SDK
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// LLM Providers
import { OpenAIAdapter, OllamaAdapter, DeepSeekAdapter } from 'somnia-agent-kit';

// Agent Runtime
import { Agent, AgentPlanner, AgentExecutor } from 'somnia-agent-kit';

// Monitoring
import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **SomniaAgentKit** | Main SDK class for blockchain interaction |
| **Agent** | Autonomous AI entity with lifecycle management |
| **Registry** | Smart contract storing agent metadata |
| **Executor** | Handles agent task execution |
| **Vault** | Manages agent funds with daily limits |
| **LLM Adapter** | Interface to AI models (OpenAI, Ollama, etc.) |

### Network Configuration

```typescript
// Testnet (recommended for development)
network: SOMNIA_NETWORKS.testnet
// RPC: https://dream-rpc.somnia.network
// Chain ID: 50312

// Mainnet (production)
network: SOMNIA_NETWORKS.mainnet
// RPC: https://rpc.somnia.network
// Chain ID: 50311
```

---

**Ready to build something amazing?** 🚀 Your agent is live and ready to help users!

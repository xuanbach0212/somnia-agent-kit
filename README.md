# Somnia AI Agent Framework v2.0

> A comprehensive framework, SDK, and monitoring tools for designing, deploying, and scaling AI agents on Somnia Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## 🎯 Overview

The Somnia AI Agent Framework is a production-ready infrastructure for building, deploying, and managing AI agents on the Somnia blockchain network. Version 2.0 brings a completely refactored architecture with native LLM support, improved developer experience, and enhanced modularity.

### 🆕 What's New in v2.0

- **🧠 Native LLM Support**: Built-in providers for OpenAI, Anthropic Claude, with mock provider for testing
- **🏗️ Refactored Architecture**: Separation of concerns with `SomniaClient` (low-level) and `SomniaAgent` (high-level)
- **🔗 Fluent API**: Chain methods for intuitive agent configuration
- **📡 Event-Driven**: Rich event system for monitoring agent lifecycle and task execution
- **🎯 Better Type Safety**: Comprehensive TypeScript types for all components
- **🧪 Testing Ready**: Mock LLM provider for unit testing without API costs

### Key Features

- 🚀 **Easy Agent Deployment**: Fluent API for creating and deploying AI agents with minimal code
- 🧠 **AI-Powered Agents**: Built-in support for OpenAI GPT-4, Claude 3, and custom LLMs
- 📊 **Real-time Monitoring**: WebSocket-based monitoring with REST API
- 💎 **Smart Contracts**: Battle-tested Solidity contracts for agent registry and task management
- 🔧 **Developer-Friendly SDK**: TypeScript SDK with comprehensive type safety
- 📈 **Metrics & Analytics**: Track agent performance, success rates, and execution times
- 🎨 **Flexible Architecture**: Support for any AI model or processing logic
- 🔐 **Secure & Decentralized**: Built on Somnia's high-performance blockchain

## 🚀 Quick Start (5 minutes)

### Installation

```bash
# 1. Clone and install
git clone https://github.com/yourusername/somnia-ai-agent-framework.git
cd somnia-ai-agent-framework
npm install

# 2. Set up environment
cp .env.example .env
```

### Get Test Tokens

1. Join [Somnia Discord](https://discord.gg/somnia)
2. Go to #dev-chat channel
3. Tag @emma_odia and request STT tokens

### Deploy Contracts

```bash
# Add your PRIVATE_KEY to .env
npm run build
npm run deploy:contracts

# Update .env with deployed contract addresses
```

### Run Your First Agent

```typescript
import { SomniaClient, SomniaAgent, OpenAIProvider } from './src';

async function main() {
  // 1. Initialize blockchain client
  const client = new SomniaClient();
  await client.connect({
    rpcUrl: process.env.SOMNIA_RPC_URL!,
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    },
  });

  // 2. Create agent with fluent API
  const agent = new SomniaAgent(client)
    .configure({
      name: 'My First Agent',
      description: 'A simple AI agent',
      capabilities: ['greeting'],
      autoStart: true,
    })
    .withExecutor(async (input, context) => {
      console.log('Processing:', input);
      return { success: true, result: 'Hello World!' };
    });

  // 3. Register and start
  const agentId = await agent.register();
  console.log(`Agent registered: ${agentId}`);
  
  await agent.start();
  console.log('Agent is running and listening for tasks!');
}

main().catch(console.error);
```

Run it:

```bash
npm run example:basic
```

## 📦 Core Components

### 1. Smart Contracts (On-chain)

- **AgentRegistry.sol** - Agent registration, metrics tracking, lifecycle management
- **AgentManager.sol** - Task queue, payment escrow, execution tracking

### 2. Core SDK (v2.0)

#### `SomniaClient` (Low-level)
- Blockchain interaction layer
- Contract calls and transactions
- Event subscriptions
- IPFS integration

#### `SomniaAgent` (High-level)
- Agent lifecycle management
- Task processing and automation
- Event-driven architecture
- LLM integration

#### LLM Providers
- **OpenAIProvider** - GPT-3.5, GPT-4, GPT-4o
- **AnthropicProvider** - Claude 3 (Opus, Sonnet, Haiku)
- **MockProvider** - Testing without API costs

### 3. Monitoring System

- **MonitoringClient** - SDK wrapper for monitoring API
- **MetricsCollector** - Performance tracking with alerts
- **AgentMonitor** - Real-time monitoring with events
- **Monitoring Server** - REST API + WebSocket

## 💻 Usage Examples

### Example 1: Basic Agent

```typescript
import { SomniaClient, SomniaAgent } from 'somnia-ai-agent-framework';

const client = new SomniaClient();
await client.connect({...});

const agent = new SomniaAgent(client)
  .configure({
    name: 'Calculator Agent',
    description: 'Performs calculations',
    capabilities: ['math'],
  })
  .withExecutor(async (input, context) => {
    const result = eval(input.expression);
    return { success: true, result };
  });

await agent.register();
await agent.start();
```

### Example 2: AI Agent with OpenAI

```typescript
import { SomniaClient, SomniaAgent, OpenAIProvider } from 'somnia-ai-agent-framework';

const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

const agent = new SomniaAgent(client)
  .configure({
    name: 'AI Assistant',
    description: 'Helpful AI assistant powered by GPT-4',
    capabilities: ['chat', 'analysis'],
  })
  .withLLM(llm)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.chat([
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: input.prompt },
    ]);
    return { success: true, result: { response } };
  });

await agent.register();
await agent.start();
```

### Example 3: Event-Driven Agent

```typescript
const agent = new SomniaAgent(client)
  .configure({...})
  .withExecutor(async (input, context) => {
    // Your logic
  });

// Listen to agent events
agent.on('agent:registered', (agentId) => {
  console.log(`✅ Agent registered: ${agentId}`);
});

agent.on('task:completed', ({ taskId, result }) => {
  console.log(`✅ Task ${taskId} completed`);
});

agent.on('task:failed', ({ taskId, error }) => {
  console.error(`❌ Task ${taskId} failed:`, error);
});

agent.on('metrics:updated', (metrics) => {
  console.log(`📊 Success rate: ${metrics.successRate}%`);
});

await agent.register();
await agent.start();
```

### Example 4: Using Anthropic Claude

```typescript
import { AnthropicProvider } from 'somnia-ai-agent-framework';

const llm = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20240620',
});

const agent = new SomniaAgent(client)
  .configure({
    name: 'Claude Agent',
    description: 'AI agent powered by Claude 3.5 Sonnet',
    capabilities: ['analysis', 'reasoning'],
  })
  .withLLM(llm)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.generate(input.prompt);
    return { success: true, result: { response } };
  });
```

### Example 5: Task Management

```typescript
// Create a task for an agent
const taskId = await client.createTask({
  agentId: '1',
  taskData: { prompt: 'Analyze this data' },
  reward: ethers.parseEther('0.1'),
});

console.log(`Task created: ${taskId}`);

// Agent will automatically pick up and process the task
// You can also manually process a specific task
const result = await agent.processTask(taskId);
console.log('Task result:', result);
```

### Example 6: Monitoring

```typescript
import { MonitoringClient } from 'somnia-ai-agent-framework';

const monitoring = new MonitoringClient({
  baseUrl: 'http://localhost:3001',
  autoConnect: true,
});

// REST API
const health = await monitoring.getHealth();
const metrics = await monitoring.getAgentMetrics('1');
const aggregated = await monitoring.getAggregatedMetrics();

// WebSocket real-time updates
monitoring.on('connected', () => {
  console.log('Connected to monitoring server');
  monitoring.subscribeToAgent('1');
});

monitoring.on('metrics', (data) => {
  console.log('Agent metrics update:', data);
});

monitoring.on('alert', (alert) => {
  console.warn('Alert:', alert);
});
```

## 🎨 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │ Somnia   │    │ Somnia   │   │Monitoring│
    │ Client   │    │  Agent   │   │  Client  │
    └──────────┘    └──────────┘   └──────────┘
           │               │               │
           │         ┌─────┴─────┐         │
           │         │           │         │
           ▼         ▼           ▼         ▼
    ┌──────────┐  ┌────┐    ┌────────┐ ┌────────┐
    │Blockchain│  │LLM │    │  IPFS  │ │Monitor │
    │Contracts │  │API │    │Storage │ │ Server │
    └──────────┘  └────┘    └────────┘ └────────┘
```

### Layer Breakdown

1. **Application Layer**: Your custom agent logic and business rules
2. **SDK Layer**: `SomniaClient` (low-level) + `SomniaAgent` (high-level)
3. **Integration Layer**: LLM providers, IPFS, Monitoring
4. **Infrastructure Layer**: Somnia blockchain, external services

## 📚 Documentation

- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation for v2.0
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and diagrams
- **[HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md)** - Hackathon submission details

## 🔧 Available Scripts

```bash
# Development
npm run build          # Compile TypeScript
npm run dev            # Run in development mode
npm test               # Run tests
npm run lint           # Lint code
npm run format         # Format code

# Deployment
npm run deploy:contracts  # Deploy to Somnia testnet
npm run deploy:local      # Deploy to local network
npm run verify            # Verify contracts

# Monitoring
npm run start:monitor  # Start monitoring server

# Examples
npm run example:basic      # Basic agent example
npm run example:openai     # OpenAI GPT agent
npm run example:claude     # Anthropic Claude agent
npm run example:events     # Event-driven agent
npm run example:tasks      # Task management
npm run example:client     # Monitoring client
```

## 🌐 Network Information

**Somnia Testnet**:
- RPC URL: `https://dream-rpc.somnia.network`
- Chain ID: `50311`
- Currency: `STT`
- Explorer: `https://explorer.somnia.network`
- Block Time: ~0.4 seconds
- Finality: Sub-second

## 🧪 Testing

```bash
# Run all tests
npm test

# Use MockProvider for testing
import { MockProvider } from 'somnia-ai-agent-framework';

const mockLLM = new MockProvider({});
const agent = new SomniaAgent(client)
  .withLLM(mockLLM)
  .withExecutor(async (input, context) => {
    // Test your logic without real API calls
  });
```

## 🔐 Environment Variables

Create a `.env` file:

```env
# Blockchain
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311
PRIVATE_KEY=your_private_key_here

# Contracts (after deployment)
AGENT_REGISTRY_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...

# LLM APIs (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
MONITORING_PORT=3001
```

## 🚨 Migration from v1.x

If you're upgrading from v1.x, here's what changed:

### Before (v1.x)
```typescript
import { SomniaAgentSDK, AgentBuilder } from '@somnia/sdk';

const sdk = new SomniaAgentSDK({...});
const agent = await AgentBuilder.quick('Name', 'Desc', executor)
  .connectSDK(sdk)
  .build();
```

### After (v2.0)
```typescript
import { SomniaClient, SomniaAgent } from '@somnia/sdk';

const client = new SomniaClient();
await client.connect({...});

const agent = new SomniaAgent(client)
  .configure({ name: 'Name', description: 'Desc', capabilities: [] })
  .withExecutor(executor);

await agent.register();
```

**Key Changes:**
- `SomniaAgentSDK` → `SomniaClient`
- `AgentBuilder` → `SomniaAgent` with fluent API
- Explicit lifecycle: `register()` → `start()`
- Built-in LLM support
- Rich event system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

This project is submitted to the **Somnia Hackathon - Infra Agents Track**.

**Requirements Met:**
- ✅ Public GitHub repository
- ✅ Minimum 2 commits with detailed history
- ✅ Comprehensive README with documentation
- ✅ MIT open-source license
- ✅ Working Web3 dApp on Somnia Testnet
- ✅ Contract addresses in documentation
- ✅ Architecture diagrams

**Innovation Highlights:**
- Native LLM integration (OpenAI, Anthropic)
- Modular architecture with separation of concerns
- Real-time monitoring with WebSocket support
- Developer-friendly SDK with fluent API
- Comprehensive TypeScript support
- Production-ready smart contracts

## 🙏 Acknowledgments

- [Somnia Network](https://docs.somnia.network/) for the blockchain infrastructure
- Infrastructure partners: Ankr, DIA, Protofire, Ormi
- OpenAI and Anthropic for LLM APIs

## 🔗 Links

- **Documentation**: https://docs.somnia.network/developer/infrastructure-dev-tools
- **Discord**: https://discord.gg/somnia
- **Explorer**: https://explorer.somnia.network
- **Get Test Tokens**: Tag @emma_odia in #dev-chat

## 💡 Use Cases

- **AI Assistants**: Deploy conversational agents with GPT-4 or Claude
- **Data Processing**: Automate data analysis and transformation
- **Task Automation**: Create autonomous agents for repetitive tasks
- **Oracle Services**: Fetch and process external data on-chain
- **Gaming NPCs**: Build intelligent NPCs for blockchain games
- **DeFi Automation**: Automated trading strategies and monitoring

## 📊 Performance

- **Transaction Speed**: Sub-second finality on Somnia
- **Scalability**: 400,000+ TPS potential
- **Cost**: Extremely low gas fees
- **Latency**: ~0.4s block time

---

**Built with ❤️ for the Somnia Hackathon | Infra Agents Track**

*Framework Version: 2.0.0*
*Last Updated: 2025-01-04*

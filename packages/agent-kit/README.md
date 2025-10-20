# Somnia Agent Kit

> Production-ready SDK for building AI agents on Somnia blockchain

[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

**Bridge AI and Web3** - Complete SDK combining AI reasoning (LLM), blockchain execution (smart contracts), autonomous agents, and monitoring.

---

## 🚀 Quick Start

### Installation

```bash
npm install somnia-agent-kit
# or
yarn add somnia-agent-kit
# or
pnpm add somnia-agent-kit
```

### Basic Usage

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Initialize
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY, // Optional: for transactions
});

await kit.initialize();

// Query agents
const agent = await kit.contracts.registry.getAgent(1);

// Register agent (requires private key)
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Autonomous agent',
  'ipfs://metadata',
  ['trading', 'analysis']
);
await tx.wait();
```

---

## 📦 What's Included

### Core SDK
```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';
```
Main SDK class with blockchain integration, contract wrappers, and configuration management.

### Agent Runtime
```typescript
import { Agent, AgentPlanner, AgentExecutor, TriggerManager, PolicyEngine } from 'somnia-agent-kit';
```
Autonomous agent lifecycle, AI planning, execution, triggers, policies, and memory management.

### LLM Integration
```typescript
import { OpenAIAdapter, OllamaAdapter, DeepSeekAdapter, LLMPlanner, MultiStepReasoner } from 'somnia-agent-kit';
```
AI reasoning with OpenAI, Ollama (FREE local), DeepSeek, planning, and chain-of-thought.

### Monitoring
```typescript
import { Logger, Metrics, Dashboard, EventRecorder, Telemetry } from 'somnia-agent-kit';
```
Structured logging, performance metrics, web dashboard, event tracking, and analytics.

---

## 💡 Example: AI Trading Bot

```typescript
import { SomniaAgentKit, Agent, OllamaAdapter, LLMPlanner } from 'somnia-agent-kit';

// Setup
const kit = new SomniaAgentKit({...});
const llm = new OllamaAdapter({ model: 'llama3.2' }); // FREE local AI
const planner = new LLMPlanner(llm);

// Create agent
const agent = new Agent({
  name: 'Trading Bot',
  capabilities: ['trading', 'analysis'],
});

// AI analyzes → plans → executes
const analysis = await llm.generate("Analyze ETH/USD market");
const plan = await planner.plan(analysis);
await agent.execute(plan);
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Network (required)
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (optional - only for transactions)
PRIVATE_KEY=0x...

# Contracts (required)
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# LLM (optional)
OPENAI_API_KEY=sk-...
```

Then simply:
```typescript
const kit = new SomniaAgentKit(); // Auto-loads from .env
```

---

## 🧠 LLM Support

### Ollama (FREE Local AI)
```bash
brew install ollama
ollama serve
ollama pull llama3.2
```

```typescript
import { OllamaAdapter } from 'somnia-agent-kit';
const llm = new OllamaAdapter({ baseURL: 'http://localhost:11434', model: 'llama3.2' });
```

### OpenAI
```typescript
import { OpenAIAdapter } from 'somnia-agent-kit';
const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4' });
```

### DeepSeek
```typescript
import { DeepSeekAdapter } from 'somnia-agent-kit';
const llm = new DeepSeekAdapter({ apiKey: process.env.DEEPSEEK_API_KEY });
```

---

## 📊 Monitoring

```typescript
import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';

// Logging
const logger = new Logger();
logger.info('Agent started', { agentId: 1 });

// Metrics
const metrics = new Metrics();
metrics.recordLLMCall(duration, true);

// Dashboard
const dashboard = new Dashboard({ port: 3001 });
await dashboard.start(); // http://localhost:3001
```

---

## 🎯 Key Features

- ✅ **Complete SDK** - Blockchain, contracts, signers
- ✅ **Agent Runtime** - Autonomous agents with lifecycle management
- ✅ **LLM Integration** - OpenAI, Ollama (FREE), DeepSeek
- ✅ **AI Planning** - LLMPlanner, MultiStepReasoner
- ✅ **Monitoring** - Logger, Metrics, Dashboard
- ✅ **TypeScript** - Full type safety
- ✅ **Production Ready** - Battle-tested on Somnia Testnet

---

## 📚 Documentation

- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Examples**: https://github.com/xuanbach0212/somnia-agent-kit/tree/main/examples
- **API Reference**: https://github.com/xuanbach0212/somnia-agent-kit/blob/main/API_REFERENCE.md
- **Architecture**: https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/architecture.md

---

## 🔗 Links

**Package**
- npm: https://www.npmjs.com/package/somnia-agent-kit
- GitHub: https://github.com/xuanbach0212/somnia-agent-kit
- Issues: https://github.com/xuanbach0212/somnia-agent-kit/issues

**Somnia Network**
- Website: https://somnia.network
- Explorer: https://explorer.somnia.network
- Discord: https://discord.gg/somnia

**Deployed Contracts (Testnet)**
- AgentRegistry: `0xC9f3452090EEB519467DEa4a390976D38C008347`
- AgentManager: `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E`
- AgentExecutor: `0x157C56dEdbAB6caD541109daabA4663Fc016026e`
- AgentVault: `0x7cEe3142A9c6d15529C322035041af697B2B5129`

---

## 📄 License

MIT License - see [LICENSE](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/LICENSE)

---

**Built with ❤️ for Somnia Network**

*Making AI agents on blockchain accessible to everyone* 🌟

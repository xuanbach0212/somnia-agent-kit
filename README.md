# Somnia AI Agent Framework

> Production-ready infrastructure for building, deploying, and managing AI agents on Somnia blockchain

[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![npm downloads](https://img.shields.io/npm/dm/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](./contracts/test/)
[![Somnia](https://img.shields.io/badge/Somnia-Testnet-purple)](https://explorer.somnia.network)

---

## 🎯 What is This?

A **complete framework** for building AI agents on blockchain that combines:
- 🧠 **AI reasoning** (LLM integration)
- ⛓️ **Blockchain execution** (Smart contracts)
- 📊 **Real-time monitoring** (Dashboard & metrics)

**Bridge the gap between AI and Web3** - AI thinks, blockchain executes, you build the future.

---

## ✨ Key Features

- **🆓 FREE Local AI** - Ollama integration (no API costs)
- **⚡ Fast** - Sub-second finality on Somnia
- **🔧 Developer-Friendly** - TypeScript SDK with full type safety
- **📊 Complete Monitoring** - Logger, Metrics, Web Dashboard
- **🎨 Production Ready** - Battle-tested contracts, comprehensive docs
- **🚀 Quick Start** - Working examples in 5 minutes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                      │
│  (DeFi Bot, AI Assistant, Game NPC, Oracle, etc.)      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              SOMNIA AI AGENT FRAMEWORK                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Runtime    │  │     LLM      │  │  Monitoring  │  │
│  │   - Agent    │  │  - OpenAI    │  │  - Logger    │  │
│  │   - Planner  │  │  - Ollama    │  │  - Metrics   │  │
│  │   - Executor │  │  - DeepSeek  │  │  - Dashboard │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Core (Blockchain Integration)            │   │
│  │  - Chain Client  - Contract Wrappers            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  SOMNIA BLOCKCHAIN                       │
│  Smart Contracts: Registry, Manager, Executor, Vault   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

```bash
# Install the SDK
npm install somnia-agent-kit
# or
pnpm add somnia-agent-kit
```

### Basic Usage

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

// Initialize SDK
const kit = new SomniaAgentKit({
  network: {
    name: 'somnia-testnet',
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
  },
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();

// Register an AI agent
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Autonomous agent on Somnia',
  'ipfs://metadata',
  ['trading', 'analysis']
);
await tx.wait();
console.log('Agent registered!');
```

### With Local AI (FREE)

```bash
# 1. Install Ollama
brew install ollama

# 2. Start Ollama & pull model
ollama serve
ollama pull llama3.2

# 3. Use in your code
import { OllamaAdapter } from 'somnia-agent-kit';

const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2',
});

const response = await llm.chat([
  { role: 'user', content: 'Analyze this market data...' }
]);
```

---

## 📦 Deployed Contracts (Somnia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **AgentRegistry** | `0xC9f3452090EEB519467DEa4a390976D38C008347` | Register & manage agents |
| **AgentManager** | `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E` | Task queue & lifecycle |
| **AgentExecutor** | `0x157C56dEdbAB6caD541109daabA4663Fc016026e` | Execute agent tasks |
| **AgentVault** | `0x7cEe3142A9c6d15529C322035041af697B2B5129` | Manage agent funds |

**Explorer**: https://explorer.somnia.network

---

## 💡 Use Cases

### 1. AI Trading Bot
```typescript
// AI analyzes market → decides trade → executes on-chain
const analysis = await llm.generate("Analyze ETH market");
if (analysis.includes("bullish")) {
  await kit.contracts.executor.executeTask(agentId, "buy_eth");
}
```

### 2. Autonomous Task Agent
```typescript
// AI plans → creates tasks → executes → records results
const plan = await llm.generate("Plan optimization tasks");
for (const task of plan.tasks) {
  await kit.contracts.manager.createTask(agentId, task);
}
```

### 3. AI Assistant with Blockchain Memory
```typescript
// Chat with AI → store conversation on-chain
const response = await llm.chat(messages);
await kit.contracts.registry.updateAgent(agentId, {
  metadata: ipfs.upload(conversation)
});
```

---

## 📊 Examples

5 focused examples to get you started:

| # | Example | What it does | Run |
|---|---------|--------------|-----|
| 1 | **Quickstart** | Initialize SDK, query agents | `npx ts-node examples/01-quickstart/index.ts` |
| 2 | **Register Agent** | Register new agent on-chain | `npx ts-node examples/02-register-agent/index.ts` |
| 3 | **AI Agent** | Use FREE local AI (Ollama) | `npx ts-node examples/03-ai-agent/index.ts` |
| 4 | **Task Execution** | Create, start, complete tasks | `npx ts-node examples/04-task-execution/index.ts` |
| 5 | **Monitoring** | Logger, Metrics, Dashboard | `npx ts-node examples/05-monitoring/index.ts` |

**See**: [examples/README.md](./examples/README.md) for detailed setup

---

## 🧠 LLM Support

| Provider | Cost | Status | Setup |
|----------|------|--------|-------|
| **Ollama** | FREE | ✅ | `brew install ollama` |
| **OpenAI** | Paid | ✅ | Add API key to .env |
| **DeepSeek** | Paid | ✅ | Add API key to .env |

**Recommended**: Start with Ollama (100% FREE, runs locally)

---

## 📈 Monitoring

### Logger (Structured Logging)
```typescript
import { Logger } from 'somnia-agent-kit';
const logger = new Logger();
logger.info('Agent started', { agentId: 1 });
```

### Metrics (Performance Tracking)
```typescript
import { Metrics } from 'somnia-agent-kit';
const metrics = new Metrics();
metrics.recordLLMCall(duration, success);
metrics.recordTransaction(success, gasUsed);
```

### Dashboard (Web UI)
```typescript
import { Dashboard } from 'somnia-agent-kit';
const dashboard = new Dashboard({ port: 3001, logger, metrics });
await dashboard.start();
// Open http://localhost:3001
```

---

## 🔧 SDK Usage

### Initialize SDK
```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: {
    name: 'somnia-testnet',
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
  },
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();
```

### Register Agent
```typescript
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Autonomous agent on Somnia',
  'ipfs://QmHash',
  ['trading', 'analysis']
);
await tx.wait();
```

### Create & Execute Task
```typescript
// Create task
const taskTx = await kit.contracts.manager.createTask(
  agentId,
  JSON.stringify({ action: 'analyze', data: {...} }),
  { value: ethers.parseEther('0.001') }
);

// Start task
await kit.contracts.manager.startTask(taskId);

// Complete task
await kit.contracts.manager.completeTask(taskId, result);
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[API_REFERENCE.md](./API_REFERENCE.md)** | Complete API documentation |
| **[DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)** | Deployed contract addresses |
| **[docs/](./docs/)** | Architecture, guides, SDK design |
| **[examples/](./examples/)** | 5 focused examples |

**Start here**: `examples/README.md` → Pick an example → Build!

---

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
pnpm test
# 41 tests, 0 failures ✅
```

### SDK Examples
```bash
cd examples/ai-agent-ollama
npx ts-node index.ts
# Agent registered successfully ✅
```

### Monitoring
```bash
cd examples/dashboard-demo
npx ts-node index.ts
# Dashboard running at http://localhost:3001 ✅
```

---

## 🎯 Why Somnia?

| Feature | Somnia | Ethereum | Solana |
|---------|--------|----------|--------|
| **TPS** | 400,000+ | ~15 | ~65,000 |
| **Finality** | Sub-second | ~15 min | ~13s |
| **Block Time** | ~0.4s | ~12s | ~0.4s |
| **Gas Fees** | Very Low | High | Low |
| **EVM Compatible** | ✅ | ✅ | ❌ |

**Perfect for AI Agents**: Fast execution, low cost, high throughput

---

## 🚀 Get Started

### For New Users
1. Read this README
2. Install Ollama (FREE AI)
3. Run `examples/01-quickstart`
4. Build your agent!

### For Developers
1. Check `API_REFERENCE.md`
2. Review `docs/architecture.md`
3. Explore `examples/`
4. Start building!

### For Reviewers
1. Check deployed contracts
2. Run examples
3. Review code!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🔗 Links

- **Somnia Network**: https://somnia.network
- **Documentation**: https://docs.somnia.network
- **Discord**: https://discord.gg/somnia
- **Explorer**: https://explorer.somnia.network

---

## 🙏 Acknowledgments

- Somnia Network team
- Infrastructure partners: Ankr, DIA, Protofire, Ormi
- OpenAI, Ollama, DeepSeek for LLM APIs

---

## 💬 Support

- **Discord**: Join #dev-chat for help
- **Issues**: Open GitHub issue
- **Docs**: Check `docs/` folder

---

## 🎉 Summary

**Somnia AI Agent Framework** = AI + Blockchain + Monitoring

- ✅ **4 Smart Contracts** deployed on Somnia
- ✅ **3 LLM Providers** (including FREE Ollama)
- ✅ **Complete Monitoring** (Logger, Metrics, Dashboard)
- ✅ **5 Focused Examples** ready to run
- ✅ **Production Ready** with comprehensive docs

**Start building AI agents on blockchain today!** 🚀

---

**Built with ❤️ for Somnia Network**

*Making AI agents on blockchain accessible to everyone* 🌟

**Version**: 2.0.0  
**License**: MIT  
**Status**: ✅ PRODUCTION READY

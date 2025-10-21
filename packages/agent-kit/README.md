# Somnia Agent Kit

> Production-ready SDK for building AI agents on Somnia blockchain

[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Complete SDK for building AI agents on blockchain - combines AI reasoning, smart contracts, and monitoring.

---

## 🚀 Quick Start

```bash
npm install somnia-agent-kit
```

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

// SDK auto-loads config from .env
const kit = new SomniaAgentKit();
await kit.initialize();

// Query agent
const agent = await kit.contracts.registry.getAgent(1);
```

> **Note**: Requires `.env` file - see [Configuration](#-configuration) or [SDK Usage](#-sdk-usage) for full options

---

## 📚 SDK Usage

### Initialize SDK

**Option 1: Full manual configuration**

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY, // Optional - only for write operations
});

await kit.initialize();
```

**Or: Auto-load from .env (recommended)**

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

// SDK automatically loads network, contracts, and privateKey from .env
const kit = new SomniaAgentKit();
await kit.initialize();
```

> **Note**: Create a `.env` file with required variables (see [Configuration](#-configuration))

### Register Agent

```typescript
// Requires private key
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Agent description',
  'ipfs://metadata',
  ['trading', 'analysis']
);
await tx.wait();
```

### Query Agents

```typescript
// No private key needed

// Get total agents
const total = await kit.contracts.registry.getTotalAgents();

// Get agent by ID
const agent = await kit.contracts.registry.getAgent(1);

// Get agent owner
const owner = await kit.contracts.registry.getAgentOwner(1);
```

### Create Task

```typescript
// Requires private key
import { ethers } from 'ethers';

const tx = await kit.contracts.manager.createTask(
  agentId,
  JSON.stringify({ action: 'analyze', data: {...} }),
  { value: ethers.parseEther('0.001') }
);
await tx.wait();
```

### Manage Vault

```typescript
// Deposit (requires private key)
const tx = await kit.contracts.vault.deposit(agentId, {
  value: ethers.parseEther('1.0')
});
await tx.wait();

// Check balance (no private key needed)
const balance = await kit.contracts.vault.getBalance(agentId);

// Withdraw (requires private key)
const withdrawTx = await kit.contracts.vault.withdraw(agentId, amount);
await withdrawTx.wait();
```

### Use with LLM

```typescript
import { OllamaAdapter } from 'somnia-agent-kit';

const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2',
});

const response = await llm.chat([
  { role: 'user', content: 'Analyze this data...' }
]);
```

---

## 🖥️ CLI Tools

```bash
# Install globally
npm install -g somnia-agent-kit

# Use CLI
somnia-agent init
somnia-agent agent:list
somnia-agent network:info

# Short alias
sak agent:list
```

---

## 🧠 LLM Providers

```typescript
// Ollama (FREE local)
import { OllamaAdapter } from 'somnia-agent-kit';
const llm = new OllamaAdapter({ model: 'llama3.2' });

// OpenAI
import { OpenAIAdapter } from 'somnia-agent-kit';
const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });

// DeepSeek
import { DeepSeekAdapter } from 'somnia-agent-kit';
const llm = new DeepSeekAdapter({ apiKey: process.env.DEEPSEEK_API_KEY });
```

---

## 📊 Monitoring

```typescript
import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';

// Logger
const logger = new Logger();
logger.info('Agent started', { agentId: 1 });

// Metrics
const metrics = new Metrics();
metrics.recordLLMCall(duration, true);

// Dashboard
const dashboard = new Dashboard({ port: 3001 });
await dashboard.start();
// Open http://localhost:3001
```

---

## 🔧 Configuration

Create a `.env` file in your project root:

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (OPTIONAL - only for write operations)
PRIVATE_KEY=0x...

# Contract Addresses
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# LLM API Keys (optional)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
```

Then use SDK without config:

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

// Auto-loads from .env
const kit = new SomniaAgentKit();
await kit.initialize();
```

---

## 📚 Documentation

- **[Quick Start](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/quickstart.md)**
- **[SDK Usage](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-usage.md)**
- **[Working with Agents](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-agents.md)**
- **[Task Management](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-tasks.md)**
- **[Vault Operations](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-vault.md)**
- **[LLM Integration](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-llm.md)**
- **[CLI Guide](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/cli-guide.md)**
- **[API Reference](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/API_REFERENCE.md)**

---

## 📦 Smart Contracts (Somnia Testnet)

| Contract | Address |
|----------|---------|
| AgentRegistry | `0xC9f3452090EEB519467DEa4a390976D38C008347` |
| AgentManager | `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E` |
| AgentExecutor | `0x157C56dEdbAB6caD541109daabA4663Fc016026e` |
| AgentVault | `0x7cEe3142A9c6d15529C322035041af697B2B5129` |

---

## 🔗 Links

- **npm**: https://www.npmjs.com/package/somnia-agent-kit
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Somnia Network**: https://somnia.network

---

## 📄 License

MIT License - see [LICENSE](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/LICENSE)

---

**Built with ❤️ for Somnia Network**

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
console.log('Agent:', agent.name);
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
// Note: Requires private key in SDK initialization
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Agent description',
  'ipfs://metadata',
  ['trading', 'analysis']
);
await tx.wait();
console.log('Agent registered!');
```

### Query Agents

```typescript
// Note: Read operations don't require private key

// Get total agents
const total = await kit.contracts.registry.getTotalAgents();

// Get agent by ID
const agent = await kit.contracts.registry.getAgent(1);
console.log(agent.name, agent.description);

// Get agent owner
const owner = await kit.contracts.registry.getAgentOwner(1);
```

### Create Task

```typescript
// Note: Requires private key
import { ethers } from 'ethers';

const tx = await kit.contracts.manager.createTask(
  agentId,
  JSON.stringify({ action: 'analyze', data: {...} }),
  { value: ethers.parseEther('0.001') } // Payment
);
await tx.wait();
```

### Manage Vault

```typescript
// Deposit funds (requires private key)
const depositTx = await kit.contracts.vault.deposit(agentId, {
  value: ethers.parseEther('1.0')
});
await depositTx.wait();

// Check balance (no private key needed)
const balance = await kit.contracts.vault.getBalance(agentId);
console.log('Balance:', ethers.formatEther(balance));

// Withdraw funds (requires private key)
const withdrawTx = await kit.contracts.vault.withdraw(agentId, amount);
await withdrawTx.wait();
```

### Use with LLM

```typescript
import { OllamaAdapter } from 'somnia-agent-kit';

// Setup local AI (FREE)
const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2',
});

// Generate response
const response = await llm.chat([
  { role: 'user', content: 'Analyze this data...' }
]);

// Use AI decision on-chain
if (response.includes('execute')) {
  await kit.contracts.executor.execute(taskId);
}
```

---

## 🖥️ CLI Tools

```bash
# Install globally
npm install -g somnia-agent-kit

# Initialize
somnia-agent init

# List agents
somnia-agent agent:list

# Network info
somnia-agent network:info

# Short alias
sak agent:list
```

---

## 📦 Smart Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| AgentRegistry | `0xC9f3452090EEB519467DEa4a390976D38C008347` | Register & manage agents |
| AgentManager | `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E` | Task lifecycle |
| AgentExecutor | `0x157C56dEdbAB6caD541109daabA4663Fc016026e` | Execute tasks |
| AgentVault | `0x7cEe3142A9c6d15529C322035041af697B2B5129` | Manage funds |

**Network**: Somnia Testnet  
**Explorer**: https://explorer.somnia.network

---

## 🧠 LLM Providers

| Provider | Cost | Setup |
|----------|------|-------|
| Ollama | FREE | `brew install ollama` |
| OpenAI | Paid | Add API key |
| DeepSeek | Paid | Add API key |

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

## 📊 Examples

| Example | Description | Run |
|---------|-------------|-----|
| [Quickstart](./examples/01-quickstart/) | Initialize SDK, query agents | `npx ts-node examples/01-quickstart/index.ts` |
| [Register Agent](./examples/02-register-agent/) | Register new agent | `npx ts-node examples/02-register-agent/index.ts` |
| [AI Agent](./examples/03-ai-agent/) | Use local AI (Ollama) | `npx ts-node examples/03-ai-agent/index.ts` |
| [Task Execution](./examples/04-task-execution/) | Create and execute tasks | `npx ts-node examples/04-task-execution/index.ts` |
| [Monitoring](./examples/05-monitoring/) | Logger, Metrics, Dashboard | `npx ts-node examples/05-monitoring/index.ts` |

---

## 📚 Documentation

- **[Quick Start](./docs/quickstart.md)** - Get started guide
- **[SDK Usage](./docs/sdk-usage.md)** - Basic SDK usage
- **[Working with Agents](./docs/sdk-agents.md)** - Agent management
- **[Task Management](./docs/sdk-tasks.md)** - Task operations
- **[Vault Operations](./docs/sdk-vault.md)** - Fund management
- **[LLM Integration](./docs/sdk-llm.md)** - AI integration
- **[CLI Guide](./docs/cli-guide.md)** - Command-line tools
- **[API Reference](./API_REFERENCE.md)** - Complete API docs

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

## 🎯 Key Features

- ✅ Complete SDK for blockchain integration
- ✅ CLI tools for easy management
- ✅ LLM integration (OpenAI, Ollama, DeepSeek)
- ✅ Smart contract wrappers
- ✅ Monitoring & logging
- ✅ TypeScript support
- ✅ Production ready

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🔗 Links

- **npm**: https://www.npmjs.com/package/somnia-agent-kit
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Somnia Network**: https://somnia.network
- **Explorer**: https://explorer.somnia.network

---

**Built with ❤️ for Somnia Network**

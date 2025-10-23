# Somnia Agent Kit

> Production-ready SDK for building autonomous AI agents on Somnia blockchain

[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Complete toolkit for building AI agents on blockchain - combines AI reasoning, smart contracts, autonomous runtime, and real-time monitoring.

---

## 📚 Documentation & Package

**📖 [Full Documentation on GitBook](https://somnia-agent-kit.gitbook.io/somnia-agent-kit)** - Complete guides, tutorials, examples, and API reference

**📦 [npm Package](https://www.npmjs.com/package/somnia-agent-kit)** - Install and use the SDK

---

**Key Features:** Autonomous Agents • Smart Contracts • LLM Integration • Token Management • Multicall Batching • Monitoring • CLI Tools

---

## 🚀 Quick Start

```bash
# Install
npm install somnia-agent-kit

# Or install globally for CLI
npm install -g somnia-agent-kit
```

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Option 1: With manual config
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY, // Optional
});

// Or: Auto-load from .env (recommended)
const kit = new SomniaAgentKit();

await kit.initialize();

// Register an agent
await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Trading bot for DeFi',
  'ipfs://QmX...',
  ['trading', 'analysis']
);
```

---

## 📖 Usage Guide

### Initialize SDK

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

// Auto-load config from .env
const kit = new SomniaAgentKit();
await kit.initialize();
```

### Work with Agents

```typescript
// Register new agent
const tx = await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Trading bot for DeFi',
  'ipfs://QmX...',
  ['trading', 'analysis']
);
await tx.wait();

// Query agents
const totalAgents = await kit.contracts.registry.getTotalAgents();
const agent = await kit.contracts.registry.getAgent(1);
const owner = await kit.contracts.registry.getAgentOwner(1);
```

### Manage Vault & Funds

```typescript
import { parseEther, formatEther } from 'somnia-agent-kit';

// Deposit funds to agent vault
await kit.contracts.vault.deposit(agentId, {
  value: parseEther('1.0')
});

// Check balance
const balance = await kit.contracts.vault.getBalance(agentId);
console.log(`Balance: ${formatEther(balance)} ETH`);

// Withdraw funds
await kit.contracts.vault.withdraw(agentId, parseEther('0.5'));
```

### Create & Execute Tasks

```typescript
// Create task for agent
const tx = await kit.contracts.manager.createTask(
  agentId,
  JSON.stringify({ action: 'analyze', symbol: 'ETH/USD' }),
  { value: parseEther('0.001') } // Payment
);
await tx.wait();

// Execute task
await kit.contracts.executor.execute(taskId);
```

### Build Autonomous Agent

```typescript
import { Agent, OllamaAdapter, LLMPlanner } from 'somnia-agent-kit';

const agent = new Agent({
  name: 'Trading Bot',
  description: 'Automated DeFi trading',
  capabilities: ['analyze', 'trade', 'monitor'],
  llm: new OllamaAdapter({ model: 'llama3.2' }),
  planner: new LLMPlanner(),
  triggers: [
    { type: 'interval', config: { interval: 60000 } } // Run every minute
  ],
  memory: { enabled: true, maxSize: 1000 }
});

// Start agent
await agent.start();

// Stop agent
await agent.stop();
```

### Use LLM for AI Reasoning

```typescript
import { OllamaAdapter, OpenAIAdapter } from 'somnia-agent-kit';

// Local AI (FREE)
const ollama = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2'
});

const response = await ollama.chat([
  { role: 'user', content: 'Should I buy ETH now?' }
]);

// OpenAI
const openai = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY
});

const analysis = await openai.chat([
  { role: 'system', content: 'You are a DeFi trading expert' },
  { role: 'user', content: 'Analyze ETH price trend' }
]);
```

### Token Operations

```typescript
import { ERC20Manager, ERC721Manager } from 'somnia-agent-kit';

// ERC20 tokens
const erc20 = new ERC20Manager(kit.getChainClient());
await erc20.transfer(tokenAddress, recipientAddress, amount);
const balance = await erc20.getBalance(tokenAddress, walletAddress);
const allowance = await erc20.getAllowance(tokenAddress, owner, spender);

// ERC721 NFTs
const erc721 = new ERC721Manager(kit.getChainClient());
await erc721.transferNFT(nftAddress, fromAddress, toAddress, tokenId);
const owner = await erc721.getOwner(nftAddress, tokenId);
```

### Batch Contract Calls (Multicall)

```typescript
import { MultiCall } from 'somnia-agent-kit';

const multicall = new MultiCall(kit.getChainClient());

// Batch multiple reads in one call
const results = await multicall.aggregate([
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getAgent', [1])
  },
  {
    target: vaultAddress,
    callData: vault.interface.encodeFunctionData('getBalance', [1])
  },
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getTotalAgents')
  }
]);
```

### Monitor Agent Activity

```typescript
import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';

// Structured logging
const logger = new Logger({ level: 'info' });
logger.info('Agent started', { agentId: 1, timestamp: Date.now() });
logger.error('Task failed', { taskId: 123, error: 'Timeout' });

// Track metrics
const metrics = new Metrics();
metrics.recordLLMCall(250, true); // duration, success
metrics.recordTransaction('0x...', true, 0.001);
console.log(metrics.getSummary());

// Web dashboard
const dashboard = new Dashboard({ port: 3001 });
await dashboard.start();
// Visit http://localhost:3001
```

---

### CLI Usage

```bash
# Install CLI globally
npm install -g somnia-agent-kit

# Initialize project
sak init

# Agent management
sak agent:list
sak agent:register --name "My Bot"
sak agent:info --id 1

# Task operations
sak task:create --agent-id 1 --data '{"action":"analyze"}'
sak task:status --task-id 123

# Wallet operations
sak wallet:balance
sak wallet:send --to 0x... --amount 1.0

# Network info
sak network:info
```

---

## 📦 Smart Contracts

Deployed on **Somnia Testnet** (Chain ID: 50312)

| Contract | Address |
|----------|---------|
| AgentRegistry | `0xC9f3452090EEB519467DEa4a390976D38C008347` |
| AgentManager | `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E` |
| AgentExecutor | `0x157C56dEdbAB6caD541109daabA4663Fc016026e` |
| AgentVault | `0x7cEe3142A9c6d15529C322035041af697B2B5129` |

**RPC**: https://dream-rpc.somnia.network  
**Explorer**: https://explorer.somnia.network

---

## ⚙️ Configuration

Create `.env` file:

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (optional - only for write operations)
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

---

## 📚 Additional Documentation

Local documentation files:

- **[Quick Start](./docs/quickstart.md)** - Get started in 5 minutes
- **[SDK Usage](./docs/sdk-usage.md)** - Core SDK features and examples
- **[Agent Development](./docs/sdk-agents.md)** - Build autonomous agents
- **[Task Management](./docs/sdk-tasks.md)** - Task operations
- **[Vault Operations](./docs/sdk-vault.md)** - Fund management
- **[LLM Integration](./docs/sdk-llm.md)** - AI reasoning and planning
- **[CLI Guide](./docs/cli-guide.md)** - Command-line tools
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation

---

## 📂 Examples

Check out the [examples](./examples) directory:

- **[01-quickstart](./examples/01-quickstart)** - Initialize SDK and query agents
- **[02-register-agent](./examples/02-register-agent)** - Register new agent on-chain
- **[03-ai-agent](./examples/03-ai-agent)** - Build AI-powered agent with Ollama
- **[04-task-execution](./examples/04-task-execution)** - Create and execute tasks
- **[05-monitoring](./examples/05-monitoring)** - Logging, metrics, and dashboard
- **[06-multicall-batch](./examples/06-multicall-batch)** - Batch contract calls
- **[07-token-management](./examples/07-token-management)** - ERC20/ERC721 operations

Run examples:
```bash
npx ts-node examples/01-quickstart/index.ts
```

---

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/xuanbach0212/somnia-agent-kit.git
cd somnia-agent-kit

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Build specific package
pnpm build:kit
```

---

## 📦 Project Structure

```
somnia-agent-kit/
├── packages/
│   └── agent-kit/          # Main SDK package
│       ├── src/
│       │   ├── core/       # Blockchain SDK
│       │   ├── runtime/    # Autonomous agents
│       │   ├── llm/        # LLM integration
│       │   ├── monitor/    # Monitoring
│       │   ├── tokens/     # Token management
│       │   └── cli/        # CLI tools
│       └── dist/           # Built files
├── contracts/              # Smart contracts
│   ├── contracts/          # Solidity files
│   ├── scripts/            # Deploy scripts
│   └── test/               # Contract tests
├── examples/               # Usage examples
├── docs/                   # Documentation
└── test/                   # Integration tests
```

---

## 🔗 Links

### Package & Documentation
- **📦 npm Package**: https://www.npmjs.com/package/somnia-agent-kit
- **📖 GitBook Documentation**: https://somnia-agent-kit.gitbook.io/somnia-agent-kit
- **💻 GitHub Repository**: https://github.com/xuanbach0212/somnia-agent-kit

### Somnia Network
- **🌐 Website**: https://somnia.network
- **🔍 Explorer**: https://explorer.somnia.network
- **💬 Discord**: https://discord.gg/somnia

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with ❤️ for Somnia Network**

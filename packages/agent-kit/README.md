# Somnia Agent Kit

> Production-ready SDK for building autonomous AI agents on Somnia blockchain

[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Complete toolkit for building AI agents on blockchain - combines AI reasoning, smart contracts, autonomous runtime, and real-time monitoring.

---

## 📚 Full Documentation

**📖 [Read Full Documentation on GitBook](https://somnia-agent-kit.gitbook.io/somnia-agent-kit)**

Complete guides, tutorials, examples, and API reference with better navigation and search.

---

## Features

- 🤖 **Autonomous Agents** - Event-driven agents with AI planning and execution
- 🔗 **Smart Contracts** - Registry, Executor, Manager, Vault integration
- 🧠 **LLM Integration** - OpenAI, Ollama (local), DeepSeek support
- 💰 **Token Management** - ERC20, ERC721, native token operations
- ⚡ **Multicall Batching** - Optimize gas with batch contract calls
- 📊 **Monitoring** - Structured logging, metrics, and web dashboard
- 🛠️ **CLI Tools** - Command-line interface for agent management
- 🔐 **Wallet Support** - Multi-signature and MetaMask connector
- 💾 **Storage** - IPFS integration for decentralized data

---

## Installation

```bash
npm install somnia-agent-kit
```

---

## Quick Start

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

// Query agents
const agent = await kit.contracts.registry.getAgent(1);
console.log(agent);
```

---

## Usage

### Working with Agents

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

const kit = new SomniaAgentKit();
await kit.initialize();

// Register new agent
await kit.contracts.registry.registerAgent(
  'My AI Agent',
  'Trading bot for DeFi',
  'ipfs://QmX...',
  ['trading', 'analysis']
);

// Query agents
const agent = await kit.contracts.registry.getAgent(1);
const total = await kit.contracts.registry.getTotalAgents();
const owner = await kit.contracts.registry.getAgentOwner(1);
```

### Vault & Fund Management

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

### Task Management

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

### Autonomous Agent Runtime

```typescript
import { Agent, OllamaAdapter, LLMPlanner } from 'somnia-agent-kit';

// Create autonomous agent with AI capabilities
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

### LLM Integration

```typescript
import { OllamaAdapter, OpenAIAdapter, DeepSeekAdapter } from 'somnia-agent-kit';

// Ollama (local, FREE)
const ollama = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  model: 'llama3.2'
});

const response = await ollama.chat([
  { role: 'user', content: 'Should I buy ETH now?' }
]);

// OpenAI
const openai = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

const analysis = await openai.chat([
  { role: 'system', content: 'You are a DeFi trading expert' },
  { role: 'user', content: 'Analyze ETH price trend' }
]);

// DeepSeek
const deepseek = new DeepSeekAdapter({
  apiKey: process.env.DEEPSEEK_API_KEY
});
```

### Token Operations

```typescript
import { ERC20Manager, ERC721Manager } from 'somnia-agent-kit';

// ERC20 token operations
const erc20 = new ERC20Manager(kit.getChainClient());
await erc20.transfer(tokenAddress, recipientAddress, amount);
const balance = await erc20.getBalance(tokenAddress, walletAddress);
const allowance = await erc20.getAllowance(tokenAddress, owner, spender);

// ERC721 NFT operations
const erc721 = new ERC721Manager(kit.getChainClient());
await erc721.transferNFT(nftAddress, fromAddress, toAddress, tokenId);
const owner = await erc721.getOwner(nftAddress, tokenId);
```

### Multicall Batching

```typescript
import { MultiCall } from 'somnia-agent-kit';

const multicall = new MultiCall(kit.getChainClient());

// Batch multiple contract reads in one call (saves gas)
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

### Monitoring & Observability

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

## CLI Tools

```bash
# Install globally
npm install -g somnia-agent-kit

# Initialize project
sak init

# Agent commands
sak agent:list                              # List all agents
sak agent:register --name "My Bot"          # Register new agent
sak agent:info --id 1                       # Get agent details

# Task commands
sak task:create --agent-id 1 --data '{"action":"analyze"}'
sak task:status --task-id 123
sak task:list --agent-id 1

# Wallet commands
sak wallet:balance                          # Check wallet balance
sak wallet:send --to 0x... --amount 1.0     # Send tokens
sak wallet:info                             # Wallet details

# Network commands
sak network:info                            # Network information
```

---

## Configuration

Create a `.env` file in your project root:

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (optional - only needed for write operations)
PRIVATE_KEY=0x...

# Contract Addresses (Somnia Testnet)
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# LLM API Keys (optional)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
```

The SDK will automatically load configuration from `.env` file.

---

## Smart Contracts

Deployed on **Somnia Testnet** (Chain ID: 50312)

| Contract | Address | Purpose |
|----------|---------|---------|
| AgentRegistry | `0xC9f3452090EEB519467DEa4a390976D38C008347` | Register and manage agents |
| AgentManager | `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E` | Task lifecycle management |
| AgentExecutor | `0x157C56dEdbAB6caD541109daabA4663Fc016026e` | Execute agent tasks |
| AgentVault | `0x7cEe3142A9c6d15529C322035041af697B2B5129` | Fund management |

**RPC**: https://dream-rpc.somnia.network  
**Explorer**: https://explorer.somnia.network

---

## Additional Resources

- **[Quick Start Guide](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/quickstart.md)** - Get started in 5 minutes
- **[SDK Usage](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-usage.md)** - Core SDK features and examples
- **[Agent Development](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-agents.md)** - Build autonomous agents
- **[LLM Integration](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/sdk-llm.md)** - AI reasoning and planning
- **[CLI Guide](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/docs/cli-guide.md)** - Command-line tools
- **[API Reference](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/API_REFERENCE.md)** - Complete API documentation

---

## Examples

Check out the [examples directory](https://github.com/xuanbach0212/somnia-agent-kit/tree/main/examples) for more use cases:

- **01-quickstart** - Initialize SDK and query agents
- **02-register-agent** - Register new agent on-chain
- **03-ai-agent** - Build AI-powered agent with Ollama
- **04-task-execution** - Create and execute tasks
- **05-monitoring** - Logging, metrics, and dashboard
- **06-multicall-batch** - Batch contract calls
- **07-token-management** - ERC20/ERC721 operations

---

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/xuanbach0212/somnia-agent-kit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xuanbach0212/somnia-agent-kit/discussions)
- **Documentation**: [Full Docs](https://github.com/xuanbach0212/somnia-agent-kit/tree/main/docs)

---

## Links

### Package & Documentation
- **📦 npm Package**: https://www.npmjs.com/package/somnia-agent-kit
- **📖 GitBook Documentation**: https://somnia-agent-kit.gitbook.io/somnia-agent-kit
- **💻 GitHub Repository**: https://github.com/xuanbach0212/somnia-agent-kit

### Somnia Network
- **🌐 Website**: https://somnia.network
- **🔍 Explorer**: https://explorer.somnia.network
- **💬 Discord**: https://discord.gg/somnia

---

## License

MIT License - see [LICENSE](https://github.com/xuanbach0212/somnia-agent-kit/blob/main/LICENSE) for details.

---

**Built with ❤️ for Somnia Network**

# 🌙 Somnia Agent Kit - Production-Ready AI Agent SDK

Welcome to **Somnia Agent Kit**, a production-ready SDK for building, deploying, and managing AI agents on Somnia blockchain.

## 🎯 What is Somnia Agent Kit?

Somnia Agent Kit is a comprehensive TypeScript SDK that combines:
- **🤖 Agent Runtime**: Autonomous agents with lifecycle management
- **⛓️ Blockchain Integration**: Smart contracts on Somnia network
- **🧠 LLM Integration**: OpenAI, DeepSeek, and Ollama (FREE local AI)
- **💰 Agent Vault System**: Secure fund management with daily limits
- **📊 Monitoring & Telemetry**: Built-in logging, metrics, and dashboard
- **🔧 Production-Ready**: Battle-tested on Somnia Testnet

## ✨ Key Features

### For Developers
- **Easy-to-use SDK**: Build agents with minimal code
- **TypeScript Support**: Full type safety and IntelliSense
- **Flexible Architecture**: Self-hosted or shared platform modes
- **Comprehensive Testing**: Extensive test coverage

### For AI Agents
- **On-chain Registry**: Decentralized agent discovery
- **Secure Execution**: Validated and monitored agent actions
- **Fund Management**: Built-in vault system for agent transactions
- **Performance Tracking**: Real-time metrics and monitoring

## 🚀 Quick Start

```bash
# Install
npm install somnia-agent-kit
```

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Initialize SDK
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();

// Query agents
const agent = await kit.contracts.registry.getAgent(1);
console.log('Agent:', agent);
```

## 📚 Documentation Structure

### Getting Started
- **[Quick Start](quickstart.md)** - Get up and running in 5 minutes
- **[Installation](installation.md)** - Install the SDK
- **[FAQ](faq.md)** - Common questions

### SDK Usage
- **[Basic Usage](sdk-usage.md)** - SDK initialization and configuration
- **[Working with Agents](sdk-agents.md)** - Register and manage agents
- **[Task Management](sdk-tasks.md)** - Create and execute tasks
- **[Vault Operations](sdk-vault.md)** - Manage agent funds
- **[LLM Integration](sdk-llm.md)** - Use AI with your agents
- **[Token Management](sdk-tokens.md)** - ERC20, ERC721, and native tokens
- **[Multicall Batching](sdk-multicall.md)** - Optimize gas with batched calls
- **[Monitoring](sdk-monitoring.md)** - Logging, metrics, and dashboard
- **[Autonomous Runtime](sdk-runtime.md)** - Build self-running agents
- **[Storage & IPFS](sdk-storage.md)** - Upload and retrieve data
- **[Real-time Events](sdk-events.md)** - WebSocket subscriptions
- **[Wallet Connectors](sdk-wallets.md)** - MetaMask and wallet integration
- **[Contract Deployment](sdk-deployment.md)** - Deploy and verify contracts
- **[RPC Load Balancer](sdk-rpc-balancer.md)** - High availability setup
- **[API Reference](../API_REFERENCE.md)** - Complete API docs

### CLI Tools
- **[CLI Guide](cli-guide.md)** - Command-line interface

### Examples
- **[Examples Overview](../examples/README.md)** - 5 working examples

## 🛠️ Tech Stack

- **Language**: TypeScript 5.3+ with full type safety
- **Blockchain**: Ethers.js v6, Somnia Network (EVM-compatible)
- **Smart Contracts**: Solidity, deployed on Somnia Testnet
- **LLM**: OpenAI GPT-4, DeepSeek, Ollama (local)
- **Monitoring**: Pino logger, custom metrics, Express dashboard
- **Build**: tsup for dual ESM/CJS builds

## 🤝 Contributing

We welcome contributions! Please check our:
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues
- **Pull Requests**: https://github.com/xuanbach0212/somnia-agent-kit/pulls

## 📄 License

MIT License - see [LICENSE](../LICENSE) file.

## 🔗 Links

### Package
- **npm**: https://www.npmjs.com/package/somnia-agent-kit
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Documentation**: https://github.com/xuanbach0212/somnia-agent-kit/tree/main/docs

### Somnia Network
- **Website**: https://somnia.network
- **Explorer**: https://explorer.somnia.network
- **Discord**: https://discord.gg/somnia

### Deployed Contracts (Testnet)
- **AgentRegistry**: `0xC9f3452090EEB519467DEa4a390976D38C008347`
- **AgentManager**: `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E`
- **AgentExecutor**: `0x157C56dEdbAB6caD541109daabA4663Fc016026e`
- **AgentVault**: `0x7cEe3142A9c6d15529C322035041af697B2B5129`

---

Ready to build your first AI agent? Head over to the [Quick Start Guide](quickstart.md)! 🚀


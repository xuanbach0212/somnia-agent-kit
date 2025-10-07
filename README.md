# Somnia AI Agent Framework

> A comprehensive framework, SDK, and monitoring tools for designing, deploying, and scaling AI agents on Somnia Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## 🎯 Overview

The Somnia AI Agent Framework is a production-ready infrastructure for building, deploying, and managing AI agents on the Somnia blockchain network. It provides developers with a complete toolkit to create autonomous agents that can execute tasks, process payments, and be monitored in real-time.

### Key Features

- 🚀 **Easy Agent Deployment**: Fluent API for creating and deploying AI agents with minimal code
- 📊 **Real-time Monitoring**: WebSocket-based monitoring dashboard with metrics collection
- 💎 **Smart Contracts**: Battle-tested Solidity contracts for agent registry and task management
- 🔧 **Developer-Friendly SDK**: TypeScript SDK with comprehensive type safety
- 📈 **Metrics & Analytics**: Track agent performance, success rates, and execution times
- 🎨 **Flexible Architecture**: Support for any AI model or processing logic
- 🔐 **Secure & Decentralized**: Built on Somnia's high-performance blockchain

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install
npm install
cp .env.example .env

# 2. Get test tokens from Discord
# Join https://discord.gg/somnia, go to #dev-chat
# Tag @emma_odia and request STT tokens

# 3. Add your PRIVATE_KEY to .env

# 4. Deploy contracts
npm run build
npm run deploy:contracts

# 5. Run example
ts-node examples/simple-agent.ts
```

## 📦 Core Components

### 1. Smart Contracts

- **AgentRegistry.sol** - Agent registration, metrics tracking, lifecycle management
- **AgentManager.sol** - Task queue, payment escrow, execution tracking

### 2. TypeScript SDK

- **SomniaAgentSDK** - Main SDK for contract interaction
- **AgentBuilder** - Fluent API for agent creation
- **DeployedAgent** - Active agent management

### 3. Monitoring System

- **MonitoringClient** - SDK wrapper for monitoring API (NEW! ⭐)
- **MetricsCollector** - Performance tracking with alerts
- **AgentMonitor** - Real-time monitoring with events
- **Monitoring Server** - REST API + WebSocket

## 💻 Usage Example

```typescript
import { SomniaAgentSDK, AgentBuilder } from 'somnia-ai-agent-framework';

// Initialize SDK
const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
});

// Create and deploy an agent
const agent = await AgentBuilder.quick(
  'My First Agent',
  'A simple AI agent',
  {
    execute: async (input) => {
      // Your agent logic here
      return { success: true, result: 'Task completed!' };
    },
  }
)
  .addCapability('data-processing')
  .connectSDK(sdk)
  .build();

console.log('Agent deployed:', agent.getAgentId());

// Execute a task
const result = await agent.execute({ data: 'test' });
console.log('Result:', result);
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and diagrams
- **[HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md)** - Hackathon submission details

## 🔧 API Reference

### SomniaAgentSDK

```typescript
// Register an agent
const agentId = await sdk.registerAgent({
  name: 'Agent Name',
  description: 'Description',
  capabilities: ['capability1'],
  metadata: { /* custom */ }
});

// Get agent metrics
const metrics = await sdk.getAgentMetrics(agentId);

// Create a task
const taskId = await sdk.createTask({
  agentId: '1',
  taskData: 'Task description',
  reward: ethers.parseEther('0.1'),
});
```

### Monitoring

```bash
# Start monitoring server
npm run start:monitor

# Use MonitoringClient SDK (NEW!)
import { MonitoringClient } from 'somnia-ai-agent-framework';

const monitoring = new MonitoringClient({
  baseUrl: 'http://localhost:3001',
  autoConnect: true
});

// REST API methods
const health = await monitoring.getHealth();
const metrics = await monitoring.getAgentMetrics('1');
const aggregated = await monitoring.getAggregatedMetrics();

// WebSocket real-time updates
monitoring.on('metrics', (data) => {
  console.log('Agent metrics:', data);
});
```

## 🌐 Network Information

**Somnia Testnet**:
- RPC URL: https://dream-rpc.somnia.network
- Chain ID: 50311
- Currency: STT
- Explorer: https://explorer.somnia.network

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Somnia Network](https://docs.somnia.network/) for the blockchain infrastructure
- Infrastructure partners: Ankr, DIA, Protofire, Ormi

## 🔗 Links

- **Documentation**: https://docs.somnia.network/developer/infrastructure-dev-tools
- **Discord**: https://discord.gg/somnia
- **Get Test Tokens**: Tag @emma_odia in #dev-chat

---

Built with ❤️ for the Somnia Hackathon | **Infra Agents Track**

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
- 🌐 **IPFS Integration**: Decentralized metadata storage for agent configurations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web dApp   │  │   CLI Tool   │  │  Monitoring  │          │
│  │  Dashboard   │  │              │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Somnia AI Agent SDK                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AgentBuilder │  │ MetricsCollector│ │ AgentMonitor│          │
│  │              │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Contract   │  │  IPFS Manager│  │   WebSocket  │          │
│  │   Utils      │  │              │  │    Server    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Somnia Blockchain Layer                        │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   AgentRegistry      │  │   AgentManager       │            │
│  │   Smart Contract     │  │   Smart Contract     │            │
│  │                      │  │                      │            │
│  │ - Register agents    │  │ - Create tasks       │            │
│  │ - Track metrics      │  │ - Manage payments    │            │
│  │ - Store metadata     │  │ - Task queue         │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Somnia Network (Testnet)                       │
│              https://dream-rpc.somnia.network                    │
│                    Chain ID: 50311                               │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/somnia-ai.git
cd somnia-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# - Add your private key
# - Configure RPC URL (default: https://dream-rpc.somnia.network)
```

## 🚀 Quick Start

### 1. Deploy Smart Contracts

First, deploy the framework's smart contracts to Somnia Testnet:

```bash
# Build contracts
npm run build

# Deploy to Somnia Testnet
npm run deploy:contracts

# Contract addresses will be automatically saved to .env
```

**Note**: You need STT (Somnia Test Tokens). Join the [Somnia Discord](https://discord.gg/somnia) and request test tokens in the #dev-chat channel by tagging @emma_odia or email [email protected].

### 2. Create Your First Agent

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

console.log('Agent deployed with ID:', agent.getAgentId());

// Execute a task
const result = await agent.execute({ data: 'test' });
console.log('Result:', result);
```

### 3. Start Monitoring Server

```bash
# Start the monitoring server (REST API + WebSocket)
npm run start:monitor
```

The monitoring server will be available at:
- REST API: `http://localhost:3001`
- WebSocket: `ws://localhost:3001`

## 📖 Documentation

### Core Components

#### 1. **AgentRegistry Smart Contract**

Manages agent registration and metadata on-chain.

```solidity
// Register a new agent
function registerAgent(
  string memory _name,
  string memory _description,
  string memory _ipfsMetadata,
  string[] memory _capabilities
) external returns (uint256)

// Record execution metrics
function recordExecution(
  uint256 _agentId,
  bool _success,
  uint256 _executionTime
) external
```

#### 2. **AgentManager Smart Contract**

Handles task creation, execution, and payment management.

```solidity
// Create a task with payment
function createTask(
  uint256 _agentId,
  string memory _taskData
) external payable returns (uint256)

// Complete a task and receive payment
function completeTask(
  uint256 _taskId,
  string memory _result
) external
```

#### 3. **SomniaAgentSDK**

TypeScript SDK for interacting with the framework.

```typescript
// Initialize SDK
const sdk = new SomniaAgentSDK(config);

// Register an agent
const agentId = await sdk.registerAgent({
  name: 'Agent Name',
  description: 'Description',
  capabilities: ['capability1', 'capability2'],
  metadata: { /* custom metadata */ }
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

#### 4. **AgentBuilder**

Fluent API for building agents with ease.

```typescript
const agent = await new AgentBuilder()
  .withName('My Agent')
  .withDescription('Agent description')
  .withCapabilities(['capability1', 'capability2'])
  .withExecutor({
    initialize: async () => { /* setup */ },
    execute: async (input) => { /* main logic */ },
    cleanup: async () => { /* cleanup */ }
  })
  .connectSDK(sdk)
  .build();
```

#### 5. **Monitoring System**

Real-time monitoring with metrics collection and alerts.

```typescript
const metricsCollector = new MetricsCollector(sdk, {
  minSuccessRate: 80,
  maxAverageExecutionTime: 5000,
});

const monitor = new AgentMonitor(sdk, metricsCollector, {
  updateInterval: 30000,
  autoStart: true,
});

// Listen for metrics
monitor.on('metrics:collected', (metrics) => {
  console.log('Agent metrics:', metrics);
});

// Listen for alerts
monitor.on('alert:critical', (alert) => {
  console.log('Critical alert:', alert);
});
```

## 🎯 Examples

### Example 1: Simple Calculator Agent

```bash
npm run dev
# or
ts-node examples/simple-agent.ts
```

### Example 2: AI Agent with OpenAI

```bash
# Set OPENAI_API_KEY in .env
ts-node examples/ai-agent-with-openai.ts
```

### Example 3: Monitoring Dashboard

```bash
ts-node examples/monitoring-example.ts
```

## 🔧 Configuration

### Environment Variables

```bash
# Somnia Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311

# Wallet
PRIVATE_KEY=your_private_key_here

# Contract Addresses (auto-filled after deployment)
AGENT_REGISTRY_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...

# Monitoring
PORT=3000
MONITORING_PORT=3001

# Optional: AI Integration
OPENAI_API_KEY=your_openai_api_key_here
```

## 📊 Deployed Contracts

After deployment, you'll find contract addresses in:
- `deployments/latest.json`
- `.env` file (auto-updated)

### Testnet Deployment

**Network**: Somnia Testnet  
**Chain ID**: 50311  
**RPC URL**: https://dream-rpc.somnia.network  
**Explorer**: https://explorer.somnia.network

**Contract Addresses** (update after deployment):
- `AgentRegistry`: [View on Explorer](https://explorer.somnia.network)
- `AgentManager`: [View on Explorer](https://explorer.somnia.network)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Reference

### REST API Endpoints

```
GET  /health                      - Health check
GET  /api/agents                  - List monitored agents
POST /api/agents/:agentId         - Add agent to monitoring
DELETE /api/agents/:agentId       - Remove agent from monitoring
GET  /api/agents/:agentId/metrics - Get agent metrics
GET  /api/agents/:agentId/history - Get metrics history
GET  /api/metrics/aggregated      - Get aggregated metrics
POST /api/monitor/start           - Start monitoring
POST /api/monitor/stop            - Stop monitoring
POST /api/monitor/collect         - Force metrics collection
```

### WebSocket Events

```typescript
// Client -> Server
{ type: 'subscribe', agentId: '1' }
{ type: 'unsubscribe', agentId: '1' }
{ type: 'getMetrics', agentId: '1' }

// Server -> Client
{ type: 'connected', timestamp, agents }
{ type: 'metrics', data: {...} }
{ type: 'aggregated', data: {...} }
{ type: 'alert', data: {...} }
```

## 🤝 Contributing

Contributions are welcome! This is an open-source project designed to help the Somnia community.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Somnia Network](https://docs.somnia.network/) for the high-performance blockchain infrastructure
- Infrastructure partners: Ankr, DIA, Protofire, Ormi
- The open-source community

## 🔗 Links

- **Documentation**: https://docs.somnia.network/
- **Discord**: https://discord.gg/somnia
- **Explorer**: https://explorer.somnia.network
- **Faucet**: Request test tokens in Discord #dev-chat

## 📞 Support

- Create an issue on GitHub
- Join our [Discord](https://discord.gg/somnia)
- Email: [email protected]

---

Built with ❤️ for the Somnia Hackathon | **Infra Agents Track**


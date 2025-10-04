# Architecture Overview - Somnia AI Agent Framework

## System Architecture

The Somnia AI Agent Framework is built on a modular, scalable architecture that separates concerns across multiple layers.

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Web dApp   │  │  Monitoring  │  │   Developer Tools/CLI    │  │
│  │  (React/    │  │   Dashboard  │  │                          │  │
│  │   Next.js)   │  │  (WebSocket) │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Application/SDK Layer                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Somnia AI Agent SDK (TypeScript)                  │  │
│  │                                                                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │  │
│  │  │  AgentBuilder   │  │ SomniaAgentSDK  │  │ DeployedAgent│ │  │
│  │  │                 │  │                 │  │              │ │  │
│  │  │ - Fluent API    │  │ - Contract      │  │ - Execute    │ │  │
│  │  │ - Configuration │  │   Interaction   │  │ - Monitor    │ │  │
│  │  └─────────────────┘  │ - IPFS Upload   │  │ - Update     │ │  │
│  │                       └─────────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Monitoring & Analytics Layer                      │  │
│  │                                                                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │  │
│  │  │ MetricsCollector│  │  AgentMonitor   │  │  REST API +  │ │  │
│  │  │                 │  │                 │  │  WebSocket   │ │  │
│  │  │ - Collect Data  │  │ - Real-time     │  │  Server      │ │  │
│  │  │ - Thresholds    │  │   Updates       │  │              │ │  │
│  │  │ - Alerts        │  │ - Event Emitter │  │              │ │  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Utility Layer                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │   Contract   │  │ IPFS Manager │  │     Logger       │    │  │
│  │  │    Utils     │  │              │  │   (Winston)      │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                        ethers.js / viem
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Smart Contract Layer                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    AgentRegistry.sol                           │  │
│  │                                                                │  │
│  │  Functions:                     Storage:                      │  │
│  │  • registerAgent()              • agents mapping              │  │
│  │  • updateAgent()                • agentMetrics mapping        │  │
│  │  • recordExecution()            • ownerAgents mapping         │  │
│  │  • deactivateAgent()            • agentCounter                │  │
│  │  • activateAgent()                                            │  │
│  │  • getAgent()                   Events:                       │  │
│  │  • getAgentMetrics()            • AgentRegistered             │  │
│  │  • getOwnerAgents()             • AgentUpdated                │  │
│  │                                 • AgentExecuted               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    AgentManager.sol                            │  │
│  │                                                                │  │
│  │  Functions:                     Storage:                      │  │
│  │  • createTask()                 • tasks mapping               │  │
│  │  • startTask()                  • taskCounter                 │  │
│  │  • completeTask()               • platformFee                 │  │
│  │  • failTask()                   • accumulatedFees             │  │
│  │  • cancelTask()                                               │  │
│  │  • getTask()                    Events:                       │  │
│  │  • updatePlatformFee()          • TaskCreated                 │  │
│  │  • withdrawFees()               • TaskCompleted               │  │
│  │                                 • TaskStarted                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Somnia Blockchain Network                         │
│                                                                      │
│  Network: Testnet                 Features:                         │
│  Chain ID: 50311                  • High TPS                        │
│  RPC: dream-rpc.somnia.network    • Low Latency                     │
│  Currency: STT                    • EVM Compatible                  │
│  Explorer: explorer.somnia.network                                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Integrations                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │     IPFS     │  │   OpenAI     │  │     DIA Oracles          │  │
│  │  (Metadata)  │  │   (AI Model) │  │   (Price Feeds)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Smart Contract Layer

#### AgentRegistry.sol
**Purpose**: Central registry for all AI agents on Somnia

**Key Features**:
- Agent registration with metadata
- Capability tracking
- Execution metrics recording
- Owner-based access control
- IPFS metadata references

**Data Structures**:
```solidity
struct Agent {
    string name;
    string description;
    string ipfsMetadata;
    address owner;
    bool isActive;
    uint256 registeredAt;
    uint256 lastUpdated;
    string[] capabilities;
    uint256 executionCount;
}

struct AgentMetrics {
    uint256 totalExecutions;
    uint256 successfulExecutions;
    uint256 failedExecutions;
    uint256 averageExecutionTime;
    uint256 lastExecutionTime;
}
```

#### AgentManager.sol
**Purpose**: Task queue and payment management

**Key Features**:
- Task creation with escrow payments
- Task lifecycle management (Pending → InProgress → Completed/Failed)
- Automatic payment distribution
- Platform fee management
- Refund mechanisms

**Data Structures**:
```solidity
struct Task {
    uint256 taskId;
    uint256 agentId;
    address requester;
    string taskData;
    uint256 reward;
    TaskStatus status;
    uint256 createdAt;
    uint256 completedAt;
    string result;
}

enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled
}
```

### 2. SDK Layer

#### SomniaAgentSDK
**Purpose**: Main interface for developers to interact with the framework

**Key Methods**:
- `registerAgent()`: Deploy new agents
- `getAgent()`: Retrieve agent information
- `getAgentMetrics()`: Get performance metrics
- `updateAgent()`: Modify agent configuration
- `recordExecution()`: Log execution results
- `createTask()`: Submit tasks with payment
- `completeTask()`: Finalize task execution
- `getOwnerAgents()`: List user's agents

#### AgentBuilder
**Purpose**: Fluent API for constructing agents

**Pattern**: Builder Pattern
```typescript
AgentBuilder
  .withName()
  .withDescription()
  .withCapabilities()
  .withExecutor()
  .connectSDK()
  .build() → DeployedAgent
```

#### DeployedAgent
**Purpose**: Represents a deployed, active agent

**Key Methods**:
- `execute()`: Run agent logic
- `getDetails()`: Fetch current configuration
- `getMetrics()`: Retrieve performance data
- `update()`: Modify agent
- `deactivate()`/`activate()`: Control state
- `cleanup()`: Resource management

### 3. Monitoring Layer

#### MetricsCollector
**Purpose**: Collect and analyze agent performance

**Features**:
- Configurable thresholds
- Success rate tracking
- Execution time monitoring
- Alert generation
- Historical data storage

**Metrics Tracked**:
- Total executions
- Success/failure counts
- Average execution time
- Success rate percentage
- Alert conditions

#### AgentMonitor
**Purpose**: Real-time monitoring with event emission

**Features**:
- Periodic metric collection
- Event-driven architecture
- Agent subscription management
- Automatic alerting
- WebSocket broadcasting

**Events**:
- `metrics:collected`: New metrics available
- `metrics:aggregated`: System-wide summary
- `alert:warning`: Performance degradation
- `alert:critical`: Serious issues
- `monitor:started`/`monitor:stopped`: State changes

#### Monitoring Server
**Purpose**: REST API and WebSocket server for dashboards

**Endpoints**:
```
GET  /health                      - Server status
GET  /api/agents                  - List agents
POST /api/agents/:id              - Add to monitoring
GET  /api/agents/:id/metrics      - Current metrics
GET  /api/agents/:id/history      - Historical data
GET  /api/metrics/aggregated      - System overview
POST /api/monitor/collect         - Force update
```

**WebSocket Protocol**:
```typescript
// Client → Server
{ type: 'subscribe', agentId: '1' }
{ type: 'getMetrics', agentId: '1' }

// Server → Client
{ type: 'metrics', data: {...} }
{ type: 'alert', data: {...} }
```

### 4. Utility Layer

#### Contract Utils
- Contract ABI definitions
- Factory functions for contract instances
- Event parsing utilities
- Gas estimation helpers

#### IPFS Manager
- JSON metadata upload/download
- File storage integration
- Content addressing
- Gateway fallbacks

#### Logger
- Winston-based logging
- Multiple transports (console, file)
- Contextual logging
- Log levels (info, warn, error, debug)

## Data Flow

### Agent Registration Flow
```
Developer Code
    ↓
AgentBuilder.build()
    ↓
SomniaAgentSDK.registerAgent()
    ↓
Upload metadata to IPFS
    ↓
AgentRegistry.registerAgent() [Transaction]
    ↓
Emit AgentRegistered event
    ↓
Return Agent ID
    ↓
Create DeployedAgent instance
```

### Task Execution Flow
```
Client
    ↓
SomniaAgentSDK.createTask() [with payment]
    ↓
AgentManager.createTask() [Transaction]
    ↓
Escrow payment locked
    ↓
Emit TaskCreated event
    ↓
Agent detects task
    ↓
DeployedAgent.execute()
    ↓
Process logic (off-chain)
    ↓
SomniaAgentSDK.completeTask() [with result]
    ↓
AgentManager.completeTask() [Transaction]
    ↓
Release payment to agent
    ↓
Emit TaskCompleted event
```

### Monitoring Flow
```
AgentMonitor.start()
    ↓
Periodic timer (30s)
    ↓
MetricsCollector.collectAgentMetrics()
    ↓
Read AgentRegistry.agentMetrics()
    ↓
Analyze against thresholds
    ↓
Generate alerts if needed
    ↓
Emit events
    ↓
WebSocket broadcast to clients
    ↓
Update dashboard UI
```

## Security Considerations

### Smart Contracts
- ReentrancyGuard on payment functions
- Ownable for admin functions
- Input validation on all public functions
- Safe math operations (Solidity 0.8+)

### SDK
- Private key management via environment variables
- Input sanitization
- Error handling and validation
- Transaction confirmation waiting

### Monitoring
- CORS configuration
- WebSocket authentication (can be added)
- Rate limiting (can be added)
- Data validation

## Scalability

### Horizontal Scaling
- Multiple monitoring servers
- Load balancer distribution
- Stateless API design

### Vertical Scaling
- Batch metric collection
- Event-driven architecture
- Efficient data structures

### On-Chain Optimization
- Gas-efficient storage patterns
- Event emission for indexing
- Minimal on-chain data

## Technology Stack

### Smart Contracts
- Solidity 0.8.20
- Hardhat development framework
- OpenZeppelin contracts

### Backend/SDK
- TypeScript 5.3
- Node.js 18+
- ethers.js 6.9
- Express.js
- WebSocket (ws)

### Monitoring
- Winston (logging)
- EventEmitter (events)
- Express (REST API)

### DevOps
- Jest (testing)
- ESLint (linting)
- Prettier (formatting)
- Hardhat (deployment)

## Future Enhancements

1. **Multi-chain Support**: Deploy to multiple EVM chains
2. **Advanced Monitoring**: Grafana/Prometheus integration
3. **Agent Marketplace**: Discover and use public agents
4. **Reputation System**: Track agent reliability
5. **Governance**: DAO for platform decisions
6. **Advanced Scheduling**: Cron-like task scheduling
7. **Result Verification**: On-chain proof systems

---

This architecture provides a solid foundation for building, deploying, and managing AI agents on Somnia while maintaining security, scalability, and developer experience.


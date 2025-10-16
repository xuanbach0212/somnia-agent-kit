# CLAUDE.md - AI Development Context

> This file provides context for AI assistants (Claude, GPT, etc.) working on the Somnia Agent Kit project.

## Project Overview

**Somnia Agent Kit** is a comprehensive TypeScript SDK and toolkit for building, deploying, and managing autonomous AI agents on the Somnia blockchain network.

### Key Features
- 🔗 **Blockchain Integration**: Direct interaction with Somnia Network smart contracts
- 🤖 **AI Agent Runtime**: Lifecycle management, planning, execution
- 🧠 **LLM Support**: OpenAI, Ollama adapters for AI capabilities
- 📊 **Monitoring**: Built-in metrics, logging, and event recording
- 🛠️ **CLI Tools**: Command-line interface for agent management

---

## Architecture

### Monorepo Structure (Detailed)

```
somnia-agent-kit/
│
├── 📄 Root Configuration
│   ├── package.json              # ✅ Monorepo root with pnpm workspaces
│   ├── pnpm-workspace.yaml       # ✅ pnpm workspace config
│   ├── tsconfig.json             # ✅ Root TypeScript config
│   ├── .env.example              # ✅ Environment template
│   ├── .gitignore                # ✅ Git ignore rules
│   ├── LICENSE                   # ✅ MIT License
│   ├── README.md                 # ✅ Main documentation
│   └── CLAUDE.md                 # ✅ This file - AI context
│
├── 📦 packages/
│   └── agent-kit/                # Main SDK package
│       ├── package.json          # ✅ With tsup, vitest, ethers
│       ├── tsconfig.json         # ✅ TypeScript config
│       ├── tsup.config.ts        # ✅ Build config (ESM + CJS)
│       ├── vitest.config.ts      # ✅ Test config
│       ├── README.md             # ✅ Package docs
│       │
│       └── src/
│           ├── index.ts          # ✅ Main SDK class (SomniaAgentKit)
│           ├── index.test.ts     # ✅ Unit tests
│           │
│           ├── core/             # ✅ COMPLETED (6/6 files)
│           │   ├── chainClient.ts    # Blockchain client
│           │   ├── contracts.ts      # Contract interactions
│           │   ├── signerManager.ts  # Wallet management
│           │   ├── config.ts         # Network configs
│           │   ├── utils.ts          # Utilities
│           │   └── index.ts          # Exports
│           │
│           ├── runtime/          # ✅ COMPLETED (7/7 files)
│           │   ├── agent.ts          # Agent lifecycle
│           │   ├── planner.ts        # Task planning
│           │   ├── executor.ts       # Execution engine
│           │   ├── trigger.ts        # Event triggers
│           │   ├── storage.ts        # State persistence
│           │   ├── policy.ts         # Access control
│           │   └── index.ts
│           │
│           ├── llm/              # ✅ COMPLETED (3/3 files)
│           │   ├── openaiAdapter.ts  # OpenAI integration
│           │   ├── ollamaAdapter.ts  # Ollama integration
│           │   └── index.ts
│           │
│           ├── monitor/          # ✅ COMPLETED (4/4 files)
│           │   ├── logger.ts         # Winston logger
│           │   ├── metrics.ts        # Performance metrics
│           │   ├── eventRecorder.ts  # Event tracking
│           │   └── index.ts
│           │
│           └── cli/              # ✅ COMPLETED (1/1 file)
│               └── cli.ts            # CLI commands
│
├── ⚙️ contracts/                 # Smart contracts workspace
│   ├── package.json              # ✅ With Hardhat & Typechain
│   ├── hardhat.config.ts         # ✅ Hardhat configuration
│   │
│   ├── contracts/
│   │   ├── AgentRegistry.sol     # ✅ Agent registration
│   │   ├── AgentManager.sol      # ✅ Task management
│   │   ├── AgentExecutor.sol     # ✅ Task execution
│   │   ├── AgentVault.sol        # ✅ Fund management
│   │   ├── BaseAgent.sol         # ✅ Base implementation
│   │   └── IAgent.sol            # ✅ Agent interface
│   │
│   ├── scripts/
│   │   ├── deploy.ts             # ✅ Deployment script
│   │   └── verify.ts             # ✅ Verification script
│   │
│   ├── test/
│   │   ├── AgentRegistry.test.ts # ✅ Registry tests
│   │   ├── AgentExecutor.test.ts # ✅ Executor tests
│   │   └── AgentVault.test.ts    # ✅ Vault tests
│   │
│   └── typechain-types/          # ✅ Generated TypeScript types (54 files)
│
├── 🔧 scripts/                   # Build and utility scripts
│   ├── generateContracts.ts      # ✅ Typechain generation
│   ├── prepareEnv.ts             # ✅ Environment setup
│   └── deploy.ts                 # ✅ Legacy deploy (kept for reference)
│
├── 📚 docs/                      # Documentation
│   ├── architecture.md           # ✅ Architecture overview
│   ├── sdk-design.md             # ✅ SDK design patterns
│   ├── contracts-overview.md     # ✅ Smart contracts guide
│   ├── quickstart.md             # ✅ Getting started
│   └── examples/
│       └── minimal-agent.md      # ✅ Minimal agent example
│
└── 📝 examples/                  # Usage examples
    ├── simple-agent-demo/
    │   └── index.ts              # ✅ Basic example
    └── onchain-chatbot/
        └── index.ts              # ✅ AI chatbot example
```

### Tech Stack
- **Language**: TypeScript 5.3+
- **Package Manager**: pnpm 8.15+
- **Build Tool**: tsup (ESM + CJS + types)
- **Test Framework**: vitest
- **Blockchain**: Ethers.js v6
- **LLM**: OpenAI SDK, Ollama
- **Logging**: Winston
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Type Generation**: Typechain

---

## Module Breakdown

### 1. **core/** - Blockchain Layer
**Status**: ✅ Completed & Refactored (100/100)

**Files**:
- `chainClient.ts` - Main blockchain client with provider/signer management
- `contracts.ts` - Smart contract wrapper with Typechain integration
- `signerManager.ts` - Wallet, mnemonic, and transaction signing
- `config.ts` - Configuration with env loading and defaults merging
- `utils.ts` - 20+ utilities (hex, ether, logger, EventEmitter)
- `index.ts` - Module exports

**Key Classes & Features**:

**ChainClient** (packages/agent-kit/src/core/chainClient.ts)
- Network connection with chain ID validation
- Event listening system (on/off/once/removeAllListeners)
- Block number with 2-second cache
- Transaction methods (sendTransaction, waitForTransaction, getTransaction/getTx)
- Contract factory methods (getContract, getReadOnlyContract)
- Gas estimation and fee data
- Full ethers.js provider access

**SignerManager** (packages/agent-kit/src/core/signerManager.ts)
- Private key, mnemonic, and external signer support
- **sendTx(to, data, value?)** - Send transactions with receipt
- **estimateGas(tx)** - Gas estimation
- getNonce(), getGasPrice(), getBalance()
- Static factories: fromMnemonic(), fromSigner()

**SomniaContracts** (packages/agent-kit/src/core/contracts.ts)
- Typechain-based contract instances
- Registry, Executor, Manager, Vault contracts
- Factory method: fromChainClient()
- Lowercase aliases (registry, executor, vault, manager)
- Read-only and signer-connected modes

**Config System** (packages/agent-kit/src/core/config.ts)
- **loadConfig(userConfig?)** - Merge defaults + env + user config
- **loadFromEnv()** - Load from environment variables
- **createConfigFromEnv()** - Quick setup from .env
- LLM provider config (OpenAI, Ollama)
- Default gas limits, log levels, metrics
- Network presets (mainnet, testnet, devnet)

**Utils Library** (packages/agent-kit/src/core/utils.ts)
- **Async**: sleep, retry, delay, timeout
- **Hex conversion**: toHex, fromHex, bytesToHex, hexToBytes, toUtf8Bytes, toUtf8String, keccak256
- **Ether/Token**: formatEther, parseEther, formatUnits, parseUnits
- **EventEmitter**: Type-safe event system with on/off/once/emit
- **Logger**: createLogger(), Logger, LogLevel re-exports
- **Address**: isValidAddress, shortAddress

### 2. **runtime/** - Agent Runtime
**Status**: ✅ Completed

Implemented modules:
- `agent.ts` - Agent class with lifecycle management (create, register, start, stop, terminate)
- `planner.ts` - Task planning and decomposition with dependency resolution
- `executor.ts` - Task execution engine with retry logic and error handling
- `trigger.ts` - Event triggers (time, event, condition-based)
- `storage.ts` - State persistence (memory, file, on-chain, IPFS)
- `policy.ts` - Access control and governance with role-based permissions

**Key Features**:
- Complete agent lifecycle (Created → Registered → Active → Paused → Stopped → Terminated)
- Automatic task decomposition and optimization
- Concurrent execution support with dependency tracking
- Flexible trigger system with cron-like scheduling
- Multi-backend storage support

### 3. **llm/** - LLM Adapters
**Status**: ✅ Completed

Implemented adapters:
- `openaiAdapter.ts` - OpenAI GPT integration (GPT-3.5, GPT-4, embeddings, streaming)
- `ollamaAdapter.ts` - Local Ollama integration (Llama, Mistral, model management)
- Common interface for seamless model switching

**Features**:
- Chat completion with message history
- Text generation with customizable parameters
- Embedding generation
- Streaming support for real-time responses
- Model management (pull, delete, list)

### 4. **monitor/** - Monitoring System
**Status**: ✅ Completed

Implemented modules:
- `logger.ts` - Structured logging with multiple levels (error, warn, info, debug, verbose)
- `metrics.ts` - Performance metrics (counters, gauges, histograms, timing)
- `eventRecorder.ts` - On-chain event tracking with filtering and callbacks

**Features**:
- Child loggers with context
- Time-series metrics with aggregation
- Automatic event listening and recording
- Export capabilities for all monitoring data

### 5. **cli/** - Command Line Interface
**Status**: ✅ Completed

Implemented commands:
- `create` - Create new agent
- `deploy` - Deploy agent on-chain
- `start` - Start agent execution
- `stop` - Stop agent
- `status` - View agent status
- `task` - Create task for agent
- `help` - Show help message

---

## Smart Contracts

### AgentRegistry.sol
- Agent registration and metadata
- Owner management
- Capability tracking
- Events: AgentRegistered, AgentUpdated

### AgentManager.sol (legacy)
- Task queue management
- Payment escrow
- Task lifecycle

**Note**: May need to create AgentExecutor.sol and AgentVault.sol based on new architecture.

---

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Exports**: Named exports preferred (no default exports except main index)
- **Async**: Use async/await, avoid callbacks
- **Error Handling**: Always throw typed errors with clear messages

### File Organization
```typescript
// Standard file structure:
/**
 * Module description
 */

// Imports
import { ... } from '...';

// Types/Interfaces
export interface ...

// Constants
export const ...

// Classes
export class ... {
  // Private fields
  private ...;

  // Constructor
  constructor(...) { }

  // Public methods
  public async ...() { }

  // Private methods
  private ...() { }
}
```

### Testing
- Unit tests in `*.test.ts` files
- Integration tests in `tests/integration/`
- Mock external dependencies (blockchain, LLMs)
- Target: 80% coverage

---

## Current Status

### ✅ Completed (v2.0.0 - Phase 1-5 Complete)

**Phase 1: Foundation Setup**
- [x] Monorepo structure with pnpm workspaces
- [x] TypeScript configuration (strict mode)
- [x] Build system (tsup for ESM + CJS + DTS)
- [x] Testing framework (vitest with 8/8 tests passing)
- [x] Package structure and exports

**Phase 2: Chain & Contract Layer**
- [x] Smart contracts (IAgent, BaseAgent, AgentExecutor, AgentVault, AgentRegistry, AgentManager)
- [x] Hardhat deployment scripts
- [x] Typechain type generation (54 generated files)
- [x] Contract verification script
- [x] SomniaContracts wrapper class
- [x] SDK integration with ethers v6

**Phase 3: Runtime System**
- [x] Agent lifecycle management (7 states)
- [x] Task planner with dependency resolution
- [x] Executor with retry logic
- [x] Event triggers (time, event, condition)
- [x] Storage layer (memory, file, on-chain, IPFS)
- [x] Policy system with role-based access control

**Phase 4: LLM Integration**
- [x] OpenAI adapter (chat, completion, embeddings, streaming)
- [x] Ollama adapter (local LLM support, model management)
- [x] Common LLM interface

**Phase 5: Monitoring & Tools**
- [x] Structured logger with levels and context
- [x] Metrics system (counters, gauges, histograms)
- [x] Event recorder for blockchain events
- [x] CLI with 7 commands

**Documentation & Examples**
- [x] Architecture overview
- [x] SDK design documentation
- [x] Smart contracts overview
- [x] Quick start guide
- [x] Minimal agent example
- [x] Simple agent demo
- [x] On-chain chatbot example

### 🎯 Production Ready
The SDK is now feature-complete and ready for:
- Agent development and deployment
- LLM-powered autonomous agents
- On-chain task execution
- Real-time monitoring and metrics
- Multi-backend state management

### 📋 Future Enhancements
- [ ] Advanced integration tests
- [ ] Performance benchmarks
- [ ] CI/CD pipeline
- [ ] npm publish workflow
- [ ] Additional LLM providers
- [ ] Enhanced CLI with interactive mode

---

## Key Concepts

### Agent Lifecycle
```
Create → Register → Deploy → Start → Execute → Stop → Cleanup
```

### Task Execution Flow
```
Trigger → Plan → Validate → Execute → Record → Store Result
```

### On-chain vs Off-chain
- **On-chain**: Agent metadata, ownership, metrics, payments
- **Off-chain**: AI computation, complex state, temporary data

---

## Environment Variables

```env
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312  # Testnet chain ID (mainnet: 50311)
PRIVATE_KEY=0x...

# Contracts
AGENT_REGISTRY_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...

# LLM (Optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Advanced (Optional)
DEFAULT_GAS_LIMIT=3000000
LOG_LEVEL=info  # debug | info | warn | error
METRICS_ENABLED=true
```

---

## Common Tasks for AI Assistance

### When implementing new modules:
1. Check existing core/ modules for patterns
2. Follow TypeScript strict typing
3. Add JSDoc comments for public APIs
4. Export through index.ts
5. Consider error handling and validation
6. Think about testability

### When writing smart contracts:
1. Follow Solidity 0.8.20 syntax
2. Use OpenZeppelin when possible
3. Add NatSpec comments
4. Consider gas optimization
5. Include events for all state changes
6. Write comprehensive tests

### When adding dependencies:
1. Add to appropriate package.json (root vs workspace)
2. Check bundle size impact
3. Prefer well-maintained packages
4. Document why dependency is needed

---

## Debugging Tips

### Common Issues
1. **"Contract not connected"** → Check ChainClient.connect() called
2. **"Signer required"** → Ensure PRIVATE_KEY in config
3. **"Invalid address"** → Validate with isValidAddress()
4. **Gas estimation fails** → Check contract state and permissions

### Useful Commands
```bash
# Build everything
npm run build

# Build specific package
npm run build:kit

# Run tests
npm test

# Lint
npm run lint

# Clean
npm run clean
```

---

## References

- [Somnia Network Docs](https://docs.somnia.network)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Notes for AI Assistants

- **Context Window**: This file should always be included when working on the project
- **File Paths**: Always use absolute paths in code
- **Breaking Changes**: Discuss with user before major architectural changes
- **Performance**: Consider gas costs for on-chain operations
- **Security**: Never commit private keys or sensitive data

---

**Last Updated**: 2025-01-16
**Version**: 2.0.1
**Status**: Production Ready - Core modules fully refactored and tested (8/8 tests passing)

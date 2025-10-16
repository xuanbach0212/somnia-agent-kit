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
│           ├── runtime/          # 🚧 TODO (0/7 files)
│           │   ├── agent.ts          # Agent lifecycle
│           │   ├── planner.ts        # Task planning
│           │   ├── executor.ts       # Execution engine
│           │   ├── trigger.ts        # Event triggers
│           │   ├── storage.ts        # State persistence
│           │   ├── policy.ts         # Access control
│           │   └── index.ts
│           │
│           ├── llm/              # 🚧 TODO (0/3 files)
│           │   ├── openaiAdapter.ts  # OpenAI integration
│           │   ├── ollamaAdapter.ts  # Ollama integration
│           │   └── index.ts
│           │
│           ├── monitor/          # 🚧 TODO (0/4 files)
│           │   ├── logger.ts         # Winston logger
│           │   ├── metrics.ts        # Performance metrics
│           │   ├── eventRecorder.ts  # Event tracking
│           │   └── index.ts
│           │
│           └── cli/              # 🚧 TODO (0/1 file)
│               └── cli.ts            # CLI commands
│
├── ⚙️ contracts/                 # Smart contracts workspace
│   ├── package.json              # 🚧 TODO - Hardhat config
│   ├── hardhat.config.ts         # ✅ Hardhat configuration
│   │
│   ├── contracts/
│   │   ├── AgentRegistry.sol     # ✅ Legacy - needs update
│   │   ├── AgentManager.sol      # ✅ Legacy - needs update
│   │   ├── AgentExecutor.sol     # 🚧 TODO - New contract
│   │   ├── AgentVault.sol        # 🚧 TODO - New contract
│   │   ├── BaseAgent.sol         # 🚧 TODO - Base interface
│   │   └── IAgent.sol            # 🚧 TODO - Interface
│   │
│   ├── scripts/
│   │   ├── deploy.ts             # 🚧 TODO - Deployment script
│   │   └── verify.ts             # 🚧 TODO - Verification script
│   │
│   └── test/
│       ├── AgentRegistry.test.ts # 🚧 TODO
│       ├── AgentExecutor.test.ts # 🚧 TODO
│       └── AgentVault.test.ts    # 🚧 TODO
│
├── 🔧 scripts/                   # Build and utility scripts
│   ├── generateContracts.ts      # 🚧 TODO - Typechain generation
│   ├── prepareEnv.ts             # 🚧 TODO - Environment setup
│   └── publish.ts                # 🚧 TODO - npm publish
│
├── 📚 docs/                      # Documentation
│   ├── architecture.md           # 🚧 TODO
│   ├── sdk-design.md             # 🚧 TODO
│   ├── contracts-overview.md     # 🚧 TODO
│   ├── quickstart.md             # 🚧 TODO
│   └── examples/
│       └── minimal-agent.md      # 🚧 TODO
│
└── 📝 examples/                  # Usage examples
    ├── simple-agent-demo/
    │   └── index.ts              # ✅ Basic example
    └── onchain-chatbot/          # 🚧 TODO
        └── index.ts
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
**Status**: ✅ Completed

- `chainClient.ts` - Main blockchain client (connect, transactions, gas estimation)
- `contracts.ts` - Smart contract interactions (AgentRegistry, AgentExecutor)
- `signerManager.ts` - Wallet and transaction signing
- `config.ts` - Network configurations and validation
- `utils.ts` - Utility functions (formatting, retries, etc.)

**Key Classes**:
- `ChainClient` - Blockchain connection manager
- `ContractManager` - Smart contract wrapper
- `SignerManager` - Wallet management

### 2. **runtime/** - Agent Runtime
**Status**: 🚧 To be implemented

Planned modules:
- `agent.ts` - Main agent class with lifecycle management
- `planner.ts` - Task planning and decomposition
- `executor.ts` - Task execution engine
- `trigger.ts` - Event triggers and conditions
- `storage.ts` - State persistence
- `policy.ts` - Access control and governance

**Design Goals**:
- Event-driven architecture
- Pluggable executor strategies
- State management (on-chain + off-chain)
- Policy-based access control

### 3. **llm/** - LLM Adapters
**Status**: 🚧 To be implemented

Planned adapters:
- `openaiAdapter.ts` - OpenAI GPT integration
- `ollamaAdapter.ts` - Local Ollama integration
- Common interface for model switching

**Interface Design**:
```typescript
interface LLMAdapter {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  chat(messages: Message[]): Promise<string>;
  embed(text: string): Promise<number[]>;
}
```

### 4. **monitor/** - Monitoring System
**Status**: 🚧 To be implemented

Modules:
- `logger.ts` - Winston-based structured logging
- `metrics.ts` - Performance metrics collection
- `eventRecorder.ts` - On-chain event tracking

### 5. **cli/** - Command Line Interface
**Status**: 🚧 To be implemented

Planned commands:
- `agent create` - Create new agent
- `agent deploy` - Deploy agent on-chain
- `agent start/stop` - Lifecycle control
- `agent status` - View agent status
- `task create` - Create task for agent

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

### Completed ✅
- [x] Monorepo structure with npm workspaces
- [x] Core blockchain layer (chainClient, contracts, signerManager)
- [x] TypeScript configuration
- [x] Package structure

### In Progress 🚧
- [ ] Runtime modules (agent, planner, executor, trigger, storage, policy)
- [ ] LLM adapters (OpenAI, Ollama)
- [ ] Monitor modules (logger, metrics, eventRecorder)
- [ ] CLI implementation
- [ ] Smart contract updates (AgentExecutor, AgentVault)

### Planned 📋
- [ ] Comprehensive documentation
- [ ] Example implementations
- [ ] Integration tests
- [ ] Deployment scripts
- [ ] npm publish workflow

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
SOMNIA_CHAIN_ID=50311
PRIVATE_KEY=0x...

# Contracts
AGENT_REGISTRY_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...

# LLM
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434

# Monitoring
LOG_LEVEL=info
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

**Last Updated**: 2025-10-16
**Version**: 2.0.0
**Status**: Active Development

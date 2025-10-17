# CLAUDE.md - AI Development Context

> This file provides context for AI assistants (Claude, GPT, etc.) working on the Somnia Agent Kit project.

---

## Project Overview

**Somnia Agent Kit** is a TypeScript SDK for building, deploying, and managing autonomous AI agents on the Somnia blockchain network.

### Key Features
- 🔗 **Blockchain Integration**: Ethers.js-based client for Somnia Network smart contracts
- 🤖 **Agent Runtime**: Full lifecycle management, planning, and execution orchestration
- 🧠 **LLM Support**: Provider-agnostic adapters (OpenAI, Ollama) for AI reasoning
- 📊 **Monitoring**: Built-in metrics, logging (Pino), event recording, and telemetry
- 🛠️ **CLI Tools**: Command-line interface for agent deployment and management
- 🔄 **Event-Driven**: Trigger system (blockchain events, intervals, webhooks)
- 💾 **Persistence**: File and memory-based storage for agent state and history

### Quick Start
```bash
pnpm install
pnpm build
pnpm test
```

See `/docs/quickstart.md` for detailed setup instructions.

---

## Architecture

### Monorepo Structure

```
somnia-agent-kit/
│
├── 📄 Root Configuration
│   ├── package.json              # Monorepo root with pnpm workspaces
│   ├── pnpm-workspace.yaml       # Workspace configuration
│   ├── tsconfig.json             # Root TypeScript config
│   ├── .env.example              # Environment template
│   └── CLAUDE.md                 # This file
│
├── 📦 packages/
│   └── agent-kit/                # Main SDK package
│       ├── package.json          # With tsup, vitest, ethers
│       ├── tsconfig.json         # Strict TypeScript config
│       ├── tsup.config.ts        # Build config (ESM + CJS + DTS)
│       ├── vitest.config.ts      # Test configuration
│       │
│       └── src/                  # 62 TypeScript files, 8 modules
│           ├── version.ts        # SDK version tracking
│           ├── index.ts          # Main exports
│           │
│           ├── core/             # Blockchain layer (5 files)
│           ├── runtime/          # Agent orchestration (8 files)
│           ├── llm/              # AI reasoning (11 files)
│           ├── utils/            # Common utilities (5 files)
│           ├── config/           # Configuration (7 files)
│           ├── types/            # Type definitions (11 files)
│           ├── monitor/          # Monitoring & telemetry (6 files)
│           └── cli/              # CLI tools (6 files)
│
├── ⚙️ contracts/                 # Smart contracts workspace
│   ├── contracts/                # Solidity contracts
│   ├── scripts/                  # Deployment scripts
│   ├── test/                     # Contract tests
│   └── typechain-types/          # Generated TypeScript types
│
├── 🔧 scripts/                   # Build and utility scripts
└── 📚 docs/                      # Documentation

```

### Build System

**Build Tool**: [tsup](https://tsup.egoist.dev/) with triple output format
- **ESM** (`dist/index.mjs`) - ~304 KB - Modern module format
- **CJS** (`dist/index.js`) - ~308 KB - Node.js compatibility
- **DTS** (`dist/index.d.ts`) - ~196 KB - TypeScript declarations

**Build Commands**:
```bash
pnpm build          # Build all packages
pnpm test           # Run tests with vitest
pnpm dev            # Watch mode
```

### Module Organization

```
Core Modules (8):
├── core/       → Blockchain interaction (ChainClient, contracts, signers)
├── runtime/    → Agent orchestration (lifecycle, planning, execution)
├── llm/        → AI reasoning (adapters, prompts, context, planning)
├── utils/      → Shared utilities (retry, encoding, validation, logging)
├── config/     → Configuration management (defaults, env, networks)
├── types/      → TypeScript type definitions
├── monitor/    → Observability (metrics, logging, telemetry, dashboard)
└── cli/        → Command-line interface
```

---

## Module Reference

### 1. core/ - Blockchain Layer

**Status**: ✅ 5 files

**Files**:
- `chainClient.ts` - Blockchain client with ethers.js provider/signer
- `contracts.ts` - Smart contract wrappers with Typechain
- `signerManager.ts` - Wallet and transaction signing
- `config.ts` - Network configuration and defaults
- `index.ts` - Module exports

**Key Exports**:
- **ChainClient**: Blockchain connection manager
  - `connect(rpcUrl, chainId)` - Connect to network
  - `sendTransaction(tx)` - Send and wait for transaction
  - `getContract(address, abi)` - Create contract instance
  - `on(event, handler)` - Listen to blockchain events
  - `getBlockNumber()`, `getGasPrice()`, `getBalance(address)`

- **SignerManager**: Transaction signing
  - `fromPrivateKey(key)` - Create from private key
  - `fromMnemonic(phrase)` - Create from mnemonic
  - `sendTx(to, data, value)` - Send transaction with receipt
  - `estimateGas(tx)` - Estimate gas cost

- **SomniaContracts**: Contract instances
  - `registry` - AgentRegistry contract
  - `executor` - AgentExecutor contract
  - `manager` - AgentManager contract
  - `vault` - AgentVault contract

**Example**:
```typescript
import { ChainClient, SignerManager } from '@somnia/agent-kit/core';

const client = new ChainClient(rpcUrl, chainId);
await client.connect();

const signer = SignerManager.fromPrivateKey(privateKey);
const contracts = SomniaContracts.fromChainClient(client);

// Register agent on-chain
const tx = await contracts.registry.registerAgent(metadata);
await tx.wait();
```

---

### 2. runtime/ - Agent Orchestration

**Status**: ✅ 8 files

**Files**:
- `agent.ts` - Main agent orchestrator with lifecycle management
- `planner.ts` - Task planning (rule-based and LLM-powered)
- `executor.ts` - Action execution engine
- `trigger.ts` - Event triggers (blockchain, interval, webhook)
- `memoryManager.ts` - Agent memory and state management
- `policy.ts` - Guards and access control
- `storage.ts` - Event and action persistence (memory/file)
- `index.ts` - Module exports

**Key Exports**:
- **Agent**: Full orchestrator
  - Lifecycle: `Created → Registered → Active → Paused → Stopped → Terminated`
  - Methods: `start()`, `stop()`, `pause()`, `resume()`, `terminate()`
  - `registerTrigger(trigger)` - Add event source
  - `getTriggerModule()`, `getPlannerModule()`, `getExecutorModule()` - Access modules
  - Event-driven: Trigger → Plan → Execute → Store

- **Planner Types**:
  - `RulePlanner` - Rule-based decomposition for common tasks
  - `LLMPlanner` - AI-powered planning with OpenAI/Ollama
  - Interface: `plan(goal, context): Promise<Action[]>`

- **Executor**: Action execution
  - `execute(action)` - Single action execution
  - `executeAll(actions)` - Batch execution (parallel/sequential)
  - Dry-run mode for testing
  - Built-in handlers: validate_address, check_balance, execute_transfer, estimate_gas, etc.

- **Trigger Types**:
  - `OnChainTrigger` - Blockchain event listening
  - `IntervalTrigger` - Time-based execution
  - `WebhookTrigger` - HTTP endpoint with signature verification

- **Storage**:
  - `MemoryStorage` - In-memory (for testing)
  - `FileStorage` - JSON file persistence (events.json, actions.json)

**Example**:
```typescript
import { Agent, RulePlanner, Executor, IntervalTrigger } from '@somnia/agent-kit/runtime';

const agent = new Agent({
  name: 'MyAgent',
  description: 'Autonomous trading agent',
  capabilities: ['transfer', 'swap']
});

const planner = new RulePlanner();
const executor = new Executor(chainClient, contracts);
const trigger = new IntervalTrigger(60000); // 1 minute

agent.registerTrigger(trigger);
await agent.start();
```

---

### 3. llm/ - AI Reasoning

**Status**: ✅ 11 files (3 adapters/ + 3 prompt/ + 5 root)

**Structure**:
```
llm/
├── adapters/              # LLM provider integrations
│   ├── openaiAdapter.ts   # OpenAI GPT integration
│   ├── ollamaAdapter.ts   # Local Ollama integration
│   └── index.ts
├── prompt/                # Prompt management
│   ├── templates.ts       # Built-in prompt templates
│   ├── builder.ts         # Dynamic prompt construction
│   └── index.ts
├── memory.ts              # LLM memory management
├── context.ts             # Context building for LLM (moved from runtime/)
├── planner.ts             # LLM-powered task planning
├── reasoning.ts           # Multi-step reasoning logic
└── index.ts
```

**Key Exports**:

#### Adapters
All adapters implement unified `LLMAdapter` interface:
```typescript
interface LLMAdapter {
  name: string;
  generate(input: string, options?: GenerateOptions): Promise<LLMResponse>;
  chat?(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  embed?(text: string, model?: string): Promise<number[]>;
  testConnection?(): Promise<boolean>;
}
```

- **OpenAIAdapter**: OpenAI GPT models (gpt-3.5-turbo, gpt-4, gpt-4-turbo)
  - Token tracking, retry logic, streaming support
  - `generate(prompt)`, `chat(messages)`, `embed(text)`

- **OllamaAdapter**: Local Ollama models (llama2, mistral, etc.)
  - Same interface as OpenAI for easy switching
  - No API key required, runs locally

#### Prompt Management
- **Templates**: Pre-built prompts (action_planner, blockchain_analyzer, event_handler, etc.)
- **Builder**: Dynamic prompt construction with variable substitution
  - `buildPrompt(template, variables)` - Compile prompt from template
  - Handlebars-style syntax: `{{variable}}`, `{{#if condition}}...{{/if}}`

#### Planning & Reasoning
- **LLMTaskPlanner**: AI-powered task decomposition
  - `planWithReason(goal, context)` - Returns ActionPlan[] with reasoning
  - `plan(goal, context)` - Returns Action[] for backward compatibility
  - Configurable: temperature, max tokens, strict validation

- **MultiStepReasoner**: Chain-of-thought reasoning
  - `chainOfThought(problem)` - Multi-step reasoning trace
  - `explainDecision(action, context)` - Explain why action is chosen
  - Quality evaluation for reasoning traces

- **ContextBuilder**: Aggregate chain state, memory, and config for LLM
  - `buildContext(options)` - Create unified AgentContext
  - `formatContext(context)` - Format for LLM consumption
  - Cached chain state (2-second TTL)

**Example**:
```typescript
import { OpenAIAdapter, LLMTaskPlanner, buildPrompt } from '@somnia/agent-kit/llm';

// Setup adapter
const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });

// Use planner
const planner = new LLMTaskPlanner(llm, {
  temperature: 0.3,
  strictValidation: true
});

const plans = await planner.planWithReason('Send 1 ETH to Alice');
// Returns: ActionPlan[] with type, params, reason, dependencies
```

---

### 4. utils/ - Common Utilities

**Status**: ✅ 5 files (extracted from core/utils.ts in v2.2.0)

**Files**:
- `retry.ts` - Retry logic with exponential backoff
- `encode.ts` - Encoding/decoding (hex, bytes, UTF-8, keccak256)
- `validate.ts` - Validation helpers (addresses, data formats)
- `logger.ts` - Logging utilities and EventEmitter
- `index.ts` - Module exports

**Key Exports**:
- **Async Utilities**:
  - `sleep(ms)` - Promise-based delay
  - `retry(fn, maxRetries, delayMs)` - Retry with exponential backoff
  - `delay(ms)` - Alias for sleep
  - `timeout(promise, ms)` - Add timeout to promise

- **Encoding/Decoding**:
  - `toHex(value)`, `fromHex(hex)` - Hex conversion
  - `bytesToHex(bytes)`, `hexToBytes(hex)` - Byte array conversion
  - `toUtf8Bytes(str)`, `toUtf8String(bytes)` - UTF-8 encoding
  - `keccak256(data)` - Keccak-256 hashing
  - `formatEther(wei)`, `parseEther(eth)` - Ether conversion
  - `formatUnits(value, decimals)`, `parseUnits(value, decimals)` - Token conversion

- **Validation**:
  - `isValidAddress(address)` - Validate Ethereum address (0x + 40 hex chars)
  - `shortAddress(address, chars)` - Shorten address for display (0x1234...5678)

- **EventEmitter**: Type-safe event system
  - `on(event, listener)` - Subscribe to event
  - `once(event, listener)` - Subscribe once
  - `off(event, listener)` - Unsubscribe
  - `emit(event, data)` - Emit event
  - `removeAllListeners()` - Clear all

**Example**:
```typescript
import { retry, isValidAddress, formatEther } from '@somnia/agent-kit/utils';

// Retry with backoff
const balance = await retry(() => client.getBalance(address), 3, 1000);

// Validate address
if (!isValidAddress(userInput)) {
  throw new Error('Invalid address');
}

// Format balance
console.log(`Balance: ${formatEther(balance)} ETH`);
```

---

### 5. config/ - Configuration Management

**Status**: ✅ 7 files

**Files**:
- `defaults.ts` - Default configuration values
- `env.ts` - Environment variable parsing
- `loader.ts` - Config loading and merging
- `merger.ts` - Deep merge utility
- `networks.ts` - Network presets (mainnet, testnet, devnet)
- `validator.ts` - Config validation
- `index.ts` - Module exports

**Key Exports**:
- `loadConfig(userConfig?)` - Load and merge configuration
- `loadFromEnv()` - Parse environment variables
- `createConfigFromEnv()` - Quick setup from .env
- `DEFAULT_CONFIG` - Default values
- `NETWORK_CONFIGS` - Network presets

**Config Structure**:
```typescript
{
  network: { rpcUrl, chainId, name },
  llm: { provider, apiKey, model, baseUrl },
  runtime: { maxConcurrent, dryRun, memoryLimit, storageBackend },
  monitoring: { enabled, logLevel, metricsEnabled },
  contracts: { registry, executor, manager, vault }
}
```

---

### 6. types/ - Type Definitions

**Status**: ✅ 11 files

**Files**:
- `agent.ts` - Agent configuration and state types
- `action.ts` - Action and ActionPlan types
- `chain.ts` - Blockchain-related types
- `config.ts` - Configuration types
- `llm.ts` - LLM adapter and response types
- `memory.ts` - Memory backend types
- `monitor.ts` - Metrics and logging types
- `storage.ts` - Storage interface types
- `trigger.ts` - Trigger types
- `common.ts` - Shared utility types
- `index.ts` - Central exports
(11 files total)

**Key Types**:
- `AgentConfig` - Agent configuration
- `AgentState` - Agent lifecycle state
- `Action` - Basic action (type + params)
- `ActionPlan` - Enhanced action with reason, dependencies, metadata
- `LLMAdapter` - LLM provider interface
- `IStorage` - Storage interface (saveEvent, saveAction, getHistory)
- `ITrigger` - Trigger interface (start, stop, isRunning)
- `IPlanner` - Planner interface (plan)

---

### 7. monitor/ - Monitoring & Observability

**Status**: ✅ 6 files

**Files**:
- `logger.ts` - Pino-based logging with levels
- `metrics.ts` - Performance metrics collection
- `eventRecorder.ts` - Event tracking and recording
- `telemetry.ts` - Remote observability (OpenTelemetry-compatible)
- `dashboard.ts` - Development UI for monitoring
- `index.ts` - Module exports

**Key Exports**:
- **Logger**: Pino-based with levels (debug, info, warn, error, fatal)
- **Metrics**: Performance tracking (execution time, success rate, gas usage)
- **EventRecorder**: Track agent events for analysis
- **Telemetry**: Export metrics to remote observability platforms

---

### 8. cli/ - Command-Line Interface

**Status**: ✅ 6 files (cli.ts + commands/ subfolder)

**Structure**:
```
cli/
├── commands/
│   ├── create.ts   # Create new agent project
│   ├── deploy.ts   # Deploy agent to blockchain
│   └── start.ts    # Start agent runtime
├── cli.ts          # Main CLI entry
├── parser.ts       # Argument parsing
└── index.ts
```

**Commands**:
- `agent-kit create <name>` - Scaffold new agent project
- `agent-kit deploy` - Deploy agent contracts and register on-chain
- `agent-kit start` - Start agent runtime with monitoring

---

## Smart Contracts

### Contract Overview

**Location**: `/contracts/contracts/`

**Core Contracts** (Solidity 0.8.20):
1. **AgentRegistry.sol** - Agent registration and metadata
   - `registerAgent(metadata)` - Register new agent
   - `updateAgent(agentId, metadata)` - Update agent info
   - `getAgent(agentId)` - Retrieve agent details
   - Events: `AgentRegistered`, `AgentUpdated`

2. **AgentExecutor.sol** - Task execution and validation
   - `executeTask(taskId)` - Execute approved task
   - Task validation and status tracking

3. **AgentManager.sol** - Task queue and lifecycle
   - `createTask(agentId, data)` - Create new task
   - Task queue management
   - Payment escrow

4. **AgentVault.sol** - Fund management
   - `deposit()` - Deposit funds for agent
   - `withdraw(amount)` - Withdraw funds
   - Balance tracking per agent

5. **BaseAgent.sol** - Base implementation
   - Common functionality for agent contracts

6. **IAgent.sol** - Agent interface
   - Standard interface for all agents

### Deployment

```bash
cd contracts
pnpm hardhat compile
pnpm hardhat test
pnpm hardhat deploy --network testnet
```

**Typechain Types**: Auto-generated in `contracts/typechain-types/` (54 files)

---

## Development Guide

### Code Style

**TypeScript Configuration**:
- Strict mode enabled (`strict: true`)
- ESNext target with ES2020 lib
- Explicit return types for public APIs

**Naming Conventions**:
- **Variables/Functions**: camelCase (`getUserBalance`, `maxRetries`)
- **Classes/Interfaces**: PascalCase (`ChainClient`, `LLMAdapter`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_GAS_LIMIT`, `SDK_VERSION`)
- **Files**: camelCase for modules (`chainClient.ts`, `memoryManager.ts`)

**Exports**:
- Prefer named exports (no default exports except main index)
- Group exports in `index.ts` files
- Re-export types when needed for convenience

**Async Patterns**:
- Use async/await (avoid callbacks)
- Handle errors explicitly with try/catch
- Always throw typed errors with clear messages

### File Organization

```typescript
/**
 * Module description
 * @packageDocumentation
 */

// External imports
import { ethers } from 'ethers';

// Internal imports
import type { Config } from '../types';
import { logger } from '../utils';

// Types and Interfaces
export interface MyInterface {
  // ...
}

// Constants
export const DEFAULT_VALUE = 100;

// Main Class
export class MyClass {
  // Private fields
  private readonly config: Config;

  // Constructor
  constructor(config: Config) {
    this.config = config;
  }

  // Public methods
  public async doSomething(): Promise<void> {
    // Implementation
  }

  // Private methods
  private validateInput(input: string): boolean {
    // Implementation
  }
}

// Helper functions
export function helperFunction(): void {
  // Implementation
}
```

### Testing

**Test Framework**: Vitest with coverage

**Test Structure**:
- Unit tests: `*.test.ts` next to source files
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

**Testing Guidelines**:
- Mock external dependencies (blockchain, LLMs, file system)
- Test error cases and edge conditions
- Aim for 80% coverage minimum
- Use descriptive test names: `it('should throw error when address is invalid')`

**Run Tests**:
```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
pnpm test:coverage     # With coverage report
```

### Common Patterns

**Error Handling**:
```typescript
import { logger } from '@somnia/agent-kit/utils';

try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new Error(`Failed to execute: ${error.message}`);
}
```

**Retry Logic**:
```typescript
import { retry } from '@somnia/agent-kit/utils';

const result = await retry(
  async () => await unstableOperation(),
  3,      // max retries
  1000    // initial delay (ms)
);
```

**Configuration Loading**:
```typescript
import { loadConfig } from '@somnia/agent-kit/config';

const config = loadConfig({
  network: {
    rpcUrl: process.env.SOMNIA_RPC_URL,
    chainId: 50312
  }
});
```

---

## Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| **Network** | | |
| `SOMNIA_RPC_URL` | RPC endpoint URL | `https://dream-rpc.somnia.network` |
| `SOMNIA_CHAIN_ID` | Chain ID (50311=mainnet, 50312=testnet) | `50312` |
| `PRIVATE_KEY` | Deployer/agent private key | - |
| **Contracts** | | |
| `AGENT_REGISTRY_ADDRESS` | AgentRegistry contract address | - |
| `AGENT_EXECUTOR_ADDRESS` | AgentExecutor contract address | - |
| `AGENT_MANAGER_ADDRESS` | AgentManager contract address | - |
| `AGENT_VAULT_ADDRESS` | AgentVault contract address | - |
| **LLM (Optional)** | | |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | OpenAI model name | `gpt-3.5-turbo` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama2` |
| **SDK Configuration** | | |
| `SDK_DEBUG` | Enable debug mode | `false` |
| `SDK_LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `SDK_LLM_PROVIDER` | Default LLM provider (openai/ollama) | `openai` |
| `SDK_DEFAULT_TIMEOUT` | Request timeout (ms) | `30000` |
| `SDK_MAX_RETRIES` | Max retry attempts | `3` |
| **Runtime Configuration** | | |
| `RUNTIME_DRY_RUN` | Enable dry-run mode (no transactions) | `false` |
| `RUNTIME_STORAGE_BACKEND` | Storage backend (memory/file) | `memory` |
| `RUNTIME_STORAGE_PATH` | Storage directory path | `./data/storage` |
| `RUNTIME_MEMORY_BACKEND` | Memory backend (memory/file) | `memory` |
| `RUNTIME_MEMORY_PATH` | Memory directory path | `./data/memory` |
| **Advanced** | | |
| `DEFAULT_GAS_LIMIT` | Default gas limit | `3000000` |
| `METRICS_ENABLED` | Enable metrics collection | `true` |

### Key Concepts

**Agent Lifecycle**:
```
Create → Register → Active → Paused → Stopped → Terminated
                       ↓
                    Execute
```

**Task Execution Flow**:
```
Trigger → Plan → Validate → Execute → Record → Store
```

**On-chain vs Off-chain**:
- **On-chain**: Agent metadata, ownership, task registry, payments, metrics
- **Off-chain**: AI computation, complex planning, temporary state, private data

**Action Types**:
- `validate_address` - Check if address is valid
- `check_balance` - Get account balance
- `execute_transfer` - Transfer ETH/tokens
- `get_quote` - Get swap quote
- `approve_token` - Approve token spending
- `execute_swap` - Execute token swap
- `validate_contract` - Check contract exists
- `estimate_gas` - Estimate gas cost
- `call_contract` - Call contract method
- `deploy_contract` - Deploy new contract
- `query_data` - Query blockchain data
- `no_action` - Observation only

### Debugging Tips

**Common Issues**:

1. **"Contract not connected"**
   - Solution: Ensure `ChainClient.connect()` is called before contract access

2. **"Insufficient funds"**
   - Solution: Check wallet balance with `getBalance()`, ensure gas + value covered

3. **"Invalid action type"**
   - Solution: Use ActionType enum or check supported types in executor.ts

4. **"LLM request timeout"**
   - Solution: Increase `SDK_DEFAULT_TIMEOUT` or use faster model

5. **"Transaction reverted"**
   - Solution: Check contract state, validate inputs, ensure approvals

6. **"Plan parsing failed"**
   - Solution: Enable `strictValidation: false` or check LLM response format

**Enable Debug Logging**:
```bash
SDK_LOG_LEVEL=debug pnpm start
```

**Dry-Run Mode** (test without transactions):
```typescript
const executor = new Executor(chainClient, contracts, {
  dryRun: true
});
```

### Version History

**v2.2.0** (Current) - Structural Reorganization
- ✅ New `utils/` module (5 files) extracted from `core/utils.ts`
- ✅ Reorganized `llm/` with `adapters/` and `prompt/` subfolders
- ✅ New files: `version.ts`, `llm/planner.ts`, `llm/reasoning.ts`
- ✅ Renamed `runtime/memory.ts` → `runtime/memoryManager.ts`
- ✅ Moved `runtime/context.ts` → `llm/context.ts` (LLM-specific)
- ✅ Enhanced `config/` to 7 files (env, loader, merger, networks, validator)
- ✅ Enhanced `cli/` with `commands/` subfolder
- ✅ Build: ESM 303.66 KB, CJS 308.33 KB, DTS 195.76 KB

**v2.0.0** - Initial stable release
- Core blockchain integration
- Agent runtime with full lifecycle
- LLM support (OpenAI, Ollama)
- Monitoring and CLI tools

---

## Notes for AI Assistants

### When Implementing Features

1. **Check existing patterns** in relevant modules (core/, runtime/, llm/)
2. **Follow TypeScript strict typing** - explicit types for public APIs
3. **Add JSDoc comments** for all exported functions/classes
4. **Export through index.ts** for module organization
5. **Handle errors explicitly** with typed errors and clear messages
6. **Write tests** alongside implementation

### When Working with Contracts

1. **Follow Solidity 0.8.20** syntax
2. **Use OpenZeppelin** libraries when applicable
3. **Add NatSpec comments** for all public functions
4. **Consider gas optimization** (storage access, loops, etc.)
5. **Emit events** for all state changes
6. **Write comprehensive tests** with edge cases

### When Adding Dependencies

1. **Add to appropriate package.json** (root vs workspace)
2. **Check bundle size impact** with `pnpm build`
3. **Prefer well-maintained packages** with active development
4. **Document why dependency is needed** in commit message

### Module Boundaries

- **core/**: Only blockchain interaction (no AI, no agent logic)
- **runtime/**: Agent orchestration (uses core/, may use llm/)
- **llm/**: AI reasoning only (no blockchain calls directly)
- **utils/**: Shared utilities (no dependencies on other modules)
- **config/**: Configuration only (pure data transformation)
- **types/**: Type definitions only (no implementation)
- **monitor/**: Observability only (side effects, no business logic)
- **cli/**: User interface only (composes other modules)

### Current Focus Areas

- ✅ Core functionality stable
- ✅ LLM integration complete
- 🚧 Testing coverage improvements needed
- 🚧 Documentation examples expansion
- 🚧 Performance optimization (caching, batching)
- 🚧 Advanced triggers (price alerts, ML predictions)

---

## References

- **Somnia Network**: https://somnia.network
- **Ethers.js**: https://docs.ethers.org/v6/
- **OpenAI API**: https://platform.openai.com/docs/api-reference
- **Ollama**: https://ollama.ai/
- **Typechain**: https://github.com/dethcrypto/TypeChain
- **Tsup**: https://tsup.egoist.dev/
- **Vitest**: https://vitest.dev/

---

**Last Updated**: v2.2.0 (October 2025)
**Total Lines**: ~1150 (reduced from 2828)
**Maintained By**: Somnia Agent Kit Team

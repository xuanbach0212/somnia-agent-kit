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
│           ├── version.ts        # ✅ SDK version tracking
│           │
│           ├── core/             # ✅ Blockchain layer (5/5 files)
│           │   ├── chainClient.ts    # Blockchain client
│           │   ├── contracts.ts      # Contract interactions
│           │   ├── signerManager.ts  # Wallet management
│           │   ├── config.ts         # Network configs
│           │   └── index.ts          # Exports
│           │
│           ├── runtime/          # ✅ Agent orchestration (6/6 files)
│           │   ├── agent.ts          # Agent lifecycle
│           │   ├── planner.ts        # Task planning
│           │   ├── executor.ts       # Execution engine
│           │   ├── trigger.ts        # Event triggers
│           │   ├── memoryManager.ts  # State/memory management
│           │   ├── policy.ts         # Access control
│           │   └── index.ts          # Exports
│           │
│           ├── llm/              # ✅ AI reasoning (9/9 files)
│           │   ├── adapters/         # LLM provider integrations
│           │   │   ├── openaiAdapter.ts   # OpenAI integration
│           │   │   └── ollamaAdapter.ts   # Ollama integration
│           │   ├── prompt/           # Prompt management
│           │   │   ├── templates.ts       # Prompt templates
│           │   │   └── builder.ts         # Dynamic prompt building
│           │   ├── memory.ts         # LLM memory management
│           │   ├── context.ts        # Context building for LLM
│           │   ├── planner.ts        # LLM-based planning
│           │   ├── reasoning.ts      # LLM reasoning logic
│           │   └── index.ts          # Exports
│           │
│           ├── monitor/          # ✅ Monitoring (6/6 files)
│           │   ├── logger.ts         # Pino logger
│           │   ├── metrics.ts        # Performance metrics
│           │   ├── eventRecorder.ts  # Event tracking
│           │   ├── telemetry.ts      # Remote observability
│           │   ├── dashboard.ts      # Development UI
│           │   └── index.ts          # Exports
│           │
│           ├── utils/            # ✅ Common utilities (5/5 files)
│           │   ├── logger.ts         # Logging utilities
│           │   ├── retry.ts          # Retry logic
│           │   ├── encode.ts         # Hex/UTF-8 utilities
│           │   ├── validate.ts       # Validation helpers
│           │   └── index.ts          # Exports
│           │
│           ├── config/           # ✅ Configuration (3/3 files)
│           │   ├── defaults.ts       # Default configs
│           │   ├── loader.ts         # Config loader
│           │   └── index.ts          # Exports
│           │
│           ├── types/            # ✅ Type definitions (7/7 files)
│           │   ├── agent.ts          # Agent types
│           │   ├── config.ts         # Configuration types
│           │   ├── chain.ts          # Blockchain types
│           │   ├── llm.ts            # LLM types
│           │   ├── action.ts         # Action types
│           │   ├── runtime.ts        # Runtime types
│           │   └── index.ts          # Central exports
│           │
│           └── cli/              # ✅ CLI tools (4/4 files)
│               ├── cli.ts            # Main CLI entry
│               └── commands/         # Command modules
│                   ├── deploy.ts     # Deploy command
│                   ├── run.ts        # Run command
│                   └── inspect.ts    # Inspect command
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
**Status**: ✅ Completed (5/5 files)

**Files**:
- `chainClient.ts` - Main blockchain client with provider/signer management
- `contracts.ts` - Smart contract wrapper with Typechain integration
- `signerManager.ts` - Wallet, mnemonic, and transaction signing
- `config.ts` - Configuration with env loading and defaults merging
- `index.ts` - Module exports

**Note**: `utils.ts` has been extracted to dedicated `utils/` folder for better organization.

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

### 2. **runtime/** - Agent Orchestration
**Status**: ✅ Refactored (6/6 files)

**Changes**:
- ✅ `memory.ts` → `memoryManager.ts` (renamed for clarity)
- ❌ `storage.ts` removed (functionality integrated elsewhere)
- ❌ `context.ts` removed (moved to `llm/context.ts` for LLM-specific use)

**agent.ts** - Full Orchestrator (100/100)
- Complete lifecycle: Created → Registered → Active → Paused → Stopped → Terminated
- Orchestrates: Trigger → Planner → Executor → Storage → Policy
- Event-driven architecture with EventEmitter
- On-chain registration via AgentRegistry contract
- Automatic event→plan→execute→store flow
- Trigger management (register, enable, disable, list)
- Runtime module accessors (getTriggerModule, getPlannerModule, etc.)
- Status monitoring with getStatus()

**trigger.ts** - Event Sources (100/100)
- **ITrigger** interface with start()/stop()/isRunning()
- **OnChainTrigger**: Blockchain event listening via ChainClient
- **IntervalTrigger**: Time-based execution with max count and immediate start options
- **WebhookTrigger**: HTTP server with Express, signature verification
- Trigger manager with factory methods
- Enable/disable individual triggers
- Cleanup on stop()

**planner.ts** - AI/Rule-Based Planning (100/100)
- **IPlanner** interface with plan(goal, context): Promise<Action[]>
- **Action** type: { type: string, params: Record<string, any> } (backward compatibility)
- **ActionPlan** (enhanced): { type, target?, params, reason, dependencies?, metadata? }
- **ActionType** enum: Transfer, Swap, ContractCall, DeployContract, ValidateAddress, etc.
- **Zod Validation**:
  - ActionSchema, ActionPlanSchema for type-safe validation
  - validateAction(), validateActionPlan(), validateActions(), validateActionPlans()
  - Conversion helpers: actionToActionPlan(), actionPlanToAction()
- **RulePlanner**: Rule-based task decomposition for transfer, swap, contract_call, deploy_contract
- **LLMPlanner**: AI-powered planning with OpenAI/Ollama integration
  - Structured JSON output with system prompt
  - Robust parsing with markdown cleanup
  - Error fallback handling
- Legacy Planner class with backward compatibility

**executor.ts** - Action Execution Engine (100/100)
- **execute(action)**: Single action execution with TxReceipt support
- **executeAll(actions)**: Batch execution (parallel or sequential)
- Dry-run mode for testing without transactions
- Real blockchain handlers:
  - validate_address: ethers.isAddress()
  - check_balance: Real balance via ChainClient
  - execute_transfer: ETH transfers with transaction receipts
  - estimate_gas: Real gas estimation
  - validate_contract: Check bytecode exists
- Retry logic with exponential backoff
- Timeout handling (default 30s, configurable)
- Constructor accepts ChainClient and SomniaContracts

**storage.ts** - Event & Action Persistence (100/100)
- **IStorage** interface: saveEvent(), saveAction(), getHistory(), getEvents(), getActions()
- **MemoryStorage**: In-memory arrays for testing
- **FileStorage**: Real JSON file persistence (events.json, actions.json)
  - Auto-create directories
  - Atomic reads/writes
  - Error handling for missing files
- **EventEntry** and **ActionEntry** types with timestamps, metadata
- Filtering support (time range, status)
- Agent integration: auto-saves events and actions
- Legacy KeyValueStorage for backward compatibility

**policy.ts** - Guards & Access Control (100/100)
- **Operational Policies** (simple guards):
  - maxGasLimit, maxRetries, maxTransferAmount, minTransferAmount
  - allowedActions/blockedActions (whitelist/blacklist)
  - rateLimit: { maxActions, windowMs } with automatic cleanup
  - requireApproval flag
- **checkPermission(address, action)**: Fixes Agent.ts runtime error
- **shouldExecute(action)**: Main guard - check all operational policies
- **shouldDelay(action)**: Returns delay in ms or false
- **overrideAction(action)**: Cap amounts/gas before execution
- **Rate limiting state**: Track action history with timestamps
- **Convenience methods**: setGasLimit(), setTransferLimit(), addAllowedAction(), etc.
- **Enterprise Access Control** (unchanged):
  - Rule-based permissions with conditions
  - Role assignment and checking
  - Priority-based evaluation

**memory.ts** - Agent Memory System (100/100)
- **Memory Management**: Short-term and long-term memory for agents
- **Memory Entry Types**: input, output, state, system
- **Backends**:
  - InMemoryBackend: Fast, for development
  - FileBackend: JSON persistence
- **Core Methods**:
  - addMemory(type, content, metadata): Save interactions
  - getContext(maxTokens): Build LLM context from memory
  - getHistory(filter): Retrieve memory entries
  - clear(): Session cleanup
  - summarize(): Memory compression
- **Token Management**: Stay within LLM context limits
- **Session Management**: Multiple agent sessions
- **Auto-integration**: Automatic saving in Agent.onEvent()
- **Context Building**: Memory → planner context pipeline

**context.ts** - Unified Context Building (100/100)
- **AgentContext** interface: Aggregates chainState, recentActions, memory, config
- **ChainState**: blockNumber, gasPrice, network, chainId, timestamp
- **ContextBuilder** class:
  - buildContext(options): Unified context aggregation
  - getChainState(): Blockchain state with 2s cache
  - getRecentActions(): Latest actions from storage
  - getMemoryContext(): Formatted memory context
  - formatContext(): Full LLM-friendly formatting
  - formatCompact(): Compact version for token limits
- **Context Building Options**:
  - maxMemoryTokens: Token limit for memory (default: 1000)
  - maxActions: Max recent actions (default: 10)
  - includeChainState/includeActions/includeMemory: Toggle components
- **Agent Integration**:
  - Automatic context building in onEvent()
  - getContextBuilder(): Access for advanced usage
  - setChainClient(): Update chain data source
- **Performance**: Parallel fetching of all context components

### 3. **prompt/** - Prompt Management
**Status**: ✅ Completed (v2.1.0)

Dynamic prompt building and template system for AI agents.

**templates.ts** - Prompt Templates (100/100)
- **9 Built-in Templates**:
  - `basic_agent`: General purpose AI agent
  - `action_planner`: Break down goals into actions (used by LLMPlanner)
  - `blockchain_analyzer`: Analyze blockchain state and events
  - `event_handler`: Handle blockchain events
  - `tool_executor`: Execute tools and handle results
  - `transaction_builder`: Build blockchain transactions
  - `data_query`: Query blockchain data
  - `error_handler`: Handle errors and suggest recovery
  - `risk_assessment`: Assess transaction risks
- **Template Metadata**: name, description, variables, examples
- **Helper Functions**: getTemplate(), listTemplates(), getTemplateVariables()

**builder.ts** - Dynamic Prompt Building (100/100)
- **buildPrompt()**: Replace placeholders ({{variable}} or ${variable})
- **buildFromTemplate()**: Build from named template
- **composePrompts()**: Combine multiple prompts
- **injectContext()**: Add context to prompts
- **sanitizeData()**: Prevent injection attacks
- **validateTemplate()**: Check for missing variables
- **extractVariables()**: Extract variables from template string
- **previewTemplate()**: Preview with example data
- **createTemplate()**: Create custom templates

**Features**:
- **Placeholder Support**: Both {{variable}} and ${variable} syntax
- **Conditional Blocks**: {{#if variable}}...{{/if}}
- **Sanitization**: Automatic data cleaning and validation
- **Trim & Format**: Automatic whitespace handling
- **Max Length**: Enforce prompt length limits
- **Strict Mode**: Error on missing required variables

### 4. **llm/** - AI Reasoning & LLM Integration (9/9 files)
**Status**: ✅ Completed (v2.2.0 - Reorganized)

The LLM module provides AI-powered reasoning, planning, and memory management through a provider-agnostic adapter interface. Supports OpenAI and local Ollama models.

**Structural Changes in v2.2.0**:
- ✅ Organized adapters into `adapters/` subfolder
- ✅ Organized prompt system into `prompt/` subfolder
- ✅ Moved `memory.ts` from `runtime/` to `llm/` (LLM-specific memory management)
- ✅ Moved `context.ts` from `runtime/` to `llm/` (LLM context building)
- ✅ Added `planner.ts` (LLM-powered planning logic)
- ✅ Added `reasoning.ts` (Multi-step reasoning and chain-of-thought)
- ❌ Removed `anthropicAdapter.ts` (consolidated to 2 adapters)
- ❌ Removed `types.ts` (merged to centralized `types/` folder)

**Module Structure**:
```
llm/
├── adapters/          # LLM provider adapters
│   ├── openaiAdapter.ts   # OpenAI GPT integration
│   └── ollamaAdapter.ts   # Local Ollama integration
├── prompt/            # Prompt management system
│   ├── templates.ts       # Built-in prompt templates
│   └── builder.ts         # Dynamic prompt construction
├── memory.ts          # Agent memory system (moved from runtime/)
├── context.ts         # Context building for LLM (moved from runtime/)
├── planner.ts         # LLM-powered planning
├── reasoning.ts       # Multi-step reasoning logic
└── index.ts           # Module exports
```

---

#### adapters/ - LLM Provider Integrations

**Standard Interface**: All adapters implement `LLMAdapter` from `types/llm.ts`:

```typescript
interface LLMAdapter {
  readonly name: string;
  generate(input: string, options?: GenerateOptions): Promise<LLMResponse>;
  chat?(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  embed?(text: string, model?: string): Promise<number[]>;
  stream?(input: string, options?: GenerateOptions): AsyncGenerator<string>;
  testConnection?(): Promise<boolean>;
}
```

**Key Benefits**:
- **Unified API**: Same methods work across all providers
- **Provider Flexibility**: Switch providers with single line change
- **Production Ready**: Built-in retry, timeout, logging
- **Cost Optimization**: Choose provider based on task complexity

##### openaiAdapter.ts - OpenAI GPT Integration

**Supported Models**:
- `gpt-3.5-turbo`: 4k context, fast, cheap ($0.50/1M tokens)
- `gpt-4`: 8k context, powerful ($30/1M tokens)
- `gpt-4-turbo`: 128k context, latest ($10/1M tokens)
- `text-embedding-ada-002`: 1536-dim embeddings

**Core Methods**:
- `generate(prompt, options)`: Single-turn text completion
- `chat(messages, options)`: Multi-turn conversation with history
- `embed(text, model)`: Generate 1536-dim vectors for semantic search
- `stream(input, options)`: Real-time token streaming
- `testConnection()`: Verify API key validity

**Features**:
- **Token Tracking**: Accurate promptTokens, completionTokens, totalTokens
- **Retry Logic**: Exponential backoff on errors (1s→2s→4s→8s→10s)
- **Timeout Control**: AbortController after configurable timeout
- **Structured Logging**: Debug/info/error with request metadata
- **Error Handling**: Rate limits, network errors, invalid keys

**Usage**:
```typescript
import { OpenAIAdapter } from '@somnia/agent-kit/llm/adapters';

const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4',
  timeout: 60000,
  retries: 3
});

const response = await adapter.generate('Explain quantum computing');
console.log(response.content);
console.log(`Used ${response.usage.totalTokens} tokens`);
```

**When to Use**:
- Production systems (reliable, fast)
- Complex reasoning tasks (GPT-4)
- Embeddings for semantic search
- High availability requirements

##### ollamaAdapter.ts - Local LLM Integration

**Supported Models**:
- `llama2`, `llama3`: Meta's open models (7B-70B params)
- `mistral`, `mixtral`: Mistral AI models (7B-8x7B params)
- `codellama`: Code-specialized Llama
- `phi`: Microsoft's small efficient models (2.7B params)

**Core Methods**:
- `generate(prompt, options)`: Local text generation
- `chat(messages, options)`: Local chat completion
- `embed(text, model)`: Local embeddings
- `stream(input, options)`: Streaming generation
- `listModels()`: Show installed models with size
- `pullModel(name)`: Download model from registry
- `deleteModel(name)`: Free disk space
- `hasModel(name)`: Check if model exists
- `testConnection()`: Verify Ollama server running

**Advantages**:
- **Free**: No API costs
- **Privacy**: Data never leaves your machine
- **Offline**: Works without internet
- **Low Latency**: No network round-trip
- **Customizable**: Fine-tune models

**Usage**:
```typescript
import { OllamaAdapter } from '@somnia/agent-kit/llm/adapters';

const adapter = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  defaultModel: 'llama3'
});

// Check and download model
if (!await adapter.hasModel('llama3')) {
  await adapter.pullModel('llama3');
}

const response = await adapter.generate('Explain blockchain');
console.log(response.content);
```

**When to Use**:
- Development and testing (free)
- Privacy-sensitive applications
- Offline deployments
- Cost optimization

---

#### prompt/ - Prompt Management System

##### templates.ts - Built-in Prompt Templates

**9 Production-Ready Templates**:
- `basic_agent`: General purpose AI agent
- `action_planner`: Break down goals into actions (used by LLMPlanner)
- `blockchain_analyzer`: Analyze blockchain state and events
- `event_handler`: Handle blockchain events
- `tool_executor`: Execute tools and handle results
- `transaction_builder`: Build blockchain transactions
- `data_query`: Query blockchain data
- `error_handler`: Handle errors and suggest recovery
- `risk_assessment`: Assess transaction risks

**Template Structure**:
```typescript
interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples?: Array<{ input: Record<string, any>; output: string }>;
}
```

**Helper Functions**:
- `getTemplate(name)`: Retrieve template by name
- `listTemplates()`: List all available templates
- `getTemplateVariables(name)`: Get required variables

##### builder.ts - Dynamic Prompt Construction

**Core Functions**:
- `buildPrompt(template, data)`: Replace placeholders ({{var}} or ${var})
- `buildFromTemplate(name, data)`: Build from named template
- `composePrompts(prompts)`: Combine multiple prompts
- `injectContext(prompt, context)`: Add context to prompts
- `sanitizeData(data)`: Prevent injection attacks
- `validateTemplate(template, data)`: Check for missing variables
- `createTemplate(config)`: Create custom templates

**Features**:
- **Placeholder Support**: Both {{variable}} and ${variable} syntax
- **Conditional Blocks**: {{#if variable}}...{{/if}}
- **Sanitization**: Automatic data cleaning and validation
- **Strict Mode**: Error on missing required variables

---

#### memory.ts - Agent Memory System (Moved from runtime/)

**Purpose**: LLM-specific memory management for agents. Moved from `runtime/` to `llm/` as it's primarily used for building LLM context.

**Core Features**:
- **Memory Types**: input, output, state, system
- **Backends**: InMemoryBackend (fast), FileBackend (persistent)
- **Token Management**: Stay within LLM context limits
- **Session Management**: Multiple agent sessions

**Key Methods**:
- `addMemory(type, content, metadata)`: Save interactions
- `getContext(maxTokens)`: Build LLM context from memory
- `getHistory(filter)`: Retrieve memory entries
- `clear()`: Session cleanup
- `summarize()`: Memory compression

**Integration**: Automatically saves agent interactions in Agent.onEvent(), builds context for LLM planners.

---

#### context.ts - LLM Context Building (Moved from runtime/)

**Purpose**: Unified context aggregation for LLM. Moved from `runtime/` to `llm/` as it's LLM-specific functionality.

**AgentContext Interface**:
- `chainState`: blockNumber, gasPrice, network, chainId, timestamp
- `recentActions`: Latest actions from storage
- `memory`: Memory context from MemoryManager
- `config`: Agent configuration

**ContextBuilder Methods**:
- `buildContext(options)`: Unified context aggregation
- `getChainState()`: Blockchain state with 2s cache
- `getRecentActions()`: Latest actions from storage
- `getMemoryContext()`: Formatted memory context
- `formatContext()`: Full LLM-friendly formatting
- `formatCompact()`: Compact version for token limits

**Options**:
- `maxMemoryTokens`: Token limit for memory (default: 1000)
- `maxActions`: Max recent actions (default: 10)
- `includeChainState/includeActions/includeMemory`: Toggle components

---

#### planner.ts - LLM-Powered Planning (NEW)

**Purpose**: AI-powered task decomposition and action planning using LLM adapters.

**Core Components**:
- **LLMPlanner**: Uses any `LLMAdapter` to generate structured action plans
- **Action Validation**: Zod-based validation for type safety
- **Structured Output**: Returns `ActionPlan[]` with reasoning

**Usage**:
```typescript
import { OpenAIAdapter } from '@somnia/agent-kit/llm/adapters';
import { LLMPlanner } from '@somnia/agent-kit/llm';

const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
const planner = new LLMPlanner(llm, {
  temperature: 0.3,        // Lower for deterministic plans
  strictValidation: true,  // Throw on invalid actions
  returnActionPlan: true   // Return ActionPlan[] with reason
});

const plans = await planner.planWithReason('Send 1 ETH to Alice');
// Returns: [
//   { type: 'check_balance', params: {...}, reason: 'Verify sufficient balance' },
//   { type: 'execute_transfer', target: '0x...', params: {...}, reason: 'Execute transfer' }
// ]
```

**Flow**: Goal → buildPrompt() → llm.generate() → parseResponseToActionPlan() → ActionPlan[] → Executor

---

#### reasoning.ts - Multi-Step Reasoning (NEW)

**Purpose**: Advanced reasoning capabilities including chain-of-thought, multi-step problem solving, and reasoning traces.

**Core Features**:
- **Chain-of-Thought**: Break complex problems into reasoning steps
- **Reasoning Traces**: Track decision-making process
- **Multi-Step Planning**: Decompose goals into sub-goals
- **Confidence Scoring**: Assess reasoning quality

**Key Methods**:
- `chainOfThought(problem)`: Generate reasoning steps
- `multiStepReasoning(goal, context)`: Complex problem solving
- `evaluateReasoning(trace)`: Assess reasoning quality
- `explainDecision(action)`: Explain why action was chosen

**Use Cases**:
- Complex task decomposition
- Decision explanation for users
- Debugging agent behavior
- Improving plan quality

---

#### Best Practices

**1. Adapter Selection**:
- **Development**: Ollama (free, fast iteration)
- **Production (simple)**: GPT-3.5-turbo (cheap, fast)
- **Production (complex)**: GPT-4 (powerful reasoning)
- **Privacy**: Ollama (local, no data leaves machine)

**2. Cost Optimization**:
- Lower temperature (0.3) for deterministic tasks
- Set `maxTokens` to limit response length
- Use streaming for long responses
- Monitor `usage.totalTokens` for cost tracking

**3. Error Handling**:
- Implement exponential backoff (1s→2s→4s→8s→10s)
- Handle rate limits (429), invalid keys (401), timeouts
- Use `testConnection()` on startup to fail fast

**4. Security**:
- Never commit API keys (use .env)
- Validate user inputs before sending to LLM
- Sanitize LLM outputs before displaying
- Use prompt templates to prevent injection

### 5. **utils/** - Shared Utilities (5/5 files) ✨ NEW
**Status**: ✅ Completed (v2.2.0 - Extracted from core/)

Shared utility functions extracted from `core/utils.ts` for better modularity and reusability across the SDK.

**Why Separate Module?**
- ✅ **Better Organization**: Utilities separated from blockchain-specific code
- ✅ **Reusability**: Can be imported by any module without circular dependencies
- ✅ **Maintainability**: Easier to find and update utility functions
- ✅ **Tree-Shaking**: Better bundle optimization (only import what you need)

**Module Structure**:
```
utils/
├── logger.ts      # Logging utilities (Pino-based)
├── retry.ts       # Retry logic with exponential backoff
├── encode.ts      # Encoding/decoding utilities (hex, bytes, UTF-8)
├── validate.ts    # Validation helpers (addresses, data formats)
└── index.ts       # Utility exports
```

---

#### logger.ts - Logging Utilities

**Features**:
- **Pino-based logging**: Fast, structured JSON logging
- **Log Levels**: debug, info, warn, error, fatal
- **Colored Terminal Output**: Pretty printing for development
- **Metadata Support**: Attach context to log entries
- **Performance**: Low overhead, production-ready

**Usage**:
```typescript
import { createLogger, LogLevel } from '@somnia/agent-kit/utils';

const logger = createLogger({
  level: LogLevel.INFO,
  pretty: true  // Colored output for dev
});

logger.info('Agent initialized', { agentId: '0x123' });
logger.error('Transaction failed', { error: err, txHash });
```

**Exports**:
- `Logger` class: Main logging interface
- `LogLevel` enum: DEBUG, INFO, WARN, ERROR, FATAL
- `createLogger(config)`: Factory function
- `LoggerConfig` type: Configuration options
- `LogEntry` type: Structured log entry

---

#### retry.ts - Retry Logic with Exponential Backoff

**Features**:
- **Exponential Backoff**: 1s→2s→4s→8s→10s (capped at maxDelay)
- **Configurable**: maxRetries, retryDelay, backoffMultiplier, maxDelay
- **Predicate Function**: Decide which errors to retry
- **Timeout Support**: Abort after configurable timeout

**Core Functions**:
- `retry<T>(fn, config)`: Retry a function with exponential backoff
- `delay(ms)`: Promise-based sleep
- `timeout<T>(promise, ms)`: Wrap promise with timeout

**Usage**:
```typescript
import { retry } from '@somnia/agent-kit/utils';

const result = await retry(
  async () => {
    const tx = await contract.transfer(to, amount);
    return await tx.wait();
  },
  {
    maxRetries: 5,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    shouldRetry: (error) => error.code !== 'INSUFFICIENT_FUNDS'
  }
);
```

**Retry Algorithm**:
```
Attempt 1: immediate
Attempt 2: wait 1000ms
Attempt 3: wait 2000ms
Attempt 4: wait 4000ms
Attempt 5: wait 8000ms
Attempt 6+: wait 10000ms (capped)
```

---

#### encode.ts - Encoding/Decoding Utilities

**Features**:
- **Hex Conversion**: toHex(), fromHex(), bytesToHex(), hexToBytes()
- **UTF-8 Encoding**: toUtf8Bytes(), toUtf8String()
- **Hashing**: keccak256() for Ethereum-compatible hashing
- **Ethers.js Integration**: Wraps ethers utilities for convenience

**Core Functions**:
- `toHex(value)`: Convert value to hex string
- `fromHex(hex)`: Parse hex string to value
- `bytesToHex(bytes)`: Uint8Array to hex
- `hexToBytes(hex)`: Hex to Uint8Array
- `toUtf8Bytes(str)`: String to UTF-8 bytes
- `toUtf8String(bytes)`: UTF-8 bytes to string
- `keccak256(data)`: Ethereum keccak256 hash

**Usage**:
```typescript
import { toHex, keccak256, toUtf8Bytes } from '@somnia/agent-kit/utils';

const hex = toHex(42);  // '0x2a'
const hash = keccak256(toUtf8Bytes('hello'));
const bytes = hexToBytes('0x1234');
```

---

#### validate.ts - Validation Helpers

**Features**:
- **Address Validation**: Check Ethereum address format
- **Format Validation**: Verify hex strings, numbers, etc.
- **Data Sanitization**: Clean and normalize inputs
- **Type Guards**: TypeScript type narrowing

**Core Functions**:
- `isValidAddress(address)`: Check if valid Ethereum address
- `shortAddress(address, chars)`: Shorten address for display (0x1234...5678)
- `isValidHex(hex)`: Verify hex string format
- `isValidChainId(chainId)`: Check chain ID validity
- `sanitizeInput(input)`: Clean user input

**Usage**:
```typescript
import { isValidAddress, shortAddress } from '@somnia/agent-kit/utils';

if (isValidAddress(userInput)) {
  console.log('Valid address:', shortAddress(userInput));
} else {
  throw new Error('Invalid Ethereum address');
}
```

**Integration**:
- Used by `core/chainClient.ts` for parameter validation
- Used by `runtime/executor.ts` for action validation
- Used by `runtime/policy.ts` for access control
- Used throughout SDK for input sanitization

---

### 6. **monitor/** - Monitoring System
**Status**: ✅ Completed

Implemented modules:
- `logger.ts` - **Pino-based logging** with colored terminal and JSON output
- `metrics.ts` - Performance metrics (counters, gauges, histograms, timing)
- `eventRecorder.ts` - On-chain event tracking with filtering and callbacks
- `telemetry.ts` - **Remote observability** with Prometheus, Datadog, OpenTelemetry
- `dashboard.ts` - **Development UI** with REST API and HTML dashboard

---

### 7. **types/** - Centralized Type Definitions (7/7 files)
**Status**: ✅ Completed

**Purpose**: Standardize data structures and interfaces across all SDK modules

**Location**: `packages/agent-kit/src/types/`

**Why Centralized Types?**
- ✅ **Single Source of Truth**: All type definitions in one place
- ✅ **Avoid Circular Dependencies**: Clean import hierarchy
- ✅ **Better Discoverability**: Easy to find and browse all types
- ✅ **Consistent Naming**: Enforce conventions across modules
- ✅ **Maintainability**: Update types in one location
- ✅ **IDE Support**: Better autocomplete and type checking

**Type Modules**:

#### `types/agent.ts` - Agent Core Types
- `AgentState` - Lifecycle states (Created, Registered, Active, Paused, Stopped, Terminated)
- `AgentRuntimeState` - Runtime status with error tracking
- `AgentConfig` - Configuration (id, name, version, model, capabilities, metadata)
- `AgentTask` - Task definition with priority, deadline, status
- `AgentOptions` - Initialization options (storage, memory, logging)
- `AgentEvents` - Event types for agent lifecycle
- `AgentStatus` - Complete status information

#### `types/config.ts` - Configuration Types (SDK + Agent + Runtime)

**SDK-Level Configuration:**
- `SDKConfig` - Global SDK settings (debug, telemetry, logLevel, defaultChain, llmProvider, defaultTimeout, maxRetries, autoRecover, options)
- `DEFAULT_SDK_CONFIG` - Default SDK configuration values

**Agent-Level Configuration:**
- `AgentKitConfig` - Agent Kit configuration (network, contracts, privateKey, llmProvider, defaultGasLimit, logLevel, metricsEnabled, telemetryEnabled, options)
- `NetworkConfig` - Network settings (rpcUrl, chainId, name)
- `ContractAddresses` - System contract addresses (agentRegistry, agentExecutor, agentManager, agentVault)
- `LLMProviderConfig` - LLM provider settings (provider, apiKey, baseUrl, model, options)
- `DEFAULT_CONFIG` - Default agent configuration values

**Runtime Module Configuration:**
- `RuntimeConfig` - Runtime settings (maxConcurrent, enableParallel, dryRun, memoryLimit, storageBackend, storagePath, memoryBackend, memoryPath, enableMemory, sessionId)
- `DEFAULT_RUNTIME_CONFIG` - Default runtime configuration values

**Complete Solution:**
- `CompleteSolutionConfig` - Combined configuration (AgentKitConfig + SDKConfig + RuntimeConfig)

**Usage Examples:**

```typescript
import {
  SDKConfig,
  RuntimeConfig,
  CompleteSolutionConfig,
  DEFAULT_SDK_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
  loadSDKConfigFromEnv,
  loadRuntimeConfigFromEnv,
} from '@somnia/agent-kit';

// SDK-level configuration (global settings)
const sdkConfig: SDKConfig = {
  debug: true,
  telemetry: false,
  logLevel: 'debug',
  llmProvider: 'openai',
  defaultTimeout: 30000,    // 30 seconds
  maxRetries: 3,
  autoRecover: true,
};

// Runtime module configuration
const runtimeConfig: RuntimeConfig = {
  maxConcurrent: 5,
  enableParallel: true,
  dryRun: false,           // Set to true for testing
  memoryLimit: 1000,
  storageBackend: 'file',
  storagePath: './data/storage',
  memoryBackend: 'file',
  memoryPath: './data/memory',
  enableMemory: true,
  sessionId: 'session-123',
};

// Complete solution configuration
const config: CompleteSolutionConfig = {
  // Agent-level configuration
  network: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    name: 'Somnia Dream Testnet',
  },
  contracts: {
    agentRegistry: '0x123...',
    agentExecutor: '0x456...',
  },
  privateKey: process.env.PRIVATE_KEY,
  llmProvider: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
  },
  defaultGasLimit: 3000000n,
  logLevel: 'info',
  metricsEnabled: true,

  // SDK-level configuration
  sdk: sdkConfig,

  // Runtime module configuration
  runtime: runtimeConfig,
};

// Load configuration from environment variables
const envSDKConfig = loadSDKConfigFromEnv();
// Reads: SDK_DEBUG, SDK_TELEMETRY, SDK_LOG_LEVEL, SDK_LLM_PROVIDER,
//        SDK_DEFAULT_TIMEOUT, SDK_MAX_RETRIES, SDK_AUTO_RECOVER

const envRuntimeConfig = loadRuntimeConfigFromEnv();
// Reads: RUNTIME_MAX_CONCURRENT, RUNTIME_ENABLE_PARALLEL, RUNTIME_DRY_RUN,
//        RUNTIME_MEMORY_LIMIT, RUNTIME_STORAGE_BACKEND, RUNTIME_STORAGE_PATH,
//        RUNTIME_MEMORY_BACKEND, RUNTIME_MEMORY_PATH, RUNTIME_ENABLE_MEMORY,
//        RUNTIME_SESSION_ID

// Merge with defaults
const mergedConfig: CompleteSolutionConfig = {
  ...config,
  sdk: { ...DEFAULT_SDK_CONFIG, ...envSDKConfig },
  runtime: { ...DEFAULT_RUNTIME_CONFIG, ...envRuntimeConfig },
};
```

**Environment Variable Configuration:**

```bash
# SDK-level settings
SDK_DEBUG=true
SDK_TELEMETRY=false
SDK_LOG_LEVEL=debug
SDK_LLM_PROVIDER=openai
SDK_DEFAULT_TIMEOUT=30000
SDK_MAX_RETRIES=3
SDK_AUTO_RECOVER=true

# Runtime module settings
RUNTIME_MAX_CONCURRENT=5
RUNTIME_ENABLE_PARALLEL=true
RUNTIME_DRY_RUN=false
RUNTIME_MEMORY_LIMIT=1000
RUNTIME_STORAGE_BACKEND=file
RUNTIME_STORAGE_PATH=./data/storage
RUNTIME_MEMORY_BACKEND=file
RUNTIME_MEMORY_PATH=./data/memory
RUNTIME_ENABLE_MEMORY=true
RUNTIME_SESSION_ID=session-123
```

**Configuration Hierarchy:**

```typescript
// 1. SDK-Level (Global)
// Controls SDK-wide behavior
const sdk: SDKConfig = {
  debug: true,          // Enable verbose logging
  telemetry: true,      // Send metrics to monitoring
  logLevel: 'debug',    // Global log level
  maxRetries: 3,        // Default retry attempts
};

// 2. Agent-Level (Instance)
// Controls individual agent behavior
const agentConfig: AgentKitConfig = {
  network: { rpcUrl: '...', chainId: 50312, name: 'Testnet' },
  contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
  privateKey: '0x...',
  logLevel: 'info',     // Override SDK log level for this agent
};

// 3. Runtime-Level (Modules)
// Controls runtime module behavior
const runtime: RuntimeConfig = {
  maxConcurrent: 5,     // Max parallel executions
  enableParallel: true, // Enable parallel execution
  dryRun: false,        // Simulate without actual execution
  memoryLimit: 1000,    // Max memory entries
};

// Combined configuration
const complete: CompleteSolutionConfig = {
  ...agentConfig,
  sdk,
  runtime,
};
```

**Real-World Usage Examples:**

```typescript
import { SomniaAgentKit, loadConfig } from '@somnia/agent-kit';

// Example 1: Development setup with debugging
const devConfig = loadConfig({
  network: { rpcUrl: 'http://localhost:8545', chainId: 31337, name: 'Devnet' },
  contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
  privateKey: '0x...',
  sdk: {
    debug: true,
    telemetry: false,
    logLevel: 'debug',
  },
  runtime: {
    dryRun: true,        // Don't execute real transactions
    enableParallel: false, // Easier to debug serially
    storageBackend: 'memory', // Faster in dev
    memoryBackend: 'memory',
  },
});

const devKit = new SomniaAgentKit(devConfig);
await devKit.initialize();

// Example 2: Production setup with telemetry
const prodConfig = loadConfig({
  network: { rpcUrl: 'https://rpc.somnia.network', chainId: 50311, name: 'Mainnet' },
  contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
  privateKey: process.env.PRIVATE_KEY,
  sdk: {
    debug: false,
    telemetry: true,
    logLevel: 'info',
    maxRetries: 5,
    autoRecover: true,
  },
  runtime: {
    maxConcurrent: 10,
    enableParallel: true,
    dryRun: false,
    storageBackend: 'file',
    storagePath: './data/storage',
    memoryBackend: 'file',
    memoryPath: './data/memory',
    enableMemory: true,
  },
});

const prodKit = new SomniaAgentKit(prodConfig);
await prodKit.initialize();

// Example 3: Testing setup
const testConfig = loadConfig({
  network: { rpcUrl: 'http://localhost:8545', chainId: 31337, name: 'Test' },
  contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
  sdk: {
    debug: true,
    telemetry: false,
    logLevel: 'verbose',
  },
  runtime: {
    dryRun: true,
    maxConcurrent: 1,
    enableParallel: false,
    storageBackend: 'memory',
    memoryBackend: 'memory',
    memoryLimit: 100,
  },
});

const testKit = new SomniaAgentKit(testConfig);
await testKit.initialize();
```

#### `types/chain.ts` - Blockchain Types
- `ChainConfig` - Simplified chain configuration (alternative to NetworkConfig + ContractAddresses)
- `Transaction` - Simplified transaction info (hash, from, to, gasUsed, status)
- `TransactionRequest` - Transaction creation parameters
- `ChainEvent` - On-chain event (name, contract, args, txHash, blockNumber)
- `Block` - Block information (number, hash, timestamp, gasUsed, transactions)
- `GasEstimate` - Gas estimation (gasLimit, gasPrice, estimatedCost)
- `GasPricing` - Gas pricing information (EIP-1559 support)
- `ChainState` - Blockchain state snapshot (blockNumber, gasPrice, chainId)
- `ContractCall` - Contract interaction parameters
- `ContractCallResult` - Contract call result with success/error
- `ContractDeployment` - Contract deployment parameters
- `NetworkInfo` - Network information

#### `types/storage.ts` - Storage Types
- `StorageBackend` - Backend types (Memory, File)
- `StorageType` - Storage categories (Memory, LocalFile, OnChain, IPFS)
- `EventEntry` - Event storage structure
- `ActionEntry` - Action storage structure
- `IStorage` - Storage interface

#### `types/memory.ts` - Memory Types
- `MemoryType` - Entry types (Input, Output, State, System)
- `MemoryEntry` - Memory structure with tokens
- `MemoryBackend` - Backend interface
- `MemoryFilter` - Query filtering options
- `MemoryConfig` - Memory configuration

#### `types/trigger.ts` - Trigger Types
- `TriggerType` - Trigger categories (Time, Event, Condition, Manual)
- `TriggerStatus` - Trigger states (Active, Inactive, Triggered, Expired)
- `TriggerCondition` - Condition definitions
- `TriggerConfig` - Trigger configuration
- `ITrigger` - Trigger interface

#### `types/action.ts` - Action Types (Runtime Execution)
**Purpose**: Standardized action definitions for runtime execution - the "action language" that the runtime understands and executes.

**Runtime Actions:**
- `RuntimeAction` - Standard action format (id, type, payload, createdAt, executed, priority, agentId, metadata)
- `ActionStatus` - Execution status enum (Pending, Running, Completed, Failed, Cancelled, Retrying)
- `ActionMetadata` - Execution control (priority, retryable, timeout, dependencies, maxRetries, retryDelay, tags)
- `RuntimeActionWithMetadata` - Action with execution metadata
- `ActionType` - Re-exported from types/llm (18 action types)

**Execution Results:**
- `ExecutionResult` - Simplified result (success, txHash, error, duration, data, retryCount)
- `ExecutionStatus` - Status enum (Idle, Running, Success, Failed, Retrying, Cancelled, Timeout)
- `DetailedExecutionResult` - Extended result (includes stepId, status, txReceipt, dryRun, executedAt)
- `ExecutionContext` - Execution state tracker (taskId, currentStep, results map, timestamps, status, metadata)

**Executor Configuration:**
- `ExecutorConfig` - Behavior and constraints (maxRetries, retryDelay, timeout, enableParallel, dryRun, maxConcurrent)
- `ActionHandler` - Handler function type (params, context) => Promise<any>
- `ActionHandlerEntry` - Handler registry entry (name, handler, description, required/optional params)
- `ActionConversionOptions` - Options for converting LLM Action to RuntimeAction

**Action Lifecycle Flow:**
```
LLM Layer (Planning):
  Action (type, params) → ActionPlan (+ reasoning)
            ↓
       [Conversion]
            ↓
Runtime Layer (Execution):
  RuntimeAction (id, type, payload, createdAt, executed)
            ↓
        [Execute]
            ↓
  ExecutionResult (success, txHash, error, duration)
            ↓
         [Store]
            ↓
Storage Layer:
  ActionEntry (id, action, result, status, timestamp)
```

#### `types/llm.ts` - LLM Types
**Message & Generation:**
- `Message` - Chat message format (role, content)
- `GenerateOptions` - Generation parameters (temperature, maxTokens, topP)
- `TokenUsage` - Token statistics (promptTokens, completionTokens, totalTokens)
- `LLMResponse` - Standard response format (content, model, usage, finishReason)
- `RetryConfig` - Retry logic configuration (maxRetries, retryDelay, backoffMultiplier)
- `LLMAdapter` - Adapter interface (generate, chat, embed, stream, testConnection)
- `LLMLogger` - Logger interface (debug, info, warn, error)
- `ConsoleLogger` - Default console logger implementation

**Prompt Building:**
- `PromptPayload` - Prompt template payload (template, variables, options)
- `PromptBuildOptions` - Build options (strict, trim, maxLength, sanitize)
- `PromptTemplate` - Template definition (name, description, template, variables, examples, category)

**Action & Planning:**
- `Action` - Base action interface (type, params)
- `ActionType` - Action type enum (Transfer, Swap, ContractCall, ValidateAddress, CheckBalance, etc.)
- `ActionPlan` - Structured action plan with reasoning (type, target, params, reason, dependencies, metadata)
- `TaskPriority` - Priority levels (Low, Medium, High, Critical)
- `TaskStatus` - Execution status (Pending, Running, Completed, Failed, Cancelled)
- `PlanStep` - Execution plan step (id, action, status, result, error, executedAt)
- `ExecutionPlan` - Complete execution plan (steps, totalSteps, currentStep, status, createdAt, completedAt)

**Reasoning:**
- `ReasoningContext` - Context for LLM reasoning (goal, chainState, memory, availableActions, userAddress, agentAddress)
- `ReasoningResult` - LLM reasoning result (actions, reasoning, confidence, llmResponse, latencyMs, rawOutput)
- `LLMResponseWithMetrics` - Enhanced response with performance metrics (latencyMs, tokensPerSecond, costEstimate, provider, timestamp)

#### `types/monitor.ts` - Monitor Types
- `LogLevel` - Log levels (Error, Warn, Info, Debug, Verbose)
- `LogEntry` - Log structure
- `LoggerConfig` - Logger configuration
- `Metric` - Metric structure
- `MetricSummary` - Statistics summary
- `MetricsConfig` - Metrics configuration
- `TelemetryFormat` - Output formats (JSON, Prometheus, Datadog, OpenTelemetry)
- `TelemetryData` - Telemetry data structure
- `TelemetryConfig` - Telemetry configuration
- `DashboardConfig` - Dashboard configuration

#### `types/common.ts` - Common Utility Types
- `Result<T, E>` - Standard result type
- `AsyncResult<T, E>` - Async result type
- `Nullable<T>` - Type with null
- `Optional<T>` - Type with undefined
- `Timestamp` - Unix timestamp
- `Address` - Ethereum address (0x-prefixed)
- `Hash` - Transaction/block hash
- `DeepPartial<T>` - Deep partial type

**Usage Examples**:

```typescript
// Import from centralized types (recommended)
import type {
  AgentConfig,
  AgentState,
  StorageBackend,
  TriggerConfig,
  Transaction,
  ChainEvent,
} from '@somnia/agent-kit/types';

// Or from individual modules (backward compatible)
import type { AgentConfig } from '@somnia/agent-kit/runtime';
```

**Blockchain Types Usage**:

```typescript
import type {
  ChainConfig,
  Transaction,
  ChainEvent,
  GasEstimate,
  ChainState,
} from '@somnia/agent-kit/types';

// Simple chain configuration
const config: ChainConfig = {
  rpcUrl: 'https://dream-rpc.somnia.network',
  chainId: 50312,
  network: 'testnet',
  contracts: {
    registry: '0x123...',
    executor: '0x456...',
  },
};

// Transaction logging
function logTransaction(tx: Transaction) {
  console.log(`TX ${tx.hash} from ${tx.from}`);
  console.log(`Gas used: ${tx.gasUsed}, Status: ${tx.status}`);
}

// Event handling
function handleEvent(event: ChainEvent) {
  console.log(`Event ${event.name} from ${event.contract}`);
  console.log(`Block: ${event.blockNumber}, Args:`, event.args);
}

// Gas estimation
const estimate: GasEstimate = {
  gasLimit: 100000n,
  maxFeePerGas: 2000000000n,
  estimatedCost: 200000000000000n, // 0.0002 ETH
};
```

**Backward Compatibility**: All existing modules re-export types from `types/` for seamless migration.

**LLM Reasoning Types Usage**:

```typescript
import type {
  PromptPayload,
  ActionPlan,
  ActionType,
  ReasoningContext,
  ReasoningResult,
  LLMResponseWithMetrics,
} from '@somnia/agent-kit/types';

// Build prompt from template
const promptPayload: PromptPayload = {
  template: 'Transfer {{amount}} ETH to {{recipient}}',
  variables: {
    amount: '1.5',
    recipient: '0xabc...',
  },
  options: {
    strict: true,
    sanitize: true,
  },
};

// Create action plan
const actionPlan: ActionPlan = {
  type: ActionType.Transfer,
  target: '0xabc...',
  params: {
    amount: '1.5',
    token: 'ETH',
  },
  reason: 'User requested transfer of 1.5 ETH',
  dependencies: [],
};

// LLM reasoning context
const context: ReasoningContext = {
  goal: 'Transfer tokens to recipient',
  chainState: { blockNumber: 1000000, gasPrice: 20n },
  memory: ['Previous successful transfer', 'User balance: 10 ETH'],
  availableActions: ['transfer', 'swap', 'approve'],
  userAddress: '0x123...',
  agentAddress: '0x456...',
};

// Process reasoning result
function processReasoning(result: ReasoningResult) {
  console.log(`Reasoning: ${result.reasoning}`);
  console.log(`Confidence: ${result.confidence}`);
  console.log(`Latency: ${result.latencyMs}ms`);

  result.actions.forEach((action, i) => {
    console.log(`Action ${i+1}: ${action.type}`);
    console.log(`Reason: ${action.reason}`);
    console.log(`Params:`, action.params);
  });
}

// Enhanced LLM response with metrics
function logMetrics(response: LLMResponseWithMetrics) {
  console.log(`Model: ${response.model}`);
  console.log(`Latency: ${response.latencyMs}ms`);
  console.log(`Tokens/sec: ${response.tokensPerSecond}`);
  console.log(`Cost: $${response.costEstimate}`);
  console.log(`Provider: ${response.provider}`);
}
```

**Runtime Action Types Usage**:

```typescript
import type {
  RuntimeAction,
  ActionStatus,
  ExecutionResult,
  ExecutionStatus,
  ActionHandler,
  ExecutorConfig,
} from '@somnia/agent-kit/types';
import { ActionType } from '@somnia/agent-kit/types';

// Create a runtime action (user's desired format)
const action: RuntimeAction = {
  id: 'action-001',
  type: ActionType.Transfer,
  payload: {
    to: '0xabc...',
    amount: '1.5',
    token: 'ETH',
  },
  createdAt: Date.now(),
  executed: false,
  priority: 80,
  agentId: '0x123...',
};

// Execute action and get result
const result: ExecutionResult = {
  success: true,
  txHash: '0xdef...',
  duration: 3500, // ms
  data: {
    gasUsed: 21000,
    blockNumber: 1000000,
  },
};

// Check execution status
if (result.success) {
  console.log(`Action ${action.id} completed successfully`);
  console.log(`TX Hash: ${result.txHash}`);
  console.log(`Duration: ${result.duration}ms`);
  action.executed = true;
} else {
  console.error(`Action ${action.id} failed: ${result.error}`);
}

// Action handler example
const transferHandler: ActionHandler = async (params, context) => {
  console.log(`Transferring ${params.amount} to ${params.to}`);

  // Simulate blockchain transfer
  const txHash = '0x' + Math.random().toString(36).substring(7);

  return {
    success: true,
    txHash,
    amount: params.amount,
    recipient: params.to,
  };
};

// Executor configuration
const executorConfig: ExecutorConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  enableParallel: true,
  dryRun: false, // Set to true for testing
  maxConcurrent: 5,
};

// Convert LLM Action to RuntimeAction
function convertToRuntimeAction(
  llmAction: { type: string; params: Record<string, any> }
): RuntimeAction {
  return {
    id: `action-${Date.now()}`,
    type: llmAction.type,
    payload: llmAction.params,
    createdAt: Date.now(),
    executed: false,
  };
}
```

---

#### **logger.ts** - Production-Ready Logging with Pino

**Overview:**
The logger module uses [pino](https://github.com/pinojs/pino) - a fast, low-overhead logging library - with support for colored terminal output via [pino-pretty](https://github.com/pinojs/pino-pretty).

**Key Features:**
- ✅ **LOG_LEVEL environment variable** - Set log level via `process.env.LOG_LEVEL`
- ✅ **Colored console output** - Pretty, readable logs in development
- ✅ **JSON format** - Structured logs for production (default in production)
- ✅ **File logging** - Write logs to files with pino file transport
- ✅ **Child loggers** - Context-aware logging with pino child loggers
- ✅ **Memory storage** - Optional in-memory log storage for testing

**Log Levels:**
```typescript
export enum LogLevel {
  Error = 'error',    // Critical errors
  Warn = 'warn',      // Warnings
  Info = 'info',      // General info
  Debug = 'debug',    // Debug details
  Verbose = 'trace',  // Trace-level details
}
```

**Basic Usage:**
```typescript
import { Logger, LogLevel, createLogger } from '@somnia/agent-kit';

// Create logger with defaults (reads LOG_LEVEL env var)
const logger = new Logger();

// Log messages at different levels
logger.info('Agent started', { agentId: '0x123...' });
logger.debug('Processing event', { eventType: 'Transfer' });
logger.warn('High gas price', { gasPrice: '100 gwei' });
logger.error('Transaction failed', { error: 'Insufficient funds' });
```

**Environment Variable Configuration:**
```bash
# Set log level via environment variable
LOG_LEVEL=debug node app.js  # Show debug and above
LOG_LEVEL=info node app.js   # Show info and above (default)
LOG_LEVEL=error node app.js  # Show only errors

# Production with JSON output
NODE_ENV=production node app.js
```

**Custom Configuration:**
```typescript
// Development: Pretty colored output
const devLogger = new Logger({
  level: LogLevel.Debug,
  format: 'pretty',
  enableConsole: true,
  enableFile: false,
});

// Production: JSON logs + file output
const prodLogger = new Logger({
  level: LogLevel.Info,
  format: 'json',
  enableConsole: true,
  enableFile: true,
  filePath: './logs/agent.log',
});

// Testing: Memory storage enabled
const testLogger = new Logger({
  level: LogLevel.Verbose,
  enableMemoryStorage: true,
});
```

**Child Logger with Context:**
```typescript
// Create child logger with context
const blockchainLogger = logger.child('blockchain');
blockchainLogger.info('Block confirmed', { blockNumber: 1000000 });
// Output: [12:34:56] INFO [blockchain]: Block confirmed

const walletLogger = logger.child('wallet');
walletLogger.warn('Low balance', { balance: '0.1 ETH' });
// Output: [12:34:57] WARN [wallet]: Low balance
```

**File Logging:**
```typescript
// Enable file logging with rotation
const logger = new Logger({
  enableFile: true,
  filePath: './logs/agent.log',
  format: 'json', // Always write JSON to files
});

logger.info('This will be written to file');
```

**Memory Storage (for testing):**
```typescript
const logger = new Logger({
  enableMemoryStorage: true,
});

logger.info('Message 1');
logger.error('Message 2');

// Retrieve logged entries
const logs = logger.getLogs(); // All logs
const errors = logger.getLogsByLevel(LogLevel.Error); // Filter by level
const recent = logger.getLogs(10); // Last 10 logs

// Time range filtering
const start = Date.now() - 3600000; // 1 hour ago
const end = Date.now();
const hourLogs = logger.getLogsByTimeRange(start, end);
```

**Advanced: Direct Pino Access:**
```typescript
// Get underlying pino logger for advanced usage
const pinoLogger = logger.getPinoLogger();
pinoLogger.fatal('Critical system error');
```

**Output Examples:**

*Pretty Format (Development):*
```
[12:34:56] INFO: Agent started
    agentId: "0x123..."
[12:34:57] DEBUG: Processing event
    eventType: "Transfer"
[12:34:58] WARN: High gas price
    gasPrice: "100 gwei"
[12:34:59] ERROR: Transaction failed
    error: "Insufficient funds"
```

*JSON Format (Production):*
```json
{"level":30,"time":1640000000,"msg":"Agent started","agentId":"0x123..."}
{"level":20,"time":1640000001,"msg":"Processing event","eventType":"Transfer"}
{"level":40,"time":1640000002,"msg":"High gas price","gasPrice":"100 gwei"}
{"level":50,"time":1640000003,"msg":"Transaction failed","error":"Insufficient funds"}
```

---

#### **metrics.ts** - Performance Metrics

Track agent performance with counters, gauges, histograms, and timing utilities. Includes built-in support for blockchain and LLM metrics.

**Key Features:**
- ✅ **Counters** - Track counts (transactions, LLM calls, errors)
- ✅ **Gauges** - Track current values (memory usage, active connections)
- ✅ **Histograms** - Track distributions (gas used, response times)
- ✅ **Uptime tracking** - Automatic uptime calculation
- ✅ **Success rates** - Auto-calculate tx_success_rate, llm_success_rate
- ✅ **TPS calculation** - Transactions per second over time windows
- ✅ **Percentiles** - p50, p95, p99 for performance analysis
- ✅ **Convenience methods** - Simple API for common agent metrics

**Basic Usage - Generic Metrics:**

```typescript
import { Metrics } from '@somnia/agent-kit';

const metrics = new Metrics();

// Counters
metrics.increment('tasks.completed');
metrics.increment('tasks.failed');

// Gauges
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);
metrics.gauge('active.connections', 10);

// Histograms
metrics.histogram('task.duration', 1250); // ms

// Time async operations
const result = await metrics.time('llm.generate', async () => {
  return await llm.generate(prompt);
});
```

**Agent-Specific Metrics (Simplified API):**

```typescript
// Record blockchain transactions
metrics.recordTransaction(true, 21000);  // success=true, gasUsed=21000
metrics.recordTransaction(false);         // failed transaction

// Record LLM calls
metrics.recordLLMCall(1250);              // duration=1250ms
metrics.recordLLMCall(800, true);         // duration, success
metrics.recordLLMCall(undefined, false);  // just track failure

// Record gas usage
metrics.recordGasUsed(50000);
```

**Calculate Success Rates:**

```typescript
// Automatic success rate calculation
const txSuccessRate = metrics.rate('tx.success', 'tx.total');
// Returns: 95.5 (as percentage)

const llmSuccessRate = metrics.rate('llm.success', 'llm.total');
// Returns: 98.2
```

**Calculate TPS (Transactions Per Second):**

```typescript
// TPS over last 60 seconds (default)
const tps = metrics.calculateRate('tx.total');
// Returns: 15.3 transactions/second

// TPS over last 5 minutes
const tps5m = metrics.calculateRate('tx.total', 300000);
// Returns: 12.7 transactions/second
```

**Percentile Analysis:**

```typescript
// Get gas usage percentiles
const p50Gas = metrics.getPercentile('tx.gas_used', 50);  // Median
const p95Gas = metrics.getPercentile('tx.gas_used', 95);  // 95th percentile
const p99Gas = metrics.getPercentile('tx.gas_used', 99);  // 99th percentile

console.log(`Gas Usage: p50=${p50Gas}, p95=${p95Gas}, p99=${p99Gas}`);
// Output: Gas Usage: p50=21000, p95=45000, p99=80000
```

**Get Uptime:**

```typescript
const uptime = metrics.getUptime();
console.log(`Agent uptime: ${uptime}ms`);
// Output: Agent uptime: 3600000ms (1 hour)

// Convert to human-readable format
const hours = uptime / (1000 * 60 * 60);
console.log(`Uptime: ${hours.toFixed(2)} hours`);
```

**Get Complete Snapshot:**

```typescript
const snapshot = metrics.getSnapshot();
console.log(JSON.stringify(snapshot, null, 2));
```

**Snapshot Format:**
```json
{
  "counters": {
    "tx.total": 1000,
    "tx.success": 955,
    "tx.failed": 45,
    "llm.total": 500,
    "llm.success": 491,
    "llm.failed": 9
  },
  "gauges": {
    "memory.usage": 52428800,
    "active.connections": 5
  },
  "histograms": {
    "gas_used": {
      "p50": 21000,
      "p95": 45000,
      "p99": 80000
    },
    "reasoning_time": {
      "p50": 1200,
      "p95": 2500,
      "p99": 3800
    }
  },
  "tx_sent": 1000,
  "tx_success_rate": 95.5,
  "avg_gas_used": 25430,
  "llm_calls": 500,
  "reasoning_time": 1234,
  "uptime": 3600000,
  "tps": 16.67,
  "timestamp": 1640000000000
}
```

**Advanced: Summary Statistics:**

```typescript
// Get detailed statistics for a metric
const gasSummary = metrics.getSummary('tx.gas_used');
console.log(gasSummary);
// {
//   name: 'tx.gas_used',
//   count: 1000,
//   sum: 25430000,
//   avg: 25430,
//   min: 21000,
//   max: 150000,
//   lastValue: 30000,
//   lastTimestamp: 1640000000000
// }
```

**Real-World Example:**

```typescript
import { Agent, Metrics, Logger } from '@somnia/agent-kit';

const metrics = new Metrics();
const logger = new Logger();

// In your agent execution loop
agent.on('transaction:sent', async (tx) => {
  try {
    const receipt = await tx.wait();
    metrics.recordTransaction(
      receipt.status === 1,  // success
      receipt.gasUsed.toNumber()
    );
  } catch (error) {
    metrics.recordTransaction(false);  // failed
  }
});

agent.on('llm:call', async (prompt) => {
  const start = Date.now();
  try {
    const response = await llm.generate(prompt);
    const duration = Date.now() - start;
    metrics.recordLLMCall(duration, true);
    return response;
  } catch (error) {
    metrics.recordLLMCall(Date.now() - start, false);
    throw error;
  }
});

// Monitor and log metrics every minute
setInterval(() => {
  const snapshot = metrics.getSnapshot();
  logger.info('Metrics snapshot', {
    tx_sent: snapshot.tx_sent,
    success_rate: snapshot.tx_success_rate.toFixed(2),
    avg_gas: snapshot.avg_gas_used.toFixed(0),
    tps: snapshot.tps.toFixed(2),
    uptime_hours: (snapshot.uptime / 3600000).toFixed(2),
  });
}, 60000);
```

---

#### **eventRecorder.ts** - Blockchain Event Tracking

Monitor and record on-chain events with filtering and callbacks.

```typescript
import { EventRecorder } from '@somnia/agent-kit';

const recorder = new EventRecorder(config);

// Start listening to events
await recorder.startListening('AgentRegistry', ['AgentRegistered', 'AgentUpdated']);

// Register event callback
recorder.on('AgentRegistered', (event) => {
  logger.info('New agent registered', { agentId: event.agentId });
});

// Query recorded events
const events = recorder.getEvents({ type: 'AgentRegistered' });
```

---

#### **telemetry.ts** - Remote Observability (Production-Level)

Send logs and metrics to external monitoring services like Prometheus, Grafana, Datadog, and OpenTelemetry collectors.

**Key Features:**
- ✅ **Non-blocking async queue** - No performance impact
- ✅ **Batch processing** - Efficient data transmission
- ✅ **Multiple formats** - JSON, Prometheus, Datadog, OpenTelemetry
- ✅ **Retry logic** - Exponential backoff (1s → 2s → 4s → 10s max)
- ✅ **Auto-flush** - Configurable interval (default: 10s)
- ✅ **Enable/disable** - Via TELEMETRY_ENDPOINT env var
- ✅ **Integration** - Auto-export from Logger and Metrics

**Basic Usage:**

```typescript
import { Telemetry } from '@somnia/agent-kit';

// Create telemetry instance
const telemetry = new Telemetry({
  endpoint: process.env.TELEMETRY_ENDPOINT,  // Required
  format: 'json',                             // json | prometheus | datadog | opentelemetry
  batchSize: 100,                             // Flush after 100 items
  flushInterval: 10000,                       // Flush every 10s
  retries: 3,                                 // Retry up to 3 times
  timeout: 5000,                              // 5s timeout
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',   // Optional custom headers
  },
});

// Send data (non-blocking, adds to queue)
telemetry.send({
  type: 'metric',
  timestamp: Date.now(),
  data: { tx_sent: 1000, tx_success_rate: 95.5 },
});

// Manual flush
await telemetry.flush();
```

**Environment Variable Configuration:**

```bash
# Enable telemetry by setting endpoint
export TELEMETRY_ENDPOINT=https://metrics.example.com/api

# Telemetry auto-detects and enables
const telemetry = new Telemetry();  // Reads TELEMETRY_ENDPOINT
```

**Integration with Logger:**

```typescript
import { Logger } from '@somnia/agent-kit';

const logger = new Logger({
  telemetry: {
    endpoint: 'https://logs.example.com/api',
    format: 'json',
    batchSize: 50,
  },
});

// All logs automatically sent to telemetry
logger.info('Transaction sent', { txHash: '0x123...' });
logger.error('Transaction failed', { error: 'Insufficient funds' });
```

**Integration with Metrics:**

```typescript
import { Metrics } from '@somnia/agent-kit';

const metrics = new Metrics({
  telemetry: {
    endpoint: 'http://localhost:9091/metrics',
    format: 'prometheus',
  },
  telemetryInterval: 60000,  // Export every 60s
});

// Metrics auto-exported to Prometheus every minute
metrics.recordTransaction(true, 21000);
metrics.recordLLMCall(1250);
```

**Prometheus Integration:**

```typescript
// Prometheus Pushgateway
const telemetry = new Telemetry({
  endpoint: 'http://pushgateway:9091/metrics/job/somnia-agent',
  format: 'prometheus',
  flushInterval: 15000,  // Push every 15s
});

// Metrics sent in Prometheus text format:
// # TYPE tx_sent counter
// tx_sent 1000 1640000000
// # TYPE tx_success_rate gauge
// tx_success_rate 95.5 1640000000
```

**Grafana Loki Integration:**

```typescript
const telemetry = new Telemetry({
  endpoint: 'http://loki:3100/loki/api/v1/push',
  format: 'json',
  headers: {
    'Content-Type': 'application/json',
    'X-Scope-OrgID': 'tenant1',
  },
});
```

**Datadog Integration:**

```typescript
const telemetry = new Telemetry({
  endpoint: 'https://api.datadoghq.com/api/v1/series',
  format: 'datadog',
  headers: {
    'DD-API-KEY': process.env.DATADOG_API_KEY,
  },
});

// Metrics sent in Datadog format:
// {
//   "series": [
//     {
//       "metric": "tx.total",
//       "type": "count",
//       "points": [[1640000000, 1000]],
//       "tags": ["env:production", "agent:v1"]
//     }
//   ]
// }
```

**OpenTelemetry Integration:**

```typescript
const telemetry = new Telemetry({
  endpoint: 'http://otel-collector:4318/v1/metrics',
  format: 'opentelemetry',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Manual Control:**

```typescript
// Enable/disable dynamically
telemetry.disable();
telemetry.enable();

// Check status
if (telemetry.isEnabled()) {
  console.log('Telemetry active');
}

// Queue status
console.log(`Queue size: ${telemetry.getQueueSize()}`);

// Force flush
await telemetry.flush();

// Cleanup on shutdown
await telemetry.shutdown();
```

**Error Handling:**

```typescript
const telemetry = new Telemetry({
  endpoint: 'https://metrics.example.com/api',
  onError: (error) => {
    logger.error('Telemetry failed', { error: error.message });
    // Send to alternative monitoring service
  },
});
```

**Real-World Example - Complete Observability Stack:**

```typescript
import { Agent, Logger, Metrics, Telemetry } from '@somnia/agent-kit';

// Unified telemetry config
const telemetryConfig = {
  endpoint: process.env.TELEMETRY_ENDPOINT,
  format: 'prometheus' as const,
  batchSize: 100,
  flushInterval: 30000,  // 30s
  headers: {
    'Authorization': `Bearer ${process.env.TELEMETRY_API_KEY}`,
  },
  onError: (error) => console.error('[Telemetry Error]', error),
};

// Logger with telemetry
const logger = new Logger({
  format: 'json',
  telemetry: {
    ...telemetryConfig,
    endpoint: process.env.TELEMETRY_LOGS_ENDPOINT,
  },
});

// Metrics with telemetry
const metrics = new Metrics({
  telemetry: telemetryConfig,
  telemetryInterval: 60000,  // Export every minute
});

// Agent lifecycle
const agent = new Agent(agentConfig, { logger });

agent.on('transaction:sent', async (tx) => {
  try {
    const receipt = await tx.wait();
    metrics.recordTransaction(
      receipt.status === 1,
      receipt.gasUsed.toNumber()
    );
    logger.info('Transaction confirmed', {
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error) {
    metrics.recordTransaction(false);
    logger.error('Transaction failed', { error });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await metrics.getSnapshot();  // Final metrics
  await agent.stop();
  process.exit(0);
});
```

**Performance Considerations:**

- **Non-blocking**: All telemetry operations are async and queued
- **Batch processing**: Reduces network overhead by 90%+
- **Retry logic**: Handles temporary network failures
- **Timeout protection**: Prevents hanging requests (default: 5s)
- **Memory efficient**: Queue auto-flushes at configurable size
- **Zero impact**: Telemetry errors never crash your agent

**Monitoring Your Monitoring:**

```typescript
// Track telemetry performance
setInterval(() => {
  console.log({
    queueSize: telemetry.getQueueSize(),
    enabled: telemetry.isEnabled(),
  });
}, 60000);
```

---

#### **dashboard.ts** - Development Monitoring UI

Simple Express-based dashboard for real-time agent monitoring in development mode. View logs, metrics, and agent status in your browser.

**Key Features:**
- ✅ **Real-time monitoring** - Live updates for logs and metrics
- ✅ **REST API** - JSON endpoints for programmatic access
- ✅ **HTML UI** - Beautiful dark-themed dashboard in browser
- ✅ **Auto-refresh** - Logs refresh every 10s, metrics every 5s
- ✅ **CORS enabled** - Access API from external tools
- ✅ **Dev mode only** - Optional in production
- ✅ **Zero config** - Works out of the box

**Quick Start:**

```typescript
import { Agent, Logger, Metrics, startDashboard } from '@somnia/agent-kit';

const logger = new Logger({ enableMemoryStorage: true });
const metrics = new Metrics();
const agent = new Agent(config, { logger });

// Start dashboard (dev mode only)
if (process.env.NODE_ENV !== 'production') {
  const dashboard = startDashboard({
    port: 3001,
    logger,
    metrics,
    agent,
  });

  console.log(`📊 Dashboard: ${dashboard.getURL()}`);
  // Output: 📊 Dashboard: http://localhost:3001
}
```

**API Endpoints:**

```typescript
// Health check
GET /health
// Response: { "status": "ok", "timestamp": 1640000000 }

// Get metrics snapshot
GET /metrics
// Response: {
//   "tx_sent": 1000,
//   "tx_success_rate": 95.5,
//   "avg_gas_used": 25430,
//   "llm_calls": 500,
//   "reasoning_time": 1234,
//   "uptime": 3600000,
//   "tps": 16.67
// }

// Get recent logs
GET /logs?limit=20
// Response: {
//   "logs": [
//     {
//       "timestamp": 1640000000,
//       "level": "info",
//       "message": "Transaction sent",
//       "metadata": { "txHash": "0x..." }
//     }
//   ],
//   "total": 20
// }

// Get agent status
GET /status
// Response: {
//   "online": true,
//   "uptime": 3600000,
//   "version": "2.0.0",
//   "agent": {
//     "state": "active",
//     "address": "0x123...",
//     "name": "My Agent"
//   }
// }
```

**HTML UI Access:**

Open in browser: `http://localhost:3001`

**Dashboard Features:**
- **Agent Status Card**: Online status, uptime, version, agent state
- **Performance Metrics Card**: TX sent, success rate, gas, LLM calls, TPS
- **Recent Logs Panel**: Last 20 logs with color-coded levels (error, warn, info, debug)
- **Auto-Refresh**: Logs refresh every 10s, metrics/status every 5s
- **Manual Refresh**: Button to force log refresh
- **Responsive Design**: Works on desktop, tablet, and mobile

**Custom Configuration:**

```typescript
const dashboard = new Dashboard({
  port: 4000,              // Custom port
  enableUI: true,          // Enable HTML UI (default: true)
  enableCORS: true,        // Enable CORS (default: true)
  logger: logger,          // Logger instance
  metrics: metrics,        // Metrics instance
  agent: agent,            // Agent instance
  onError: (error) => {    // Custom error handler
    console.error('Dashboard error:', error);
  },
});

await dashboard.start();   // Start server
console.log(dashboard.getURL());  // Get URL
console.log(dashboard.isRunning());  // Check if running
await dashboard.stop();    // Stop server
```

**Programmatic API Access:**

```typescript
// Fetch metrics from external script
const response = await fetch('http://localhost:3001/metrics');
const metrics = await response.json();
console.log(`TPS: ${metrics.tps}, Success Rate: ${metrics.tx_success_rate}%`);

// Fetch recent logs
const logsResponse = await fetch('http://localhost:3001/logs?limit=50');
const { logs } = await logsResponse.json();
logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`);
});
```

**Integration with Monitoring Tools:**

```bash
# Curl examples
curl http://localhost:3001/metrics | jq '.tx_success_rate'
curl http://localhost:3001/status | jq '.uptime'

# Watch metrics in terminal
watch -n 5 'curl -s http://localhost:3001/metrics | jq .'
```

**Grafana Integration:**

```typescript
// Use dashboard API as Grafana datasource (Simple JSON plugin)
// Grafana dashboard queries:
// - http://localhost:3001/metrics (for metrics panels)
// - http://localhost:3001/status (for status panel)
// - http://localhost:3001/logs (for log table)
```

**Security Considerations:**

```typescript
// Production mode: Disable dashboard
if (process.env.NODE_ENV === 'production') {
  console.log('Dashboard disabled in production');
} else {
  startDashboard({ port: 3001, logger, metrics, agent });
}

// Or: Bind to localhost only (no external access)
const dashboard = new Dashboard({
  port: 3001,
  enableCORS: false,  // Disable CORS for security
});

// Or: Use authentication middleware
import express from 'express';
const app = express();
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token !== 'Bearer YOUR_SECRET_TOKEN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

**Real-World Example:**

```typescript
import { Agent, Logger, Metrics, startDashboard } from '@somnia/agent-kit';

// Setup monitoring
const logger = new Logger({
  format: 'pretty',
  enableMemoryStorage: true,  // Required for dashboard
});

const metrics = new Metrics();

// Create agent
const agent = new Agent({
  name: 'Trading Agent',
  description: 'Automated trading bot',
  owner: '0x...',
}, { logger });

// Track agent events
agent.on('transaction:sent', (tx) => {
  logger.info('Transaction sent', { txHash: tx.hash });
});

agent.on('transaction:confirmed', (receipt) => {
  metrics.recordTransaction(
    receipt.status === 1,
    receipt.gasUsed.toNumber()
  );
  logger.info('Transaction confirmed', {
    txHash: receipt.transactionHash,
    gasUsed: receipt.gasUsed.toString(),
  });
});

// Start dashboard in dev mode
if (process.env.NODE_ENV !== 'production') {
  const dashboard = startDashboard({
    port: 3001,
    logger,
    metrics,
    agent,
    onError: (error) => logger.error('Dashboard error', { error }),
  });

  console.log(`
╔═══════════════════════════════════════╗
║   📊 Agent Dashboard                   ║
║   ${dashboard.getURL()}                ║
║                                       ║
║   Endpoints:                          ║
║   - /metrics  (Performance metrics)   ║
║   - /logs     (Recent logs)           ║
║   - /status   (Agent status)          ║
║   - /health   (Health check)          ║
╚═══════════════════════════════════════╝
  `);
}

// Start agent
await agent.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await agent.stop();
  await dashboard.stop();
  process.exit(0);
});
```

**Performance:**
- **Lightweight**: Express server with minimal overhead
- **Non-blocking**: All API calls are async
- **Memory efficient**: Only stores logs if enableMemoryStorage is true
- **Fast**: API responses < 10ms for typical datasets

**Troubleshooting:**

```typescript
// Port already in use
const dashboard = new Dashboard({ port: 3002 });  // Use different port

// Logger not showing logs
const logger = new Logger({
  enableMemoryStorage: true,  // REQUIRED for dashboard /logs endpoint
});

// Metrics not available
const metrics = new Metrics();  // Create metrics instance first
const dashboard = startDashboard({ metrics });  // Pass to dashboard

// CORS issues
const dashboard = new Dashboard({
  enableCORS: true,  // Enable CORS for external access
});
```

---

### 8. **cli/** - Command Line Interface (4/4 files)
**Status**: ✅ Completed (v2.2.0 - Reorganized)

**Structural Changes in v2.2.0**:
- ✅ Organized commands into `commands/` subfolder for better structure
- ✅ Each command has its own file for maintainability

**Module Structure**:
```
cli/
├── commands/       # Individual command implementations
│   ├── create.ts
│   ├── deploy.ts
│   └── start.ts
├── index.ts        # CLI entry point
└── parser.ts       # Command parsing logic
```

**Implemented Commands**:
- `create` - Create new agent configuration
- `deploy` - Deploy agent on-chain via AgentRegistry
- `start` - Start agent execution with triggers
- `stop` - Stop running agent
- `status` - View agent status and metrics
- `task` - Create and manage tasks for agents
- `help` - Display command help and usage

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

### ✅ Latest: v2.2.0 - Structural Reorganization (October 2025)

**Major Architectural Changes:**
- ✅ **New `utils/` Module (5 files)**: Extracted utilities from `core/utils.ts` for better modularity
  - `logger.ts`: Pino-based logging utilities
  - `retry.ts`: Retry logic with exponential backoff
  - `encode.ts`: Encoding/decoding utilities (hex, bytes, UTF-8)
  - `validate.ts`: Validation helpers (addresses, data formats)
  - `index.ts`: Utility exports

- ✅ **Reorganized `llm/` Module (9 files)**: Improved structure with subfolders
  - **New `adapters/` subfolder**: openaiAdapter.ts, ollamaAdapter.ts
  - **New `prompt/` subfolder**: templates.ts, builder.ts
  - **Moved from `runtime/`**: memory.ts, context.ts (LLM-specific functionality)
  - **New files**: planner.ts (LLM planning logic), reasoning.ts (chain-of-thought)
  - **Removed**: anthropicAdapter.ts (consolidated to 2 adapters), types.ts (merged to centralized types/)

- ✅ **Enhanced `runtime/` Module (6 files)**: Cleaner separation of concerns
  - **Renamed**: memory.ts → memoryManager.ts (agent-specific memory management)
  - **Removed**: storage.ts (merged into agent.ts), context.ts (moved to llm/)
  - Core files: agent.ts, planner.ts, executor.ts, trigger.ts, memoryManager.ts, policy.ts

- ✅ **Reorganized `cli/` Module (4 files)**: Better command organization
  - **New `commands/` subfolder**: create.ts, deploy.ts, start.ts
  - Files: commands/, index.ts, parser.ts

- ✅ **New `version.ts`**: SDK version tracking at root level

- ✅ **Reduced `core/` Module (5 files)**: Extracted utilities for cleaner blockchain layer
  - Files: chainClient.ts, contracts.ts, signerManager.ts, config.ts, index.ts
  - Removed: utils.ts (extracted to utils/ module)

**Module Summary (v2.2.0):**
```
src/
├── version.ts        # ✅ SDK version tracking (NEW)
├── core/             # ✅ 5/5 files (was 6 - extracted utils)
├── runtime/          # ✅ 6/6 files (was 7 - removed storage, renamed memory)
├── llm/              # ✅ 9/9 files (was 4 - reorganized with subfolders)
├── utils/            # ✅ 5/5 files (NEW - extracted from core/)
├── config/           # ✅ 3/3 files (unchanged)
├── types/            # ✅ 7/7 files (unchanged)
├── monitor/          # ✅ 5/5 files (unchanged)
├── cli/              # ✅ 4/4 files (was 3 - added commands/ subfolder)
└── prompt/           # ✅ 2/2 files (moved to llm/prompt/)
```

**Benefits of Reorganization:**
- 🎯 **Better Modularity**: Clear separation between blockchain, runtime, LLM, and utilities
- 🎯 **Improved Maintainability**: Each module has focused responsibility
- 🎯 **Tree-Shaking**: Better bundle optimization with granular imports
- 🎯 **Discoverability**: Logical folder structure matches architectural layers

---

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

### 🔧 Recent Fixes (v2.0.1 - October 2025)

**Build & Type Errors Fixed:**
- ✅ **Fixed `agent.ts` registration** - Added missing `_ipfsMetadata` parameter to `registerAgent()` call (line 123)
- ✅ **Fixed `agent.ts` termination** - Changed from `deregisterAgent()` to `deactivateAgent()` using agentId (line 288)
- ✅ **Fixed `storage.ts` enum imports** - Changed StorageType and StorageBackend to value imports
- ✅ **Fixed `policy.ts` duplicate property** - Reordered object spread to prevent 'enabled' overwrite
- ✅ **Fixed `executor.ts` return types** - Changed ExecutionResult to DetailedExecutionResult for proper typing
- ✅ **Fixed `context.ts` network access** - Changed `provider.network` to `provider.getNetwork()` for ethers v6
- ✅ **Fixed `ollamaAdapter.ts` type assertion** - Added proper type for response.json()
- ✅ **Fixed `anthropicAdapter.ts` error types** - Added type assertions for error objects

**Contract Integration:**
- Agent registration now properly stores `agentId` (uint256) from AgentRegistry contract
- Terminate method correctly uses `deactivateAgent(agentId)` instead of non-existent `deregisterAgent()`
- IPFS metadata support added to agent registration flow

**Build Status:**
- ✅ ESM build: 299.86 KB
- ✅ CJS build: 303.83 KB
- ✅ DTS build: 184.36 KB
- ✅ All TypeScript errors resolved

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

# Agent Metadata (Optional)
AGENT_IPFS_METADATA=QmHash...  # IPFS hash for agent metadata (required for registration)

# SDK-Level Configuration (Optional)
SDK_DEBUG=false
SDK_TELEMETRY=false
SDK_LOG_LEVEL=info
SDK_LLM_PROVIDER=openai
SDK_DEFAULT_TIMEOUT=30000
SDK_MAX_RETRIES=3
SDK_AUTO_RECOVER=false

# Runtime Module Configuration (Optional)
RUNTIME_MAX_CONCURRENT=5
RUNTIME_ENABLE_PARALLEL=true
RUNTIME_DRY_RUN=false
RUNTIME_MEMORY_LIMIT=1000
RUNTIME_STORAGE_BACKEND=memory  # memory | file
RUNTIME_STORAGE_PATH=./data/storage
RUNTIME_MEMORY_BACKEND=memory  # memory | file
RUNTIME_MEMORY_PATH=./data/memory
RUNTIME_ENABLE_MEMORY=true
RUNTIME_SESSION_ID=

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

**Last Updated**: 2025-10-17
**Version**: 2.0.1
**Status**: Production Ready - All build errors fixed, SDK + Runtime config complete (Build: ESM 299.86 KB, CJS 303.83 KB, DTS 184.36 KB)

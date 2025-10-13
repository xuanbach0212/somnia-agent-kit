# Changelog

All notable changes to the Somnia AI Agent Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-04

### 🎉 Major Release - Complete Architecture Refactor

This is a **breaking release** with significant improvements to developer experience and functionality.

### Added

#### Core Architecture
- **`SomniaClient`** - New low-level blockchain interaction layer
  - Explicit `connect()` method for initialization
  - Improved error handling and connection management
  - Event subscription system
  - IPFS integration
  
- **`SomniaAgent`** - New high-level agent abstraction
  - Fluent API for configuration (`.configure()`, `.withExecutor()`, `.withLLM()`)
  - Explicit lifecycle management (`register()`, `start()`, `stop()`, `restart()`)
  - Built-in task listening and processing
  - Rich event system
  - Context-aware executor with utilities

#### LLM Support
- **`LLMProvider`** - Abstract base class for LLM implementations
- **`OpenAIProvider`** - Native OpenAI integration
  - Support for GPT-3.5, GPT-4, GPT-4o
  - Chat completions and text generation
  - Embeddings support
  - Token estimation
  
- **`AnthropicProvider`** - Native Anthropic Claude integration
  - Support for Claude 3 family (Opus, Sonnet, Haiku)
  - Claude 3.5 Sonnet support
  - Unified API with other providers
  
- **`MockProvider`** - Testing provider without API costs
  - Mock responses for all LLM methods
  - Deterministic behavior for testing
  - No API key required

#### Event System
- Lifecycle events: `agent:registered`, `agent:started`, `agent:stopped`
- Update events: `agent:updated`, `agent:activated`, `agent:deactivated`
- Task events: `task:created`, `task:started`, `task:completed`, `task:failed`
- Metrics events: `metrics:updated`
- Error events: `error`

#### Types & Interfaces
- **`ClientConfig`** - Configuration for SomniaClient
- **`AgentConfig`** - Configuration for SomniaAgent
- **`ExecutorContext`** - Context passed to executor functions
- **`LLMConfig`**, **`OpenAIConfig`**, **`AnthropicConfig`** - LLM configurations
- **`ChatMessage`**, **`GenerateOptions`**, **`ChatOptions`** - LLM method parameters
- **`ModelInfo`** - LLM model metadata

#### Examples
- `examples/1-basic-agent.ts` - Simple agent without LLM
- `examples/2-llm-agent-openai.ts` - Agent with OpenAI GPT
- `examples/3-llm-agent-claude.ts` - Agent with Anthropic Claude
- `examples/4-event-driven-agent.ts` - Event-driven architecture
- `examples/5-task-management.ts` - Task creation and management

#### Documentation
- **API_REFERENCE.md** - Complete API documentation
- **MIGRATION.md** - Migration guide from v1.x
- **CHANGELOG.md** - This file
- Enhanced README with v2.0 examples

### Changed

#### Breaking Changes
- **`SomniaAgentSDK`** renamed to **`SomniaClient`**
  - Constructor no longer takes config (use `connect()` method)
  - Config structure changed: `contracts.agentRegistry` instead of `agentRegistryAddress`
  - Removed `chainId` parameter (auto-detected)
  
- **`AgentBuilder`** removed, replaced by **`SomniaAgent`**
  - `.quick()` removed - use `new SomniaAgent(client).configure({...})`
  - `.addCapability()` removed - use `capabilities: []` array
  - `.connectSDK()` removed - pass client to constructor
  - `.build()` removed - use explicit `register()` and `start()`
  
- **Executor signature changed**
  - Old: `{ execute: async (input) => {...} }`
  - New: `.withExecutor(async (input, context) => {...})`
  - Context provides: `llm`, `agentId`, `logger`, `ipfs`

- **Type imports reorganized**
  - `sdk/types.ts` → `core/types.ts` and `llm/types.ts`
  - `SDKConfig` → `ClientConfig`
  
#### API Changes
- Task data now supports objects (auto-serialized to JSON)
- Agent activation/deactivation separated from start/stop
- IPFS methods available via client and executor context
- Improved error messages with context

#### Monitoring
- `MetricsCollector` and `AgentMonitor` updated to use `SomniaClient`
- `MonitoringClient` added as SDK wrapper for REST + WebSocket APIs
- Server initialization uses `client.connect()` pattern

### Improved

- **Developer Experience**
  - Fluent, chainable API
  - Better TypeScript support with comprehensive types
  - Clear separation of concerns (client vs agent)
  - Explicit lifecycle management
  - Rich event system for monitoring
  
- **Testing**
  - `MockProvider` for testing without API costs
  - Deterministic mock responses
  - Easy to test agent logic in isolation
  
- **Error Handling**
  - Better error messages with context
  - Graceful degradation
  - Connection state management
  
- **Code Quality**
  - Modular architecture
  - Better separation of concerns
  - Improved code organization
  - Comprehensive JSDoc comments

### Fixed

- ESLint dependency conflicts (downgraded to v8.57.0)
- TypeScript compilation errors
- Import path issues in monitoring modules
- IPFS configuration type conflicts
- OpenAI streaming response type handling

### Removed

- `viem` dependency (using ethers.js v6)
- `AgentBuilder` class
- `SomniaAgentSDK` class
- Old example files
- Redundant documentation files

### Dependencies

#### Added
- `@anthropic-ai/sdk@^0.20.0` - Anthropic Claude integration
- `openai@^4.20.1` - OpenAI integration

#### Updated
- `eslint@^8.57.0` (downgraded from ^9.0.0 for compatibility)
- `@typescript-eslint/parser@^7.0.0`
- `@typescript-eslint/eslint-plugin@^7.0.0`

#### Removed
- `viem` - Replaced by ethers.js

---

## [1.0.0] - 2024-12-XX

### Initial Release

- Smart contracts for agent registry and task management
- TypeScript SDK for agent interaction
- Agent builder with fluent API
- Monitoring server with REST API and WebSocket
- IPFS integration for metadata storage
- Examples and documentation
- Hardhat deployment scripts
- ESLint and Prettier configuration

---

## Migration Notes

### From v1.x to v2.0

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.

**Quick summary:**
1. Replace `SomniaAgentSDK` with `SomniaClient`
2. Replace `AgentBuilder` with `SomniaAgent`
3. Use `connect()` method for initialization
4. Use fluent API for configuration
5. Update executor to accept context parameter
6. Use built-in LLM providers if needed
7. Add event listeners for monitoring

**Example:**

```typescript
// v1.x
const sdk = new SomniaAgentSDK({...});
const agent = await AgentBuilder.quick('Name', 'Desc', {
  execute: async (input) => {...}
}).connectSDK(sdk).build();

// v2.0
const client = new SomniaClient();
await client.connect({...});
const agent = new SomniaAgent(client)
  .configure({ name: 'Name', description: 'Desc', capabilities: [] })
  .withExecutor(async (input, context) => {...});
await agent.register();
await agent.start();
```

---

## Roadmap

### v2.1.0 (Planned)
- [ ] Additional LLM providers (Cohere, Mistral)
- [ ] Agent-to-agent communication
- [ ] Multi-agent orchestration
- [ ] Advanced monitoring dashboards
- [ ] Performance optimizations

### v2.2.0 (Planned)
- [ ] Agent marketplace integration
- [ ] Automated testing framework
- [ ] CLI tool for agent management
- [ ] Web UI for monitoring

### v3.0.0 (Future)
- [ ] Multi-chain support
- [ ] Advanced cryptographic features
- [ ] Decentralized agent discovery
- [ ] DAO governance integration

---

[2.0.0]: https://github.com/yourusername/somnia-ai-agent-framework/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/yourusername/somnia-ai-agent-framework/releases/tag/v1.0.0


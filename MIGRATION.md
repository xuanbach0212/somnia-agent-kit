# Migration Guide: v1.x → v2.0

This guide helps you upgrade from v1.x to v2.0 of the Somnia AI Agent Framework.

## 🎯 Overview of Changes

Version 2.0 is a major refactor with breaking changes but improved developer experience:

### Key Improvements

1. **Native LLM Support** - Built-in OpenAI, Anthropic, and Mock providers
2. **Modular Architecture** - Separation of `SomniaClient` (low-level) and `SomniaAgent` (high-level)
3. **Fluent API** - Chainable configuration methods
4. **Event System** - Rich events for monitoring agent lifecycle
5. **Better Types** - Comprehensive TypeScript support
6. **Testing Ready** - Mock provider for unit testing

---

## 📦 Package Changes

### Dependencies

**Removed:**
- `viem` (replaced by ethers.js v6)

**Added:**
- `@anthropic-ai/sdk` - Anthropic Claude integration
- `openai` - OpenAI GPT integration

**Updated:**
- `eslint` - 9.0.0 → 8.57.0 (for compatibility)

### Installation

```bash
# Remove old node_modules
rm -rf node_modules package-lock.json

# Install new dependencies
npm install

# If you use LLMs, install their SDKs
npm install openai @anthropic-ai/sdk
```

---

## 🔄 API Changes

### 1. SDK Initialization

**Before (v1.x):**
```typescript
import { SomniaAgentSDK } from './sdk/SomniaAgentSDK';

const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  chainId: Number(process.env.SOMNIA_CHAIN_ID),
  privateKey: process.env.PRIVATE_KEY,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
});
```

**After (v2.0):**
```typescript
import { SomniaClient } from './core/SomniaClient';

const client = new SomniaClient();
await client.connect({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
    agentManager: process.env.AGENT_MANAGER_ADDRESS,
  },
});
```

**Changes:**
- `SomniaAgentSDK` → `SomniaClient`
- Constructor takes no arguments (lazy initialization)
- Explicit `connect()` method (async)
- `contracts` nested object instead of flat properties
- No `chainId` needed (auto-detected from RPC)

---

### 2. Agent Creation

**Before (v1.x):**
```typescript
import { AgentBuilder } from './sdk/AgentBuilder';

const agent = await AgentBuilder.quick(
  'My Agent',
  'Agent description',
  {
    execute: async (input) => {
      return { success: true, result: 'done' };
    },
  }
)
  .addCapability('task1')
  .connectSDK(sdk)
  .build();

// Agent is automatically registered and active
```

**After (v2.0):**
```typescript
import { SomniaAgent } from './core/SomniaAgent';

const agent = new SomniaAgent(client)
  .configure({
    name: 'My Agent',
    description: 'Agent description',
    capabilities: ['task1'],
  })
  .withExecutor(async (input, context) => {
    return { success: true, result: 'done' };
  });

// Explicit lifecycle control
await agent.register();
await agent.start();
```

**Changes:**
- `AgentBuilder.quick()` → `new SomniaAgent(client)`
- `.addCapability()` → `capabilities: []` array in config
- `.connectSDK()` → pass client to constructor
- `.build()` → separate `register()` and `start()` calls
- Executor receives `context` with utilities (logger, IPFS, LLM)

---

### 3. LLM Integration

**Before (v1.x):**
```typescript
// No built-in LLM support - you had to integrate manually
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: '...' });

const agent = await AgentBuilder.quick('AI Agent', 'desc', {
  execute: async (input) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: input.prompt }],
    });
    return { success: true, result: response.choices[0].message.content };
  },
}).connectSDK(sdk).build();
```

**After (v2.0):**
```typescript
import { OpenAIProvider } from './llm/OpenAIProvider';

const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

const agent = new SomniaAgent(client)
  .configure({
    name: 'AI Agent',
    description: 'AI-powered agent',
    capabilities: ['chat'],
  })
  .withLLM(llm)
  .withExecutor(async (input, context) => {
    // Access LLM via context
    const response = await context.llm!.chat([
      { role: 'user', content: input.prompt },
    ]);
    return { success: true, result: { response } };
  });
```

**Changes:**
- Built-in `OpenAIProvider`, `AnthropicProvider`, `MockProvider`
- Standardized interface across all LLMs
- LLM available in executor context
- No need to import SDK-specific packages
- Mock provider for testing

---

### 4. Event Handling

**Before (v1.x):**
```typescript
// Limited event support
// Had to manually poll or subscribe to blockchain events
sdk.getAgentRegistryContract().on('AgentExecuted', (agentId) => {
  console.log('Agent executed:', agentId);
});
```

**After (v2.0):**
```typescript
// Rich event system built into SomniaAgent
agent.on('agent:registered', (agentId) => {
  console.log('Agent registered:', agentId);
});

agent.on('agent:started', () => {
  console.log('Agent started');
});

agent.on('task:created', (task) => {
  console.log('New task:', task);
});

agent.on('task:completed', ({ taskId, result }) => {
  console.log('Task completed:', taskId, result);
});

agent.on('task:failed', ({ taskId, error }) => {
  console.error('Task failed:', taskId, error);
});

agent.on('metrics:updated', (metrics) => {
  console.log('Metrics:', metrics);
});

agent.on('error', (error) => {
  console.error('Agent error:', error);
});
```

**Changes:**
- Built-in EventEmitter in `SomniaAgent`
- Lifecycle events (registered, started, stopped)
- Task events (created, started, completed, failed)
- Metrics events (real-time updates)
- Standardized event naming (`category:action`)

---

### 5. Monitoring

**Before (v1.x):**
```typescript
import { MetricsCollector } from './monitoring/MetricsCollector';

const collector = new MetricsCollector(sdk);
const metrics = await collector.collectAgentMetrics('1');
```

**After (v2.0):**
```typescript
import { MonitoringClient } from './monitoring/MonitoringClient';

const monitoring = new MonitoringClient({
  baseUrl: 'http://localhost:3001',
  autoConnect: true,
});

// REST API
const metrics = await monitoring.getAgentMetrics('1');
const aggregated = await monitoring.getAggregatedMetrics();

// WebSocket
monitoring.on('metrics', (data) => {
  console.log('Metrics update:', data);
});
```

**Changes:**
- New `MonitoringClient` wraps all monitoring APIs
- REST + WebSocket in single client
- Auto-reconnection support
- Typed events

---

### 6. Task Management

**Before (v1.x):**
```typescript
// Create task
const taskId = await sdk.createTask({
  agentId: '1',
  taskData: 'Task description',
  reward: ethers.parseEther('0.1'),
});

// Complete task (manual)
await sdk.completeTask(taskId, 'Result');
```

**After (v2.0):**
```typescript
// Create task (same)
const taskId = await client.createTask({
  agentId: '1',
  taskData: { prompt: 'Task description' },
  reward: ethers.parseEther('0.1'),
});

// Agent auto-processes tasks when running
await agent.start(); // Listens and auto-processes

// Or manually process specific task
const result = await agent.processTask(taskId);
```

**Changes:**
- Tasks can be objects (auto-serialized)
- Agent auto-listens and processes when started
- Manual processing still available via `processTask()`
- Automatic metrics recording
- Automatic payment handling (complete/fail)

---

### 7. IPFS

**Before (v1.x):**
```typescript
import { IPFSManager } from './utils/ipfs';

const ipfs = new IPFSManager();
const hash = await ipfs.upload({ data: 'hello' });
const data = await ipfs.fetch(hash);
```

**After (v2.0):**
```typescript
// Available in executor context
const agent = new SomniaAgent(client)
  .withExecutor(async (input, context) => {
    // Upload to IPFS
    const hash = await context.ipfs.upload({ data: 'hello' });
    
    // Fetch from IPFS
    const data = await context.ipfs.fetch(hash);
    
    return { success: true, result: data };
  });

// Or use client directly
const hash = await client.uploadToIPFS({ data: 'hello' });
const data = await client.fetchFromIPFS(hash);
```

**Changes:**
- IPFS available in executor context
- Also available via client
- Same API, more accessible

---

### 8. Type Imports

**Before (v1.x):**
```typescript
import { SDKConfig, AgentData, AgentMetrics } from './sdk/types';
```

**After (v2.0):**
```typescript
// Core types
import { ClientConfig, AgentConfig, AgentData, AgentMetrics } from './core/types';

// LLM types
import { LLMConfig, ChatMessage, GenerateOptions } from './llm/types';

// Or import from index
import type { ClientConfig, AgentConfig } from './index';
```

**Changes:**
- `SDKConfig` → `ClientConfig`
- Types organized by module (`core/types`, `llm/types`)
- All types exported from index

---

## 🧪 Testing Changes

**Before (v1.x):**
```typescript
// No mock support - had to use real APIs or mock manually
```

**After (v2.0):**
```typescript
import { MockProvider } from './llm/MockProvider';

// Use in tests without API costs
const mockLLM = new MockProvider({});

const agent = new SomniaAgent(client)
  .withLLM(mockLLM)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.generate(input.prompt);
    // Returns: "Mock response to: [input.prompt]"
    expect(response).toContain('Mock response');
  });
```

---

## 📝 Example Migration

Here's a complete example migration:

### Before (v1.x)

```typescript
import { SomniaAgentSDK, AgentBuilder } from './sdk';
import OpenAI from 'openai';

const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  chainId: 50311,
  privateKey: process.env.PRIVATE_KEY,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const agent = await AgentBuilder.quick('AI Agent', 'Desc', {
  execute: async (input) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: input.prompt }],
    });
    return { 
      success: true, 
      result: response.choices[0].message.content 
    };
  },
})
  .addCapability('chat')
  .connectSDK(sdk)
  .build();

console.log('Agent ID:', agent.getAgentId());
```

### After (v2.0)

```typescript
import { SomniaClient, SomniaAgent, OpenAIProvider } from './index';

const client = new SomniaClient();
await client.connect({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
    agentManager: process.env.AGENT_MANAGER_ADDRESS,
  },
});

const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

const agent = new SomniaAgent(client)
  .configure({
    name: 'AI Agent',
    description: 'Desc',
    capabilities: ['chat'],
    autoStart: true,
  })
  .withLLM(llm)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.chat([
      { role: 'user', content: input.prompt },
    ]);
    return { success: true, result: { response } };
  });

// Set up events
agent.on('agent:registered', (agentId) => {
  console.log('Agent ID:', agentId);
});

agent.on('task:completed', ({ taskId, result }) => {
  console.log('Task completed:', taskId);
});

// Register and start
await agent.register();
await agent.start();
```

---

## ✅ Migration Checklist

- [ ] Update imports: `SomniaAgentSDK` → `SomniaClient`
- [ ] Update imports: `AgentBuilder` → `SomniaAgent`
- [ ] Change SDK initialization to use `connect()` method
- [ ] Update agent creation to use fluent API
- [ ] Change `.build()` to `.register()` + `.start()`
- [ ] Update executor signature to include `context` parameter
- [ ] If using OpenAI/Anthropic, use built-in providers
- [ ] Add event listeners for agent lifecycle
- [ ] Update type imports (core/types, llm/types)
- [ ] Test with `MockProvider` before deploying

---

## 🆘 Common Issues

### Issue: "Cannot find module '../sdk/SomniaAgentSDK'"

**Solution:** Update imports to new paths:
```typescript
// Old
import { SomniaAgentSDK } from './sdk/SomniaAgentSDK';

// New
import { SomniaClient } from './core/SomniaClient';
```

### Issue: "Property 'build' does not exist"

**Solution:** Replace `.build()` with explicit lifecycle:
```typescript
// Old
const agent = await builder.build();

// New
const agent = new SomniaAgent(client).configure({...});
await agent.register();
await agent.start();
```

### Issue: "Executor function not working"

**Solution:** Update executor signature:
```typescript
// Old
{ execute: async (input) => {...} }

// New
.withExecutor(async (input, context) => {...})
```

---

## 📚 Resources

- [API Reference](./API_REFERENCE.md) - Complete v2.0 API docs
- [Examples](./examples/) - Updated example code
- [README](./README.md) - Quick start guide

---

**Need help?** Open an issue on GitHub or ask in the Somnia Discord #dev-chat channel.

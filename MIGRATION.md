# Migration Guide - SDK v2.0

This guide helps you migrate from the old SDK architecture to the new refactored version.

## What Changed?

### Architecture Overview

**Old:**
```
AgentBuilder + DeployedAgent + SomniaAgentSDK
```

**New:**
```
SomniaClient (low-level) + SomniaAgent (high-level) + LLM (core)
```

## Key Changes

### 1. Import Changes

**Old:**
```typescript
import { SomniaAgentSDK, AgentBuilder } from '@somnia/sdk';
```

**New:**
```typescript
import { SomniaClient, SomniaAgent, OpenAIProvider } from '@somnia/sdk';
```

### 2. Client Initialization

**Old:**
```typescript
const sdk = new SomniaAgentSDK({
  rpcUrl: 'https://...',
  privateKey: '0x...',
  agentRegistryAddress: '0x...',
  agentManagerAddress: '0x...',
});
```

**New:**
```typescript
const client = new SomniaClient();
await client.connect({
  rpcUrl: 'https://...',
  privateKey: '0x...',
  contracts: {
    agentRegistry: '0x...',
    agentManager: '0x...',
  },
});
```

### 3. Agent Creation

**Old:**
```typescript
const agent = await AgentBuilder.quick(
  'Agent Name',
  'Description',
  {
    execute: async (input) => {
      return { success: true, result: input };
    },
  }
)
  .addCapability('capability')
  .connectSDK(sdk)
  .build();
```

**New:**
```typescript
const agent = new SomniaAgent(client)
  .configure({
    name: 'Agent Name',
    description: 'Description',
    capabilities: ['capability'],
  })
  .withExecutor(async (input, context) => {
    return { success: true, result: input };
  });

const agentId = await agent.register();
```

### 4. LLM Integration

**Old:**
LLM was optional and not part of core

**New:**
LLM is a core feature:

```typescript
import { OpenAIProvider } from '@somnia/sdk';

const agent = new SomniaAgent(client)
  .configure({...})
  .withLLM(new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
  }))
  .withExecutor(async (input, context) => {
    // LLM is available in context
    const response = await context.llm.chat([...]);
    return { success: true, result: { response } };
  });
```

### 5. Executor Function Signature

**Old:**
```typescript
execute: async (input: any) => Promise<ExecutionResult>
```

**New:**
```typescript
executor: async (input: any, context: ExecutorContext) => Promise<ExecutionResult>

// Context includes:
// - llm: LLMProvider (if configured)
// - agentId: string
// - logger: Logger
// - ipfs: IPFSManager
```

### 6. Lifecycle Management

**New feature in v2.0:**

```typescript
// Start agent (activates + listens for tasks)
await agent.start();

// Stop agent
await agent.stop();

// Restart agent
await agent.restart();

// Check state
agent.getState(); // 'idle' | 'running' | 'stopped' | 'error'
```

### 7. Event System

**New feature in v2.0:**

```typescript
agent.on('agent:registered', (agentId) => {
  console.log(`Agent registered: ${agentId}`);
});

agent.on('task:completed', ({ taskId, result }) => {
  console.log(`Task completed: ${taskId}`);
});

agent.on('metrics:updated', (metrics) => {
  console.log(`Metrics: ${metrics}`);
});
```

### 8. Task Management

**Old (via SDK):**
```typescript
const taskId = await sdk.createTask({ agentId, taskData, reward });
await sdk.completeTask(taskId, result);
```

**New (via Client):**
```typescript
// Low-level control
const taskId = await client.createTask({ agentId, taskData, reward });
await client.startTask(taskId);
await client.completeTask(taskId, result);

// High-level (via Agent)
await agent.start(); // Auto-listens for tasks
// Tasks are processed automatically
```

### 9. Direct Contract Calls

**Old:**
```typescript
await sdk.registerAgent(config);
await sdk.getAgent(agentId);
await sdk.getAgentMetrics(agentId);
```

**New:**
```typescript
// Via Client (low-level)
await client.registerAgent(params);
await client.getAgent(agentId);
await client.getAgentMetrics(agentId);

// Via Agent (high-level)
await agent.register();
await agent.getDetails();
await agent.getMetrics();
```

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install @anthropic-ai/sdk@^0.20.0
```

### Step 2: Update Imports

Replace all old imports with new ones:
```typescript
// Remove
import { SomniaAgentSDK, AgentBuilder } from '@somnia/sdk';

// Add
import { SomniaClient, SomniaAgent, OpenAIProvider } from '@somnia/sdk';
```

### Step 3: Update Client Initialization

Change SDK initialization to Client:
```typescript
const client = new SomniaClient();
await client.connect(config);
```

### Step 4: Update Agent Creation

Replace AgentBuilder with SomniaAgent:
```typescript
const agent = new SomniaAgent(client)
  .configure({...})
  .withExecutor((input, context) => {...});

await agent.register();
```

### Step 5: Add LLM (Optional)

If using AI capabilities:
```typescript
.withLLM(new OpenAIProvider({ apiKey: '...' }))
```

### Step 6: Update Executor Function

Add context parameter:
```typescript
.withExecutor(async (input, context) => {
  // Use context.llm, context.logger, etc.
})
```

### Step 7: Add Event Handlers (Optional)

```typescript
agent.on('task:completed', (result) => {
  // Handle completion
});
```

## Complete Example Migration

### Before (Old SDK)
```typescript
import { SomniaAgentSDK, AgentBuilder } from '@somnia/sdk';

const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
});

const agent = await AgentBuilder.quick(
  'My Agent',
  'Description',
  {
    execute: async (input) => {
      return { success: true, result: input };
    },
  }
)
  .addCapability('task-processing')
  .connectSDK(sdk)
  .build();

const result = await agent.execute(input);
```

### After (New SDK)
```typescript
import { SomniaClient, SomniaAgent } from '@somnia/sdk';

const client = new SomniaClient();
await client.connect({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
    agentManager: process.env.AGENT_MANAGER_ADDRESS,
  },
});

const agent = new SomniaAgent(client)
  .configure({
    name: 'My Agent',
    description: 'Description',
    capabilities: ['task-processing'],
  })
  .withExecutor(async (input, context) => {
    return { success: true, result: input };
  });

await agent.register();
await agent.start(); // Auto-listens for tasks

// Or process manually
const result = await agent.processTask(taskId);
```

## Benefits of v2.0

1. **Clearer Separation**: SomniaClient (low-level) vs SomniaAgent (high-level)
2. **LLM as Core**: First-class support for AI with OpenAI, Anthropic, Mock providers
3. **Event-Driven**: Built-in EventEmitter for reactive programming
4. **Lifecycle Management**: start/stop/restart with state tracking
5. **Better Context**: Executor receives context with LLM, logger, IPFS
6. **Type Safety**: Improved TypeScript types throughout
7. **Flexibility**: Use Client directly for fine-grained control or Agent for convenience

## Need Help?

- Check [examples/](./examples/) for complete working examples
- See [README.md](./README.md) for full documentation
- Review [examples/README.md](./examples/README.md) for example-specific docs

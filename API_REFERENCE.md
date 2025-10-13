# API Reference - Somnia AI Agent Framework v2.0

Complete API documentation for the refactored Somnia AI Agent Framework.

---

## 📚 Table of Contents

1. [Core Classes](#core-classes)
   - [SomniaClient](#somniaclient)
   - [SomniaAgent](#somniaagent)
   - [LLMProvider](#llmprovider)
2. [LLM Providers](#llm-providers)
   - [OpenAIProvider](#openaiprovider)
   - [AnthropicProvider](#anthropicprovider)
   - [MockProvider](#mockprovider)
3. [Monitoring](#monitoring)
   - [MonitoringClient](#monitoringclient)
   - [MetricsCollector](#metricscollector)
   - [AgentMonitor](#agentmonitor)
4. [Types](#types)
5. [Events](#events)

---

## Core Classes

### SomniaClient

**Low-level blockchain interaction layer** for contract calls, transactions, and events.

#### Constructor

```typescript
const client = new SomniaClient();
```

#### Methods

##### Connection Management

**`connect(config: ClientConfig): Promise<void>`**
- Initialize connection to Somnia network
- Parameters:
  - `config.rpcUrl` - RPC endpoint URL
  - `config.privateKey` - Optional private key for signing
  - `config.contracts.agentRegistry` - AgentRegistry address
  - `config.contracts.agentManager` - AgentManager address
  - `config.ipfs` - Optional IPFS configuration

```typescript
await client.connect({
  rpcUrl: 'https://dream-rpc.somnia.network',
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    agentRegistry: '0x...',
    agentManager: '0x...',
  }
});
```

**`disconnect(): void`**
- Close connection and clean up resources

**`isConnected(): boolean`**
- Check if client is connected

##### Agent Registry Methods

**`registerAgent(params: RegisterAgentParams): Promise<string>`**
- Register new agent on-chain
- Returns: Agent ID
- Parameters:
  - `name` - Agent name
  - `description` - Agent description
  - `ipfsMetadata` - IPFS hash for metadata
  - `capabilities` - Array of capability strings

```typescript
const agentId = await client.registerAgent({
  name: 'My Agent',
  description: 'Agent description',
  ipfsMetadata: 'QmXXX...',
  capabilities: ['task1', 'task2']
});
```

**`updateAgent(agentId: string, params: UpdateAgentParams): Promise<void>`**
- Update agent information

**`activateAgent(agentId: string): Promise<void>`**
- Activate agent on-chain

**`deactivateAgent(agentId: string): Promise<void>`**
- Deactivate agent on-chain

**`recordExecution(agentId: string, success: boolean, executionTime: number): Promise<void>`**
- Record execution metrics on-chain

**`getAgent(agentId: string): Promise<AgentData>`**
- Fetch agent data from blockchain

**`getAgentMetrics(agentId: string): Promise<AgentMetrics>`**
- Get agent performance metrics

**`getOwnerAgents(ownerAddress?: string): Promise<string[]>`**
- Get all agents owned by address

**`getTotalAgents(): Promise<number>`**
- Get total number of registered agents

##### Task Manager Methods

**`createTask(params: CreateTaskParams): Promise<string>`**
- Create new task with payment
- Returns: Task ID
- Parameters:
  - `agentId` - Target agent ID
  - `taskData` - Task data (string or object)
  - `reward` - Payment amount in wei

```typescript
const taskId = await client.createTask({
  agentId: '1',
  taskData: { prompt: 'Hello' },
  reward: ethers.parseEther('0.1')
});
```

**`startTask(taskId: string): Promise<void>`**
- Mark task as in progress

**`completeTask(taskId: string, result: string | object): Promise<void>`**
- Complete task and release payment

**`failTask(taskId: string): Promise<void>`**
- Mark task as failed and refund

**`cancelTask(taskId: string): Promise<void>`**
- Cancel pending task

**`getTask(taskId: string): Promise<TaskData>`**
- Fetch task details

**`getTotalTasks(): Promise<number>`**
- Get total number of tasks

##### Event Subscription

**`subscribeToEvent(eventName: string, callback: EventCallback): Subscription`**
- Subscribe to blockchain events
- Returns: Subscription object with `unsubscribe()` method

```typescript
const sub = client.subscribeToEvent('TaskCreated', (taskId, agentId) => {
  console.log(`Task ${taskId} created for agent ${agentId}`);
});

// Later
sub.unsubscribe();
```

##### IPFS Methods

**`uploadToIPFS(data: any): Promise<string>`**
- Upload data to IPFS
- Returns: IPFS hash

**`fetchFromIPFS(hash: string): Promise<any>`**
- Fetch data from IPFS

##### Utility Methods

**`getSignerAddress(): Promise<string>`**
- Get current signer address

**`getBalance(address?: string): Promise<bigint>`**
- Get balance of address

**`getProvider(): JsonRpcProvider | undefined`**
- Get ethers provider

**`getSigner(): Wallet | undefined`**
- Get ethers signer

---

### SomniaAgent

**High-level agent abstraction** with lifecycle management and event system.

#### Constructor

```typescript
const agent = new SomniaAgent(client);
```

#### Configuration Methods

**`configure(config: AgentConfig): SomniaAgent`**
- Configure agent properties
- Returns: `this` (chainable)

```typescript
agent.configure({
  name: 'My Agent',
  description: 'Agent description',
  capabilities: ['task1', 'task2'],
  metadata: { version: '1.0.0' },
  autoStart: true,
  pollingInterval: 5000
});
```

**`withExecutor(executor: ExecutorFunction): SomniaAgent`**
- Set executor function
- Returns: `this` (chainable)

```typescript
agent.withExecutor(async (input, context) => {
  // Your logic here
  return { success: true, result: 'done' };
});
```

**`withLLM(llm: LLMProvider): SomniaAgent`**
- Attach LLM provider
- Returns: `this` (chainable)

```typescript
const llm = new OpenAIProvider({ apiKey: '...' });
agent.withLLM(llm);
```

**`getLLM(): LLMProvider | undefined`**
- Get attached LLM provider

#### Lifecycle Methods

**`register(): Promise<string>`**
- Register agent on blockchain
- Returns: Agent ID

**`start(): Promise<void>`**
- Start agent (activate + listen for tasks)

**`stop(): Promise<void>`**
- Stop agent (deactivate + stop listening)

**`restart(): Promise<void>`**
- Restart agent

**`getState(): AgentState`**
- Get current state: `'idle' | 'running' | 'stopped' | 'error'`

#### Task Processing

**`processTask(taskId: string): Promise<ExecutionResult>`**
- Process a specific task
- Executes executor function
- Records metrics on-chain
- Completes or fails task automatically

**`listenForTasks(): Promise<void>`**
- Start listening for new tasks (events + polling)

**`stopListening(): void`**
- Stop listening for tasks

#### Information Methods

**`getMetrics(): Promise<AgentMetrics>`**
- Get agent metrics from blockchain

**`getDetails(): Promise<AgentData>`**
- Get agent details from blockchain

**`getAgentId(): string | undefined`**
- Get agent ID

**`getConfig(): AgentConfig | undefined`**
- Get agent configuration

#### Update Methods

**`update(params: UpdateAgentParams): Promise<void>`**
- Update agent on blockchain

**`activate(): Promise<void>`**
- Activate agent

**`deactivate(): Promise<void>`**
- Deactivate agent

#### Events

Agent extends EventEmitter and emits these events:

```typescript
agent.on('agent:registered', (agentId: string) => {});
agent.on('agent:started', () => {});
agent.on('agent:stopped', () => {});
agent.on('agent:updated', (params) => {});
agent.on('agent:activated', () => {});
agent.on('agent:deactivated', () => {});

agent.on('task:created', (task) => {});
agent.on('task:started', (taskId) => {});
agent.on('task:completed', ({ taskId, result }) => {});
agent.on('task:failed', ({ taskId, error }) => {});

agent.on('metrics:updated', (metrics) => {});
agent.on('error', (error) => {});
```

---

### LLMProvider

**Abstract base class** for all LLM implementations.

#### Methods

**`abstract generate(prompt: string, options?: GenerateOptions): Promise<string>`**
- Generate completion from prompt

**`abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>`**
- Chat completion with message history

**`abstract embed(text: string): Promise<number[]>`**
- Generate embeddings

**`abstract estimateTokens(text: string): number`**
- Estimate token count

**`abstract getModelInfo(): ModelInfo`**
- Get model information

**`getModel(): string`**
- Get current model name

**`isConfigured(): boolean`**
- Check if API key is configured

---

## LLM Providers

### OpenAIProvider

**OpenAI GPT integration** (GPT-3.5, GPT-4, GPT-4o).

#### Constructor

```typescript
import { OpenAIProvider } from '@somnia/sdk';

const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o', // or 'gpt-4', 'gpt-3.5-turbo'
  organization?: 'org-xxx'
});
```

#### Methods

**`generate(prompt: string, options?: GenerateOptions): Promise<string>`**

```typescript
const response = await llm.generate('What is Somnia?', {
  maxTokens: 500,
  temperature: 0.7
});
```

**`chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>`**

```typescript
const response = await llm.chat([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello!' }
], {
  maxTokens: 500,
  temperature: 0.7
});
```

**`embed(text: string): Promise<number[]>`**

```typescript
const embedding = await llm.embed('Some text to embed');
// Returns array of 1536 numbers for text-embedding-ada-002
```

**`estimateTokens(text: string): number`**

```typescript
const tokens = llm.estimateTokens('Hello world');
// Returns ~2
```

**`getModelInfo(): ModelInfo`**

```typescript
const info = llm.getModelInfo();
// {
//   provider: 'openai',
//   model: 'gpt-4o',
//   contextWindow: 128000,
//   maxOutputTokens: 4096
// }
```

**`getDefaultModel(): string`**
- Returns: `'gpt-4o'`

---

### AnthropicProvider

**Anthropic Claude integration** (Claude 3 family).

#### Constructor

```typescript
import { AnthropicProvider } from '@somnia/sdk';

const llm = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20240620' // or opus, haiku
});
```

#### Methods

Same as OpenAIProvider:
- `generate()`
- `chat()`
- `embed()`
- `estimateTokens()`
- `getModelInfo()`

**`getDefaultModel(): string`**
- Returns: `'claude-3-5-sonnet-20240620'`

---

### MockProvider

**Mock LLM for testing** (no API key needed).

#### Constructor

```typescript
import { MockProvider } from '@somnia/sdk';

const llm = new MockProvider({
  model: 'mock-model'
});
```

#### Methods

Same interface as other providers, but returns mock responses:
- `generate()` - Returns: `"Mock response to: [prompt]"`
- `chat()` - Returns: `"Mock chat response"`
- `embed()` - Returns: `[0.1, 0.2, ..., 0.1]` (768 dimensions)
- `estimateTokens()` - Returns: `Math.ceil(text.length / 4)`

---

## Monitoring

### MonitoringClient

**SDK wrapper for monitoring server** (REST API + WebSocket).

[Same as previous documentation - keeping existing MonitoringClient docs]

---

## Types

### Core Types

```typescript
// Client Configuration
interface ClientConfig {
  rpcUrl: string;
  privateKey?: string;
  contracts: {
    agentRegistry: string;
    agentManager: string;
  };
  ipfs?: {
    gateway?: string;
    uploadUrl?: string;
  };
}

// Agent Configuration
interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  metadata?: Record<string, any>;
  autoStart?: boolean;
  pollingInterval?: number;
  maxConcurrentTasks?: number;
}

// Agent Data (from blockchain)
interface AgentData {
  id: string;
  name: string;
  description: string;
  ipfsMetadata: string;
  owner: string;
  isActive: boolean;
  registeredAt: number;
  lastUpdated: number;
  capabilities: string[];
  executionCount: number;
}

// Agent State
type AgentState = 'idle' | 'running' | 'stopped' | 'error';

// Agent Metrics
interface AgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  successRate: number;
}

// Execution Result
interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime?: number;
  gasUsed?: string;
  transactionHash?: string;
}

// Executor Context
interface ExecutorContext {
  llm?: LLMProvider;
  agentId: string;
  logger: Logger;
  ipfs: IPFSManager;
}

// Executor Function
type ExecutorFunction = (
  input: any,
  context: ExecutorContext
) => Promise<ExecutionResult>;
```

### LLM Types

```typescript
// LLM Configuration
interface LLMConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

// Chat Message
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Generation Options
interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

// Chat Options
interface ChatOptions extends GenerateOptions {
  stream?: boolean;
}

// Model Info
interface ModelInfo {
  provider: string;
  model: string;
  contextWindow: number;
  maxOutputTokens: number;
}
```

### Task Types

```typescript
// Task Data
interface TaskData {
  taskId: string;
  agentId: string;
  requester: string;
  taskData: string;
  reward: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  result?: string;
}

// Task Status
enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4
}

// Create Task Parameters
interface CreateTaskParams {
  agentId: string;
  taskData: string | object;
  reward: string; // in wei
}
```

---

## Events

### Agent Events

```typescript
// Lifecycle Events
'agent:registered' - (agentId: string)
'agent:started' - ()
'agent:stopped' - ()
'agent:updated' - (params: UpdateAgentParams)
'agent:activated' - ()
'agent:deactivated' - ()

// Task Events
'task:created' - (task: TaskData)
'task:started' - (taskId: string)
'task:completed' - ({ taskId: string, result: ExecutionResult })
'task:failed' - ({ taskId: string, error: string })

// Metrics Events
'metrics:updated' - (metrics: AgentMetrics)

// Error Events
'error' - (error: Error)
```

### Blockchain Events

Events that can be subscribed via `client.subscribeToEvent()`:

```typescript
// Agent Registry Events
'AgentRegistered' - (agentId, owner, name, timestamp)
'AgentUpdated' - (agentId, name, timestamp)
'AgentActivated' - (agentId, timestamp)
'AgentDeactivated' - (agentId, timestamp)
'AgentExecuted' - (agentId, success, executionTime, timestamp)

// Agent Manager Events
'TaskCreated' - (taskId, agentId, requester, reward, timestamp)
'TaskStarted' - (taskId, timestamp)
'TaskCompleted' - (taskId, result, timestamp)
'TaskFailed' - (taskId, timestamp)
'TaskCancelled' - (taskId, timestamp)
```

---

## Usage Patterns

### Pattern 1: Simple Agent

```typescript
const client = new SomniaClient();
await client.connect(config);

const agent = new SomniaAgent(client)
  .configure({
    name: 'Simple Agent',
    description: 'Does simple tasks',
    capabilities: ['task1']
  })
  .withExecutor(async (input, context) => {
    // Your logic
    return { success: true, result: 'done' };
  });

await agent.register();
await agent.start();
```

### Pattern 2: AI Agent with LLM

```typescript
const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

const agent = new SomniaAgent(client)
  .configure({...})
  .withLLM(llm)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.chat([
      { role: 'user', content: input.prompt }
    ]);
    return { success: true, result: { response } };
  });
```

### Pattern 3: Event-Driven Agent

```typescript
const agent = new SomniaAgent(client)
  .configure({...})
  .withExecutor(async (input, context) => {
    // Your logic
  });

// Set up event listeners
agent.on('task:completed', ({ taskId, result }) => {
  console.log(`Task ${taskId} done:`, result);
});

agent.on('task:failed', ({ taskId, error }) => {
  console.error(`Task ${taskId} failed:`, error);
});

agent.on('metrics:updated', (metrics) => {
  console.log('Metrics:', metrics);
});

await agent.register();
await agent.start();
```

---

## Migration Guide

### From v1.x to v2.0

**Before (v1.x):**
```typescript
import { SomniaAgentSDK, AgentBuilder } from '@somnia/sdk';

const sdk = new SomniaAgentSDK({...});
const agent = await AgentBuilder.quick('Name', 'Desc', executor)
  .connectSDK(sdk)
  .build();
```

**After (v2.0):**
```typescript
import { SomniaClient, SomniaAgent } from '@somnia/sdk';

const client = new SomniaClient();
await client.connect({...});

const agent = new SomniaAgent(client)
  .configure({ name: 'Name', description: 'Desc', capabilities: [] })
  .withExecutor(executor);

await agent.register();
```

**Key Changes:**
1. `SomniaAgentSDK` → `SomniaClient` (low-level)
2. `AgentBuilder` → `SomniaAgent` (high-level)
3. Explicit `connect()` method
4. Fluent API with `.configure()`, `.withExecutor()`, `.withLLM()`
5. Built-in LLM support (OpenAI, Anthropic)
6. Better event system
7. Lifecycle management (start/stop/restart)

---

## Best Practices

1. **Always disconnect** when done:
   ```typescript
   try {
     // Your code
   } finally {
     client.disconnect();
   }
   ```

2. **Handle events** for robust applications:
   ```typescript
   agent.on('error', (error) => {
     logger.error('Agent error:', error);
   });
   ```

3. **Use TypeScript** for type safety

4. **Configure LLM properly**:
   ```typescript
   if (!llm.isConfigured()) {
     throw new Error('LLM API key not configured');
   }
   ```

5. **Monitor metrics** regularly:
   ```typescript
   setInterval(async () => {
     const metrics = await agent.getMetrics();
     if (metrics.successRate < 80) {
       // Alert!
     }
   }, 60000);
   ```

---

## Complete Example

```typescript
import { 
  SomniaClient, 
  SomniaAgent, 
  OpenAIProvider 
} from '@somnia/sdk';

async function main() {
  // 1. Initialize client
  const client = new SomniaClient();
  await client.connect({
    rpcUrl: 'https://dream-rpc.somnia.network',
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!
    }
  });

  // 2. Initialize LLM
  const llm = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
  });

  // 3. Create agent
  const agent = new SomniaAgent(client)
    .configure({
      name: 'AI Assistant',
      description: 'Helpful AI assistant',
      capabilities: ['chat', 'analysis'],
      autoStart: true,
      pollingInterval: 5000
    })
    .withLLM(llm)
    .withExecutor(async (input, context) => {
      const response = await context.llm!.chat([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: input.prompt }
      ]);
      return { success: true, result: { response } };
    });

  // 4. Set up event listeners
  agent.on('task:completed', ({ taskId, result }) => {
    console.log(`✅ Task ${taskId} completed`);
  });

  agent.on('metrics:updated', (metrics) => {
    console.log(`📊 Success rate: ${metrics.successRate}%`);
  });

  // 5. Register and start
  const agentId = await agent.register();
  console.log(`Agent registered: ${agentId}`);
  
  await agent.start();
  console.log('Agent started and listening for tasks');

  // 6. Keep running
  process.on('SIGINT', async () => {
    await agent.stop();
    client.disconnect();
    process.exit(0);
  });
}

main().catch(console.error);
```

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-04


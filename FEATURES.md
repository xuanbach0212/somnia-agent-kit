# Features Overview

Complete feature list for Somnia AI Agent Framework v2.0

---

## 🎯 Core Features

### 1. Blockchain Integration

#### Smart Contract Layer
- **AgentRegistry** - On-chain agent registration and metadata
  - Register agents with unique IDs
  - Store agent metadata on IPFS
  - Track agent status (active/inactive)
  - Record execution metrics on-chain
  - Owner-based access control
  
- **AgentManager** - Task management with payment escrow
  - Create tasks with ETH rewards
  - Escrow payment system
  - Task lifecycle management (pending → in progress → completed/failed)
  - Automatic payment release on success
  - Refund on failure or cancellation

#### Blockchain Client (`SomniaClient`)
- Connection management to Somnia network
- Transaction signing and sending
- Gas estimation
- Event subscription and filtering
- Contract interaction wrappers
- Balance queries
- Signer management

### 2. Agent Management

#### Agent Lifecycle
- **Registration** - Register agent on-chain with metadata
- **Activation** - Activate agent for task processing
- **Deactivation** - Temporarily disable agent
- **Start/Stop** - Control agent execution state
- **Restart** - Gracefully restart agent
- **Update** - Modify agent metadata

#### Agent Configuration
```typescript
{
  name: string;                    // Agent display name
  description: string;             // Agent description
  capabilities: string[];          // List of supported tasks
  metadata?: object;               // Custom metadata
  autoStart?: boolean;             // Auto-start on register
  pollingInterval?: number;        // Task polling interval (ms)
  maxConcurrentTasks?: number;     // Max parallel tasks
}
```

#### Executor Functions
- Custom logic execution
- Context with utilities (LLM, logger, IPFS)
- Async/await support
- Error handling
- Result validation

### 3. LLM Integration

#### Supported Providers
- **OpenAI** - GPT-3.5, GPT-4, GPT-4o
- **Anthropic** - Claude 3 (Opus, Sonnet, Haiku), Claude 3.5
- **Mock** - Testing without API costs

#### LLM Capabilities
- **Text Generation** - Generate text from prompts
- **Chat Completions** - Multi-turn conversations
- **Embeddings** - Generate vector embeddings
- **Token Estimation** - Estimate API costs
- **Model Information** - Query model capabilities

#### Unified API
```typescript
interface LLMProvider {
  generate(prompt: string, options?): Promise<string>;
  chat(messages: ChatMessage[], options?): Promise<string>;
  embed(text: string): Promise<number[]>;
  estimateTokens(text: string): number;
  getModelInfo(): ModelInfo;
}
```

### 4. Event System

#### Agent Lifecycle Events
```typescript
'agent:registered'   // Agent registered on-chain
'agent:started'      // Agent started processing
'agent:stopped'      // Agent stopped
'agent:updated'      // Agent metadata updated
'agent:activated'    // Agent activated
'agent:deactivated'  // Agent deactivated
```

#### Task Events
```typescript
'task:created'    // New task created
'task:started'    // Task processing started
'task:completed'  // Task completed successfully
'task:failed'     // Task failed
```

#### Metrics Events
```typescript
'metrics:updated'  // Agent metrics updated
```

#### Error Events
```typescript
'error'  // Error occurred
```

### 5. Task Management

#### Task Creation
- Create tasks with payment
- Assign to specific agents
- JSON or string task data
- Configurable rewards in ETH/STT

#### Task Processing
- Automatic task listening
- Event-based task detection
- Polling fallback mechanism
- Concurrent task processing
- Automatic state transitions

#### Task States
```typescript
enum TaskStatus {
  Pending = 0,      // Waiting for agent
  InProgress = 1,   // Being processed
  Completed = 2,    // Successfully completed
  Failed = 3,       // Failed with error
  Cancelled = 4     // Cancelled by requester
}
```

#### Payment Handling
- Escrow on task creation
- Automatic release on completion
- Automatic refund on failure
- Anti-reentrancy protection

### 6. Monitoring & Metrics

#### Real-Time Monitoring
- **Monitoring Server** - REST API + WebSocket
  - Health checks
  - Agent metrics queries
  - Aggregated metrics
  - Real-time updates via WebSocket
  
- **MonitoringClient** - SDK wrapper
  - REST API methods
  - WebSocket connection
  - Auto-reconnection
  - Event-based updates

#### Metrics Tracked
```typescript
interface AgentMetrics {
  totalExecutions: number;         // Total tasks executed
  successfulExecutions: number;    // Successful tasks
  failedExecutions: number;        // Failed tasks
  averageExecutionTime: number;    // Avg time in seconds
  lastExecutionTime: number;       // Last execution timestamp
  successRate: number;             // Success percentage
}
```

#### Alerts
- Success rate thresholds
- Execution time warnings
- Failure rate alerts
- Custom alert handlers

### 7. Storage & IPFS

#### IPFS Integration
- Upload JSON metadata
- Fetch metadata by hash
- Configurable gateways
- Pinning support (with external service)

#### Supported Data
- Agent metadata (name, description, etc.)
- Task results
- Execution logs
- Custom application data

### 8. Developer Experience

#### Fluent API
```typescript
new SomniaAgent(client)
  .configure({...})
  .withLLM(llm)
  .withExecutor(executor)
```

#### TypeScript Support
- Comprehensive type definitions
- IntelliSense support
- Compile-time type checking
- Generic types for extensibility

#### Error Handling
- Descriptive error messages
- Error context information
- Graceful degradation
- Retry mechanisms

#### Logging
- Structured logging with Winston
- Configurable log levels
- Context-aware logs
- Timestamp and metadata

---

## 🚀 Use Cases

### 1. AI Assistants
Build conversational agents powered by GPT-4 or Claude:
```typescript
const agent = new SomniaAgent(client)
  .withLLM(new OpenAIProvider({ model: 'gpt-4o' }))
  .withExecutor(async (input, context) => {
    const response = await context.llm!.chat([...]);
    return { success: true, result: { response } };
  });
```

### 2. Data Processing Agents
Automate data analysis and transformation:
```typescript
const agent = new SomniaAgent(client)
  .configure({
    name: 'Data Processor',
    capabilities: ['csv-processing', 'json-transformation'],
  })
  .withExecutor(async (input, context) => {
    const processed = processData(input.data);
    const hash = await context.ipfs.upload(processed);
    return { success: true, result: { ipfsHash: hash } };
  });
```

### 3. Oracle Services
Fetch external data and bring it on-chain:
```typescript
const agent = new SomniaAgent(client)
  .configure({
    name: 'Price Oracle',
    capabilities: ['price-feed'],
  })
  .withExecutor(async (input, context) => {
    const price = await fetchPrice(input.symbol);
    return { success: true, result: { price, timestamp: Date.now() } };
  });
```

### 4. Task Automation
Create autonomous agents for repetitive tasks:
```typescript
const agent = new SomniaAgent(client)
  .configure({
    name: 'Scheduler',
    capabilities: ['cron-jobs', 'automation'],
  })
  .withExecutor(async (input, context) => {
    await executeScheduledTask(input.taskId);
    return { success: true };
  });
```

### 5. Gaming NPCs
Build intelligent NPCs for blockchain games:
```typescript
const agent = new SomniaAgent(client)
  .withLLM(new AnthropicProvider({ model: 'claude-3-haiku' }))
  .configure({
    name: 'Game NPC',
    capabilities: ['dialogue', 'decision-making'],
  })
  .withExecutor(async (input, context) => {
    const action = await context.llm!.generate(
      `Player said: "${input.message}". How should NPC respond?`
    );
    return { success: true, result: { action } };
  });
```

### 6. DeFi Automation
Automated trading strategies and monitoring:
```typescript
const agent = new SomniaAgent(client)
  .configure({
    name: 'Trading Bot',
    capabilities: ['trading', 'monitoring'],
  })
  .withExecutor(async (input, context) => {
    const signal = analyzeMarket(input.pair);
    if (signal === 'buy') {
      await executeTrade(input.pair, input.amount);
    }
    return { success: true, result: { signal } };
  });
```

---

## 🎨 Architecture Patterns

### 1. Simple Agent Pattern
Single executor, no external dependencies:
```typescript
const agent = new SomniaAgent(client)
  .configure({...})
  .withExecutor(async (input, context) => {
    // Your logic
  });
```

### 2. AI-Powered Agent Pattern
Integrate LLM for intelligent responses:
```typescript
const agent = new SomniaAgent(client)
  .withLLM(new OpenAIProvider({...}))
  .withExecutor(async (input, context) => {
    const response = await context.llm!.chat([...]);
    return { success: true, result: { response } };
  });
```

### 3. Event-Driven Pattern
React to agent and task events:
```typescript
agent.on('task:completed', ({ taskId, result }) => {
  console.log('Task done:', taskId);
});

agent.on('metrics:updated', (metrics) => {
  if (metrics.successRate < 80) {
    sendAlert('Low success rate!');
  }
});
```

### 4. Multi-Agent Pattern
Coordinate multiple agents:
```typescript
const processor = new SomniaAgent(client)
  .configure({ name: 'Processor', capabilities: ['process'] });

const validator = new SomniaAgent(client)
  .configure({ name: 'Validator', capabilities: ['validate'] });

// Processor creates task for validator
processor.withExecutor(async (input, context) => {
  const result = processData(input);
  const taskId = await client.createTask({
    agentId: validatorId,
    taskData: result,
    reward: ethers.parseEther('0.01'),
  });
  return { success: true, result: { taskId } };
});
```

### 5. Testing Pattern
Use mock provider for unit tests:
```typescript
const mockLLM = new MockProvider({});

const agent = new SomniaAgent(client)
  .withLLM(mockLLM)
  .withExecutor(async (input, context) => {
    const response = await context.llm!.generate(input.prompt);
    expect(response).toContain('Mock response');
  });
```

---

## 🛠️ Advanced Features

### Custom LLM Provider
Implement your own LLM provider:
```typescript
class CustomProvider extends LLMProvider {
  getDefaultModel(): string {
    return 'custom-model-v1';
  }

  async generate(prompt: string): Promise<string> {
    // Your implementation
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Your implementation
  }

  // ... other methods
}

const agent = new SomniaAgent(client)
  .withLLM(new CustomProvider({...}));
```

### Custom Event Handlers
Handle specific events:
```typescript
agent.on('task:failed', async ({ taskId, error }) => {
  // Retry logic
  await agent.processTask(taskId);
});

agent.on('metrics:updated', (metrics) => {
  // Send to external monitoring
  sendToDatadog(metrics);
});
```

### Advanced Monitoring
Custom monitoring setup:
```typescript
const monitoring = new MonitoringClient({
  baseUrl: 'http://localhost:3001',
  autoConnect: true,
  reconnectInterval: 5000,
});

monitoring.on('metrics', (data) => {
  // Custom metrics processing
  analyzeMetrics(data);
});

monitoring.on('alert', (alert) => {
  // Send notifications
  sendSlackNotification(alert);
});
```

---

## 📊 Performance

### Somnia Network
- **TPS**: 400,000+ transactions per second
- **Block Time**: ~0.4 seconds
- **Finality**: Sub-second
- **Gas Fees**: Extremely low

### SDK Performance
- **Agent Registration**: ~1 second
- **Task Creation**: ~1 second
- **Task Processing**: Depends on executor logic
- **Event Subscription**: Real-time (WebSocket)
- **Metrics Collection**: ~100ms per query

---

## 🔐 Security Features

### Smart Contracts
- OpenZeppelin libraries (Ownable, ReentrancyGuard)
- Access control on critical functions
- Payment escrow protection
- Reentrancy attack prevention

### SDK
- Private key encryption support
- Secure transaction signing
- Input validation
- Error handling with no sensitive data leakage

### Best Practices
- Never commit private keys
- Use environment variables
- Implement rate limiting
- Validate all inputs
- Monitor for unusual activity

---

## 📦 Deployment Options

### Development
- Local Hardhat network
- Mock LLM providers
- In-memory IPFS

### Testnet
- Somnia Dream Testnet
- Free STT tokens from Discord
- Test with real LLM APIs

### Production
- Somnia Mainnet (when available)
- Production LLM API keys
- Pinata/Infura for IPFS
- Monitoring dashboards

---

## 🎓 Learning Path

1. **Start Simple** - Run `examples/1-basic-agent.ts`
2. **Add AI** - Try `examples/2-llm-agent-openai.ts`
3. **Explore Events** - Study `examples/4-event-driven-agent.ts`
4. **Task Management** - Review `examples/5-task-management.ts`
5. **Build Custom** - Create your own agent for your use case
6. **Deploy** - Deploy to Somnia testnet
7. **Monitor** - Set up monitoring and alerts
8. **Optimize** - Tune performance and costs

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-04


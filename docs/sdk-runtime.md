# 🤖 Autonomous Agent Runtime

Complete guide for building fully autonomous AI agents with lifecycle management, triggers, planning, and execution.

## Overview

The Runtime module provides a complete framework for building autonomous agents that can:
- React to events (blockchain, time-based, webhooks)
- Plan tasks using AI reasoning
- Execute actions autonomously
- Learn from past interactions
- Follow safety policies

## Agent Lifecycle

### Agent States

```typescript
enum AgentState {
  Created,    // Agent created but not started
  Running,    // Agent is active and processing
  Paused,     // Agent temporarily paused
  Stopped,    // Agent stopped
  Error       // Agent encountered error
}
```

### Create Agent

```typescript
import { Agent, OllamaAdapter, LLMPlanner } from 'somnia-agent-kit';

// Create autonomous agent
const agent = new Agent({
  name: 'Trading Bot',
  description: 'Automated DeFi trading agent',
  capabilities: ['analyze', 'trade', 'monitor'],
  llm: new OllamaAdapter({ model: 'llama3.2' }),
  planner: new LLMPlanner()
}, {
  logger: logger,
  enableMemory: true,
  memoryBackend: 'file',
  memoryPath: './data/memory',
  storageBackend: 'file',
  storagePath: './data/storage'
});
```

### Initialize Agent

```typescript
// Initialize with blockchain contracts
await agent.initialize(
  kit.contracts.registry,
  kit.contracts.executor
);

console.log('✅ Agent initialized');
```

### Start Agent

```typescript
// Start agent (begins listening to triggers)
await agent.start();
console.log('🚀 Agent started');
```

### Pause Agent

```typescript
// Temporarily pause agent
await agent.pause();
console.log('⏸️  Agent paused');
```

### Resume Agent

```typescript
// Resume paused agent
await agent.resume();
console.log('▶️  Agent resumed');
```

### Stop Agent

```typescript
// Stop agent completely
await agent.stop();
console.log('🛑 Agent stopped');
```

### Get Agent State

```typescript
const state = agent.getState();
console.log('Agent state:', AgentState[state]);
```

## Triggers

Triggers define when your agent should act.

### Interval Trigger

Execute at regular time intervals:

```typescript
import { IntervalTrigger } from 'somnia-agent-kit';

// Create interval trigger
const trigger = new IntervalTrigger(60000, { // Every 60 seconds
  startImmediately: true,
  maxExecutions: 100
});

// Start trigger
await trigger.start((data) => {
  console.log('⏰ Trigger fired', {
    execution: data.execution,
    timestamp: data.timestamp
  });
  
  // Agent will process this event
});
```

### OnChain Trigger

React to blockchain events:

```typescript
import { OnChainTrigger } from 'somnia-agent-kit';

// Listen to AgentRegistered events
const trigger = new OnChainTrigger(
  chainClient,
  kit.contracts.registry,
  'AgentRegistered',
  { owner: myAddress } // Optional filter
);

await trigger.start((event) => {
  console.log('🔔 New agent registered', {
    agentId: event.args.agentId,
    owner: event.args.owner,
    name: event.args.name
  });
});
```

### Webhook Trigger

Receive HTTP webhooks:

```typescript
import { WebhookTrigger } from 'somnia-agent-kit';

// Create webhook endpoint
const trigger = new WebhookTrigger({
  port: 3000,
  path: '/webhook',
  secret: 'my-secret-key'
});

await trigger.start((data) => {
  console.log('📨 Webhook received', {
    body: data.body,
    headers: data.headers
  });
});

// Send webhook:
// POST http://localhost:3000/webhook
// Headers: { "x-webhook-signature": "..." }
// Body: { "action": "trade", "symbol": "ETH" }
```

### Multiple Triggers

```typescript
// Agent with multiple triggers
const agent = new Agent({
  name: 'Multi-Trigger Bot',
  description: 'Responds to multiple event types',
  capabilities: ['analyze', 'execute'],
  llm: new OllamaAdapter({ model: 'llama3.2' }),
  planner: new LLMPlanner(),
  triggers: [
    {
      type: 'interval',
      config: { interval: 300000 } // Every 5 minutes
    },
    {
      type: 'onchain',
      config: {
        contract: kit.contracts.registry,
        eventName: 'TaskCreated'
      }
    }
  ]
});
```

## Planning

### LLM Planner

Uses AI to break down goals into actionable steps:

```typescript
import { LLMPlanner, OllamaAdapter } from 'somnia-agent-kit';

const llm = new OllamaAdapter({ model: 'llama3.2' });
const planner = new LLMPlanner(llm);

// Plan tasks
const goal = 'Buy 1 ETH if price is below $2000';
const context = 'Current ETH price: $1950, Balance: $5000';

const tasks = await planner.plan(goal, context);

console.log('📋 Planned tasks:', tasks);
// Output: [
//   { type: 'check_price', params: { symbol: 'ETH', threshold: 2000 } },
//   { type: 'execute_trade', params: { action: 'buy', amount: 1, symbol: 'ETH' } }
// ]
```

### Rule-Based Planner

Uses predefined rules for deterministic planning:

```typescript
import { RulePlanner } from 'somnia-agent-kit';

const planner = new RulePlanner({
  rules: [
    {
      condition: (goal) => goal.includes('buy'),
      actions: [
        { type: 'check_balance', params: {} },
        { type: 'check_price', params: {} },
        { type: 'execute_trade', params: { action: 'buy' } }
      ]
    }
  ]
});

const tasks = await planner.plan('Buy ETH');
```

## Execution

### Executor

Executes planned tasks with retry logic:

```typescript
import { Executor } from 'somnia-agent-kit';

const executor = new Executor(chainClient, contracts, {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  enableParallel: true,
  dryRun: false
});

// Register custom action handlers
executor.registerHandler('check_price', async (params) => {
  // Fetch price from API
  const price = await fetchPrice(params.symbol);
  return { price };
});

executor.registerHandler('execute_trade', async (params) => {
  // Execute trade
  const tx = await executeTrade(params);
  return { txHash: tx.hash };
});

// Execute tasks
const results = await executor.executeAll(tasks);

results.forEach((result, index) => {
  console.log(`Task ${index + 1}:`, result.status);
  console.log('Result:', result.data);
});
```

### Parallel Execution

```typescript
// Execute tasks in parallel (when possible)
const executor = new Executor(chainClient, contracts, {
  enableParallel: true
});

const tasks = [
  { type: 'check_price', params: { symbol: 'ETH' } },
  { type: 'check_price', params: { symbol: 'BTC' } },
  { type: 'check_balance', params: {} }
];

// All three tasks run simultaneously
const results = await executor.executeAll(tasks);
```

### Dry Run Mode

```typescript
// Test execution without actually running
const executor = new Executor(chainClient, contracts, {
  dryRun: true
});

const results = await executor.executeAll(tasks);
// Tasks are simulated, no actual execution
```

## Memory

### Enable Memory

```typescript
const agent = new Agent({
  name: 'Learning Agent',
  description: 'Agent with memory',
  capabilities: ['learn', 'adapt'],
  llm: new OllamaAdapter({ model: 'llama3.2' }),
  planner: new LLMPlanner()
}, {
  enableMemory: true,
  memoryBackend: 'file', // 'file' or 'memory'
  memoryPath: './data/memory',
  sessionId: 'agent-1'
});
```

### Memory Operations

```typescript
import { Memory, FileBackend } from 'somnia-agent-kit';

// Create memory
const memory = new Memory({
  backend: new FileBackend('./data/memory'),
  sessionId: 'agent-1'
});

// Add input
await memory.addInput('User asked about ETH price', {
  timestamp: Date.now(),
  source: 'user'
});

// Add output
await memory.addOutput('ETH price is $2000', {
  timestamp: Date.now(),
  confidence: 0.95
});

// Get recent memories
const recent = await memory.getRecent(10);
console.log('Recent memories:', recent);

// Search memories
const results = await memory.search('ETH price');
console.log('Search results:', results);

// Clear old memories
await memory.clear();
```

## Policy Engine

### Define Policies

```typescript
import { Policy } from 'somnia-agent-kit';

const policy = new Policy();

// Add permission rules
policy.addPermission('user1', 'execute');
policy.addPermission('user2', 'read');

// Add operational limits
policy.setOperationalLimit('maxGasPrice', 100); // gwei
policy.setOperationalLimit('maxTransactionValue', 1000); // USD
policy.setOperationalLimit('dailyLimit', 10000); // USD

// Add safety rules
policy.addSafetyRule('no_weekend_trading', (context) => {
  const day = new Date().getDay();
  return day !== 0 && day !== 6; // Not Sunday or Saturday
});

policy.addSafetyRule('price_threshold', (context) => {
  return context.price > 1000 && context.price < 5000;
});
```

### Check Policies

```typescript
// Check permission
if (policy.checkPermission('user1', 'execute')) {
  // User has permission
  await executeAction();
}

// Check operational limits
if (policy.checkOperationalLimit('gasPrice', currentGasPrice)) {
  // Within limits
  await sendTransaction();
}

// Check safety rules
if (policy.checkAllSafetyRules(context)) {
  // All rules passed
  await executeTrade();
}
```

## Storage

### File Storage

```typescript
import { FileStorage } from 'somnia-agent-kit';

const storage = new FileStorage('./data/agent');

// Save event
await storage.saveEvent({
  type: 'task_completed',
  taskId: 123,
  result: 'success'
});

// Save action
await storage.saveAction(
  { type: 'trade', symbol: 'ETH' },
  { txHash: '0x...' }
);

// Get history
const history = await storage.getHistory();
console.log('Events:', history.events.length);
console.log('Actions:', history.actions.length);
```

### Memory Storage

```typescript
import { MemoryStorage } from 'somnia-agent-kit';

// In-memory storage (for testing)
const storage = new MemoryStorage();

await storage.saveEvent(event);
await storage.saveAction(action, result);

const events = await storage.getEvents();
const actions = await storage.getActions();
```

## Complete Example: Autonomous Trading Bot

```typescript
import {
  Agent,
  OllamaAdapter,
  LLMPlanner,
  Executor,
  Policy,
  IntervalTrigger,
  Logger,
  Metrics
} from 'somnia-agent-kit';

async function autonomousTradingBot() {
  // Initialize monitoring
  const logger = new Logger({ level: 'info' });
  const metrics = new Metrics();
  
  // Initialize LLM
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2'
  });
  
  // Create planner
  const planner = new LLMPlanner(llm);
  
  // Create policy
  const policy = new Policy();
  policy.setOperationalLimit('maxTradeValue', 1000);
  policy.setOperationalLimit('dailyLimit', 5000);
  policy.addSafetyRule('trading_hours', (context) => {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17; // Only trade 9 AM - 5 PM
  });
  
  // Create agent
  const agent = new Agent({
    name: 'Autonomous Trading Bot',
    description: 'AI-powered autonomous trading agent',
    capabilities: ['analyze', 'trade', 'monitor', 'risk-management'],
    llm: llm,
    planner: planner
  }, {
    logger: logger,
    enableMemory: true,
    memoryBackend: 'file',
    memoryPath: './data/trading-bot/memory',
    storageBackend: 'file',
    storagePath: './data/trading-bot/storage'
  });
  
  // Initialize with contracts
  await agent.initialize(
    kit.contracts.registry,
    kit.contracts.executor
  );
  
  logger.info('✅ Agent initialized');
  
  // Create executor with custom handlers
  const executor = new Executor(chainClient, contracts, {
    maxRetries: 3,
    timeout: 30000
  });
  
  // Register action handlers
  executor.registerHandler('analyze_market', async (params) => {
    logger.info('📊 Analyzing market...', params);
    
    // Use LLM for analysis
    const analysis = await llm.generate(
      `Analyze ${params.symbol} market conditions and provide trading recommendation`
    );
    
    metrics.increment('analysis.completed');
    return { analysis: analysis.content };
  });
  
  executor.registerHandler('execute_trade', async (params) => {
    logger.info('💱 Executing trade...', params);
    
    // Check policy
    if (!policy.checkOperationalLimit('maxTradeValue', params.value)) {
      throw new Error('Trade value exceeds limit');
    }
    
    if (!policy.checkAllSafetyRules({ hour: new Date().getHours() })) {
      throw new Error('Trading not allowed at this time');
    }
    
    // Execute trade (mock)
    const txHash = '0x' + Math.random().toString(16).substring(2);
    
    metrics.increment('trades.executed');
    metrics.histogram('trade.value', params.value);
    
    return { txHash, status: 'success' };
  });
  
  // Create interval trigger
  const trigger = new IntervalTrigger(300000, { // Every 5 minutes
    startImmediately: true
  });
  
  await trigger.start(async (data) => {
    logger.info('⏰ Trigger fired', { execution: data.execution });
    
    try {
      // Plan tasks
      const goal = 'Analyze ETH market and execute trade if conditions are favorable';
      const context = `Execution #${data.execution}, Time: ${new Date().toISOString()}`;
      
      const tasks = await planner.plan(goal, context);
      logger.info('📋 Tasks planned', { count: tasks.length });
      
      // Execute tasks
      const results = await executor.executeAll(tasks);
      
      results.forEach((result, index) => {
        logger.info(`Task ${index + 1}: ${result.status}`, result.data);
      });
      
      metrics.increment('cycles.completed');
      
    } catch (error) {
      logger.error('❌ Cycle failed', { error: error.message });
      metrics.increment('cycles.failed');
    }
  });
  
  // Start agent
  await agent.start();
  logger.info('🚀 Autonomous trading bot started');
  
  // Log metrics every minute
  setInterval(() => {
    const summary = metrics.getSummary();
    logger.info('📊 Performance metrics', summary);
  }, 60000);
}

autonomousTradingBot().catch(console.error);
```

## Best Practices

### 1. Always Set Safety Policies

```typescript
const policy = new Policy();

// Set limits
policy.setOperationalLimit('maxGasPrice', 100);
policy.setOperationalLimit('maxTransactionValue', 1000);

// Add safety rules
policy.addSafetyRule('check_balance', async (context) => {
  const balance = await getBalance();
  return balance > context.requiredAmount;
});
```

### 2. Handle Errors Gracefully

```typescript
try {
  await agent.start();
} catch (error) {
  logger.error('Failed to start agent', { error: error.message });
  
  // Attempt recovery
  await agent.stop();
  await agent.start();
}
```

### 3. Monitor Agent Health

```typescript
setInterval(async () => {
  const state = agent.getState();
  
  if (state === AgentState.Error) {
    logger.error('⚠️  Agent in error state');
    await agent.stop();
    await agent.start(); // Restart
  }
}, 60000);
```

### 4. Use Memory for Learning

```typescript
// Store successful strategies
await memory.addOutput('Strategy: Buy ETH when price < $2000', {
  success: true,
  profit: 150
});

// Retrieve past strategies
const strategies = await memory.search('Strategy');
const successful = strategies.filter(s => s.metadata.success);
```

### 5. Test with Dry Run

```typescript
// Test agent logic without executing
const executor = new Executor(chainClient, contracts, {
  dryRun: true
});

const results = await executor.executeAll(tasks);
// Review results before enabling real execution
```

## See Also

- [Working with Agents](sdk-agents.md)
- [LLM Integration](sdk-llm.md)
- [Monitoring](sdk-monitoring.md)
- [API Reference](../API_REFERENCE.md)


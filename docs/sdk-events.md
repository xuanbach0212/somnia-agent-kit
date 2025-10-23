# ⚡ Real-Time Events & WebSocket

Complete guide for subscribing to real-time blockchain events using WebSocket connections.

## Overview

The SDK provides WebSocket utilities for real-time event streaming, allowing your agents to react instantly to blockchain events without polling.

## WebSocket Client

### Initialize WebSocket Client

```typescript
import { WebSocketClient } from 'somnia-agent-kit';

// Create WebSocket client
const ws = new WebSocketClient(kit.getChainClient(), {
  wsUrl: 'wss://dream-rpc.somnia.network', // Optional, auto-derived from HTTP RPC
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 10
});
```

### Connect to WebSocket

```typescript
// Connect to WebSocket
await ws.connect();
console.log('✅ WebSocket connected');
```

### Disconnect

```typescript
// Disconnect WebSocket
await ws.disconnect();
console.log('🔌 WebSocket disconnected');
```

## Subscribe to Events

### Subscribe to New Blocks

```typescript
// Subscribe to new blocks
const subId = await ws.subscribeToBlocks((block) => {
  console.log('🆕 New block:', {
    number: block.number,
    hash: block.hash,
    timestamp: block.timestamp,
    transactions: block.transactions.length
  });
});

console.log('Subscription ID:', subId);
```

### Subscribe to Pending Transactions

```typescript
// Subscribe to pending transactions
const subId = await ws.subscribeToPendingTransactions((txHash) => {
  console.log('⏳ Pending transaction:', txHash);
});
```

### Subscribe to Contract Events

```typescript
// Subscribe to specific contract events
const registry = kit.contracts.registry;

const subId = await ws.subscribeToContractEvents(
  registry,
  'AgentRegistered',
  (agentId, owner, name, event) => {
    console.log('🤖 New agent registered:', {
      agentId: agentId.toString(),
      owner: owner,
      name: name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    });
  }
);
```

### Subscribe to Logs

```typescript
import { ethers } from 'ethers';

// Subscribe to logs matching filter
const subId = await ws.subscribeToLogs(
  {
    address: tokenAddress,
    topics: [
      ethers.id('Transfer(address,address,uint256)')
    ]
  },
  (log) => {
    console.log('📝 Transfer event:', {
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: log.blockNumber
    });
  }
);
```

## Unsubscribe

```typescript
// Unsubscribe from specific subscription
await ws.unsubscribe(subId);
console.log('Unsubscribed from:', subId);

// Unsubscribe from all
await ws.unsubscribeAll();
console.log('Unsubscribed from all events');
```

## Complete Example: Real-Time Agent Monitor

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  WebSocketClient,
  Logger
} from 'somnia-agent-kit';

async function realTimeMonitor() {
  // Initialize logger
  const logger = new Logger({ level: 'info' });
  
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  logger.info('✅ SDK initialized');

  // Initialize WebSocket
  const ws = new WebSocketClient(kit.getChainClient(), {
    autoReconnect: true
  });

  await ws.connect();
  logger.info('✅ WebSocket connected');

  // Subscribe to new blocks
  await ws.subscribeToBlocks((block) => {
    logger.info('🆕 New block', {
      number: block.number,
      transactions: block.transactions.length
    });
  });

  // Subscribe to agent registrations
  await ws.subscribeToContractEvents(
    kit.contracts.registry,
    'AgentRegistered',
    async (agentId, owner, name) => {
      logger.info('🤖 New agent registered', {
        agentId: agentId.toString(),
        owner,
        name
      });

      // Get full agent details
      const agent = await kit.contracts.registry.getAgent(agentId);
      logger.info('Agent details', {
        description: agent.description,
        capabilities: await kit.contracts.registry.getAgentCapabilities(agentId)
      });
    }
  );

  // Subscribe to task creation
  await ws.subscribeToContractEvents(
    kit.contracts.manager,
    'TaskCreated',
    async (taskId, agentId, creator) => {
      logger.info('📝 New task created', {
        taskId: taskId.toString(),
        agentId: agentId.toString(),
        creator
      });

      // Get task details
      const task = await kit.contracts.manager.getTask(taskId);
      logger.info('Task details', {
        status: task.status,
        reward: ethers.formatEther(task.reward)
      });
    }
  );

  // Subscribe to task completion
  await ws.subscribeToContractEvents(
    kit.contracts.manager,
    'TaskCompleted',
    (taskId, agentId, result) => {
      logger.info('✅ Task completed', {
        taskId: taskId.toString(),
        agentId: agentId.toString(),
        result
      });
    }
  );

  // Subscribe to vault deposits
  await ws.subscribeToContractEvents(
    kit.contracts.vault,
    'Deposit',
    (agentId, amount, depositor) => {
      logger.info('💰 Vault deposit', {
        agentId: agentId.toString(),
        amount: ethers.formatEther(amount),
        depositor
      });
    }
  );

  logger.info('👂 Listening to real-time events...');

  // Handle reconnection
  ws.on('reconnect', () => {
    logger.info('🔄 WebSocket reconnected');
  });

  ws.on('error', (error) => {
    logger.error('❌ WebSocket error', { error: error.message });
  });

  // Keep process running
  process.on('SIGINT', async () => {
    logger.info('🛑 Shutting down...');
    await ws.disconnect();
    process.exit(0);
  });
}

realTimeMonitor().catch(console.error);
```

## Complete Example: Trading Bot with Real-Time Prices

```typescript
import {
  SomniaAgentKit,
  WebSocketClient,
  OllamaAdapter,
  Logger,
  Metrics
} from 'somnia-agent-kit';

async function tradingBotWithRealTime() {
  const logger = new Logger({ level: 'info' });
  const metrics = new Metrics();

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  // Initialize LLM
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2'
  });

  // Initialize WebSocket
  const ws = new WebSocketClient(kit.getChainClient());
  await ws.connect();

  logger.info('🤖 Trading bot started');

  // Track price changes
  const priceHistory: number[] = [];
  const PRICE_ORACLE_ADDRESS = '0x...'; // Your price oracle contract

  // Subscribe to price updates
  await ws.subscribeToContractEvents(
    new ethers.Contract(
      PRICE_ORACLE_ADDRESS,
      ['event PriceUpdated(string symbol, uint256 price, uint256 timestamp)'],
      kit.getProvider()
    ),
    'PriceUpdated',
    async (symbol, price, timestamp) => {
      const priceInUSD = Number(ethers.formatUnits(price, 8)); // Assuming 8 decimals
      
      logger.info('💹 Price update', {
        symbol,
        price: priceInUSD,
        timestamp: new Date(Number(timestamp) * 1000).toISOString()
      });

      // Track price history
      priceHistory.push(priceInUSD);
      if (priceHistory.length > 100) {
        priceHistory.shift(); // Keep last 100 prices
      }

      metrics.gauge('price.current', priceInUSD);

      // Analyze with AI
      if (priceHistory.length >= 10) {
        const avgPrice = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length;
        const priceChange = ((priceInUSD - avgPrice) / avgPrice) * 100;

        logger.info('📊 Analysis', {
          avgPrice,
          currentPrice: priceInUSD,
          change: priceChange.toFixed(2) + '%'
        });

        // Use AI for decision
        if (Math.abs(priceChange) > 5) { // Significant price change
          const decision = await llm.generate(
            `ETH price changed by ${priceChange.toFixed(2)}%. ` +
            `Current price: $${priceInUSD}, Average: $${avgPrice.toFixed(2)}. ` +
            `Should I buy, sell, or hold? Answer in one word and explain briefly.`
          );

          logger.info('🧠 AI Decision', { decision: decision.content });

          // Execute trade based on AI decision
          if (decision.content.toLowerCase().includes('buy')) {
            logger.info('💱 Executing BUY order...');
            metrics.increment('trades.buy');
            // Execute buy logic here
          } else if (decision.content.toLowerCase().includes('sell')) {
            logger.info('💱 Executing SELL order...');
            metrics.increment('trades.sell');
            // Execute sell logic here
          }
        }
      }
    }
  );

  // Subscribe to new blocks for periodic checks
  await ws.subscribeToBlocks(async (block) => {
    // Every 10 blocks, log performance
    if (block.number % 10 === 0) {
      const summary = metrics.getSummary();
      logger.info('📊 Performance', {
        blockNumber: block.number,
        trades: summary.counters
      });
    }
  });

  logger.info('👂 Listening to price updates...');
}

tradingBotWithRealTime().catch(console.error);
```

## Event Filtering

### Filter by Address

```typescript
// Listen to events from specific address
await ws.subscribeToLogs(
  {
    address: contractAddress,
    fromBlock: 'latest'
  },
  (log) => {
    console.log('Event from contract:', log);
  }
);
```

### Filter by Topics

```typescript
// Listen to specific event signature
await ws.subscribeToLogs(
  {
    topics: [
      ethers.id('Transfer(address,address,uint256)'),
      null, // from (any)
      ethers.zeroPadValue(myAddress, 32) // to (my address)
    ]
  },
  (log) => {
    console.log('Transfer to me:', log);
  }
);
```

### Filter by Block Range

```typescript
// Listen to events from specific block range
await ws.subscribeToLogs(
  {
    address: contractAddress,
    fromBlock: 1000000,
    toBlock: 'latest'
  },
  (log) => {
    console.log('Historical event:', log);
  }
);
```

## Best Practices

### 1. Handle Reconnections

```typescript
const ws = new WebSocketClient(chainClient, {
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 10
});

ws.on('reconnect', () => {
  logger.info('🔄 Reconnected to WebSocket');
  
  // Resubscribe to events if needed
  resubscribeToEvents();
});

ws.on('disconnect', () => {
  logger.warn('⚠️  WebSocket disconnected');
});
```

### 2. Clean Up Subscriptions

```typescript
const subscriptions: string[] = [];

// Track subscriptions
const subId = await ws.subscribeToBlocks(handler);
subscriptions.push(subId);

// Clean up on exit
process.on('SIGINT', async () => {
  for (const subId of subscriptions) {
    await ws.unsubscribe(subId);
  }
  await ws.disconnect();
  process.exit(0);
});
```

### 3. Handle Errors Gracefully

```typescript
try {
  await ws.subscribeToContractEvents(contract, 'EventName', handler);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    logger.error('Network error, retrying...');
    // Retry logic
  } else {
    logger.error('Subscription failed:', error.message);
  }
}
```

### 4. Rate Limit Event Processing

```typescript
let processing = false;

await ws.subscribeToBlocks(async (block) => {
  if (processing) {
    logger.debug('Skipping block, still processing previous');
    return;
  }

  processing = true;
  try {
    await processBlock(block);
  } finally {
    processing = false;
  }
});
```

### 5. Use Event Batching

```typescript
const eventBatch: any[] = [];
const BATCH_SIZE = 10;

await ws.subscribeToContractEvents(contract, 'Transfer', (from, to, amount) => {
  eventBatch.push({ from, to, amount });

  if (eventBatch.length >= BATCH_SIZE) {
    processBatch(eventBatch.splice(0, BATCH_SIZE));
  }
});

// Process remaining events periodically
setInterval(() => {
  if (eventBatch.length > 0) {
    processBatch(eventBatch.splice(0, eventBatch.length));
  }
}, 5000);
```

## Comparison: WebSocket vs Polling

### WebSocket (Real-Time)

```typescript
// ✅ Instant updates
// ✅ Low latency
// ✅ Efficient (no unnecessary requests)
// ❌ Requires persistent connection
// ❌ More complex error handling

const ws = new WebSocketClient(chainClient);
await ws.connect();

await ws.subscribeToBlocks((block) => {
  console.log('New block:', block.number);
});
```

### Polling (Traditional)

```typescript
// ✅ Simple to implement
// ✅ Works with any RPC
// ❌ Higher latency
// ❌ More RPC calls
// ❌ Can miss events between polls

setInterval(async () => {
  const blockNumber = await provider.getBlockNumber();
  console.log('Current block:', blockNumber);
}, 15000); // Poll every 15 seconds
```

## See Also

- [Working with Agents](sdk-agents.md)
- [Autonomous Runtime](sdk-runtime.md)
- [Monitoring](sdk-monitoring.md)
- [API Reference](../API_REFERENCE.md)


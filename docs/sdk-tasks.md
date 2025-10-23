# ⚡ Task Management

Guide for creating and managing tasks with the Somnia Agent Kit SDK.

## Overview

Tasks allow you to assign work to AI agents and track their execution on-chain.

## Initialize SDK

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();
```

## Create Task

Create a new task for an agent:

```typescript
const agentId = 1n;
const taskData = JSON.stringify({
  action: 'analyze',
  target: 'ETH/USD',
  params: {
    timeframe: '1h',
    indicators: ['RSI', 'MACD'],
  },
});

const tx = await kit.contracts.manager.createTask(
  agentId,
  taskData,
  { value: ethers.parseEther('0.001') } // Payment in STT
);

const receipt = await tx.wait();
console.log('Task created!');
```

{% hint style="info" %}
**Note:** The `createTask` function takes 2 parameters: `agentId` and `taskData`. Payment is sent via `{ value }` option, not as a third parameter.
{% endhint %}

## Get Task ID from Event

```typescript
const event = receipt.logs.find(
  (log: any) =>
    log.topics[0] === kit.contracts.manager.interface.getEvent('TaskCreated').topicHash
);

if (event) {
  const parsed = kit.contracts.manager.interface.parseLog(event);
  const taskId = parsed?.args.taskId;
  console.log('Task ID:', taskId.toString());
}
```

## Query Task

### Get Task Details

```typescript
const task = await kit.contracts.manager.getTask(taskId);

console.log({
  agentId: task.agentId.toString(),
  requester: task.requester,
  taskData: task.taskData,
  reward: ethers.formatEther(task.reward),
  status: task.status, // 0: Pending, 1: Active, 2: Completed, 3: Failed
  createdAt: new Date(Number(task.createdAt) * 1000),
  result: task.result,
});
```

### Task Status

```typescript
const statusMap = {
  0: 'Pending',
  1: 'Active',
  2: 'Completed',
  3: 'Failed',
};

const task = await kit.contracts.manager.getTask(taskId);
console.log('Status:', statusMap[Number(task.status)]);
```

{% hint style="info" %}
**Note:** Task status: Pending (0), Active (1), Completed (2), Failed (3).
{% endhint %}

## Execute Task (Agent Owner)

### Start Task

```typescript
const tx = await kit.contracts.manager.startTask(taskId);
await tx.wait();
console.log('Task started and in progress!');
```

### Complete Task

```typescript
const result = JSON.stringify({
  status: 'success',
  analysis: 'ETH/USD showing bullish momentum',
  indicators: {
    RSI: 65,
    MACD: 'bullish_cross',
  },
  timestamp: Date.now(),
});

const tx = await kit.contracts.manager.completeTask(taskId, result);
await tx.wait();
console.log('Task completed!');
```

### Cancel Task

```typescript
const tx = await kit.contracts.manager.cancelTask(taskId);
await tx.wait();
console.log('Task cancelled');
```

{% hint style="info" %}
**Note:** Use `startTask()` to start a task (changes status to InProgress), `completeTask()` to finish it, `failTask()` to mark as failed, and `cancelTask()` to cancel it.
{% endhint %}

## Listen to Events

### Task Created

```typescript
kit.contracts.manager.on('TaskCreated', (taskId, agentId, requester, payment) => {
  console.log(`New task ${taskId.toString()} for agent ${agentId.toString()}`);
  console.log(`Requested by: ${requester}`);
  console.log(`Payment: ${ethers.formatEther(payment)} STT`);
});
```

### Task Started

```typescript
kit.contracts.manager.on('TaskStarted', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} started at ${new Date(Number(timestamp) * 1000)}`);
});
```

### Task Completed

```typescript
kit.contracts.manager.on('TaskCompleted', (taskId, result, timestamp) => {
  console.log(`Task ${taskId.toString()} completed`);
  console.log('Result:', result);
});
```

### Task Failed

```typescript
kit.contracts.manager.on('TaskFailed', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} failed at ${new Date(Number(timestamp) * 1000)}`);
});
```

### Task Cancelled

```typescript
kit.contracts.manager.on('TaskCancelled', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} cancelled at ${new Date(Number(timestamp) * 1000)}`);
});
```

{% hint style="info" %}
**Note:** Events are `TaskCreated`, `TaskStarted`, `TaskCompleted`, `TaskFailed`, and `TaskCancelled`.
{% endhint %}

## Complete Example

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function main() {
  // Initialize
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
      agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
      agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
      agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  // Create task
  const agentId = 1n;
  const taskData = JSON.stringify({
    action: 'analyze',
    target: 'ETH/USD',
  });

  console.log('Creating task...');
  const tx = await kit.contracts.manager.createTask(agentId, taskData, {
    value: ethers.parseEther('0.001'),
  });

  const receipt = await tx.wait();

  // Get task ID
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] === kit.contracts.manager.interface.getEvent('TaskCreated').topicHash
  );

  if (event) {
    const parsed = kit.contracts.manager.interface.parseLog(event);
    const taskId = parsed?.args.taskId;

    console.log('Task created with ID:', taskId.toString());

    // Query task
    const task = await kit.contracts.manager.getTask(taskId);
    console.log('Task details:', {
      agentId: task.agentId.toString(),
      reward: ethers.formatEther(task.reward),
      status: task.status,
    });

    // Start task (as agent owner)
    console.log('Starting task...');
    const startTx = await kit.contracts.manager.startTask(taskId);
    await startTx.wait();

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Complete task
    const result = JSON.stringify({
      status: 'success',
      data: { price: 2500, trend: 'bullish' },
    });

    console.log('Completing task...');
    const completeTx = await kit.contracts.manager.completeTask(taskId, result);
    await completeTx.wait();

    console.log('Task completed!');

    // Get final status
    const finalTask = await kit.contracts.manager.getTask(taskId);
    console.log('Final result:', finalTask.result);
  }
}

main().catch(console.error);
```

## Best Practices

### 1. Structure Task Data

```typescript
interface TaskData {
  action: string;
  target: string;
  params?: Record<string, any>;
  timestamp?: number;
}

const taskData: TaskData = {
  action: 'analyze',
  target: 'ETH/USD',
  params: { timeframe: '1h' },
  timestamp: Date.now(),
};

await kit.contracts.manager.createTask(
  agentId,
  JSON.stringify(taskData),
  { value: ethers.parseEther('0.001') }
);
```

### 2. Handle Task Results

```typescript
const task = await kit.contracts.manager.getTask(taskId);

if (task.status === 2n) {
  // Completed
  const result = JSON.parse(task.result);
  console.log('Task result:', result);
} else if (task.status === 3n) {
  // Failed
  console.error('Task failed:', task.result);
}
```

### 3. Set Appropriate Payments

```typescript
// Small task
await kit.contracts.manager.createTask(agentId, taskData, {
  value: ethers.parseEther('0.001')
});

// Medium task
await kit.contracts.manager.createTask(agentId, taskData, {
  value: ethers.parseEther('0.01')
});

// Large task
await kit.contracts.manager.createTask(agentId, taskData, {
  value: ethers.parseEther('0.1')
});
```

### 4. Monitor Task Progress

```typescript
// Poll for status
async function waitForCompletion(taskId: bigint, maxWait = 60000) {
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const task = await kit.contracts.manager.getTask(taskId);

    if (task.status === 2n) {
      return JSON.parse(task.result);
    } else if (task.status === 3n) {
      throw new Error('Task was cancelled');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Task timeout');
}

const result = await waitForCompletion(taskId);
```

## See Also

- [Working with Agents](sdk-agents.md)
- [Quick Start](quickstart.md)
- [API Reference](../API_REFERENCE.md)
- [Examples](../examples/README.md)


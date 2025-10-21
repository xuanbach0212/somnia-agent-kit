# 📝 AgentManager Contract

Contract for managing agent tasks and lifecycle.

## Overview

The AgentManager contract handles task creation, assignment, and completion for AI agents.

## Contract Address

**Testnet**: `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E`

## Main Functions

### Create Task

Create a new task for an agent:

```typescript
import { ethers } from 'ethers';

const agentId = 1n;
const taskData = JSON.stringify({
  action: 'analyze',
  target: 'ETH/USD',
});

const tx = await kit.contracts.manager.createTask(agentId, taskData, {
  value: ethers.parseEther('0.001'), // Payment
});

await tx.wait();
console.log('Task created');
```

### Get Task

Get task details:

```typescript
const task = await kit.contracts.manager.getTask(taskId);

console.log({
  agentId: task.agentId.toString(),
  requester: task.requester,
  taskData: task.taskData,
  reward: ethers.formatEther(task.reward),
  status: task.status,
  result: task.result,
});
```

### Start Task

Start executing a task (agent owner only):

```typescript
const tx = await kit.contracts.manager.startTask(taskId);
await tx.wait();
console.log('Task started');
```

### Complete Task

Complete a task with result:

```typescript
const result = JSON.stringify({
  status: 'success',
  data: { price: 2500 },
});

const tx = await kit.contracts.manager.completeTask(taskId, result);
await tx.wait();
console.log('Task completed');
```

### Fail Task

Mark a task as failed:

```typescript
const errorMessage = 'Failed to fetch data';

const tx = await kit.contracts.manager.failTask(taskId, errorMessage);
await tx.wait();
console.log('Task marked as failed');
```

## Events

### TaskCreated

```typescript
kit.contracts.manager.on('TaskCreated', (taskId, agentId, requester) => {
  console.log(`New task ${taskId.toString()} for agent ${agentId.toString()}`);
});
```

### TaskStarted

```typescript
kit.contracts.manager.on('TaskStarted', (taskId) => {
  console.log(`Task ${taskId.toString()} started`);
});
```

### TaskCompleted

```typescript
kit.contracts.manager.on('TaskCompleted', (taskId, result) => {
  console.log(`Task ${taskId.toString()} completed`);
  console.log('Result:', result);
});
```

### TaskFailed

```typescript
kit.contracts.manager.on('TaskFailed', (taskId, reason) => {
  console.log(`Task ${taskId.toString()} failed: ${reason}`);
});
```

## Task Status

- `0` - Pending
- `1` - Active
- `2` - Completed
- `3` - Failed

## Example

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function main() {
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

  const tx = await kit.contracts.manager.createTask(agentId, taskData, {
    value: ethers.parseEther('0.001'),
  });

  const receipt = await tx.wait();

  // Get task ID from event
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] === kit.contracts.manager.interface.getEvent('TaskCreated').topicHash
  );

  if (event) {
    const parsed = kit.contracts.manager.interface.parseLog(event);
    const taskId = parsed?.args.taskId;

    console.log('Task created with ID:', taskId.toString());

    // Start task
    const startTx = await kit.contracts.manager.startTask(taskId);
    await startTx.wait();

    // Complete task
    const result = JSON.stringify({ status: 'success' });
    const completeTx = await kit.contracts.manager.completeTask(taskId, result);
    await completeTx.wait();

    console.log('Task completed!');
  }
}

main().catch(console.error);
```

## See Also

- [AgentExecutor](agent-executor.md)
- [Task Management](../sdk-tasks.md)
- [API Reference](../../API_REFERENCE.md)


# 📝 AgentManager Contract

Contract for managing agent tasks and lifecycle on the Somnia blockchain.

## Overview

The AgentManager contract handles task creation, assignment, and completion for AI agents. It manages the full lifecycle of tasks from creation through completion or cancellation.

## Contract Address

**Testnet**: `0x77F6dC5924652e32DBa0B4329De0a44a2C95691E`

## 📊 Contract Architecture

```solidity
contract AgentManager {
    enum TaskStatus {
        Pending,      // 0 - Task created, waiting to be accepted
        InProgress,   // 1 - Task accepted and being worked on
        Completed,    // 2 - Task completed successfully
        Cancelled     // 3 - Task cancelled
    }

    struct Task {
        uint256 agentId;        // ID of the agent assigned to the task
        address requester;      // Address that created the task
        string taskData;        // JSON string with task details
        uint256 payment;        // Payment amount for the task
        TaskStatus status;      // Current status
        uint256 createdAt;      // Creation timestamp
        uint256 completedAt;    // Completion timestamp (0 if not completed)
        string result;          // Task result (empty until completed)
    }
    
    mapping(uint256 => Task) private tasks;
    uint256 private taskCounter;
}
```

{% hint style="info" %}
**Task Management:**
- The struct uses `reward` for payment amount
- Status enum: Pending (0), InProgress (1), Completed (2), Failed (3), Cancelled (4)
- Task includes `createdAt` and `completedAt` timestamps
- Use `startTask()` to begin execution
- Use `failTask()` to mark as failed (with refund)
- Use `cancelTask()` to cancel pending tasks (with refund)
{% endhint %}

## Main Functions

### Create Task

Create a new task for an agent:

```typescript
import { ethers } from 'ethers';

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

await tx.wait();
console.log('Task created');
```

**Function Signature:**
```solidity
function createTask(
    uint256 _agentId,
    string memory _taskData
) external payable returns (uint256)
```

**Parameters:**
- `_agentId` - ID of the agent to assign the task
- `_taskData` - JSON string containing task details
- Payment sent via `msg.value` (payable function)

**Returns:**
- `uint256` - Task ID

**Events Emitted:**
```solidity
event TaskCreated(
    uint256 indexed taskId,
    uint256 indexed agentId,
    address indexed requester,
    uint256 payment
);
```

{% hint style="info" %}
**Note:** The `payment` parameter is a regular function parameter, NOT sent as `{ value: payment }` in the transaction options.
{% endhint %}

### Get Task

Get task details:

```typescript
const task = await kit.contracts.manager.getTask(taskId);

console.log({
  agentId: task.agentId.toString(),
  requester: task.requester,
  taskData: task.taskData,
  reward: ethers.formatEther(task.reward),
  status: task.status, // 0: Pending, 1: InProgress, 2: Completed, 3: Cancelled
  createdAt: new Date(Number(task.createdAt) * 1000),
  completedAt: task.completedAt > 0n ? new Date(Number(task.completedAt) * 1000) : null,
  result: task.result,
});
```

**Function Signature:**
```solidity
function getTask(uint256 _taskId) 
    external 
    view 
    returns (
        uint256 agentId,
        address requester,
        string memory taskData,
        uint256 payment,
        TaskStatus status,
        uint256 createdAt,
        uint256 completedAt,
        string memory result
    )
```

### Start Task

Start working on a task (agent owner only):

```typescript
const tx = await kit.contracts.manager.startTask(taskId);
await tx.wait();
console.log('Task started and in progress!');
```

**Function Signature:**
```solidity
function startTask(uint256 _taskId) external
```

**Requirements:**
- Task must be in Pending status

**Events Emitted:**
```solidity
event TaskStarted(
    uint256 indexed taskId,
    uint256 timestamp
);
```

### Complete Task

Complete a task with result:

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

**Function Signature:**
```solidity
function completeTask(
    uint256 _taskId,
    string memory _result
) external
```

**Requirements:**
- Task must be in InProgress or Pending status

**Events Emitted:**
```solidity
event TaskCompleted(
    uint256 indexed taskId,
    string result,
    uint256 timestamp
);
```

### Fail Task

Mark a task as failed and refund the requester:

```typescript
const tx = await kit.contracts.manager.failTask(taskId);
await tx.wait();
console.log('Task failed and refunded');
```

**Function Signature:**
```solidity
function failTask(uint256 _taskId) external
```

**Requirements:**
- Task must be in InProgress status

**Events Emitted:**
```solidity
event TaskFailed(
    uint256 indexed taskId,
    uint256 timestamp
);
```

### Cancel Task

Cancel a pending task and refund the requester:

```typescript
const tx = await kit.contracts.manager.cancelTask(taskId);
await tx.wait();
console.log('Task cancelled');
```

**Function Signature:**
```solidity
function cancelTask(uint256 _taskId) external
```

**Requirements:**
- Caller must be the task requester
- Task must be in Pending status

**Events Emitted:**
```solidity
event TaskCancelled(
    uint256 indexed taskId,
    uint256 timestamp
);
```

## Events

### TaskCreated

```typescript
kit.contracts.manager.on('TaskCreated', (taskId, agentId, requester, reward, timestamp) => {
  console.log(`New task ${taskId.toString()} for agent ${agentId.toString()}`);
  console.log(`Requested by: ${requester}`);
  console.log(`Reward: ${ethers.formatEther(reward)} STT`);
});
```

### TaskStarted

```typescript
kit.contracts.manager.on('TaskStarted', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} started at ${new Date(Number(timestamp) * 1000)}`);
});
```

### TaskCompleted

```typescript
kit.contracts.manager.on('TaskCompleted', (taskId, result, timestamp) => {
  console.log(`Task ${taskId.toString()} completed`);
  console.log('Result:', result);
});
```

### TaskFailed

```typescript
kit.contracts.manager.on('TaskFailed', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} failed at ${new Date(Number(timestamp) * 1000)}`);
});
```

### TaskCancelled

```typescript
kit.contracts.manager.on('TaskCancelled', (taskId, timestamp) => {
  console.log(`Task ${taskId.toString()} cancelled at ${new Date(Number(timestamp) * 1000)}`);
});
```

## Task Status

```typescript
const statusMap = {
  0: 'Pending',
  1: 'InProgress',
  2: 'Completed',
  3: 'Cancelled',
};

const task = await kit.contracts.manager.getTask(taskId);
console.log('Status:', statusMap[Number(task.status)]);
```

## Complete Example

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
  ethers.parseEther('0.001')
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
  // Cancelled
  console.error('Task was cancelled');
}
```

### 3. Monitor Task Progress

```typescript
// Poll for status
async function waitForCompletion(taskId: bigint, maxWait = 60000) {
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const task = await kit.contracts.manager.getTask(taskId);

    if (task.status === 2n) {
      return JSON.parse(task.result);
    } else if (task.status === 3n) {
      throw new Error('Task failed');
    } else if (task.status === 4n) {
      throw new Error('Task was cancelled');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Task timeout');
}

const result = await waitForCompletion(taskId);
```

## 📚 Related Documentation

- **[AgentRegistry Contract](./agent-registry.md)** - Register agents
- **[AgentVault Contract](./agent-vault.md)** - Manage agent funds
- **[Task Management Guide](../sdk-tasks.md)** - SDK usage
- **[Smart Contracts Overview](../contracts-overview.md)** - All contracts

## ⚠️ Important Notes

1. **Payment via msg.value** - Payment is sent as transaction value using `{ value }`, not as a function parameter
2. **Task Status** - Tasks can be: Pending (0), InProgress (1), Completed (2), Failed (3), or Cancelled (4)
3. **Start Before Complete** - Must call `startTask()` before `completeTask()`
4. **Failure Handling** - Use `failTask()` to mark as failed with refund, or `cancelTask()` to cancel pending tasks

---

**Next:** Learn about [AgentVault](./agent-vault.md) for managing agent funds.

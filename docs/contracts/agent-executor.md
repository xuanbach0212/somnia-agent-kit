# ⚡ AgentExecutor Contract

Contract for executing agent tasks with authorization and resource control.

## Overview

The AgentExecutor contract manages agent task execution with role-based access control, gas limits, and execution fees. It provides a secure environment for running agent code on-chain.

## Contract Address

**Testnet**: `0x157C56dEdbAB6caD541109daabA4663Fc016026e`

## Execution Context

```solidity
struct ExecutionContext {
    address agent;
    bytes32 taskId;
    address requester;
    uint256 gasLimit;
    uint256 value;
    uint256 timestamp;
    ExecutionStatus status;
    bytes result;
}

enum ExecutionStatus {
    Pending,
    Success,
    Failed,
    Reverted
}
```

## Main Functions

### Authorize Agent

Authorize an agent for execution (Admin only):

```typescript
const tx = await kit.contracts.executor.authorizeAgent(agentAddress);
await tx.wait();
console.log('Agent authorized');
```

**Function Signature:**
```solidity
function authorizeAgent(address agent) external onlyRole(ADMIN_ROLE)
```

### Execute Task

Execute an agent task with gas limit and execution fee:

```typescript
import { ethers } from 'ethers';

const agentAddress = '0x...'; // Authorized agent contract
const taskData = ethers.toUtf8Bytes('{"action": "analyze", "data": "..."}');
const gasLimit = 500000;

const tx = await kit.contracts.executor.executeTask(
  agentAddress,
  taskData,
  gasLimit,
  { value: ethers.parseEther('0.001') } // Execution fee
);

const receipt = await tx.wait();
console.log('Task executed');
```

**Function Signature:**
```solidity
function executeTask(
    address agent,
    bytes memory data,
    uint256 gasLimit
) external payable returns (bytes32 taskId)
```

**Parameters:**
- `agent`: Address of authorized agent contract
- `data`: Encoded task data
- `gasLimit`: Maximum gas for execution
- `msg.value`: Execution fee (minimum required)

**Returns:** `taskId` - Unique task identifier

### Get Execution Details

```typescript
const taskId = '0x...'; // bytes32 task ID
const execution = await kit.contracts.executor.getExecution(taskId);

console.log('Execution:', {
  agent: execution.agent,
  requester: execution.requester,
  status: execution.status, // 0: Pending, 1: Success, 2: Failed, 3: Reverted
  gasLimit: execution.gasLimit.toString(),
  result: execution.result,
});
```

**Function Signature:**
```solidity
function getExecution(bytes32 taskId) external view returns (ExecutionContext memory)
```

### Check Agent Authorization

```typescript
const isAuthorized = await kit.contracts.executor.isAgentAuthorized(agentAddress);
console.log('Agent authorized:', isAuthorized);
```

### Get Agent Execution Count

```typescript
const count = await kit.contracts.executor.getAgentExecutionCount(agentAddress);
console.log('Executions:', count.toString());
```

## Admin Functions

### Revoke Agent

```typescript
const tx = await kit.contracts.executor.revokeAgent(agentAddress);
await tx.wait();
console.log('Agent revoked');
```

### Update Execution Fee

```typescript
const newFee = ethers.parseEther('0.002');
const tx = await kit.contracts.executor.setExecutionFee(newFee);
await tx.wait();
```

### Update Max Gas Limit

```typescript
const tx = await kit.contracts.executor.setMaxGasLimit(10000000);
await tx.wait();
```

### Withdraw Fees

```typescript
const recipient = '0x...';
const tx = await kit.contracts.executor.withdrawFees(recipient);
await tx.wait();
```

## Events

### ExecutionQueued

Emitted when a task is queued for execution:

```typescript
kit.contracts.executor.on('ExecutionQueued', (taskId, agent, requester) => {
  console.log(`Task ${taskId} queued`);
  console.log(`Agent: ${agent}`);
  console.log(`Requester: ${requester}`);
});
```

### ExecutionCompleted

Emitted when execution finishes:

```typescript
kit.contracts.executor.on('ExecutionCompleted', (taskId, status, result) => {
  console.log(`Task ${taskId} completed`);
  console.log(`Status: ${status}`); // 1: Success, 2: Failed, 3: Reverted
  console.log(`Result:`, result);
});
```

### AgentAuthorized

```typescript
kit.contracts.executor.on('AgentAuthorized', (agent, authorizer) => {
  console.log(`Agent ${agent} authorized by ${authorizer}`);
});
```

### AgentRevoked

```typescript
kit.contracts.executor.on('AgentRevoked', (agent, revoker) => {
  console.log(`Agent ${agent} revoked by ${revoker}`);
});
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

  // 1. Authorize agent (if admin)
  const agentAddress = '0x...';
  await kit.contracts.executor.authorizeAgent(agentAddress);

  // 2. Execute task
  const taskData = ethers.toUtf8Bytes(JSON.stringify({
    action: 'analyze',
    params: { symbol: 'ETH/USD' }
  }));

  const tx = await kit.contracts.executor.executeTask(
    agentAddress,
    taskData,
    500000, // gas limit
    { value: ethers.parseEther('0.001') }
  );

  const receipt = await tx.wait();

  // 3. Get task ID from event
  const event = receipt.logs.find(
    (log: any) => log.topics[0] === 
      kit.contracts.executor.interface.getEvent('ExecutionQueued').topicHash
  );

  if (event) {
    const parsed = kit.contracts.executor.interface.parseLog(event);
    const taskId = parsed?.args.taskId;

    // 4. Check execution result
    const execution = await kit.contracts.executor.getExecution(taskId);
    console.log('Execution status:', execution.status);
    console.log('Result:', execution.result);
  }
}

main().catch(console.error);
```

## Security Features

1. **Role-Based Access Control** - Admin and executor roles
2. **Agent Authorization** - Only authorized agents can execute
3. **Gas Limits** - Prevent excessive gas consumption
4. **Execution Fees** - Spam prevention
5. **Reentrancy Protection** - Safe external calls

## See Also

- [AgentManager](agent-manager.md) - Task management
- [AgentRegistry](agent-registry.md) - Agent registration
- [Task Management](../sdk-tasks.md) - SDK usage


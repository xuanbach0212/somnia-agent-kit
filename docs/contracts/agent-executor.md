# ⚡ AgentExecutor Contract

Contract for executing agent tasks on-chain.

## Overview

The AgentExecutor contract handles the execution of tasks assigned to AI agents.

## Contract Address

**Testnet**: `0x157C56dEdbAB6caD541109daabA4663Fc016026e`

## Main Functions

### Execute Task

Execute a task for an agent:

```typescript
const tx = await kit.contracts.executor.execute(taskId);
await tx.wait();
console.log('Task executed');
```

### Get Execution Status

```typescript
const status = await kit.contracts.executor.getExecutionStatus(taskId);
console.log('Execution status:', status);
```

## Events

### TaskExecuted

Emitted when a task is executed:

```typescript
kit.contracts.executor.on('TaskExecuted', (taskId, executor, result) => {
  console.log(`Task ${taskId.toString()} executed by ${executor}`);
  console.log('Result:', result);
});
```

## Example

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

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

  // Execute task
  const taskId = 1n;
  const tx = await kit.contracts.executor.execute(taskId);
  await tx.wait();

  console.log('Task executed successfully!');
}

main().catch(console.error);
```

## See Also

- [AgentManager](agent-manager.md)
- [Task Management](../sdk-tasks.md)
- [API Reference](../../API_REFERENCE.md)


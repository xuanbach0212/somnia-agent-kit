# 🤖 Working with Agents

Complete guide for managing AI agents using the Somnia Agent Kit SDK.

## Overview

The SDK provides simple methods to register, query, and manage AI agents on the Somnia blockchain.

## Initialize SDK

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY, // Optional for read operations
});

await kit.initialize();
```

## Register Agent

Register a new AI agent on-chain:

```typescript
// Register agent
const tx = await kit.contracts.registry.registerAgent(
  'Trading Bot',                              // name
  'AI-powered trading assistant',             // description
  'ipfs://QmExample123',                      // metadata URI
  ['trading', 'analysis', 'risk-management']  // capabilities
);

// Wait for confirmation
const receipt = await tx.wait();

// Get agent ID from event
const event = receipt.logs.find(
  (log: any) =>
    log.topics[0] ===
    kit.contracts.registry.interface.getEvent('AgentRegistered').topicHash
);

if (event) {
  const parsed = kit.contracts.registry.interface.parseLog(event);
  const agentId = parsed?.args.agentId;
  console.log('Agent registered with ID:', agentId.toString());
}
```

## Query Agents

### Get Total Agents

```typescript
const total = await kit.contracts.registry.getTotalAgents();
console.log('Total agents:', total.toString());
```

### Get Agent by ID

```typescript
const agent = await kit.contracts.registry.getAgent(1);

console.log({
  name: agent.name,
  description: agent.description,
  owner: agent.owner,
  isActive: agent.isActive,
  metadata: agent.ipfsMetadata,
});
```

### Get Agent Capabilities

```typescript
const capabilities = await kit.contracts.registry.getAgentCapabilities(1);
console.log('Capabilities:', capabilities);
// Output: ['trading', 'analysis', 'risk-management']
```

### Get Agents by Owner

```typescript
const signer = kit.getSigner();
const ownerAddress = await signer.getAddress();

const agentIds = await kit.contracts.registry.getAgentsByOwner(ownerAddress);
console.log('My agents:', agentIds.map(id => id.toString()));
```

### Get All Agents

```typescript
const allAgents = await kit.contracts.registry.getAllAgents();

for (const agentId of allAgents) {
  const agent = await kit.contracts.registry.getAgent(agentId);
  console.log(`Agent #${agentId}: ${agent.name}`);
}
```

### Get Active Agents

```typescript
const activeAgents = await kit.contracts.registry.getActiveAgents();
console.log('Active agents:', activeAgents.length);
```

## Update Agent

### Update Agent Info

```typescript
const tx = await kit.contracts.registry.updateAgent(
  1,                                    // agentId
  'Updated Trading Bot',                // new name
  'Enhanced AI trading assistant',      // new description
  'ipfs://QmNewMetadata456'             // new metadata
);

await tx.wait();
console.log('Agent updated!');
```

## Manage Agent Status

### Deactivate Agent

```typescript
const tx = await kit.contracts.registry.deactivateAgent(1);
await tx.wait();
console.log('Agent deactivated');
```

### Reactivate Agent

```typescript
const tx = await kit.contracts.registry.reactivateAgent(1);
await tx.wait();
console.log('Agent reactivated');
```

## Transfer Ownership

```typescript
const newOwner = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

const tx = await kit.contracts.registry.transferAgentOwnership(1, newOwner);
await tx.wait();
console.log('Ownership transferred to:', newOwner);
```

## Listen to Events

### Agent Registered Event

```typescript
kit.contracts.registry.on('AgentRegistered', (agentId, owner, name) => {
  console.log(`New agent registered!`);
  console.log(`ID: ${agentId.toString()}`);
  console.log(`Owner: ${owner}`);
  console.log(`Name: ${name}`);
});
```

### Agent Updated Event

```typescript
kit.contracts.registry.on('AgentUpdated', (agentId) => {
  console.log(`Agent ${agentId.toString()} was updated`);
});
```

### Agent Status Changed Event

```typescript
kit.contracts.registry.on('AgentStatusChanged', (agentId, isActive) => {
  console.log(`Agent ${agentId.toString()} is now ${isActive ? 'active' : 'inactive'}`);
});
```

## Complete Example

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

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

  // Register agent
  console.log('Registering agent...');
  const tx = await kit.contracts.registry.registerAgent(
    'My Trading Bot',
    'AI-powered trading assistant',
    'ipfs://QmExample',
    ['trading', 'analysis']
  );

  const receipt = await tx.wait();
  console.log('Agent registered!');

  // Get agent ID
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] ===
      kit.contracts.registry.interface.getEvent('AgentRegistered').topicHash
  );

  if (event) {
    const parsed = kit.contracts.registry.interface.parseLog(event);
    const agentId = parsed?.args.agentId;

    // Query agent
    const agent = await kit.contracts.registry.getAgent(agentId);
    console.log('Agent details:', {
      id: agentId.toString(),
      name: agent.name,
      owner: agent.owner,
      isActive: agent.isActive,
    });

    // Get capabilities
    const capabilities = await kit.contracts.registry.getAgentCapabilities(agentId);
    console.log('Capabilities:', capabilities);
  }
}

main().catch(console.error);
```

## Best Practices

### 1. Always Initialize SDK

```typescript
await kit.initialize();
// Now safe to use kit.contracts
```

### 2. Handle Errors

```typescript
try {
  const tx = await kit.contracts.registry.registerAgent(...);
  await tx.wait();
} catch (error) {
  console.error('Failed to register agent:', error);
}
```

### 3. Check Agent Exists

```typescript
const total = await kit.contracts.registry.getTotalAgents();
if (agentId <= total) {
  const agent = await kit.contracts.registry.getAgent(agentId);
  // Use agent
}
```

### 4. Verify Ownership

```typescript
const agent = await kit.contracts.registry.getAgent(agentId);
const signer = kit.getSigner();
const myAddress = await signer.getAddress();

if (agent.owner.toLowerCase() === myAddress.toLowerCase()) {
  // You own this agent
  await kit.contracts.registry.updateAgent(...);
}
```

## See Also

- [Quick Start](quickstart.md)
- [Task Management](sdk-tasks.md)
- [API Reference](../API_REFERENCE.md)
- [Examples](../examples/README.md)


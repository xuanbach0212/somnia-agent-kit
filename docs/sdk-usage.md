# 🔧 SDK Basic Usage

Quick guide to get started with the Somnia Agent Kit SDK.

## Installation

```bash
npm install somnia-agent-kit
```

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

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (optional for read-only operations)
PRIVATE_KEY=0x...

# Contract Addresses (Testnet)
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129
```

### Network Configuration

```typescript
import { SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Testnet (default)
network: SOMNIA_NETWORKS.testnet

// Mainnet
network: SOMNIA_NETWORKS.mainnet

// Devnet
network: SOMNIA_NETWORKS.devnet

// Custom
network: {
  rpcUrl: 'https://custom-rpc.somnia.network',
  chainId: 50312,
  name: 'Custom Network',
}
```

## Basic Operations

### Get Network Info

```typescript
const network = kit.getNetworkInfo();
console.log('Network:', network.name);
console.log('Chain ID:', network.chainId);
console.log('RPC URL:', network.rpcUrl);
```

### Get Provider

```typescript
const provider = kit.getProvider();
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);
```

### Get Signer

```typescript
const signer = kit.getSigner();
if (signer) {
  const address = await signer.getAddress();
  console.log('Your address:', address);
  
  const balance = await provider.getBalance(address);
  console.log('Balance:', ethers.formatEther(balance), 'STT');
}
```

## Access Contracts

### AgentRegistry

```typescript
// Get total agents
const total = await kit.contracts.registry.getTotalAgents();
console.log('Total agents:', total.toString());

// Get agent by ID
const agent = await kit.contracts.registry.getAgent(1);
console.log('Agent:', agent.name);
```

### AgentManager

```typescript
// Get task
const task = await kit.contracts.manager.getTask(1);
console.log('Task status:', task.status);
```

### AgentVault

```typescript
// Get balance
const balance = await kit.contracts.vault.getBalance(1);
console.log('Vault balance:', ethers.formatEther(balance));
```

### AgentExecutor

```typescript
// Execute task
const tx = await kit.contracts.executor.execute(taskId);
await tx.wait();
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
  console.log('✅ SDK initialized');

  // Get network info
  const network = kit.getNetworkInfo();
  console.log('📡 Network:', network.name);

  // Get your address
  const signer = kit.getSigner();
  if (signer) {
    const address = await signer.getAddress();
    console.log('👤 Address:', address);
  }

  // Query agents
  const total = await kit.contracts.registry.getTotalAgents();
  console.log('🤖 Total agents:', total.toString());

  if (total > 0n) {
    const agent = await kit.contracts.registry.getAgent(1);
    console.log('📋 Agent #1:', agent.name);
  }
}

main().catch(console.error);
```

## Error Handling

```typescript
try {
  await kit.initialize();
  // Use SDK
} catch (error) {
  console.error('Failed to initialize SDK:', error);
}
```

## Best Practices

### 1. Always Initialize

```typescript
await kit.initialize();
// Now safe to use kit.contracts
```

### 2. Check Signer for Write Operations

```typescript
const signer = kit.getSigner();
if (!signer) {
  throw new Error('Private key required for this operation');
}
```

### 3. Handle Network Errors

```typescript
try {
  const agent = await kit.contracts.registry.getAgent(id);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network connection failed');
  } else {
    console.error('Error:', error);
  }
}
```

## Next Steps

- **[Working with Agents](sdk-agents.md)** - Register and manage agents
- **[Task Management](sdk-tasks.md)** - Create and execute tasks
- **[Vault Operations](sdk-vault.md)** - Manage agent funds
- **[LLM Integration](sdk-llm.md)** - Use AI with your agents
- **[API Reference](../API_REFERENCE.md)** - Complete API documentation

## See Also

- [Quick Start](quickstart.md)
- [Installation](installation.md)
- [Examples](../examples/README.md)


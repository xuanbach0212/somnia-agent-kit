# ⚡ Multicall Batching

Complete guide for optimizing gas costs by batching multiple contract calls into a single transaction.

## Overview

Multicall allows you to batch multiple contract read operations into a single RPC call, significantly reducing network overhead and improving performance.

## Benefits

- ⚡ **Faster**: Single RPC call instead of multiple
- 💰 **Cheaper**: Reduced network overhead
- 🎯 **Atomic**: All calls execute in the same block
- 📊 **Efficient**: Perfect for dashboards and analytics

## Initialize Multicall

```typescript
import { MultiCall } from 'somnia-agent-kit';

// Create multicall instance
const multicall = new MultiCall(kit.getChainClient());
```

## Basic Usage

### Batch Contract Reads

```typescript
import { ethers } from 'ethers';

// Prepare calls
const calls = [
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getTotalAgents')
  },
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getAgent', [1])
  },
  {
    target: vaultAddress,
    callData: vault.interface.encodeFunctionData('getBalance', [1])
  }
];

// Execute all calls in one transaction
const results = await multicall.aggregate(calls);

// Decode results
const totalAgents = registry.interface.decodeFunctionResult(
  'getTotalAgents',
  results[0]
)[0];

const agent = registry.interface.decodeFunctionResult(
  'getAgent',
  results[1]
)[0];

const balance = vault.interface.decodeFunctionResult(
  'getBalance',
  results[2]
)[0];

console.log('Total agents:', totalAgents.toString());
console.log('Agent name:', agent.name);
console.log('Balance:', ethers.formatEther(balance));
```

## Advanced Usage

### Batch with Error Handling

```typescript
// Use tryAggregate to handle failures gracefully
const calls = [
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getAgent', [1])
  },
  {
    target: registryAddress,
    callData: registry.interface.encodeFunctionData('getAgent', [999]) // May not exist
  }
];

// requireSuccess = false allows individual calls to fail
const results = await multicall.tryAggregate(false, calls);

results.forEach((result, index) => {
  if (result.success) {
    const agent = registry.interface.decodeFunctionResult(
      'getAgent',
      result.returnData
    )[0];
    console.log(`Agent ${index + 1}:`, agent.name);
  } else {
    console.log(`Agent ${index + 1}: Not found`);
  }
});
```

### Get Block Information

```typescript
// Get block info along with call results
const { blockNumber, blockHash, results } = await multicall.aggregateWithBlock(calls);

console.log('Block number:', blockNumber);
console.log('Block hash:', blockHash);
console.log('Results:', results);
```

## Complete Example: Dashboard Data

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  MultiCall
} from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function fetchDashboardData() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
  });

  await kit.initialize();

  // Initialize multicall
  const multicall = new MultiCall(kit.getChainClient());

  const registry = kit.contracts.registry;
  const vault = kit.contracts.vault;
  const manager = kit.contracts.manager;

  console.log('📊 Fetching dashboard data...');

  // Prepare all calls
  const calls = [
    // Registry data
    {
      target: await registry.getAddress(),
      callData: registry.interface.encodeFunctionData('getTotalAgents')
    },
    {
      target: await registry.getAddress(),
      callData: registry.interface.encodeFunctionData('getActiveAgents')
    },
    // Agent 1 data
    {
      target: await registry.getAddress(),
      callData: registry.interface.encodeFunctionData('getAgent', [1])
    },
    {
      target: await vault.getAddress(),
      callData: vault.interface.encodeFunctionData('getBalance', [1])
    },
    // Agent 2 data
    {
      target: await registry.getAddress(),
      callData: registry.interface.encodeFunctionData('getAgent', [2])
    },
    {
      target: await vault.getAddress(),
      callData: vault.interface.encodeFunctionData('getBalance', [2])
    },
  ];

  // Execute all calls at once
  const startTime = Date.now();
  const results = await multicall.aggregate(calls);
  const duration = Date.now() - startTime;

  console.log(`✅ Fetched ${calls.length} data points in ${duration}ms\n`);

  // Decode results
  const totalAgents = registry.interface.decodeFunctionResult(
    'getTotalAgents',
    results[0]
  )[0];

  const activeAgents = registry.interface.decodeFunctionResult(
    'getActiveAgents',
    results[1]
  )[0];

  const agent1 = registry.interface.decodeFunctionResult(
    'getAgent',
    results[2]
  )[0];

  const balance1 = vault.interface.decodeFunctionResult(
    'getBalance',
    results[3]
  )[0];

  const agent2 = registry.interface.decodeFunctionResult(
    'getAgent',
    results[4]
  )[0];

  const balance2 = vault.interface.decodeFunctionResult(
    'getBalance',
    results[5]
  )[0];

  // Display dashboard
  console.log('📊 Dashboard Data:');
  console.log('─────────────────────────────────────');
  console.log(`Total Agents:  ${totalAgents.toString()}`);
  console.log(`Active Agents: ${activeAgents.length}`);
  console.log('');
  console.log('Agent #1:');
  console.log(`  Name:    ${agent1.name}`);
  console.log(`  Owner:   ${agent1.owner}`);
  console.log(`  Balance: ${ethers.formatEther(balance1)} ETH`);
  console.log('');
  console.log('Agent #2:');
  console.log(`  Name:    ${agent2.name}`);
  console.log(`  Owner:   ${agent2.owner}`);
  console.log(`  Balance: ${ethers.formatEther(balance2)} ETH`);
  console.log('─────────────────────────────────────');
}

fetchDashboardData().catch(console.error);
```

## Complete Example: Portfolio Tracker

```typescript
import { MultiCall, ERC20Manager } from 'somnia-agent-kit';

async function trackPortfolio() {
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
  });

  await kit.initialize();

  const multicall = new MultiCall(kit.getChainClient());
  const erc20 = new ERC20Manager(kit.getChainClient());

  // Token addresses to track
  const tokens = [
    { address: '0x...', symbol: 'USDT' },
    { address: '0x...', symbol: 'USDC' },
    { address: '0x...', symbol: 'DAI' },
  ];

  const walletAddress = '0x...'; // Your wallet

  console.log('💼 Tracking portfolio...\n');

  // Prepare calls for all tokens
  const calls = tokens.flatMap(token => [
    {
      target: token.address,
      callData: erc20.getContract(token.address).interface.encodeFunctionData('balanceOf', [walletAddress])
    },
    {
      target: token.address,
      callData: erc20.getContract(token.address).interface.encodeFunctionData('decimals')
    }
  ]);

  // Fetch all balances at once
  const results = await multicall.aggregate(calls);

  // Process results
  const portfolio = [];
  for (let i = 0; i < tokens.length; i++) {
    const balanceResult = results[i * 2];
    const decimalsResult = results[i * 2 + 1];

    const balance = erc20.getContract(tokens[i].address).interface.decodeFunctionResult(
      'balanceOf',
      balanceResult
    )[0];

    const decimals = erc20.getContract(tokens[i].address).interface.decodeFunctionResult(
      'decimals',
      decimalsResult
    )[0];

    portfolio.push({
      symbol: tokens[i].symbol,
      balance: ethers.formatUnits(balance, decimals),
      raw: balance
    });
  }

  // Display portfolio
  console.log('💼 Your Portfolio:');
  console.log('─────────────────────────────');
  portfolio.forEach(token => {
    console.log(`${token.symbol}: ${token.balance}`);
  });
  console.log('─────────────────────────────');
}

trackPortfolio().catch(console.error);
```

## Performance Comparison

### Without Multicall (Sequential)

```typescript
// ❌ Slow: Multiple RPC calls
const totalAgents = await registry.getTotalAgents();  // Call 1
const agent1 = await registry.getAgent(1);            // Call 2
const agent2 = await registry.getAgent(2);            // Call 3
const balance1 = await vault.getBalance(1);           // Call 4
const balance2 = await vault.getBalance(2);           // Call 5

// Total time: ~5 x 200ms = 1000ms
```

### With Multicall (Batched)

```typescript
// ✅ Fast: Single RPC call
const calls = [
  { target: registryAddr, callData: encodedCall1 },
  { target: registryAddr, callData: encodedCall2 },
  { target: registryAddr, callData: encodedCall3 },
  { target: vaultAddr, callData: encodedCall4 },
  { target: vaultAddr, callData: encodedCall5 },
];

const results = await multicall.aggregate(calls);

// Total time: ~200ms (5x faster!)
```

## Best Practices

### 1. Batch Related Calls

```typescript
// Good: Batch related data fetching
const calls = [
  // Agent data
  { target: registry, callData: encodeGetAgent(1) },
  { target: vault, callData: encodeGetBalance(1) },
  { target: manager, callData: encodeGetTasks(1) },
];

const results = await multicall.aggregate(calls);
```

### 2. Use tryAggregate for Optional Data

```typescript
// Some calls might fail (agent doesn't exist, etc.)
const results = await multicall.tryAggregate(false, calls);

results.forEach((result, index) => {
  if (result.success) {
    // Process successful result
  } else {
    // Handle failure gracefully
    console.log(`Call ${index} failed`);
  }
});
```

### 3. Limit Batch Size

```typescript
// Don't batch too many calls at once
const BATCH_SIZE = 50;

for (let i = 0; i < allCalls.length; i += BATCH_SIZE) {
  const batch = allCalls.slice(i, i + BATCH_SIZE);
  const results = await multicall.aggregate(batch);
  // Process batch results
}
```

### 4. Cache Multicall Results

```typescript
const cache = new Map();

async function getCachedData(cacheKey: string, calls: any[]) {
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.data;
    }
  }

  const results = await multicall.aggregate(calls);
  cache.set(cacheKey, {
    data: results,
    timestamp: Date.now()
  });

  return results;
}
```

### 5. Handle Errors Gracefully

```typescript
try {
  const results = await multicall.aggregate(calls);
  // Process results
} catch (error) {
  console.error('Multicall failed:', error.message);
  
  // Fallback to sequential calls
  for (const call of calls) {
    try {
      const result = await provider.call({
        to: call.target,
        data: call.callData
      });
      // Process individual result
    } catch (err) {
      console.error('Individual call failed:', err);
    }
  }
}
```

## Multicall Contract

The SDK uses the Multicall3 contract deployed on Somnia:

```
Address: 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223
Network: Somnia Testnet
```

## See Also

- [SDK Usage](sdk-usage.md)
- [Working with Agents](sdk-agents.md)
- [Token Management](sdk-tokens.md)
- [API Reference](../API_REFERENCE.md)
- [Multicall Example](../examples/06-multicall-batch/)


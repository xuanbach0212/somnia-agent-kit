# Example 6: MultiCall Batch Operations

Demonstrates how to use MultiCall to batch multiple contract calls into a single RPC request, dramatically reducing overhead and improving performance.

## Features

- ✅ Batch balance checks for multiple addresses
- ✅ Batch token metadata queries
- ✅ Block-aware aggregation
- ✅ 80-90% performance improvement

## Use Cases

- Portfolio tracking (check multiple token balances at once)
- NFT collection queries (batch metadata fetches)
- Dashboard data aggregation
- DeFi protocol state monitoring
- Analytics and reporting

## Performance Benefits

| Operation | Without MultiCall | With MultiCall | Improvement |
|-----------|------------------|----------------|-------------|
| Check 10 balances | 10 RPC calls | 1 RPC call | 90% faster |
| Check 100 balances | 100 RPC calls | 1 RPC call | 99% faster |
| Token metadata (4 calls) | 4 RPC calls | 1 RPC call | 75% faster |

## How to Run

1. Set up environment variables:
```bash
export AGENT_REGISTRY_ADDRESS="your_registry_address"
export AGENT_EXECUTOR_ADDRESS="your_executor_address"
```

2. Replace the example token address with a real ERC20 token on Somnia testnet

3. Run the example:
```bash
cd examples/06-multicall-batch
npx ts-node index.ts
```

## Code Highlights

### Example 1: Batch Balance Checks
```typescript
// Get MultiCall instance (recommended)
const multicall = kit.getMultiCall();

// Create batch calls
const calls = addresses.map((address) => ({
  target: tokenAddress,
  callData: tokenContract.interface.encodeFunctionData('balanceOf', [address]),
}));

// Execute in 1 RPC call
const results = await multicall.tryAggregate(calls, false);
```

### Example 2: Batch Token Info
```typescript
const metadataCalls = MultiCall.createBatch(tokenContract, [
  { method: 'name', args: [] },
  { method: 'symbol', args: [] },
  { method: 'decimals', args: [] },
  { method: 'totalSupply', args: [] },
]);

const results = await multicall.aggregate(metadataCalls);
```

### Example 3: Block and Aggregate
```typescript
// Get data + block info atomically
const result = await multicall.blockAndAggregate([call]);
console.log(result.blockNumber, result.blockHash, result.returnData);
```

## Learn More

- [MultiCall3 Contract](https://www.multicall3.com/)
- [Somnia Network Documentation](https://docs.somnia.network/)


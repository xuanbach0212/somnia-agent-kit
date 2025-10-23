# Example 08: Convenience API Demo

This example demonstrates the new convenient getter methods that provide easy access to all SDK modules through the main `SomniaAgentKit` instance.

## What's New?

Previously, you had to manually instantiate module managers:

```typescript
// Old way ❌
const erc20 = new ERC20Manager(kit.getChainClient());
const multicall = new MultiCall(kit.getChainClient());
const ipfs = new IPFSManager();
```

Now, you can access them directly through the SDK instance:

```typescript
// New way ✅
const erc20 = kit.getERC20Manager();
const multicall = kit.getMultiCall();
const ipfs = kit.getIPFSManager();
```

## Available Convenience Getters

### Token Management
- `kit.getERC20Manager()` - ERC20 token operations
- `kit.getERC721Manager()` - NFT operations
- `kit.getNativeTokenManager()` - Native token (STT/SOMI) operations

### Blockchain Operations
- `kit.getMultiCall()` - Batch RPC calls (80-90% faster!)

### Storage & Events
- `kit.getIPFSManager()` - IPFS storage and NFT metadata
- `kit.getWebSocketClient()` - Real-time blockchain events

### Contract Deployment
- `kit.getContractDeployer()` - Deploy smart contracts
- `kit.getContractVerifier()` - Verify contracts on Somnia Explorer

### Wallet Integration
- `kit.getMetaMaskConnector()` - Browser wallet integration

### Core Modules (Already Available)
- `kit.contracts` - Smart contract instances
- `kit.getChainClient()` - Low-level blockchain operations
- `kit.getProvider()` - Ethers.js provider
- `kit.getSigner()` - Ethers.js signer

## Benefits

1. **Convenient** - No need to manually instantiate managers
2. **Lazy Loading** - Instances only created when needed
3. **Cached** - Same instance returned on multiple calls
4. **Type Safe** - Full TypeScript support
5. **Backward Compatible** - Old code still works

## Running the Example

```bash
# From the examples directory
cd examples/08-convenience-api

# Run the example
npx ts-node index.ts
```

## Expected Output

The example will:
1. Initialize the SDK
2. Demonstrate access to all token management modules
3. Show blockchain operation modules
4. Display storage and event modules
5. Show contract deployment modules
6. Display wallet integration
7. List existing core modules

All modules are accessible and ready to use!

## Next Steps

- Check out [Example 06](../06-multicall-batch) for MultiCall usage
- Check out [Example 07](../07-token-management) for token management
- See the [SDK Documentation](../../docs) for detailed API reference


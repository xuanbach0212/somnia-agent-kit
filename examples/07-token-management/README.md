# Example 7: Token Management

Comprehensive example demonstrating token management utilities for ERC20, ERC721, and native tokens on Somnia blockchain.

## Features

### Native Token (STT)
- ✅ Balance queries
- ✅ Transfer operations
- ✅ Gas estimation
- ✅ Batch balance checks
- ✅ Transfer affordability checks

### ERC20 Tokens
- ✅ Token information (name, symbol, decimals, supply)
- ✅ Balance queries
- ✅ Transfer operations
- ✅ Approval management
- ✅ Auto-approve if needed
- ✅ Batch operations

### ERC721 NFTs
- ✅ Collection information
- ✅ NFT ownership queries
- ✅ Token URI fetching
- ✅ Transfer operations
- ✅ Approval management
- ✅ Enumeration support

## How to Run

1. Set up environment variables:
```bash
export AGENT_REGISTRY_ADDRESS="your_registry_address"
export AGENT_EXECUTOR_ADDRESS="your_executor_address"
export PRIVATE_KEY="your_private_key"  # Optional, for write operations
```

2. Replace example addresses with real tokens on Somnia testnet:
   - `tokenAddress`: Valid ERC20 token
   - `nftAddress`: Valid ERC721 collection

3. Run the example:
```bash
cd examples/07-token-management
npx ts-node index.ts
```

## Code Highlights

### Native Token Operations
```typescript
const nativeManager = new NativeTokenManager(chainClient);

// Get balance
const balance = await nativeManager.getBalance();

// Estimate transfer cost
const estimate = await nativeManager.estimateTransferGas(to, amount);

// Transfer
await nativeManager.transfer(to, amount);
```

### ERC20 Operations
```typescript
const erc20Manager = new ERC20Manager(chainClient);

// Get token info
const info = await erc20Manager.getTokenInfo(tokenAddress);

// Check balance
const balance = await erc20Manager.balanceOf(tokenAddress, account);

// Transfer
await erc20Manager.transfer(tokenAddress, to, amount);

// Approve
await erc20Manager.approve(tokenAddress, spender, amount);

// Auto-approve if needed
await erc20Manager.ensureApproval(tokenAddress, spender, amount);
```

### ERC721 Operations
```typescript
const nftManager = new ERC721Manager(chainClient);

// Get collection info
const info = await nftManager.getCollectionInfo(nftAddress);

// Check ownership
const owner = await nftManager.ownerOf(nftAddress, tokenId);

// Get owned NFTs
const tokenIds = await nftManager.getOwnedTokens(nftAddress, owner);

// Transfer NFT
await nftManager.safeTransferFrom(nftAddress, from, to, tokenId);
```

## Use Cases

- 🪙 Wallet applications
- 📊 Token dashboards
- 🖼️ NFT marketplaces
- 💼 Portfolio trackers
- 🏦 DeFi protocols
- 💳 Payment systems
- 📈 Analytics platforms

## Helper Utilities

### Format/Parse Amounts
```typescript
// Format wei to human-readable
const formatted = ERC20Manager.formatAmount(amount, decimals);
const native = NativeTokenManager.formatAmount(amount);

// Parse human-readable to wei
const amount = ERC20Manager.parseAmount('100.5', decimals);
const native = NativeTokenManager.parseAmount('1.5');
```

### Gas Price Formatting
```typescript
const gasPrice = await nativeManager.getGasPrice();
const formatted = NativeTokenManager.formatGasPrice(gasPrice);
console.log(`${formatted} gwei`);
```

## Learn More

- [ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [ERC721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Somnia Network Documentation](https://docs.somnia.network/)


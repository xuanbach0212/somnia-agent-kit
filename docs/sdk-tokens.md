# 💰 Token Management

Complete guide for managing ERC20 tokens and ERC721 NFTs on Somnia blockchain.

## Overview

The SDK provides utilities for interacting with ERC20 tokens and ERC721 NFTs, including transfers, approvals, and balance queries.

## ERC20 Token Operations

### Initialize ERC20 Manager

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Initialize SDK
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    agentVault: process.env.AGENT_VAULT_ADDRESS!,
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();

// Get ERC20 manager (recommended)
const erc20 = kit.getERC20Manager();
```

### Get Token Information

```typescript
const tokenAddress = '0x...'; // Your ERC20 token address

// Get token info
const info = await erc20.getTokenInfo(tokenAddress);

console.log({
  name: info.name,           // e.g., "Somnia Token"
  symbol: info.symbol,       // e.g., "STT"
  decimals: info.decimals,   // e.g., 18
  totalSupply: info.totalSupply.toString()
});
```

### Check Balance

```typescript
const walletAddress = '0x...';
const tokenAddress = '0x...';

// Get balance
const balance = await erc20.getBalance(tokenAddress, walletAddress);

console.log('Balance:', ethers.formatUnits(balance, 18), 'tokens');
```

### Transfer Tokens

```typescript
const recipientAddress = '0x...';
const amount = ethers.parseUnits('100', 18); // 100 tokens

// Transfer tokens
const tx = await erc20.transfer(tokenAddress, recipientAddress, amount);
await tx.wait();

console.log('✅ Tokens transferred!');
```

### Approve Spending

```typescript
const spenderAddress = '0x...'; // Contract or user to approve
const amount = ethers.parseUnits('1000', 18);

// Approve spender
const tx = await erc20.approve(tokenAddress, spenderAddress, amount);
await tx.wait();

console.log('✅ Spending approved!');
```

### Check Allowance

```typescript
const ownerAddress = '0x...';
const spenderAddress = '0x...';

// Get allowance
const allowance = await erc20.getAllowance(
  tokenAddress,
  ownerAddress,
  spenderAddress
);

console.log('Allowance:', ethers.formatUnits(allowance, 18));
```

### Transfer From (Using Allowance)

```typescript
const fromAddress = '0x...';
const toAddress = '0x...';
const amount = ethers.parseUnits('50', 18);

// Transfer from another address (requires prior approval)
const tx = await erc20.transferFrom(
  tokenAddress,
  fromAddress,
  toAddress,
  amount
);
await tx.wait();

console.log('✅ Tokens transferred from allowance!');
```

## ERC721 NFT Operations

### Initialize ERC721 Manager

```typescript
// Get ERC721 manager (already initialized above)
const nft = kit.getERC721Manager();
```

### Get Collection Information

```typescript
const nftAddress = '0x...'; // Your NFT collection address

// Get collection info
const info = await erc721.getCollectionInfo(nftAddress);

console.log({
  name: info.name,           // e.g., "Somnia NFTs"
  symbol: info.symbol,       // e.g., "SNFT"
  totalSupply: info.totalSupply?.toString()
});
```

### Check NFT Owner

```typescript
const tokenId = 1;

// Get owner of NFT
const owner = await erc721.getOwner(nftAddress, tokenId);
console.log('NFT owner:', owner);
```

### Get NFT Balance

```typescript
const walletAddress = '0x...';

// Get number of NFTs owned
const balance = await erc721.getBalance(nftAddress, walletAddress);
console.log('NFTs owned:', balance.toString());
```

### Transfer NFT

```typescript
const fromAddress = '0x...';
const toAddress = '0x...';
const tokenId = 1;

// Transfer NFT (safe transfer)
const tx = await erc721.safeTransferFrom(
  nftAddress,
  fromAddress,
  toAddress,
  tokenId
);
await tx.wait();

console.log('✅ NFT transferred!');
```

### Approve NFT Transfer

```typescript
const approvedAddress = '0x...';
const tokenId = 1;

// Approve specific NFT
const tx = await erc721.approve(nftAddress, approvedAddress, tokenId);
await tx.wait();

console.log('✅ NFT transfer approved!');
```

### Set Approval for All

```typescript
const operatorAddress = '0x...';

// Approve operator for all NFTs
const tx = await erc721.setApprovalForAll(nftAddress, operatorAddress, true);
await tx.wait();

console.log('✅ Operator approved for all NFTs!');
```

### Get NFT Metadata

```typescript
const tokenId = 1;

// Get token URI
const uri = await erc721.getTokenURI(nftAddress, tokenId);
console.log('Token URI:', uri);

// Fetch metadata from IPFS/HTTP
const metadata = await erc721.getMetadata(nftAddress, tokenId);
console.log('Metadata:', {
  name: metadata.name,
  description: metadata.description,
  image: metadata.image,
  attributes: metadata.attributes
});
```

## Complete Example: Token Transfer Bot

```typescript
import { SomniaAgentKit, ERC20Manager, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function tokenTransferBot() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized');

  // Get ERC20 manager
  const erc20 = kit.getERC20Manager();
  
  const tokenAddress = '0x...'; // Your token address
  const recipientAddress = '0x...';
  
  // Get token info
  const info = await erc20.getTokenInfo(tokenAddress);
  console.log(`📊 Token: ${info.name} (${info.symbol})`);
  
  // Check balance
  const signer = kit.getSigner();
  const myAddress = await signer!.getAddress();
  const balance = await erc20.getBalance(tokenAddress, myAddress);
  
  console.log(`💰 Balance: ${ethers.formatUnits(balance, info.decimals)} ${info.symbol}`);
  
  // Transfer tokens
  const amount = ethers.parseUnits('10', info.decimals);
  
  if (balance >= amount) {
    console.log('📤 Transferring tokens...');
    const tx = await erc20.transfer(tokenAddress, recipientAddress, amount);
    await tx.wait();
    
    console.log('✅ Transfer complete!');
    console.log('📄 Transaction:', tx.hash);
  } else {
    console.log('❌ Insufficient balance');
  }
}

tokenTransferBot().catch(console.error);
```

## Complete Example: NFT Gallery

```typescript
import { SomniaAgentKit, ERC721Manager, SOMNIA_NETWORKS } from 'somnia-agent-kit';

async function nftGallery() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  
  // Get managers
  const erc20 = kit.getERC20Manager();
  const nft = kit.getERC721Manager();
  
  const nftAddress = '0x...'; // Your NFT collection
  const signer = kit.getSigner();
  const myAddress = await signer!.getAddress();
  
  // Get collection info
  const info = await erc721.getCollectionInfo(nftAddress);
  console.log(`🎨 Collection: ${info.name} (${info.symbol})`);
  
  // Get owned NFTs count
  const balance = await erc721.getBalance(nftAddress, myAddress);
  console.log(`🖼️  You own ${balance.toString()} NFTs`);
  
  // Get NFTs owned by user (if collection supports enumerable)
  const totalSupply = info.totalSupply || 0n;
  const ownedNFTs = [];
  
  for (let tokenId = 1n; tokenId <= totalSupply; tokenId++) {
    try {
      const owner = await erc721.getOwner(nftAddress, tokenId);
      if (owner.toLowerCase() === myAddress.toLowerCase()) {
        ownedNFTs.push(tokenId);
      }
    } catch (error) {
      // Token doesn't exist or error
      continue;
    }
  }
  
  console.log('📋 Your NFTs:', ownedNFTs.map(id => id.toString()));
  
  // Get metadata for each NFT
  for (const tokenId of ownedNFTs) {
    try {
      const metadata = await erc721.getMetadata(nftAddress, tokenId);
      console.log(`\n🎨 NFT #${tokenId}:`);
      console.log(`  Name: ${metadata.name}`);
      console.log(`  Description: ${metadata.description}`);
      console.log(`  Image: ${metadata.image}`);
    } catch (error) {
      console.log(`  ⚠️  Metadata not available`);
    }
  }
}

nftGallery().catch(console.error);
```

## Best Practices

### 1. Always Check Balance Before Transfer

```typescript
const balance = await erc20.getBalance(tokenAddress, myAddress);
const amount = ethers.parseUnits('100', 18);

if (balance >= amount) {
  await erc20.transfer(tokenAddress, recipient, amount);
} else {
  console.error('Insufficient balance');
}
```

### 2. Handle Token Decimals Correctly

```typescript
// Get token info first
const info = await erc20.getTokenInfo(tokenAddress);

// Use correct decimals
const amount = ethers.parseUnits('100', info.decimals);
const balance = await erc20.getBalance(tokenAddress, address);
const formatted = ethers.formatUnits(balance, info.decimals);
```

### 3. Verify NFT Ownership

```typescript
const owner = await erc721.getOwner(nftAddress, tokenId);
const myAddress = await signer.getAddress();

if (owner.toLowerCase() === myAddress.toLowerCase()) {
  // You own this NFT
  await erc721.safeTransferFrom(nftAddress, myAddress, recipient, tokenId);
}
```

### 4. Use Safe Transfer for NFTs

```typescript
// Prefer safeTransferFrom over transferFrom
// It checks if recipient can receive NFTs
await erc721.safeTransferFrom(nftAddress, from, to, tokenId);
```

### 5. Handle Errors Gracefully

```typescript
try {
  const tx = await erc20.transfer(tokenAddress, recipient, amount);
  await tx.wait();
  console.log('✅ Transfer successful');
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('❌ Insufficient balance');
  } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    console.error('❌ Transaction would fail');
  } else {
    console.error('❌ Transfer failed:', error.message);
  }
}
```

## Listen to Token Events

### ERC20 Transfer Events

```typescript
const tokenContract = erc20.getContract(tokenAddress);

tokenContract.on('Transfer', (from, to, amount) => {
  console.log(`Transfer: ${from} → ${to}`);
  console.log(`Amount: ${ethers.formatUnits(amount, 18)}`);
});
```

### ERC721 Transfer Events

```typescript
const nftContract = erc721.getContract(nftAddress);

nftContract.on('Transfer', (from, to, tokenId) => {
  console.log(`NFT #${tokenId.toString()} transferred`);
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
});
```

## See Also

- [Working with Agents](sdk-agents.md)
- [Vault Operations](sdk-vault.md)
- [API Reference](../API_REFERENCE.md)
- [Token Management Example](../examples/07-token-management/)


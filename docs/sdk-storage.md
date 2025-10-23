# 💾 Storage & IPFS

Complete guide for storing data on IPFS and managing decentralized storage for your AI agents.

## Overview

The SDK provides utilities for uploading and retrieving data from IPFS, perfect for storing NFT metadata, agent configurations, and other decentralized data.

## IPFS Manager

### Initialize IPFS Manager

### Option 1: Via SomniaAgentKit (Recommended)

```typescript
import { SomniaAgentKit } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({ /* config */ });
await kit.initialize();

// Get IPFS manager with default config
const ipfs = kit.getIPFSManager();

// Or with custom config
const ipfs = kit.getIPFSManager({
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  apiEndpoint: 'https://api.pinata.cloud',
  apiKey: process.env.PINATA_API_KEY,
  apiSecret: process.env.PINATA_API_SECRET,
});
```

### Option 2: Standalone

```typescript
import { IPFSManager } from 'somnia-agent-kit';

// Basic setup (read-only)
const ipfs = new IPFSManager({
  gateway: 'https://ipfs.io/ipfs/'
});

// With Pinata (for uploads)
const ipfs = new IPFSManager({
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  apiEndpoint: 'https://api.pinata.cloud',
  apiKey: process.env.PINATA_API_KEY,
  apiSecret: process.env.PINATA_API_SECRET,
  timeout: 30000
});
```

### Upload JSON Data

```typescript
// Upload any JSON data
const data = {
  name: 'My AI Agent',
  description: 'Autonomous trading bot',
  version: '1.0.0',
  capabilities: ['trading', 'analysis'],
  config: {
    maxTradeSize: 1000,
    riskLevel: 'medium'
  }
};

const result = await ipfs.uploadJSON(data);

console.log('IPFS Hash:', result.hash);
console.log('IPFS URI:', result.uri);
console.log('Gateway URL:', result.gatewayUrl);

// Output:
// IPFS Hash: QmX7Kd...
// IPFS URI: ipfs://QmX7Kd...
// Gateway URL: https://ipfs.io/ipfs/QmX7Kd...
```

### Upload NFT Metadata

```typescript
// Upload NFT metadata (ERC721/ERC1155 standard)
const metadata = {
  name: 'Cool NFT #1',
  description: 'A really cool NFT from my collection',
  image: 'ipfs://QmImageHash...',
  attributes: [
    { trait_type: 'Background', value: 'Blue' },
    { trait_type: 'Rarity', value: 'Legendary' }
  ],
  external_url: 'https://example.com/nft/1'
};

const result = await ipfs.uploadNFTMetadata(metadata);
console.log('NFT Metadata URI:', result.uri);
```

### Fetch JSON Data

```typescript
// Fetch from IPFS hash
const data = await ipfs.fetchJSON('QmX7Kd...');
console.log('Data:', data);

// Or use full URI
const data = await ipfs.fetchJSON('ipfs://QmX7Kd...');
console.log('Data:', data);
```

### Fetch NFT Metadata

```typescript
// Fetch NFT metadata
const metadata = await ipfs.fetchNFTMetadata('QmMetadataHash...');

console.log({
  name: metadata.name,
  description: metadata.description,
  image: metadata.image,
  attributes: metadata.attributes
});
```

### Convert IPFS URI

```typescript
// Convert IPFS URI to HTTP gateway URL
const uri = 'ipfs://QmX7Kd...';
const url = ipfs.toGatewayURL(uri);

console.log('Gateway URL:', url);
// Output: https://ipfs.io/ipfs/QmX7Kd...
```

## Complete Example: Agent with IPFS Metadata

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  IPFSManager
} from 'somnia-agent-kit';

async function agentWithIPFS() {
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

  // Initialize IPFS
  const ipfs = new IPFSManager({
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    apiEndpoint: 'https://api.pinata.cloud',
    apiKey: process.env.PINATA_API_KEY,
    apiSecret: process.env.PINATA_API_SECRET
  });

  // Create agent metadata
  const metadata = {
    name: 'Trading Bot v2.0',
    description: 'Advanced AI-powered trading agent',
    version: '2.0.0',
    author: 'Your Name',
    capabilities: [
      'market_analysis',
      'automated_trading',
      'risk_management',
      'portfolio_optimization'
    ],
    config: {
      maxTradeSize: 1000,
      riskLevel: 'medium',
      tradingPairs: ['ETH/USD', 'BTC/USD'],
      strategies: ['momentum', 'mean_reversion']
    },
    performance: {
      totalTrades: 0,
      successRate: 0,
      totalProfit: 0
    },
    created: Date.now(),
    image: 'ipfs://QmAgentImage...',
    external_url: 'https://example.com/agents/trading-bot'
  };

  console.log('📤 Uploading metadata to IPFS...');

  // Upload to IPFS
  const result = await ipfs.uploadJSON(metadata);
  
  console.log('✅ Metadata uploaded');
  console.log('📍 IPFS URI:', result.uri);
  console.log('🌐 Gateway URL:', result.gatewayUrl);

  // Register agent with IPFS metadata
  console.log('📝 Registering agent on-chain...');
  
  const tx = await kit.contracts.registry.registerAgent(
    metadata.name,
    metadata.description,
    result.uri, // Use IPFS URI
    metadata.capabilities
  );

  await tx.wait();
  console.log('✅ Agent registered with IPFS metadata!');

  // Later: Fetch agent metadata
  const agentId = 1; // Your agent ID
  const agent = await kit.contracts.registry.getAgent(agentId);
  
  console.log('\n📥 Fetching agent metadata from IPFS...');
  const fetchedMetadata = await ipfs.fetchJSON(agent.ipfsMetadata);
  
  console.log('Agent metadata:', {
    name: fetchedMetadata.name,
    version: fetchedMetadata.version,
    capabilities: fetchedMetadata.capabilities,
    config: fetchedMetadata.config
  });
}

agentWithIPFS().catch(console.error);
```

## Complete Example: NFT Collection with IPFS

```typescript
import {
  SomniaAgentKit,
  IPFSManager,
  ERC721Manager
} from 'somnia-agent-kit';

async function nftCollectionWithIPFS() {
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

  // Initialize IPFS
  const ipfs = new IPFSManager({
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    apiEndpoint: 'https://api.pinata.cloud',
    apiKey: process.env.PINATA_API_KEY,
    apiSecret: process.env.PINATA_API_SECRET
  });

  // Get ERC721 manager
  const erc721 = kit.getERC721Manager();

  // Upload NFT images first (assume already uploaded)
  const imageHashes = [
    'QmImage1...',
    'QmImage2...',
    'QmImage3...'
  ];

  // Create and upload NFT metadata
  const nfts = [];

  for (let i = 0; i < imageHashes.length; i++) {
    const metadata = {
      name: `Agent NFT #${i + 1}`,
      description: `Unique AI Agent NFT from the collection`,
      image: `ipfs://${imageHashes[i]}`,
      attributes: [
        { trait_type: 'Type', value: 'Trading Bot' },
        { trait_type: 'Rarity', value: i === 0 ? 'Legendary' : 'Common' },
        { trait_type: 'Level', value: (i + 1) * 10 },
        { trait_type: 'Power', value: Math.floor(Math.random() * 100) }
      ],
      external_url: `https://example.com/nft/${i + 1}`
    };

    console.log(`📤 Uploading metadata for NFT #${i + 1}...`);
    const result = await ipfs.uploadNFTMetadata(metadata);
    
    nfts.push({
      tokenId: i + 1,
      metadataURI: result.uri,
      metadata: metadata
    });

    console.log(`✅ NFT #${i + 1} metadata uploaded: ${result.uri}`);
  }

  console.log('\n✅ All NFT metadata uploaded to IPFS');
  console.log('NFT Collection:', nfts);

  // Now you can mint NFTs with these metadata URIs
  // (Assuming you have an NFT contract with mint function)
  
  // Example: Fetch and display NFT
  const tokenId = 1;
  const nftAddress = '0x...'; // Your NFT contract
  
  const tokenURI = await erc721.getTokenURI(nftAddress, tokenId);
  console.log('\n📥 Fetching NFT metadata...');
  
  const metadata = await ipfs.fetchNFTMetadata(tokenURI);
  console.log('NFT Metadata:', {
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    attributes: metadata.attributes
  });
}

nftCollectionWithIPFS().catch(console.error);
```

## Using Different IPFS Services

### Pinata

```typescript
const ipfs = new IPFSManager({
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  apiEndpoint: 'https://api.pinata.cloud',
  apiKey: process.env.PINATA_API_KEY,
  apiSecret: process.env.PINATA_API_SECRET
});
```

### Infura

```typescript
const ipfs = new IPFSManager({
  gateway: 'https://ipfs.infura.io/ipfs/',
  apiEndpoint: 'https://ipfs.infura.io:5001',
  apiKey: process.env.INFURA_PROJECT_ID,
  apiSecret: process.env.INFURA_PROJECT_SECRET
});
```

### NFT.Storage

```typescript
// NFT.Storage provides free IPFS storage for NFTs
const ipfs = new IPFSManager({
  gateway: 'https://nftstorage.link/ipfs/',
  apiEndpoint: 'https://api.nft.storage',
  apiKey: process.env.NFT_STORAGE_API_KEY
});
```

### Web3.Storage

```typescript
const ipfs = new IPFSManager({
  gateway: 'https://w3s.link/ipfs/',
  apiEndpoint: 'https://api.web3.storage',
  apiKey: process.env.WEB3_STORAGE_API_KEY
});
```

## Best Practices

### 1. Pin Important Data

```typescript
// Always pin data you want to keep permanently
// Most IPFS services provide pinning APIs
const result = await ipfs.uploadJSON(data);

// Pin the hash (service-specific)
await pinataClient.pinByHash(result.hash);
```

### 2. Use Descriptive Metadata

```typescript
// Good: Descriptive metadata
const metadata = {
  name: 'Trading Bot v2.0',
  description: 'Advanced AI-powered trading agent with risk management',
  version: '2.0.0',
  capabilities: ['trading', 'analysis', 'risk-management'],
  created: Date.now(),
  author: 'Your Name'
};

// Bad: Minimal metadata
const metadata = {
  name: 'Bot',
  description: 'A bot'
};
```

### 3. Handle IPFS Errors

```typescript
try {
  const result = await ipfs.uploadJSON(data);
  console.log('✅ Uploaded:', result.uri);
} catch (error) {
  if (error.code === 'ETIMEDOUT') {
    console.error('❌ Upload timeout - IPFS service unavailable');
  } else if (error.code === 'UNAUTHORIZED') {
    console.error('❌ Invalid API credentials');
  } else {
    console.error('❌ Upload failed:', error.message);
  }
}
```

### 4. Cache Fetched Data

```typescript
// Cache frequently accessed data
const cache = new Map();

async function getCachedMetadata(uri: string) {
  if (cache.has(uri)) {
    return cache.get(uri);
  }
  
  const data = await ipfs.fetchJSON(uri);
  cache.set(uri, data);
  
  return data;
}
```

### 5. Validate Metadata Structure

```typescript
// Validate before uploading
function validateNFTMetadata(metadata: any): boolean {
  return (
    typeof metadata.name === 'string' &&
    typeof metadata.description === 'string' &&
    typeof metadata.image === 'string' &&
    Array.isArray(metadata.attributes)
  );
}

if (validateNFTMetadata(metadata)) {
  await ipfs.uploadNFTMetadata(metadata);
} else {
  console.error('❌ Invalid metadata structure');
}
```

### 6. Use Multiple Gateways for Reliability

```typescript
const gateways = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

async function fetchWithFallback(hash: string) {
  for (const gateway of gateways) {
    try {
      const ipfs = new IPFSManager({ gateway });
      return await ipfs.fetchJSON(hash);
    } catch (error) {
      console.warn(`Gateway ${gateway} failed, trying next...`);
    }
  }
  
  throw new Error('All gateways failed');
}
```

## Environment Variables

Add to your `.env` file:

```bash
# Pinata
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret

# Infura
INFURA_PROJECT_ID=your_project_id
INFURA_PROJECT_SECRET=your_project_secret

# NFT.Storage
NFT_STORAGE_API_KEY=your_api_key

# Web3.Storage
WEB3_STORAGE_API_KEY=your_api_key
```

## See Also

- [Token Management](sdk-tokens.md)
- [Working with Agents](sdk-agents.md)
- [API Reference](../API_REFERENCE.md)
- [NFT.Storage Documentation](https://nft.storage/docs/)
- [Pinata Documentation](https://docs.pinata.cloud/)


# 👛 Wallet Connectors

Complete guide for integrating wallet connections in your Somnia applications.

## Overview

The Somnia Agent Kit provides wallet connectors for seamless integration with popular Web3 wallets:

- 🦊 **MetaMask**: Browser extension wallet
- 🔗 **WalletConnect**: Multi-wallet support
- 🔐 **Private Key**: Direct wallet access
- 📱 **Mobile Wallets**: Support for mobile apps

## Installation

Wallet connectors are included in the main package:

```bash
npm install somnia-agent-kit
```

## MetaMask Connector

### Initialize MetaMask

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
});

await kit.initialize();

// Get MetaMask connector (recommended)
const metamask = kit.getMetaMaskConnector();

// Check if MetaMask is installed
if (!await metamask.isAvailable()) {
  console.log('❌ MetaMask not installed');
  console.log('Install from: https://metamask.io');
  return;
}

console.log('✅ MetaMask detected!');
```

### Connect Wallet

```typescript
// Request connection to MetaMask
const accounts = await metamask.connect();

if (accounts.length > 0) {
  console.log('✅ Connected to MetaMask!');
  console.log('Address:', accounts[0]);
} else {
  console.log('❌ Connection rejected');
}
```

### Get Current Account

```typescript
// Get currently connected account
const account = await metamask.getAccount();

if (account) {
  console.log('Connected account:', account);
} else {
  console.log('No account connected');
}
```

### Get Balance

```typescript
import { ethers } from 'ethers';

// Get ETH balance
const balance = await metamask.getBalance();
console.log('Balance:', ethers.formatEther(balance), 'ETH');
```

### Switch Network

```typescript
import { SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Switch to Somnia Testnet
await metamask.switchNetwork(SOMNIA_NETWORKS.testnet);
console.log('✅ Switched to Somnia Testnet');
```

### Add Network

```typescript
// Add Somnia network to MetaMask
await metamask.addNetwork({
  chainId: '0x1A82E', // 108590 in hex
  chainName: 'Somnia Testnet',
  rpcUrls: ['https://dream-rpc.somnia.network'],
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer-testnet.somnia.network'],
});

console.log('✅ Somnia network added to MetaMask');
```

### Sign Message

```typescript
// Sign a message with MetaMask
const message = 'Hello Somnia!';
const signature = await metamask.signMessage(message);

console.log('Signature:', signature);
```

### Send Transaction

```typescript
import { parseEther } from 'somnia-agent-kit';

// Send ETH transaction
const txHash = await metamask.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
  data: '0x', // Optional: contract call data
});

console.log('Transaction sent:', txHash);
```

### Listen to Events

```typescript
// Listen for account changes
metamask.on('accountsChanged', (accounts: string[]) => {
  console.log('Account changed:', accounts[0]);
});

// Listen for network changes
metamask.on('chainChanged', (chainId: string) => {
  console.log('Network changed:', chainId);
});

// Listen for disconnection
metamask.on('disconnect', () => {
  console.log('MetaMask disconnected');
});
```

## Complete Example: MetaMask Integration

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  MetaMaskConnector,
  parseEther
} from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function connectAndInteract() {
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

  // Get MetaMask connector
  const metamask = kit.getMetaMaskConnector();

  // Check if MetaMask is available
  if (!await metamask.isAvailable()) {
    console.error('❌ MetaMask not installed!');
    console.log('Install from: https://metamask.io');
    return;
  }

  console.log('🦊 MetaMask detected!\n');

  // Connect to MetaMask
  console.log('📱 Requesting connection...');
  const accounts = await metamask.connect();

  if (accounts.length === 0) {
    console.error('❌ Connection rejected');
    return;
  }

  const userAddress = accounts[0];
  console.log('✅ Connected!');
  console.log('Address:', userAddress);

  // Get balance
  const balance = await metamask.getBalance();
  console.log('Balance:', ethers.formatEther(balance), 'STT\n');

  // Check current network
  const chainId = await metamask.getChainId();
  console.log('Current Chain ID:', chainId);

  // Switch to Somnia Testnet if needed
  if (chainId !== SOMNIA_NETWORKS.testnet.chainId) {
    console.log('\n🔄 Switching to Somnia Testnet...');
    
    try {
      await metamask.switchNetwork(SOMNIA_NETWORKS.testnet);
      console.log('✅ Switched to Somnia Testnet');
    } catch (error) {
      // Network not added yet, add it
      console.log('📝 Adding Somnia Testnet to MetaMask...');
      
      await metamask.addNetwork({
        chainId: '0x1A82E',
        chainName: 'Somnia Testnet',
        rpcUrls: ['https://dream-rpc.somnia.network'],
        nativeCurrency: {
          name: 'STT',
          symbol: 'STT',
          decimals: 18,
        },
        blockExplorerUrls: ['https://explorer-testnet.somnia.network'],
      });
      
      console.log('✅ Network added and switched!');
    }
  }


  console.log('\n📋 Fetching agents...');
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('Total agents:', totalAgents.toString());

  // Register an agent using MetaMask
  console.log('\n🤖 Registering agent...');
  
  const tx = await kit.contracts.registry.registerAgent(
    'MetaMask Agent',
    'Agent registered via MetaMask',
    'ipfs://QmExample',
    ['trading', 'defi']
  );

  console.log('Transaction sent:', tx.hash);
  console.log('⏳ Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('✅ Agent registered!');
  console.log('Block:', receipt.blockNumber);

  // Listen for account changes
  metamask.on('accountsChanged', async (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('\n🔌 Disconnected from MetaMask');
    } else {
      console.log('\n👤 Account changed:', accounts[0]);
      
      // Reload balance
      const newBalance = await metamask.getBalance();
      console.log('New balance:', ethers.formatEther(newBalance), 'STT');
    }
  });

  // Listen for network changes
  metamask.on('chainChanged', (chainId: string) => {
    console.log('\n🔄 Network changed:', chainId);
    console.log('Please reload the application');
    window.location.reload();
  });

  console.log('\n✅ All done! Listening for wallet events...');
}

connectAndInteract().catch(console.error);
```

## React Integration

### MetaMask Hook

```typescript
import { useState, useEffect } from 'react';
import { MetaMaskConnector } from 'somnia-agent-kit';

export function useMetaMask() {
  const [kit] = useState(() => new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
  }));
  const [metamask] = useState(() => kit.getMetaMaskConnector());
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if already connected
    metamask.getAccount().then(acc => {
      if (acc) {
        setAccount(acc);
        setIsConnected(true);
        updateBalance(acc);
      }
    });

    // Listen for account changes
    metamask.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        updateBalance(accounts[0]);
      } else {
        setAccount(null);
        setIsConnected(false);
        setBalance('0');
      }
    });

    // Listen for network changes
    metamask.on('chainChanged', () => {
      window.location.reload();
    });

    return () => {
      metamask.removeAllListeners();
    };
  }, []);

  const updateBalance = async (address: string) => {
    const bal = await metamask.getBalance();
    setBalance(ethers.formatEther(bal));
  };

  const connect = async () => {
    const accounts = await metamask.connect();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      updateBalance(accounts[0]);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
  };

  return {
    metamask,
    account,
    balance,
    isConnected,
    connect,
    disconnect,
  };
}
```

### React Component

```typescript
import React from 'react';
import { useMetaMask } from './useMetaMask';

export function WalletConnect() {
  const { account, balance, isConnected, connect, disconnect } = useMetaMask();

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button onClick={connect}>
          🦊 Connect MetaMask
        </button>
      ) : (
        <div>
          <p>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
          <p>Balance: {balance} STT</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

## Private Key Wallet

### Initialize with Private Key

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

// Initialize SDK with private key
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    agentVault: process.env.AGENT_VAULT_ADDRESS!,
  },
});

await kit.initialize();

// Get wallet address
const signer = kit.getSigner();
const address = await signer.getAddress();
console.log('Wallet address:', address);
```

### Create New Wallet

```typescript
import { ethers } from 'ethers';

// Generate new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);

// IMPORTANT: Save these securely!
```

### Import from Mnemonic

```typescript
// Import wallet from mnemonic phrase
const mnemonic = 'your twelve word mnemonic phrase here...';
const wallet = ethers.Wallet.fromPhrase(mnemonic);

console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
```

## Best Practices

### 1. Check Wallet Availability

```typescript
const metamask = new MetaMaskConnector();

if (!metamask.isAvailable()) {
  // Show install prompt
  console.log('Please install MetaMask');
  return;
}
```

### 2. Handle Connection Errors

```typescript
try {
  const accounts = await metamask.connect();
  if (accounts.length === 0) {
    console.log('User rejected connection');
  }
} catch (error) {
  console.error('Connection error:', error.message);
}
```

### 3. Listen for Disconnection

```typescript
metamask.on('accountsChanged', (accounts: string[]) => {
  if (accounts.length === 0) {
    // User disconnected
    handleDisconnect();
  }
});
```

### 4. Validate Network

```typescript
const chainId = await metamask.getChainId();

if (chainId !== SOMNIA_NETWORKS.testnet.chainId) {
  console.log('Please switch to Somnia Testnet');
  await metamask.switchNetwork(SOMNIA_NETWORKS.testnet);
}
```

### 5. Never Expose Private Keys

```typescript
// ❌ BAD: Never hardcode private keys
const privateKey = '0x1234...';

// ✅ GOOD: Use environment variables
const privateKey = process.env.PRIVATE_KEY;

// ✅ GOOD: Use wallet connectors for user wallets
const metamask = new MetaMaskConnector();
```

### 6. Handle Network Changes

```typescript
metamask.on('chainChanged', (chainId: string) => {
  // Reload application on network change
  console.log('Network changed, reloading...');
  window.location.reload();
});
```

### 7. Show User Feedback

```typescript
async function registerAgent() {
  try {
    setLoading(true);
    setStatus('Waiting for confirmation...');
    
    const tx = await kit.contracts.registry.registerAgent(
      name,
      description,
      metadataUri,
      capabilities
    );
    
    setStatus('Transaction sent! Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    setStatus('✅ Agent registered successfully!');
  } catch (error) {
    if (error.code === 4001) {
      setStatus('❌ Transaction rejected by user');
    } else {
      setStatus('❌ Error: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
}
```

## Security Considerations

### Private Key Storage

```typescript
// ✅ GOOD: Environment variables
const privateKey = process.env.PRIVATE_KEY;

// ✅ GOOD: Encrypted storage
import { encrypt, decrypt } from 'crypto';
const encryptedKey = encrypt(privateKey, password);

// ❌ BAD: Hardcoded in source
const privateKey = '0x1234...';

// ❌ BAD: Committed to git
// .env file should be in .gitignore
```

### Transaction Validation

```typescript
// Always validate transaction parameters
function validateTransaction(tx: any) {
  if (!ethers.isAddress(tx.to)) {
    throw new Error('Invalid recipient address');
  }
  
  if (tx.value < 0) {
    throw new Error('Invalid value');
  }
  
  // Add more validation...
}

// Validate before sending
validateTransaction(transaction);
const txHash = await metamask.sendTransaction(transaction);
```

### User Confirmation

```typescript
// Show transaction details before sending
const confirmed = window.confirm(`
  Send ${ethers.formatEther(value)} STT to ${recipient}?
  
  Gas estimate: ${gasEstimate.toString()}
`);

if (confirmed) {
  await metamask.sendTransaction({ to: recipient, value });
}
```

## See Also

- [SDK Usage](sdk-usage.md)
- [Working with Agents](sdk-agents.md)
- [Token Management](sdk-tokens.md)
- [Contract Deployment](sdk-deployment.md)
- [API Reference](../API_REFERENCE.md)


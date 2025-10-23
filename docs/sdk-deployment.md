# 🚀 Contract Deployment & Verification

Complete guide for deploying and verifying smart contracts on Somnia blockchain.

## Overview

The Somnia Agent Kit provides powerful tools for:

- 📦 **Deploying** smart contracts with gas optimization
- ✅ **Verifying** contracts on block explorers
- 🔍 **Monitoring** deployment status
- 💰 **Estimating** deployment costs

## Installation

The deployment module is included in the main package:

```bash
npm install somnia-agent-kit
```

## Initialize SDK

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();
```

## Contract Deployment

### Basic Deployment

```typescript
import { ContractDeployer } from 'somnia-agent-kit';

// Initialize deployer
const deployer = new ContractDeployer(kit.getChainClient());

// Deploy contract
const result = await deployer.deployContract({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: ['arg1', 'arg2', 100],
});

console.log('✅ Contract deployed!');
console.log('Address:', result.address);
console.log('Transaction:', result.txHash);
console.log('Block:', result.blockNumber);
console.log('Gas used:', result.gasUsed.toString());
```

### Deploy ERC20 Token

```typescript
import { ethers } from 'ethers';

// ERC20 constructor: name, symbol, decimals, initialSupply
const result = await deployer.deployContract({
  abi: ERC20_ABI,
  bytecode: ERC20_BYTECODE,
  constructorArgs: [
    'My Token',
    'MTK',
    18,
    ethers.parseEther('1000000') // 1 million tokens
  ],
});

console.log('🪙 Token deployed at:', result.address);
```

### Deploy with Gas Limit

```typescript
// Specify custom gas limit
const result = await deployer.deployContract({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: ['arg1'],
  gasLimit: 5000000, // 5M gas
});
```

### Deploy with ETH Value

```typescript
import { parseEther } from 'somnia-agent-kit';

// Deploy contract with initial ETH
const result = await deployer.deployContract({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: [],
  value: parseEther('1.0'), // Send 1 ETH to contract
});
```

## Gas Estimation

### Estimate Deployment Cost

```typescript
// Estimate gas before deploying
const gasEstimate = await deployer.estimateDeploymentCost({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: ['arg1', 'arg2'],
});

console.log('Estimated gas:', gasEstimate.toString());

// Calculate cost in ETH
const gasPrice = (await kit.getProvider().getFeeData()).gasPrice || 0n;
const costInWei = gasEstimate * gasPrice;
const costInEth = ethers.formatEther(costInWei);

console.log('Estimated cost:', costInEth, 'ETH');
```

### Get Deployment Cost

```typescript
// After deployment, calculate actual cost
const cost = await deployer.calculateDeploymentCost(result.gasUsed);
console.log('Deployment cost:', ethers.formatEther(cost), 'ETH');
```

## Wait for Confirmations

```typescript
// Wait for multiple confirmations
await deployer.waitForDeployment(result.txHash, 3); // Wait for 3 confirmations
console.log('✅ Contract confirmed!');
```

## Verify Contract Exists

```typescript
// Verify contract was deployed successfully
const exists = await deployer.verifyContractExists(result.address);

if (exists) {
  console.log('✅ Contract exists on-chain');
} else {
  console.log('❌ Contract not found');
}
```

## Contract Verification

### Initialize Verifier

```typescript
import { ContractVerifier } from 'somnia-agent-kit';

// Initialize verifier with explorer API
const verifier = new ContractVerifier(kit.getChainClient(), {
  apiKey: process.env.EXPLORER_API_KEY, // Get from Somnia Explorer
  apiUrl: 'https://explorer.somnia.network/api',
});
```

### Verify Contract

```typescript
// Verify contract on explorer
const verifyResult = await verifier.verifyContract({
  address: result.address,
  sourceCode: `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    
    contract MyContract {
      string public name;
      
      constructor(string memory _name) {
        name = _name;
      }
    }
  `,
  contractName: 'MyContract',
  compilerVersion: 'v0.8.20+commit.a1b79de6',
  optimization: true,
  runs: 200,
});

if (verifyResult.success) {
  console.log('✅ Verification submitted!');
  console.log('GUID:', verifyResult.guid);
} else {
  console.error('❌ Verification failed:', verifyResult.error);
}
```

### Check Verification Status

```typescript
// Check if verification is complete
const status = await verifier.checkStatus(verifyResult.guid);

if (status.status === 'success') {
  console.log('✅ Contract verified!');
} else if (status.status === 'pending') {
  console.log('⏳ Verification pending...');
} else {
  console.log('❌ Verification failed:', status.message);
}
```

### Wait for Verification

```typescript
// Wait until verification completes
const finalStatus = await verifier.waitForVerification(
  verifyResult.guid,
  60000 // Timeout: 60 seconds
);

if (finalStatus.status === 'success') {
  console.log('✅ Contract verified successfully!');
} else {
  console.error('❌ Verification failed:', finalStatus.message);
}
```

## Complete Example: Deploy & Verify

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  ContractDeployer,
  ContractVerifier,
  parseEther
} from 'somnia-agent-kit';
import { ethers } from 'ethers';

// Contract ABI and Bytecode
const MyContract_ABI = [
  'constructor(string name, uint256 value)',
  'function name() view returns (string)',
  'function value() view returns (uint256)',
];

const MyContract_BYTECODE = '0x...'; // Your compiled bytecode

const MyContract_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
  string public name;
  uint256 public value;
  
  constructor(string memory _name, uint256 _value) {
    name = _name;
    value = _value;
  }
}
`;

async function deployAndVerify() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  console.log('🚀 Starting deployment...\n');

  // Step 1: Estimate gas
  const deployer = new ContractDeployer(kit.getChainClient());

  const gasEstimate = await deployer.estimateDeploymentCost({
    abi: MyContract_ABI,
    bytecode: MyContract_BYTECODE,
    constructorArgs: ['My Contract', 100],
  });

  console.log('📊 Gas estimate:', gasEstimate.toString());

  // Step 2: Deploy contract
  console.log('\n📦 Deploying contract...');

  const result = await deployer.deployContract({
    abi: MyContract_ABI,
    bytecode: MyContract_BYTECODE,
    constructorArgs: ['My Contract', 100],
  });

  console.log('✅ Contract deployed!');
  console.log('   Address:', result.address);
  console.log('   TX Hash:', result.txHash);
  console.log('   Block:', result.blockNumber);
  console.log('   Gas Used:', result.gasUsed.toString());

  // Step 3: Wait for confirmations
  console.log('\n⏳ Waiting for confirmations...');
  await deployer.waitForDeployment(result.txHash, 3);
  console.log('✅ 3 confirmations received!');

  // Step 4: Verify contract exists
  const exists = await deployer.verifyContractExists(result.address);
  if (!exists) {
    throw new Error('Contract not found on-chain!');
  }

  // Step 5: Verify on explorer
  console.log('\n🔍 Verifying contract on explorer...');

  const verifier = new ContractVerifier(kit.getChainClient(), {
    apiKey: process.env.EXPLORER_API_KEY,
    apiUrl: 'https://explorer.somnia.network/api',
  });

  // Encode constructor arguments
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder()
    .encode(['string', 'uint256'], ['My Contract', 100])
    .slice(2); // Remove '0x' prefix

  const verifyResult = await verifier.verifyContract({
    address: result.address,
    sourceCode: MyContract_SOURCE,
    contractName: 'MyContract',
    compilerVersion: 'v0.8.20+commit.a1b79de6',
    constructorArgs: constructorArgs,
    optimization: true,
    runs: 200,
  });

  if (!verifyResult.success) {
    throw new Error(`Verification failed: ${verifyResult.error}`);
  }

  console.log('✅ Verification submitted!');
  console.log('   GUID:', verifyResult.guid);

  // Step 6: Wait for verification
  console.log('\n⏳ Waiting for verification...');

  const finalStatus = await verifier.waitForVerification(
    verifyResult.guid,
    120000 // 2 minutes timeout
  );

  if (finalStatus.status === 'success') {
    console.log('\n🎉 Contract verified successfully!');
    console.log('   View on explorer:');
    console.log(`   https://explorer.somnia.network/address/${result.address}`);
  } else {
    console.error('\n❌ Verification failed:', finalStatus.message);
  }

  return result;
}

deployAndVerify().catch(console.error);
```

## Deploy Multiple Contracts

```typescript
async function deployMultiple() {
  const deployer = new ContractDeployer(kit.getChainClient());

  const contracts = [
    {
      name: 'Token',
      abi: ERC20_ABI,
      bytecode: ERC20_BYTECODE,
      args: ['My Token', 'MTK', 18, parseEther('1000000')]
    },
    {
      name: 'NFT',
      abi: ERC721_ABI,
      bytecode: ERC721_BYTECODE,
      args: ['My NFT', 'MNFT']
    },
    {
      name: 'Vault',
      abi: Vault_ABI,
      bytecode: Vault_BYTECODE,
      args: []
    }
  ];

  const deployedContracts = [];

  for (const contract of contracts) {
    console.log(`\n📦 Deploying ${contract.name}...`);

    const result = await deployer.deployContract({
      abi: contract.abi,
      bytecode: contract.bytecode,
      constructorArgs: contract.args,
    });

    console.log(`✅ ${contract.name} deployed at:`, result.address);

    deployedContracts.push({
      name: contract.name,
      address: result.address,
      txHash: result.txHash,
    });
  }

  console.log('\n🎉 All contracts deployed!');
  console.log(JSON.stringify(deployedContracts, null, 2));

  return deployedContracts;
}
```

## Deploy and Verify in One Step

```typescript
// Deploy and verify automatically
const result = await deployer.deployAndVerify(
  {
    abi: MyContract_ABI,
    bytecode: MyContract_BYTECODE,
    constructorArgs: ['arg1', 'arg2'],
  },
  3 // Wait for 3 confirmations
);

console.log('✅ Contract deployed and verified!');
console.log('Address:', result.address);
```

## Best Practices

### 1. Always Estimate Gas First

```typescript
// Estimate before deploying
const gasEstimate = await deployer.estimateDeploymentCost({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: args,
});

// Add 20% buffer
const gasLimit = (gasEstimate * 120n) / 100n;

await deployer.deployContract({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: args,
  gasLimit: gasLimit,
});
```

### 2. Wait for Confirmations

```typescript
// Always wait for multiple confirmations
await deployer.waitForDeployment(result.txHash, 3);

// Verify contract exists
const exists = await deployer.verifyContractExists(result.address);
if (!exists) {
  throw new Error('Deployment failed!');
}
```

### 3. Save Deployment Info

```typescript
import fs from 'fs';

// Save deployment info to file
const deploymentInfo = {
  network: 'testnet',
  address: result.address,
  txHash: result.txHash,
  blockNumber: result.blockNumber,
  gasUsed: result.gasUsed.toString(),
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(
  'deployment.json',
  JSON.stringify(deploymentInfo, null, 2)
);
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = await deployer.deployContract({
    abi: MyContract_ABI,
    bytecode: MyContract_BYTECODE,
    constructorArgs: args,
  });
  
  console.log('✅ Deployed at:', result.address);
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  
  // Check if it's a gas issue
  if (error.message.includes('gas')) {
    console.log('💡 Try increasing gas limit');
  }
  
  // Check if it's a balance issue
  if (error.message.includes('insufficient funds')) {
    console.log('💡 Add more funds to your wallet');
  }
}
```

### 5. Verify Constructor Arguments

```typescript
import { ethers } from 'ethers';

// Properly encode constructor arguments for verification
const constructorTypes = ['string', 'uint256', 'address'];
const constructorValues = ['My Token', 1000000, '0x...'];

const encodedArgs = ethers.AbiCoder.defaultAbiCoder()
  .encode(constructorTypes, constructorValues)
  .slice(2); // Remove '0x' prefix

await verifier.verifyContract({
  address: result.address,
  sourceCode: sourceCode,
  contractName: 'MyContract',
  compilerVersion: 'v0.8.20+commit.a1b79de6',
  constructorArgs: encodedArgs,
  optimization: true,
  runs: 200,
});
```

## Configuration

### Deployment Config

```typescript
const deployer = new ContractDeployer(kit.getChainClient());

// All deployment options
await deployer.deployContract({
  abi: MyContract_ABI,
  bytecode: MyContract_BYTECODE,
  constructorArgs: ['arg1', 'arg2'],
  gasLimit: 5000000,      // Optional: custom gas limit
  value: parseEther('1'), // Optional: send ETH with deployment
});
```

### Verifier Config

```typescript
const verifier = new ContractVerifier(kit.getChainClient(), {
  apiKey: process.env.EXPLORER_API_KEY,
  apiUrl: 'https://explorer.somnia.network/api',
  timeout: 30000, // 30 seconds timeout
});
```

## See Also

- [SDK Usage](sdk-usage.md)
- [Working with Agents](sdk-agents.md)
- [Smart Contracts Overview](contracts-overview.md)
- [API Reference](../API_REFERENCE.md)


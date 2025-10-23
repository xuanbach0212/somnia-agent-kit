# 💰 Vault Operations

Guide for managing agent funds using the AgentVault contract.

## Overview

The AgentVault allows agents to securely store and manage funds on-chain. The vault uses **agent addresses** (not agent IDs) for all operations.

{% hint style="warning" %}
**Important:** AgentVault uses agent addresses, not agent IDs. You need to get the agent's owner address or contract address first.
{% endhint %}

## Initialize SDK

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

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
```

## Get Agent Address

First, get the agent address from the registry:

```typescript
// Get agent details
const agentId = 1n;
const agent = await kit.contracts.registry.getAgent(agentId);
const agentAddress = agent.owner; // Use agent owner address

console.log('Agent address:', agentAddress);
```

## Create Vault

Create a new vault for an agent (only contract owner):

```typescript
const agentAddress = '0x...'; // Agent owner address
const dailyLimit = ethers.parseEther('10.0'); // 10 STT daily limit

const tx = await kit.contracts.vault.createVault(agentAddress, dailyLimit);
await tx.wait();

console.log('✅ Vault created with daily limit:', ethers.formatEther(dailyLimit), 'STT');
```

## Deposit Native Tokens

Deposit STT (native tokens) into an agent's vault:

```typescript
const agentAddress = '0x...'; // Agent owner address
const amount = ethers.parseEther('1.0'); // 1 STT

const tx = await kit.contracts.vault.depositNative(agentAddress, {
  value: amount,
});

await tx.wait();
console.log('✅ Deposited 1 STT to agent vault');
```

## Deposit ERC20 Tokens

Deposit ERC20 tokens into vault:

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...'; // ERC20 token address
const amount = ethers.parseUnits('100', 18); // 100 tokens

// First, approve the vault to spend tokens
const tokenContract = new ethers.Contract(
  tokenAddress,
  ['function approve(address spender, uint256 amount) returns (bool)'],
  kit.getSigner()
);

const approveTx = await tokenContract.approve(
  await kit.contracts.vault.getAddress(),
  amount
);
await approveTx.wait();

// Then deposit
const tx = await kit.contracts.vault.depositToken(
  agentAddress,
  tokenAddress,
  amount
);
await tx.wait();

console.log('✅ Deposited 100 tokens to agent vault');
```

## Withdraw Native Tokens

Withdraw STT from agent vault (only agent owner or contract owner):

```typescript
const agentAddress = '0x...';
const recipientAddress = '0x...'; // Where to send funds
const amount = ethers.parseEther('0.5'); // 0.5 STT

const tx = await kit.contracts.vault.withdrawNative(
  agentAddress,
  recipientAddress,
  amount
);
await tx.wait();

console.log('✅ Withdrew 0.5 STT from agent vault');
```

## Withdraw ERC20 Tokens

Withdraw ERC20 tokens from vault:

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...';
const recipientAddress = '0x...';
const amount = ethers.parseUnits('50', 18);

const tx = await kit.contracts.vault.withdrawToken(
  agentAddress,
  tokenAddress,
  recipientAddress,
  amount
);
await tx.wait();

console.log('✅ Withdrew 50 tokens from agent vault');
```

## Check Balances

### Native Token Balance

```typescript
const agentAddress = '0x...';
const balance = await kit.contracts.vault.getNativeBalance(agentAddress);

console.log('Native balance:', ethers.formatEther(balance), 'STT');
```

### ERC20 Token Balance

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...';
const balance = await kit.contracts.vault.getTokenBalance(agentAddress, tokenAddress);

console.log('Token balance:', ethers.formatUnits(balance, 18));
```

## Daily Limit Management

### Get Daily Limit Info

```typescript
const agentAddress = '0x...';
const limitInfo = await kit.contracts.vault.getDailyLimitInfo(agentAddress);

console.log({
  limit: ethers.formatEther(limitInfo.limit),
  spent: ethers.formatEther(limitInfo.spent),
  remaining: ethers.formatEther(limitInfo.remaining),
  resetTime: new Date(Number(limitInfo.resetTime) * 1000),
});
```

### Update Daily Limit

```typescript
const agentAddress = '0x...';
const newLimit = ethers.parseEther('20.0'); // 20 STT

const tx = await kit.contracts.vault.updateDailyLimit(agentAddress, newLimit);
await tx.wait();

console.log('✅ Daily limit updated to 20 STT');
```

## Token Management

### Get Allowed Tokens

```typescript
const agentAddress = '0x...';
const allowedTokens = await kit.contracts.vault.getAllowedTokens(agentAddress);

console.log('Allowed tokens:', allowedTokens);
```

### Allow Token

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...';

const tx = await kit.contracts.vault.allowToken(agentAddress, tokenAddress);
await tx.wait();

console.log('✅ Token allowed for vault');
```

### Disallow Token

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...';

const tx = await kit.contracts.vault.disallowToken(agentAddress, tokenAddress);
await tx.wait();

console.log('✅ Token disallowed for vault');
```

## Vault Status

### Check if Vault is Active

```typescript
const agentAddress = '0x...';
const isActive = await kit.contracts.vault.isVaultActive(agentAddress);

console.log('Vault active:', isActive);
```

### Activate Vault

```typescript
const agentAddress = '0x...';

const tx = await kit.contracts.vault.activateVault(agentAddress);
await tx.wait();

console.log('✅ Vault activated');
```

### Deactivate Vault

```typescript
const agentAddress = '0x...';

const tx = await kit.contracts.vault.deactivateVault(agentAddress);
await tx.wait();

console.log('✅ Vault deactivated');
```

## Listen to Events

### Native Deposit Event

```typescript
kit.contracts.vault.on('NativeDeposit', (agent, depositor, amount) => {
  console.log(`💰 Native Deposit`);
  console.log(`Agent: ${agent}`);
  console.log(`From: ${depositor}`);
  console.log(`Amount: ${ethers.formatEther(amount)} STT`);
});
```

### Native Withdraw Event

```typescript
kit.contracts.vault.on('NativeWithdraw', (agent, recipient, amount) => {
  console.log(`💸 Native Withdraw`);
  console.log(`Agent: ${agent}`);
  console.log(`To: ${recipient}`);
  console.log(`Amount: ${ethers.formatEther(amount)} STT`);
});
```

### Token Deposit Event

```typescript
kit.contracts.vault.on('TokenDeposit', (agent, token, depositor, amount) => {
  console.log(`🪙 Token Deposit`);
  console.log(`Agent: ${agent}`);
  console.log(`Token: ${token}`);
  console.log(`From: ${depositor}`);
  console.log(`Amount: ${amount.toString()}`);
});
```

### Token Withdraw Event

```typescript
kit.contracts.vault.on('TokenWithdraw', (agent, token, recipient, amount) => {
  console.log(`💳 Token Withdraw`);
  console.log(`Agent: ${agent}`);
  console.log(`Token: ${token}`);
  console.log(`To: ${recipient}`);
  console.log(`Amount: ${amount.toString()}`);
});
```

### Transfer Event

```typescript
kit.contracts.vault.on('Transferred', (fromAgentId, toAgentId, amount) => {
  console.log(`Transfer: Agent ${fromAgentId.toString()} → Agent ${toAgentId.toString()}`);
  console.log(`Amount: ${ethers.formatEther(amount)} STT`);
});
```


## See Also

- [Working with Agents](sdk-agents.md)
- [Task Management](sdk-tasks.md)
- [API Reference](../API_REFERENCE.md)
- [Examples](../examples/README.md)


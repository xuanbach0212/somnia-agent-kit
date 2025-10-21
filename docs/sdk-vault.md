# 💰 Vault Operations

Guide for managing agent funds using the AgentVault contract.

## Overview

The AgentVault allows agents to securely store and manage funds on-chain.

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

## Deposit Funds

Deposit funds into an agent's vault:

```typescript
const agentId = 1n;
const amount = ethers.parseEther('1.0'); // 1 STT

const tx = await kit.contracts.vault.deposit(agentId, {
  value: amount,
});

await tx.wait();
console.log('Deposited 1 STT to agent vault');
```

## Withdraw Funds

Withdraw funds from agent vault (only agent owner):

```typescript
const agentId = 1n;
const amount = ethers.parseEther('0.5'); // 0.5 STT

const tx = await kit.contracts.vault.withdraw(agentId, amount);
await tx.wait();
console.log('Withdrew 0.5 STT from agent vault');
```

## Check Balance

Get agent vault balance:

```typescript
const agentId = 1n;
const balance = await kit.contracts.vault.getBalance(agentId);

console.log('Balance:', ethers.formatEther(balance), 'STT');
```

## Transfer Between Agents

Transfer funds from one agent to another:

```typescript
const fromAgentId = 1n;
const toAgentId = 2n;
const amount = ethers.parseEther('0.1');

const tx = await kit.contracts.vault.transfer(fromAgentId, toAgentId, amount);
await tx.wait();
console.log('Transferred 0.1 STT between agents');
```

## Listen to Events

### Deposit Event

```typescript
kit.contracts.vault.on('Deposited', (agentId, depositor, amount) => {
  console.log(`Agent ${agentId.toString()} received ${ethers.formatEther(amount)} STT`);
  console.log(`From: ${depositor}`);
});
```

### Withdrawal Event

```typescript
kit.contracts.vault.on('Withdrawn', (agentId, recipient, amount) => {
  console.log(`Agent ${agentId.toString()} withdrew ${ethers.formatEther(amount)} STT`);
  console.log(`To: ${recipient}`);
});
```

### Transfer Event

```typescript
kit.contracts.vault.on('Transferred', (fromAgentId, toAgentId, amount) => {
  console.log(`Transfer: Agent ${fromAgentId.toString()} → Agent ${toAgentId.toString()}`);
  console.log(`Amount: ${ethers.formatEther(amount)} STT`);
});
```

## Complete Example

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';

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

  const agentId = 1n;

  // Check initial balance
  let balance = await kit.contracts.vault.getBalance(agentId);
  console.log('Initial balance:', ethers.formatEther(balance), 'STT');

  // Deposit funds
  console.log('Depositing 1 STT...');
  const depositTx = await kit.contracts.vault.deposit(agentId, {
    value: ethers.parseEther('1.0'),
  });
  await depositTx.wait();

  // Check new balance
  balance = await kit.contracts.vault.getBalance(agentId);
  console.log('New balance:', ethers.formatEther(balance), 'STT');

  // Withdraw some funds
  console.log('Withdrawing 0.5 STT...');
  const withdrawTx = await kit.contracts.vault.withdraw(
    agentId,
    ethers.parseEther('0.5')
  );
  await withdrawTx.wait();

  // Check final balance
  balance = await kit.contracts.vault.getBalance(agentId);
  console.log('Final balance:', ethers.formatEther(balance), 'STT');
}

main().catch(console.error);
```

## Best Practices

### 1. Check Balance Before Withdrawal

```typescript
const balance = await kit.contracts.vault.getBalance(agentId);
const withdrawAmount = ethers.parseEther('0.5');

if (balance >= withdrawAmount) {
  await kit.contracts.vault.withdraw(agentId, withdrawAmount);
} else {
  console.error('Insufficient balance');
}
```

### 2. Handle Errors

```typescript
try {
  await kit.contracts.vault.withdraw(agentId, amount);
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    console.error('Not enough funds in vault');
  } else if (error.message.includes('Not agent owner')) {
    console.error('Only agent owner can withdraw');
  } else {
    console.error('Withdrawal failed:', error);
  }
}
```

### 3. Monitor Events

```typescript
// Listen for deposits
kit.contracts.vault.on('Deposited', async (agentId, depositor, amount) => {
  const balance = await kit.contracts.vault.getBalance(agentId);
  console.log(`New balance: ${ethers.formatEther(balance)} STT`);
});
```

## See Also

- [Working with Agents](sdk-agents.md)
- [Task Management](sdk-tasks.md)
- [API Reference](../API_REFERENCE.md)
- [Examples](../examples/README.md)


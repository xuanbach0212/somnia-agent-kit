# 💰 Agent Vault Demo

Learn how to manage agent funds securely with the AgentVault smart contract.

## 🎯 Overview

This example demonstrates:
- ✅ Creating a vault for your agent
- ✅ Depositing funds (native tokens + ERC20)
- ✅ Setting daily spending limits
- ✅ Withdrawing funds safely
- ✅ Managing multiple tokens

## 📋 Prerequisites

- Somnia Agent Kit installed
- Agent registered on-chain
- Testnet tokens for deposits
- Basic understanding of vaults

## 💡 What is an Agent Vault?

An Agent Vault is a smart contract that:
- **Stores funds** securely for your agent
- **Enforces daily limits** to prevent overspending
- **Supports multiple tokens** (native + ERC20)
- **Provides withdrawal controls** (owner-only)
- **Tracks spending** automatically

## 🚀 Quick Start

### Step 1: Create Vault

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';
import 'dotenv/config';

async function createVault() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  // Get your agent ID
  const myAddress = await kit.getSigner()?.getAddress();
  const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
  const agentId = myAgents[0]; // Use first agent

  console.log('💰 Creating vault for agent:', agentId.toString());

  // Set daily limit (1 STM per day)
  const dailyLimit = ethers.parseEther('1.0');

  // Create vault
  const tx = await kit.contracts.vault.createVault(agentId, dailyLimit);
  await tx.wait();

  console.log('✅ Vault created!');
  console.log('   Daily limit:', ethers.formatEther(dailyLimit), 'STM');
}

createVault();
```

### Step 2: Deposit Funds

```typescript
async function depositFunds() {
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  const myAddress = await kit.getSigner()?.getAddress();
  const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
  const agentId = myAgents[0];

  // Deposit 0.5 STM
  const amount = ethers.parseEther('0.5');

  console.log('💸 Depositing', ethers.formatEther(amount), 'STM...');

  const tx = await kit.contracts.vault.depositNative(agentId, {
    value: amount,
  });

  await tx.wait();

  console.log('✅ Deposit successful!');

  // Check balance
  const vault = await kit.contracts.vault.getVault(agentId);
  console.log('   Vault balance:', ethers.formatEther(vault.nativeBalance), 'STM');
}

depositFunds();
```

### Step 3: Check Vault Status

```typescript
async function checkVaultStatus() {
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  const myAddress = await kit.getSigner()?.getAddress();
  const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
  const agentId = myAgents[0];

  // Get vault info
  const vault = await kit.contracts.vault.getVault(agentId);

  console.log('📊 Vault Status:');
  console.log('   Owner:', vault.owner);
  console.log('   Balance:', ethers.formatEther(vault.nativeBalance), 'STM');
  console.log('   Daily Limit:', ethers.formatEther(vault.dailyLimit), 'STM');
  console.log('   Daily Spent:', ethers.formatEther(vault.dailySpent), 'STM');
  console.log('   Is Active:', vault.isActive);

  // Calculate available amount
  const available = await kit.contracts.vault.getAvailableDailyAmount(agentId);
  console.log('   Available Today:', ethers.formatEther(available), 'STM');

  // Time until reset
  const lastReset = Number(vault.lastResetTime) * 1000;
  const nextReset = lastReset + 86400000; // +24 hours
  const timeUntilReset = nextReset - Date.now();

  if (timeUntilReset > 0) {
    const hours = Math.floor(timeUntilReset / 3600000);
    const minutes = Math.floor((timeUntilReset % 3600000) / 60000);
    console.log(`   Limit resets in: ${hours}h ${minutes}m`);
  }
}

checkVaultStatus();
```

## 🎨 Advanced Usage

### Complete Vault Management

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import { ethers } from 'ethers';
import 'dotenv/config';

class VaultManager {
  private kit: SomniaAgentKit;
  private agentId: bigint;

  constructor(agentId: bigint) {
    this.agentId = agentId;
    this.kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentManager: process.env.AGENT_MANAGER_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
        agentVault: process.env.AGENT_VAULT_ADDRESS!,
      },
      privateKey: process.env.PRIVATE_KEY!,
    });
  }

  async initialize() {
    await this.kit.initialize();
  }

  async createVault(dailyLimitEther: string) {
    const dailyLimit = ethers.parseEther(dailyLimitEther);
    const tx = await this.kit.contracts.vault.createVault(
      this.agentId,
      dailyLimit
    );
    await tx.wait();
    console.log('✅ Vault created');
  }

  async deposit(amountEther: string) {
    const amount = ethers.parseEther(amountEther);
    const tx = await this.kit.contracts.vault.depositNative(
      this.agentId,
      { value: amount }
    );
    await tx.wait();
    console.log(`✅ Deposited ${amountEther} STM`);
  }

  async withdraw(amountEther: string) {
    const amount = ethers.parseEther(amountEther);
    const tx = await this.kit.contracts.vault.withdrawNative(
      this.agentId,
      amount
    );
    await tx.wait();
    console.log(`✅ Withdrawn ${amountEther} STM`);
  }

  async getStatus() {
    const vault = await this.kit.contracts.vault.getVault(this.agentId);
    const available = await this.kit.contracts.vault.getAvailableDailyAmount(
      this.agentId
    );

    return {
      balance: ethers.formatEther(vault.nativeBalance),
      dailyLimit: ethers.formatEther(vault.dailyLimit),
      dailySpent: ethers.formatEther(vault.dailySpent),
      available: ethers.formatEther(available),
      isActive: vault.isActive,
    };
  }

  async updateDailyLimit(newLimitEther: string) {
    const newLimit = ethers.parseEther(newLimitEther);
    const tx = await this.kit.contracts.vault.updateDailyLimit(
      this.agentId,
      newLimit
    );
    await tx.wait();
    console.log(`✅ Daily limit updated to ${newLimitEther} STM`);
  }

  async autoRefill(minBalanceEther: string, refillAmountEther: string) {
    const minBalance = ethers.parseEther(minBalanceEther);
    const refillAmount = ethers.parseEther(refillAmountEther);

    setInterval(async () => {
      const vault = await this.kit.contracts.vault.getVault(this.agentId);
      
      if (vault.nativeBalance < minBalance) {
        console.log('⚠️ Balance low, refilling...');
        await this.deposit(refillAmountEther);
      }
    }, 60000); // Check every minute
  }
}

// Usage
async function main() {
  const manager = new VaultManager(1n); // Agent ID 1
  await manager.initialize();

  // Create vault
  await manager.createVault('1.0');

  // Deposit funds
  await manager.deposit('5.0');

  // Check status
  const status = await manager.getStatus();
  console.log('Status:', status);

  // Setup auto-refill
  await manager.autoRefill('1.0', '2.0');
}

main();
```

## 🔒 Security Features

### Daily Spending Limits

```typescript
// Prevent overspending
const dailyLimit = ethers.parseEther('1.0'); // Max 1 STM/day
await vault.createVault(agentId, dailyLimit);

// Try to withdraw more than limit
try {
  const tooMuch = ethers.parseEther('2.0');
  await vault.withdrawNative(agentId, tooMuch);
} catch (error) {
  console.log('❌ Withdrawal blocked: Daily limit exceeded');
}
```

### Owner-Only Withdrawals

```typescript
// Only vault owner can withdraw
const tx = await vault.withdrawNative(agentId, amount);
// Will fail if caller is not the owner
```

### Emergency Deactivation

```typescript
// Deactivate vault in emergency
const tx = await vault.deactivateVault(agentId);
await tx.wait();
console.log('🚨 Vault deactivated');
```

## 📊 Monitoring

Track vault activity:

```typescript
import { Logger, Metrics } from 'somnia-agent-kit';

const logger = new Logger();
const metrics = new Metrics();

// Log deposits
vault.on('NativeDeposited', (agentId, depositor, amount) => {
  logger.info('Deposit received', {
    agentId: agentId.toString(),
    depositor,
    amount: ethers.formatEther(amount),
  });
  
  metrics.recordDeposit(Number(ethers.formatEther(amount)));
});

// Log withdrawals
vault.on('NativeWithdrawn', (agentId, recipient, amount) => {
  logger.info('Withdrawal made', {
    agentId: agentId.toString(),
    recipient,
    amount: ethers.formatEther(amount),
  });
  
  metrics.recordWithdrawal(Number(ethers.formatEther(amount)));
});

// Alert on low balance
setInterval(async () => {
  const vault = await kit.contracts.vault.getVault(agentId);
  const balance = Number(ethers.formatEther(vault.nativeBalance));
  
  if (balance < 0.1) {
    logger.warn('Low balance alert', { balance });
  }
}, 300000); // Check every 5 minutes
```

## 🎓 Key Learnings

1. ✅ **Vault Creation** - Set daily limits for safety
2. ✅ **Fund Management** - Deposit and withdraw securely
3. ✅ **Daily Limits** - Automatic spending controls
4. ✅ **Status Monitoring** - Track balance and usage
5. ✅ **Security** - Owner-only access, emergency controls

## 🚀 Next Steps

- **[Monitoring Demo](./monitoring.md)** - Add comprehensive monitoring
- **[Production Deployment](../deployment/production.md)** - Deploy to production
- **[Security Best Practices](../security/best-practices.md)** - Secure your vaults

## 📚 Related Documentation

- **[AgentVault Contract](../contracts/agent-vault.md)** - Full contract reference
- **[Smart Contracts Overview](../contracts-overview.md)** - All contracts
- **[Troubleshooting](../troubleshooting.md)** - Common issues

---

**Congratulations!** 🎉 You now know how to manage agent funds securely!


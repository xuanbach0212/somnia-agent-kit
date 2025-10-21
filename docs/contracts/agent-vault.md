# 💰 AgentVault Contract

The **AgentVault** contract manages funds for AI agents, providing secure storage, daily spending limits, and multi-token support.

## 🎯 Overview

AgentVault provides:
- ✅ **Secure Fund Storage** - Safe storage for agent funds
- ✅ **Daily Spending Limits** - Prevent excessive spending
- ✅ **Multi-Token Support** - Native tokens + ERC20
- ✅ **Withdrawal Controls** - Owner-controlled withdrawals
- ✅ **Emergency Functions** - Pause and recovery options

## 📊 Contract Architecture

```solidity
contract AgentVault {
    struct Vault {
        uint256 agentId;
        address owner;
        uint256 nativeBalance;
        uint256 dailyLimit;
        uint256 dailySpent;
        uint256 lastResetTime;
        bool isActive;
        mapping(address => uint256) tokenBalances;
        mapping(address => bool) allowedTokens;
    }
    
    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => bool) public vaultExists;
}
```

## 🔧 Core Functions

### 1. Create Vault

Create a new vault for an agent.

```solidity
function createVault(
    uint256 agentId,
    uint256 dailyLimit
) external returns (bool)
```

**Parameters:**
- `agentId` - ID of the agent
- `dailyLimit` - Daily spending limit in wei

**Requirements:**
- Caller must own the agent
- Vault must not already exist
- Daily limit must be > 0

**Events:**
```solidity
event VaultCreated(
    uint256 indexed agentId,
    address indexed owner,
    uint256 dailyLimit
);
```

**Example:**

```typescript
import { ethers } from 'ethers';

const agentId = 1;
const dailyLimit = ethers.utils.parseEther('1.0'); // 1 token per day

const tx = await kit.contracts.AgentVault.createVault(
  agentId,
  dailyLimit
);

await tx.wait();
console.log('✅ Vault created with daily limit:', 
  ethers.utils.formatEther(dailyLimit));
```

### 2. Deposit Native Tokens

Deposit native blockchain tokens (e.g., STM) into the vault.

```solidity
function depositNative(uint256 agentId) 
    external 
    payable
```

**Parameters:**
- `agentId` - ID of the agent

**Requirements:**
- Vault must exist
- Vault must be active
- msg.value must be > 0

**Events:**
```solidity
event NativeDeposited(
    uint256 indexed agentId,
    address indexed depositor,
    uint256 amount
);
```

**Example:**

```typescript
const agentId = 1;
const amount = ethers.utils.parseEther('0.5'); // 0.5 tokens

const tx = await kit.contracts.AgentVault.depositNative(
  agentId,
  { value: amount }
);

await tx.wait();
console.log('✅ Deposited:', ethers.utils.formatEther(amount));
```

### 3. Withdraw Native Tokens

Withdraw native tokens from the vault (owner only).

```solidity
function withdrawNative(
    uint256 agentId,
    uint256 amount
) external
```

**Parameters:**
- `agentId` - ID of the agent
- `amount` - Amount to withdraw in wei

**Requirements:**
- Caller must be vault owner
- Amount must not exceed daily limit
- Sufficient balance

**Example:**

```typescript
const agentId = 1;
const amount = ethers.utils.parseEther('0.1');

const tx = await kit.contracts.AgentVault.withdrawNative(
  agentId,
  amount
);

await tx.wait();
console.log('✅ Withdrawn:', ethers.utils.formatEther(amount));
```

### 4. Deposit ERC20 Tokens

Deposit ERC20 tokens into the vault.

```solidity
function depositToken(
    uint256 agentId,
    address token,
    uint256 amount
) external
```

**Requirements:**
- Token must be allowed
- Caller must have approved the vault
- Amount must be > 0

**Example:**

```typescript
// 1. Approve the vault to spend your tokens
const tokenContract = new ethers.Contract(
  tokenAddress,
  ['function approve(address spender, uint256 amount) returns (bool)'],
  kit.signer
);

const approvalTx = await tokenContract.approve(
  kit.contracts.AgentVault.address,
  amount
);
await approvalTx.wait();

// 2. Deposit tokens
const depositTx = await kit.contracts.AgentVault.depositToken(
  agentId,
  tokenAddress,
  amount
);

await depositTx.wait();
console.log('✅ ERC20 tokens deposited');
```

### 5. Withdraw ERC20 Tokens

Withdraw ERC20 tokens from the vault.

```solidity
function withdrawToken(
    uint256 agentId,
    address token,
    uint256 amount
) external
```

**Example:**

```typescript
const tx = await kit.contracts.AgentVault.withdrawToken(
  agentId,
  tokenAddress,
  amount
);

await tx.wait();
```

### 6. Allow Token

Enable an ERC20 token for the vault (owner only).

```solidity
function allowToken(
    uint256 agentId,
    address token
) external
```

**Example:**

```typescript
const usdcAddress = '0x...'; // USDC token address

const tx = await kit.contracts.AgentVault.allowToken(
  agentId,
  usdcAddress
);

await tx.wait();
console.log('✅ USDC enabled for vault');
```

### 7. Update Daily Limit

Update the daily spending limit (owner only).

```solidity
function updateDailyLimit(
    uint256 agentId,
    uint256 newLimit
) external
```

**Example:**

```typescript
const newLimit = ethers.utils.parseEther('2.0'); // Increase to 2 tokens/day

const tx = await kit.contracts.AgentVault.updateDailyLimit(
  agentId,
  newLimit
);

await tx.wait();
console.log('✅ Daily limit updated');
```

## 🔍 Query Functions

### Get Vault Info

```solidity
function getVault(uint256 agentId) 
    external 
    view 
    returns (
        address owner,
        uint256 nativeBalance,
        uint256 dailyLimit,
        uint256 dailySpent,
        uint256 lastResetTime,
        bool isActive
    )
```

**Example:**

```typescript
const vault = await kit.contracts.AgentVault.getVault(agentId);

console.log('Vault Info:', {
  owner: vault.owner,
  balance: ethers.utils.formatEther(vault.nativeBalance),
  dailyLimit: ethers.utils.formatEther(vault.dailyLimit),
  dailySpent: ethers.utils.formatEther(vault.dailySpent),
  isActive: vault.isActive,
});
```

### Get Token Balance

```solidity
function getTokenBalance(
    uint256 agentId,
    address token
) external view returns (uint256)
```

**Example:**

```typescript
const balance = await kit.contracts.AgentVault.getTokenBalance(
  agentId,
  usdcAddress
);

console.log('USDC Balance:', ethers.utils.formatUnits(balance, 6));
```

### Get Available Daily Amount

```solidity
function getAvailableDailyAmount(uint256 agentId) 
    external 
    view 
    returns (uint256)
```

**Example:**

```typescript
const available = await kit.contracts.AgentVault.getAvailableDailyAmount(agentId);

console.log('Available today:', ethers.utils.formatEther(available));
```

### Check if Token is Allowed

```solidity
function isTokenAllowed(
    uint256 agentId,
    address token
) external view returns (bool)
```

## 📡 Events

### VaultCreated

```solidity
event VaultCreated(
    uint256 indexed agentId,
    address indexed owner,
    uint256 dailyLimit
);
```

### NativeDeposited

```solidity
event NativeDeposited(
    uint256 indexed agentId,
    address indexed depositor,
    uint256 amount
);
```

### NativeWithdrawn

```solidity
event NativeWithdrawn(
    uint256 indexed agentId,
    address indexed recipient,
    uint256 amount
);
```

### TokenDeposited

```solidity
event TokenDeposited(
    uint256 indexed agentId,
    address indexed token,
    address indexed depositor,
    uint256 amount
);
```

### TokenWithdrawn

```solidity
event TokenWithdrawn(
    uint256 indexed agentId,
    address indexed token,
    address indexed recipient,
    uint256 amount
);
```

### DailyLimitUpdated

```solidity
event DailyLimitUpdated(
    uint256 indexed agentId,
    uint256 oldLimit,
    uint256 newLimit
);
```

## 💡 Usage Patterns

### Pattern 1: Basic Vault Setup

```typescript
async function setupAgentVault(agentId: number) {
  // 1. Create vault
  const dailyLimit = ethers.utils.parseEther('1.0');
  const createTx = await kit.contracts.AgentVault.createVault(
    agentId,
    dailyLimit
  );
  await createTx.wait();
  
  // 2. Deposit initial funds
  const initialDeposit = ethers.utils.parseEther('5.0');
  const depositTx = await kit.contracts.AgentVault.depositNative(
    agentId,
    { value: initialDeposit }
  );
  await depositTx.wait();
  
  console.log('✅ Vault setup complete');
}
```

### Pattern 2: Multi-Token Vault

```typescript
async function setupMultiTokenVault(agentId: number) {
  // 1. Create vault
  await kit.contracts.AgentVault.createVault(
    agentId,
    ethers.utils.parseEther('1.0')
  );
  
  // 2. Allow multiple tokens
  const tokens = [
    { address: '0x...', name: 'USDC' },
    { address: '0x...', name: 'USDT' },
    { address: '0x...', name: 'DAI' },
  ];
  
  for (const token of tokens) {
    const tx = await kit.contracts.AgentVault.allowToken(
      agentId,
      token.address
    );
    await tx.wait();
    console.log(`✅ ${token.name} enabled`);
  }
}
```

### Pattern 3: Automated Refill

```typescript
async function autoRefillVault(agentId: number, minBalance: string) {
  const minBalanceWei = ethers.utils.parseEther(minBalance);
  
  // Check balance periodically
  setInterval(async () => {
    const vault = await kit.contracts.AgentVault.getVault(agentId);
    
    if (vault.nativeBalance.lt(minBalanceWei)) {
      const refillAmount = ethers.utils.parseEther('1.0');
      
      const tx = await kit.contracts.AgentVault.depositNative(
        agentId,
        { value: refillAmount }
      );
      
      await tx.wait();
      console.log('✅ Vault refilled');
    }
  }, 60000); // Check every minute
}
```

### Pattern 4: Daily Limit Management

```typescript
async function manageDailyLimit(agentId: number) {
  // Get current usage
  const vault = await kit.contracts.AgentVault.getVault(agentId);
  const available = await kit.contracts.AgentVault.getAvailableDailyAmount(agentId);
  
  const usagePercent = vault.dailySpent
    .mul(100)
    .div(vault.dailyLimit)
    .toNumber();
  
  console.log(`Daily usage: ${usagePercent}%`);
  
  // Alert if usage is high
  if (usagePercent > 80) {
    console.warn('⚠️ High daily usage! Consider increasing limit.');
  }
  
  // Auto-adjust limit based on usage patterns
  if (usagePercent > 90) {
    const newLimit = vault.dailyLimit.mul(150).div(100); // +50%
    
    const tx = await kit.contracts.AgentVault.updateDailyLimit(
      agentId,
      newLimit
    );
    
    await tx.wait();
    console.log('✅ Daily limit increased');
  }
}
```

## 🔒 Security Features

### 1. Daily Spending Limits

Prevents agents from spending all funds at once:

```typescript
// Daily limit resets every 24 hours
// Tracks spending per day
// Prevents withdrawal if limit exceeded
```

### 2. Owner-Only Withdrawals

Only the agent owner can withdraw funds:

```solidity
modifier onlyVaultOwner(uint256 agentId) {
    require(msg.sender == vaults[agentId].owner, "Not vault owner");
    _;
}
```

### 3. Token Whitelist

Only approved tokens can be deposited:

```typescript
// Owner must explicitly allow each token
await vault.allowToken(agentId, tokenAddress);
```

### 4. Emergency Pause

Vault can be deactivated in emergencies:

```typescript
const tx = await kit.contracts.AgentVault.deactivateVault(agentId);
await tx.wait();
```

## 🧪 Testing

### Test Daily Limit Reset

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('AgentVault Daily Limit', () => {
  it('should reset daily spending after 24 hours', async () => {
    // Setup
    const vault = await deployVault();
    const agentId = 1;
    const dailyLimit = ethers.utils.parseEther('1.0');
    
    await vault.createVault(agentId, dailyLimit);
    await vault.depositNative(agentId, { 
      value: ethers.utils.parseEther('10.0') 
    });
    
    // Spend up to limit
    await vault.withdrawNative(agentId, dailyLimit);
    
    // Try to spend more (should fail)
    await expect(
      vault.withdrawNative(agentId, ethers.utils.parseEther('0.1'))
    ).to.be.revertedWith('Daily limit exceeded');
    
    // Fast forward 24 hours
    await time.increase(86400);
    
    // Should work now
    await expect(
      vault.withdrawNative(agentId, ethers.utils.parseEther('0.1'))
    ).to.not.be.reverted;
  });
});
```

## 💰 Gas Optimization Tips

### 1. Batch Deposits

```typescript
// ❌ Multiple transactions
await vault.depositNative(agentId1, { value: amount1 });
await vault.depositNative(agentId2, { value: amount2 });

// ✅ Use multicall if available
await vault.multicall([
  vault.interface.encodeFunctionData('depositNative', [agentId1]),
  vault.interface.encodeFunctionData('depositNative', [agentId2]),
], { value: amount1.add(amount2) });
```

### 2. Check Balance Before Deposit

```typescript
// Avoid unnecessary transactions
const vault = await kit.contracts.AgentVault.getVault(agentId);
const targetBalance = ethers.utils.parseEther('10.0');

if (vault.nativeBalance.lt(targetBalance)) {
  const needed = targetBalance.sub(vault.nativeBalance);
  await kit.contracts.AgentVault.depositNative(agentId, { value: needed });
}
```

## 📚 Related Documentation

- **[AgentRegistry Contract](./agent-registry.md)** - Register agents
- **[AgentExecutor Contract](./agent-executor.md)** - Execute tasks
- **[Smart Contracts Overview](../contracts-overview.md)** - All contracts

## ⚠️ Important Notes

1. **Daily Limit Resets** - Automatically resets every 24 hours from last reset
2. **Gas Costs** - Keep enough native tokens for gas fees
3. **Token Approvals** - Remember to approve vault before depositing ERC20
4. **Emergency Access** - Owner can always withdraw, regardless of daily limit

---

**Next:** Learn about [AgentExecutor](./agent-executor.md) for task execution.


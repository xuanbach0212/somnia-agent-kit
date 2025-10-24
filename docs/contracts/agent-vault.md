# 💰 AgentVault Contract

The **AgentVault** contract manages funds for AI agents, providing secure storage, daily spending limits, and multi-token support.

## 🎯 Overview

AgentVault provides:
- ✅ **Secure Fund Storage** - Safe storage for agent funds
- ✅ **Daily Spending Limits** - Prevent excessive spending
- ✅ **Multi-Token Support** - Native tokens + ERC20
- ✅ **Withdrawal Controls** - Owner-controlled withdrawals
- ✅ **Token Whitelist** - Control which tokens can be deposited

## 📊 Contract Architecture

```solidity
contract AgentVault is Ownable, ReentrancyGuard {
    struct Vault {
        uint256 nativeBalance;
        mapping(address => uint256) tokenBalances;
        address[] allowedTokens;
        uint256 dailyLimit;
        uint256 dailySpent;
        uint256 lastResetTime;
        bool isActive;
    }
    
    mapping(address => Vault) private vaults;
    mapping(address => bool) public registeredAgents;
    
    uint256 public constant MIN_DAILY_LIMIT = 0.01 ether;
    uint256 public constant MAX_DAILY_LIMIT = 100 ether;
}
```

{% hint style="warning" %}
**Critical:** AgentVault uses **agent addresses** (not agent IDs) for all operations. The vault is mapped by the agent's address, not by a numeric ID.
{% endhint %}

## 🔧 Core Functions

### 1. Create Vault

Create a new vault for an agent (contract owner only).

```solidity
function createVault(
    address agent,
    uint256 dailyLimit
) external onlyOwner
```

**Parameters:**
- `agent` - Address of the agent (owner address)
- `dailyLimit` - Daily spending limit in wei (must be between 0.01 and 100 ether)

**Requirements:**
- Caller must be contract owner
- Vault must not already exist
- Daily limit must be within MIN_DAILY_LIMIT and MAX_DAILY_LIMIT

**Events:**
```solidity
event VaultCreated(
    address indexed agent,
    uint256 dailyLimit
);
```

**Example:**

```typescript
import { ethers } from 'ethers';

// Get agent address from registry first
const agentId = 1n;
const agent = await kit.contracts.registry.getAgent(agentId);
const agentAddress = agent.owner; // Use agent owner address

const dailyLimit = ethers.parseEther('1.0'); // 1 STT per day

const tx = await kit.contracts.vault.createVault(
  agentAddress,
  dailyLimit
);

await tx.wait();
console.log('✅ Vault created with daily limit:', ethers.formatEther(dailyLimit), 'STT');
```

### 2. Deposit Native Tokens

Deposit native blockchain tokens (STT) into the vault.

```solidity
function depositNative(address agent) 
    external 
    payable 
    nonReentrant
```

**Parameters:**
- `agent` - Address of the agent

**Requirements:**
- Vault must exist
- msg.value must be > 0

**Events:**
```solidity
event NativeDeposit(
    address indexed agent,
    address indexed depositor,
    uint256 amount
);
```

**Example:**

```typescript
const agentAddress = '0x...'; // Agent owner address
const amount = ethers.parseEther('0.5'); // 0.5 STT

const tx = await kit.contracts.vault.depositNative(agentAddress, {
  value: amount,
});

await tx.wait();
console.log('✅ Deposited:', ethers.formatEther(amount), 'STT');
```

### 3. Withdraw Native Tokens

Withdraw native tokens from the vault (agent or contract owner only).

```solidity
function withdrawNative(
    address agent,
    address payable recipient,
    uint256 amount
) external nonReentrant
```

**Parameters:**
- `agent` - Address of the agent
- `recipient` - Address to receive the funds
- `amount` - Amount to withdraw in wei

**Requirements:**
- Caller must be agent or contract owner
- Vault must be active
- Sufficient balance
- Amount must not exceed daily limit

**Example:**

```typescript
const agentAddress = '0x...';
const recipientAddress = '0x...'; // Where to send funds
const amount = ethers.parseEther('0.1');

const tx = await kit.contracts.vault.withdrawNative(
  agentAddress,
  recipientAddress,
  amount
);

await tx.wait();
console.log('✅ Withdrawn:', ethers.formatEther(amount), 'STT');
```

### 4. Deposit ERC20 Tokens

Deposit ERC20 tokens into the vault.

```solidity
function depositToken(
    address agent,
    address token,
    uint256 amount
) external nonReentrant
```

**Requirements:**
- Token must be allowed for this vault
- Caller must have approved the vault
- Amount must be > 0

**Example:**

```typescript
const agentAddress = '0x...';
const tokenAddress = '0x...'; // ERC20 token address
const amount = ethers.parseUnits('100', 18); // 100 tokens

// 1. Approve the vault to spend your tokens
const tokenContract = new ethers.Contract(
  tokenAddress,
  ['function approve(address spender, uint256 amount) returns (bool)'],
  kit.getSigner()
);

const approvalTx = await tokenContract.approve(
  await kit.contracts.vault.getAddress(),
  amount
);
await approvalTx.wait();

// 2. Deposit tokens
const depositTx = await kit.contracts.vault.depositToken(
  agentAddress,
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
    address agent,
    address token,
    address recipient,
    uint256 amount
) external nonReentrant
```

**Requirements:**
- Caller must be agent or contract owner
- Vault must be active
- Sufficient token balance

**Example:**

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
console.log('✅ Withdrawn 50 tokens');
```

### 6. Allow Token

Enable an ERC20 token for the vault (contract owner only).

```solidity
function allowToken(
    address agent,
    address token
) external onlyOwner
```

**Example:**

```typescript
const agentAddress = '0x...';
const usdcAddress = '0x...'; // USDC token address

const tx = await kit.contracts.vault.allowToken(
  agentAddress,
  usdcAddress
);

await tx.wait();
console.log('✅ USDC enabled for vault');
```

### 7. Disallow Token

Disable an ERC20 token for the vault (contract owner only).

```solidity
function disallowToken(
    address agent,
    address token
) external onlyOwner
```

**Example:**

```typescript
const tx = await kit.contracts.vault.disallowToken(
  agentAddress,
  tokenAddress
);

await tx.wait();
console.log('✅ Token disallowed');
```

### 8. Update Daily Limit

Update the daily spending limit (contract owner only).

```solidity
function updateDailyLimit(
    address agent,
    uint256 newLimit
) external onlyOwner
```

**Example:**

```typescript
const newLimit = ethers.parseEther('2.0'); // Increase to 2 STT/day

const tx = await kit.contracts.vault.updateDailyLimit(
  agentAddress,
  newLimit
);

await tx.wait();
console.log('✅ Daily limit updated');
```

### 9. Activate/Deactivate Vault

Control vault status (contract owner only).

```solidity
function activateVault(address agent) external onlyOwner
function deactivateVault(address agent) external onlyOwner
```

**Example:**

```typescript
// Deactivate vault
const tx1 = await kit.contracts.vault.deactivateVault(agentAddress);
await tx1.wait();
console.log('✅ Vault deactivated');

// Reactivate vault
const tx2 = await kit.contracts.vault.activateVault(agentAddress);
await tx2.wait();
console.log('✅ Vault activated');
```

## 🔍 Query Functions

### Get Native Balance

```solidity
function getNativeBalance(address agent) 
    external 
    view 
    returns (uint256)
```

**Example:**

```typescript
const balance = await kit.contracts.vault.getNativeBalance(agentAddress);
console.log('Native balance:', ethers.formatEther(balance), 'STT');
```

### Get Token Balance

```solidity
function getTokenBalance(
    address agent,
    address token
) external view returns (uint256)
```

**Example:**

```typescript
const balance = await kit.contracts.vault.getTokenBalance(
  agentAddress,
  tokenAddress
);

console.log('Token balance:', ethers.formatUnits(balance, 18));
```

### Get Daily Limit Info

```solidity
function getDailyLimitInfo(address agent) 
    external 
    view 
    returns (
        uint256 limit,
        uint256 spent,
        uint256 remaining,
        uint256 resetTime
    )
```

**Example:**

```typescript
const limitInfo = await kit.contracts.vault.getDailyLimitInfo(agentAddress);

console.log({
  limit: ethers.formatEther(limitInfo.limit),
  spent: ethers.formatEther(limitInfo.spent),
  remaining: ethers.formatEther(limitInfo.remaining),
  resetTime: new Date(Number(limitInfo.resetTime) * 1000),
});
```

### Get Allowed Tokens

```solidity
function getAllowedTokens(address agent) 
    external 
    view 
    returns (address[] memory)
```

**Example:**

```typescript
const allowedTokens = await kit.contracts.vault.getAllowedTokens(agentAddress);
console.log('Allowed tokens:', allowedTokens);
```

### Check if Vault is Active

```solidity
function isVaultActive(address agent) 
    external 
    view 
    returns (bool)
```

**Example:**

```typescript
const isActive = await kit.contracts.vault.isVaultActive(agentAddress);
console.log('Vault active:', isActive);
```

## 📡 Events

### VaultCreated

```solidity
event VaultCreated(
    address indexed agent,
    uint256 dailyLimit
);
```

### NativeDeposit

```solidity
event NativeDeposit(
    address indexed agent,
    address indexed depositor,
    uint256 amount
);
```

**Listen for deposits:**

```typescript
kit.contracts.vault.on('NativeDeposit', (agent, depositor, amount) => {
  console.log(`💰 Native Deposit`);
  console.log(`Agent: ${agent}`);
  console.log(`From: ${depositor}`);
  console.log(`Amount: ${ethers.formatEther(amount)} STT`);
});
```

### NativeWithdraw

```solidity
event NativeWithdraw(
    address indexed agent,
    address indexed recipient,
    uint256 amount
);
```

### TokenDeposit

```solidity
event TokenDeposit(
    address indexed agent,
    address indexed token,
    address indexed depositor,
    uint256 amount
);
```

### TokenWithdraw

```solidity
event TokenWithdraw(
    address indexed agent,
    address indexed token,
    address indexed recipient,
    uint256 amount
);
```

### DailyLimitUpdated

```solidity
event DailyLimitUpdated(
    address indexed agent,
    uint256 oldLimit,
    uint256 newLimit
);
```

### TokenAllowed / TokenDisallowed

```solidity
event TokenAllowed(
    address indexed agent,
    address indexed token
);

event TokenDisallowed(
    address indexed agent,
    address indexed token
);
```

### VaultActivated / VaultDeactivated

```solidity
event VaultActivated(address indexed agent);
event VaultDeactivated(address indexed agent);
```

## 💡 Usage Patterns

### Pattern 1: Basic Vault Setup

```typescript
async function setupAgentVault(agentId: bigint) {
  // 1. Get agent address from registry
  const agent = await kit.contracts.registry.getAgent(agentId);
  const agentAddress = agent.owner;
  
  // 2. Create vault
  const dailyLimit = ethers.parseEther('1.0');
  const createTx = await kit.contracts.vault.createVault(
    agentAddress,
    dailyLimit
  );
  await createTx.wait();
  
  // 3. Deposit initial funds
  const initialDeposit = ethers.parseEther('5.0');
  const depositTx = await kit.contracts.vault.depositNative(
    agentAddress,
    { value: initialDeposit }
  );
  await depositTx.wait();
  
  console.log('✅ Vault setup complete');
}
```

### Pattern 2: Multi-Token Vault

```typescript
async function setupMultiTokenVault(agentAddress: string) {
  // 1. Create vault
  await kit.contracts.vault.createVault(
    agentAddress,
    ethers.parseEther('1.0')
  );
  
  // 2. Allow multiple tokens
  const tokens = [
    { address: '0x...', name: 'USDC' },
    { address: '0x...', name: 'USDT' },
    { address: '0x...', name: 'DAI' },
  ];
  
  for (const token of tokens) {
    const tx = await kit.contracts.vault.allowToken(
      agentAddress,
      token.address
    );
    await tx.wait();
    console.log(`✅ ${token.name} enabled`);
  }
}
```

### Pattern 3: Automated Refill

```typescript
async function autoRefillVault(agentAddress: string, minBalance: string) {
  const minBalanceWei = ethers.parseEther(minBalance);
  
  // Check balance periodically
  setInterval(async () => {
    const balance = await kit.contracts.vault.getNativeBalance(agentAddress);
    
    if (balance < minBalanceWei) {
      const refillAmount = ethers.parseEther('1.0');
      
      const tx = await kit.contracts.vault.depositNative(
        agentAddress,
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
async function manageDailyLimit(agentAddress: string) {
  // Get current usage
  const limitInfo = await kit.contracts.vault.getDailyLimitInfo(agentAddress);
  
  const usagePercent = Number(limitInfo.spent * 100n / limitInfo.limit);
  
  console.log(`Daily usage: ${usagePercent}%`);
  
  // Alert if usage is high
  if (usagePercent > 80) {
    console.warn('⚠️ High daily usage! Consider increasing limit.');
  }
  
  // Auto-adjust limit based on usage patterns
  if (usagePercent > 90) {
    const newLimit = limitInfo.limit * 150n / 100n; // +50%
    
    const tx = await kit.contracts.vault.updateDailyLimit(
      agentAddress,
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
- Daily limit resets every 24 hours
- Tracks spending per day
- Prevents withdrawal if limit exceeded

### 2. Access Control

- **Contract Owner**: Can create vaults, update limits, allow/disallow tokens, activate/deactivate vaults
- **Agent Address**: Can withdraw from their own vault
- **Anyone**: Can deposit to any vault

### 3. Token Whitelist

Only approved tokens can be deposited:

```typescript
// Owner must explicitly allow each token
await vault.allowToken(agentAddress, tokenAddress);
```

### 4. Reentrancy Protection

All state-changing functions use `nonReentrant` modifier to prevent reentrancy attacks.

## 📚 Related Documentation

- **[AgentRegistry Contract](./agent-registry.md)** - Register agents
- **[AgentManager Contract](./agent-manager.md)** - Manage tasks
- **[Vault Operations Guide](../sdk-vault.md)** - SDK usage
- **[Smart Contracts Overview](../contracts-overview.md)** - All contracts

## 🔗 Contract Addresses

### Somnia Testnet
```
AgentVault: 0x7cEe3142A9c6d15529C322035041af697B2B5129
```

### Somnia Mainnet
```
AgentVault: Coming soon
```

## ⚠️ Important Notes

1. **Agent Addresses** - Vault uses agent addresses (not IDs). Always get the agent's owner address from the registry first.
2. **Daily Limit Resets** - Automatically resets every 24 hours from last reset
3. **Gas Costs** - Keep enough native tokens for gas fees
4. **Token Approvals** - Remember to approve vault before depositing ERC20
5. **Owner vs Agent** - Contract owner manages vault settings, agent address can withdraw

---

**Next:** Learn about [AgentExecutor](./agent-executor.md) for task execution.

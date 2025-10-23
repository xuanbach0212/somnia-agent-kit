# 📋 Somnia Agent Kit SDK Enhancement Plan

**Version:** 2.0  
**Updated:** October 2024  
**Network:** Testnet Only (Shannon - Chain ID 50312)  
**Reference:** [Somnia Developer Guides](https://docs.somnia.network/developer/how-to-guides)

---

## 🎯 Current Status

### ✅ What Works
- Testnet connection (chainId 50312)
- Agent lifecycle management
- Task execution system
- Vault operations
- LLM integration (OpenAI, Ollama, DeepSeek)
- Private key & mnemonic signing

### ❌ What's Missing
- MultiCall (batch RPC calls)
- Token management (ERC20/ERC721)
- Browser wallet support (MetaMask, etc.)
- Contract deployment helpers
- WebSocket events
- DAO/DEX/Oracle integrations

---

## 📂 Folder Structure Design

### **Design Philosophy: Separation of Concerns**

**`core/` = Low-level blockchain primitives only**
- ✅ Keep: Direct blockchain interaction (RPC, transactions, signing)
- ❌ Not here: Business logic, high-level features

### **Why Separate Folders?**

| Concern | Why NOT in `core/` | Better Location |
|---------|-------------------|-----------------|
| **Maintainability** | `core/` would become 10+ files, hard to navigate | Separate folders by feature domain |
| **Modularity** | Can't use tokens without importing all of core | Import only what you need |
| **Responsibility** | `core/` is blockchain layer, tokens are business layer | Different abstraction levels |
| **Discoverability** | Looking for ERC20? Is it in core? utils? helpers? | Clear: it's in `tokens/` |
| **Testing** | Testing core = testing everything mixed together | Test each domain independently |
| **Team Work** | Multiple devs editing `core/` = merge conflicts | Each dev owns a folder |

---

### **Proposed Structure**

```
packages/agent-kit/src/
├── core/                    [BLOCKCHAIN LAYER - Low Level]
│   ├── chainClient.ts      ✅ RPC provider
│   ├── signerManager.ts    ✅ Transaction signing
│   ├── contracts.ts        ✅ Contract instances
│   ├── config.ts           ✅ Network config
│   ├── multicall.ts        🆕 Batch calls (still core!)
│   └── rpcProvider.ts      🆕 RPC failover (still core!)
│
├── tokens/                  [BUSINESS LAYER - Token Standards]
│   ├── erc20.ts            🆕 ERC20 business logic
│   ├── erc721.ts           🆕 ERC721 business logic
│   └── native.ts           🆕 Native token helpers
│
├── deployment/              [DEVTOOLS LAYER - Developer Tools]
│   ├── deployer.ts         🆕 Deploy contracts
│   └── verifier.ts         🆕 Verify on explorer
│
├── wallets/                 [INTEGRATION LAYER - External Services]
│   ├── metamask.ts         🆕 MetaMask integration
│   ├── privy.ts            🆕 Privy integration
│   └── types.ts            🆕 Wallet interfaces
│
├── storage/                 [INTEGRATION LAYER - External Services]
│   └── ipfs.ts             🆕 IPFS integration
│
├── events/                  [INFRASTRUCTURE LAYER - Async Comms]
│   └── websocket.ts        🆕 Real-time subscriptions
│
└── [existing folders...]
    ├── runtime/            ✅ Agent execution
    ├── llm/                ✅ AI integration
    ├── cli/                ✅ Command line
    └── ...
```

---

### **Architectural Layers**

```
┌─────────────────────────────────────────────┐
│  Business Logic Layer                       │
│  (runtime/, tokens/, deployment/)           │
│  → High-level features users interact with  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Integration Layer                          │
│  (wallets/, storage/, llm/)                 │
│  → Connect to external services             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Infrastructure Layer                       │
│  (events/, monitor/, config/)               │
│  → Cross-cutting concerns                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Core Blockchain Layer                      │
│  (core/)                                    │
│  → Direct blockchain interaction ONLY       │
└─────────────────────────────────────────────┘
```

---

### **Example: Why ERC20 is NOT in core/**

**❌ If in `core/erc20.ts`:**
```typescript
// core/ becomes a dumping ground
core/
├── chainClient.ts      // Blockchain primitive ✅
├── signerManager.ts    // Blockchain primitive ✅
├── erc20.ts            // Business logic ❓
├── erc721.ts           // Business logic ❓
├── dao.ts              // Business logic ❓
├── dex.ts              // Business logic ❓
├── oracle.ts           // Integration ❓
└── ... (keeps growing)
```

**Problem:**
- `core/` mixes low-level + high-level code
- Hard to find things
- Testing becomes complex
- Can't tree-shake unused features

**✅ With separate folders:**
```typescript
// Clear separation of concerns
core/
├── chainClient.ts      // Low-level RPC
└── signerManager.ts    // Low-level signing

tokens/
├── erc20.ts           // High-level ERC20 helpers
└── erc721.ts          // High-level NFT helpers

// User can import only what they need:
import { ChainClient } from './core';        // ✅ Always needed
import { ERC20Manager } from './tokens';     // ✅ Only if using tokens
```

---

### **Real-World Analogy**

Think of it like a restaurant:

| Folder | Restaurant Equivalent | Why Separate? |
|--------|----------------------|---------------|
| `core/` | **Kitchen utilities** (stove, oven, knife) | Basic tools everyone needs |
| `tokens/` | **Pastry station** (cakes, bread) | Specialized area for one type of work |
| `wallets/` | **Payment terminal** | Integration with external system |
| `deployment/` | **Menu printing** | Dev tools, not for customers |

You wouldn't put the pastry station IN the oven room - they serve different purposes even though pastries need the oven.

---

### **Benefits of This Structure**

#### 1. **Discoverability** 🔍
```typescript
// ✅ Clear: Looking for ERC20 helpers?
import { ERC20Manager } from '@somnia/agent-kit/tokens';

// ❌ Unclear: Is it in core? utils? helpers?
import { ERC20Manager } from '@somnia/agent-kit/core'; // ???
```

#### 2. **Tree-Shaking** 🌲
```typescript
// User only imports what they use
import { ChainClient } from '@somnia/agent-kit/core';
import { ERC20Manager } from '@somnia/agent-kit/tokens';

// Bundle size: ONLY core + tokens
// NOT included: wallets, storage, events (unused)
```

#### 3. **Parallel Development** 👥
```
Developer A: Working on tokens/ folder
Developer B: Working on wallets/ folder
Developer C: Working on core/ folder

→ No merge conflicts! Each owns their domain
```

#### 4. **Testability** 🧪
```typescript
// Test tokens independently
describe('ERC20Manager', () => {
  // Mock only core layer
  // No need to mock wallets, storage, etc.
});
```

#### 5. **Future Extensibility** 🚀
```
Easy to add new features without bloating core:

tokens/
├── erc20.ts
├── erc721.ts
├── erc1155.ts    🆕 New standard
└── erc4626.ts    🆕 New standard

wallets/
├── metamask.ts
├── privy.ts
├── coinbase.ts   🆕 New wallet
└── phantom.ts    🆕 New wallet
```

---

### **Alternative: Everything in core/ (NOT RECOMMENDED)**

```typescript
core/
├── chainClient.ts
├── signerManager.ts
├── multicall.ts
├── erc20.ts          // ❌ Mixed concerns
├── erc721.ts         // ❌ Mixed concerns
├── deployer.ts       // ❌ Mixed concerns
├── metamask.ts       // ❌ Mixed concerns
├── ipfs.ts           // ❌ Mixed concerns
├── websocket.ts      // ❌ Mixed concerns
├── dao.ts            // ❌ Mixed concerns
└── dex.ts            // ❌ Mixed concerns
// → 15+ files in one folder → Hard to maintain
```

**Problems:**
- "God folder" anti-pattern
- Hard to navigate
- Unclear what's "core" vs "feature"
- Testing nightmare
- Can't optimize bundle size

---

### **Conclusion: Keep `core/` Pure**

**`core/` should only contain:**
- ✅ `chainClient.ts` - RPC provider management
- ✅ `signerManager.ts` - Transaction signing
- ✅ `contracts.ts` - Contract instance creation
- ✅ `config.ts` - Network configuration
- ✅ `multicall.ts` - Still low-level RPC optimization
- ✅ `rpcProvider.ts` - Still low-level RPC management

**Everything else** = Feature-specific folders based on domain

---

## 🔍 On-Chain Interaction: Core vs Business Layer

### **Question: "Vậy là mấy cái tương tác on-chain là để core hả?"**

**Answer:** Phụ thuộc vào **abstraction level** của interaction đó!

### **Rule of Thumb:**

```
core/       = LOW-LEVEL on-chain primitives
            → sendTransaction, call contract, sign data
            
tokens/     = HIGH-LEVEL on-chain features  
            → deploy ERC20, mint NFT, swap tokens
```

---

### **Examples by Layer:**

#### ✅ **Core Layer** (Low-Level Blockchain)
```typescript
// core/chainClient.ts
class ChainClient {
  // ✅ Generic blockchain operations
  async sendTransaction(tx: TransactionRequest) {...}
  async getBalance(address: string) {...}
  async getBlockNumber() {...}
  async estimateGas(tx: TransactionRequest) {...}
  
  // ✅ Generic contract interaction
  getContract(address: string, abi: any) {...}
  async call(contract: Contract, method: string, args: any[]) {...}
}

// core/multicall.ts
class MultiCall {
  // ✅ Low-level batch RPC optimization
  async aggregate(calls: Call[]) {...}
  async tryAggregate(calls: Call[]) {...}
}
```

**Characteristics:**
- ✅ Works with ANY contract (generic)
- ✅ No business logic
- ✅ Reusable across all features
- ✅ Direct blockchain protocol

---

#### 🎯 **Business Layer** (High-Level Features)
```typescript
// tokens/erc20.ts
class ERC20Manager {
  // ❌ NOT in core - Specific to ERC20 business logic
  async deployToken(name: string, symbol: string) {...}
  async transfer(token: string, to: string, amount: bigint) {...}
  async approve(token: string, spender: string) {...}
  async balanceOf(token: string, account: string) {...}
}

// tokens/erc721.ts  
class ERC721Manager {
  // ❌ NOT in core - Specific to NFT business logic
  async deployCollection(name: string, symbol: string) {...}
  async mint(collection: string, to: string, tokenURI: string) {...}
  async ownerOf(collection: string, tokenId: bigint) {...}
}
```

**Characteristics:**
- ❌ Specific to one standard (ERC20, ERC721)
- ❌ Has business logic (validation, helpers)
- ❌ Built ON TOP of core layer
- ❌ Domain-specific features

---

### **Visual Comparison:**

```typescript
// ════════════════════════════════════════════════
// CORE LAYER (Generic, Low-Level)
// ════════════════════════════════════════════════

// ✅ In core/chainClient.ts
const contract = chainClient.getContract(
  '0xTokenAddress',
  ERC20_ABI
);
const tx = await chainClient.sendTransaction({
  to: contract.target,
  data: contract.interface.encodeFunctionData('transfer', [to, amount])
});

// → Generic, works with ANY contract
// → Requires manual ABI encoding
// → Low-level blockchain operation


// ════════════════════════════════════════════════
// BUSINESS LAYER (Specific, High-Level)
// ════════════════════════════════════════════════

// ✅ In tokens/erc20.ts
await erc20Manager.transfer(
  tokenAddress,
  recipientAddress, 
  ethers.parseEther('100')
);

// → Specific to ERC20 tokens
// → Has built-in validation
// → High-level business operation
// → Internally uses core layer
```

---

### **Dependency Flow:**

```
┌─────────────────────────────────────────┐
│  User Application Code                  │
│  (examples/, your dApp)                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Business Layer (tokens/, deployment/)  │
│                                         │
│  erc20Manager.transfer()                │
│  erc721Manager.mint()                   │
│  deployer.deployContract()              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Core Layer (core/)                     │
│                                         │
│  chainClient.sendTransaction()          │
│  chainClient.getContract()              │
│  signerManager.sign()                   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Somnia Blockchain                      │
└─────────────────────────────────────────┘
```

---

### **Decision Tree: Where to Put On-Chain Code?**

```
Is it a blockchain interaction?
│
├─ YES → Does it work with ANY contract?
│         │
│         ├─ YES → PUT IN core/
│         │        (e.g., sendTx, getBalance, multicall)
│         │
│         └─ NO → Is it specific to a standard/protocol?
│                  │
│                  ├─ Token standard? → PUT IN tokens/
│                  │   (e.g., ERC20, ERC721)
│                  │
│                  ├─ DAO/DEX/Oracle? → PUT IN respective folder
│                  │   (e.g., dao/, dex/, oracles/)
│                  │
│                  └─ Deployment? → PUT IN deployment/
│                      (e.g., deployer, verifier)
│
└─ NO → Not blockchain interaction
         │
         ├─ Wallet integration? → PUT IN wallets/
         ├─ Storage? → PUT IN storage/
         └─ Events? → PUT IN events/
```

---

### **Real Examples:**

#### Example 1: Check ETH Balance

```typescript
// ✅ In core/ - Generic blockchain operation
class ChainClient {
  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }
}

// Usage
const balance = await chainClient.getBalance('0x...');
```

**Why core?** Works for ANY address, generic RPC call.

---

#### Example 2: Check ERC20 Token Balance

```typescript
// ✅ In tokens/erc20.ts - Specific to ERC20 standard
class ERC20Manager {
  async balanceOf(token: string, account: string): Promise<bigint> {
    const contract = this.chainClient.getContract(token, ERC20_ABI);
    return await contract.balanceOf(account);
  }
}

// Usage  
const balance = await erc20Manager.balanceOf(tokenAddress, accountAddress);
```

**Why NOT core?** Specific to ERC20 standard, has business logic.

---

#### Example 3: MultiCall (Batch RPC Calls)

```typescript
// ✅ In core/multicall.ts - Generic RPC optimization
class MultiCall {
  async aggregate(calls: Call[]): Promise<Result[]> {
    // Works with ANY contract calls
    const multicall = this.chainClient.getContract(
      MULTICALL_ADDRESS, 
      MULTICALL_ABI
    );
    return await multicall.aggregate(calls);
  }
}

// Usage - Can batch ANY contract calls
const results = await multicall.aggregate([
  { target: erc20, callData: transferCalldata },
  { target: nft, callData: mintCalldata },
  { target: dao, callData: voteCalldata }
]);
```

**Why core?** Generic, works with ANY contract, low-level optimization.

---

#### Example 4: Deploy ERC20 Token

```typescript
// ✅ In tokens/erc20.ts - Specific to ERC20
class ERC20Manager {
  async deployToken(params: {
    name: string;
    symbol: string;
    supply: bigint;
  }): Promise<string> {
    // ERC20-specific deployment logic
    const factory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      this.chainClient.getSigner()
    );
    
    const token = await factory.deploy(
      params.name,
      params.symbol,
      params.supply
    );
    
    await token.waitForDeployment();
    return await token.getAddress();
  }
}
```

**Why NOT core?** Specific to ERC20 tokens, has deployment business logic.

---

### **Summary Table:**

| Operation | Layer | Location | Why? |
|-----------|-------|----------|------|
| Send transaction | Core | `core/chainClient.ts` | Generic blockchain operation |
| Get balance (native) | Core | `core/chainClient.ts` | Generic RPC call |
| Sign message | Core | `core/signerManager.ts` | Generic signing |
| MultiCall batch | Core | `core/multicall.ts` | Generic RPC optimization |
| Get contract instance | Core | `core/chainClient.ts` | Generic contract helper |
| **ERC20 transfer** | Business | `tokens/erc20.ts` | ERC20-specific logic |
| **ERC721 mint** | Business | `tokens/erc721.ts` | NFT-specific logic |
| **Deploy token** | Business | `tokens/erc20.ts` | Token deployment logic |
| **DAO vote** | Business | `dao/manager.ts` | DAO-specific logic |
| **DEX swap** | Business | `dex/manager.ts` | DEX-specific logic |

---

### **Key Principle:**

```
core/     = CÁI GÌ CŨNG DÙNG ĐƯỢC (Generic primitives)
tokens/   = CHỈ DÙNG CHO TOKEN (Domain-specific)
wallets/  = CHỈ DÙNG CHO WALLET (Integration-specific)
```

**Nếu code chỉ work với 1 loại contract/standard → KHÔNG để trong core/**

---

## 🎯 Enhancement Overview

### 🔴 Phase 1: Core Improvements (Week 1)
**Folder:** `src/core/`

| Module | Priority | Purpose |
|--------|----------|---------|
| `multicall.ts` | 🔴 Critical | Batch RPC calls → Reduce 80% requests |
| `rpcProvider.ts` | 🟠 High | Failover & load balancing |

**Impact:** Major performance boost

---

### 🟠 Phase 2: Token Management (Week 2)
**Folder:** `src/tokens/` + `src/deployment/`

| Module | Priority | Purpose |
|--------|----------|---------|
| `erc20.ts` | 🔴 Critical | Deploy & manage ERC20 tokens |
| `erc721.ts` | 🔴 Critical | Deploy & manage NFT collections |
| `deployer.ts` | 🟠 High | Contract deployment helper |
| `verifier.ts` | 🟡 Medium | Contract verification on Explorer |

**Impact:** Essential for most dApps

---

### 🟡 Phase 3: Frontend Support (Week 3)
**Folder:** `src/wallets/` + `src/storage/`

| Module | Priority | Purpose |
|--------|----------|---------|
| `metamask.ts` | 🔴 Critical | MetaMask integration for browser dApps |
| `privy.ts` | 🟡 Medium | Privy wallet connector |
| `ipfs.ts` | 🟡 Medium | IPFS metadata storage for NFTs |
| `native.ts` | 🟡 Medium | STT token utilities |

**Impact:** Enable frontend dApp development

---

### 🟢 Phase 4: Advanced Features (Week 4-5)
**Folder:** `src/events/` + Advanced modules

| Module | Priority | Purpose |
|--------|----------|---------|
| `websocket.ts` | 🟢 Low | Real-time blockchain events |
| DAO support | 🟢 Low | Governance contracts |
| DEX support | 🟢 Low | Swap & liquidity |

**Impact:** Advanced use cases

---

## 📊 Summary Table

| Phase | New Modules | Effort | Priority | Impact |
|-------|-------------|--------|----------|--------|
| Phase 1 | 2 modules (`core/`) | Low | 🔴 Critical | Performance ⚡ |
| Phase 2 | 4 modules (`tokens/`, `deployment/`) | Medium | 🟠 High | Essential features 🎯 |
| Phase 3 | 4 modules (`wallets/`, `storage/`) | Medium | 🟡 Medium | Frontend support 🌐 |
| Phase 4 | 3+ modules (`events/`, advanced) | High | 🟢 Low | Advanced features 🚀 |

**Total:** ~13 new modules across 4 phases

---

## 📝 Next Steps

1. ✅ Review folder structure
2. ⏳ Start Phase 1: `multicall.ts` implementation
3. ⏳ Test performance improvements
4. ⏳ Move to Phase 2 if approved

---

## 🔗 Quick Reference

- **Testnet RPC:** `https://dream-rpc.somnia.network/`
- **Chain ID:** `50312`
- **MultiCall Contract:** `0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223`
- **EntryPoint v0.7:** `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- **Explorer:** `https://shannon-explorer.somnia.network/`

---

## 📚 Detailed Implementation Plans

---

## 🔴 PHASE 1: Core Improvements

### 📋 Task List

- [ ] **Task 1.1:** Add MultiCall config to network settings
- [ ] **Task 1.2:** Implement `core/multicall.ts`
- [ ] **Task 1.3:** Implement `core/rpcProvider.ts`
- [ ] **Task 1.4:** Add unit tests
- [ ] **Task 1.5:** Performance benchmarks
- [ ] **Task 1.6:** Update documentation

---

### **Task 1.1: Add MultiCall Config** ⏱️ 30 mins

**File:** `packages/agent-kit/src/config/networks.ts`

**Action:** Add MultiCall address to network config

```typescript
export const SOMNIA_NETWORKS = {
  testnet: {
    name: 'Somnia Shannon Testnet',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    chainId: 50312,
    explorer: 'https://shannon-explorer.somnia.network/',
    token: 'STT',
    multicall: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223', // 🆕 ADD THIS
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // 🆕 ADD THIS
  },
}
```

**Test:**
```bash
npm run build
node -e "const { SOMNIA_NETWORKS } = require('./dist/config/networks'); console.log(SOMNIA_NETWORKS.testnet.multicall)"
```

---

### **Task 1.2: Implement MultiCall** ⏱️ 4-6 hours

**File:** `packages/agent-kit/src/core/multicall.ts`

**Structure:**
```typescript
// 1. Types & Interfaces
interface Call {
  target: string;
  callData: string;
}

interface Result {
  success: boolean;
  returnData: string;
}

// 2. MultiCall Class
export class MultiCall {
  constructor(chainClient: ChainClient)
  
  // Core methods
  async aggregate(calls: Call[]): Promise<string[]>
  async tryAggregate(calls: Call[], requireSuccess: boolean): Promise<Result[]>
  async blockAndAggregate(calls: Call[]): Promise<{...}>
  
  // Helper methods
  private getMultiCallContract(): Contract
  private encodeCall(contract: Contract, method: string, args: any[]): string
}

// 3. Export
export { MultiCall, Call, Result }
```

**Implementation Steps:**

1. **Create file:**
   ```bash
   touch packages/agent-kit/src/core/multicall.ts
   ```

2. **Add MultiCall ABI** (minimal):
   ```typescript
   const MULTICALL_ABI = [
     'function aggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes[] returnData)',
     'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',
   ];
   ```

3. **Implement core logic:**
   ```typescript
   async aggregate(calls: Call[]): Promise<string[]> {
     const contract = this.getMultiCallContract();
     const [blockNumber, results] = await contract.aggregate(calls);
     return results;
   }
   ```

4. **Add to exports:**
   ```typescript
   // packages/agent-kit/src/core/index.ts
   export * from './multicall';
   ```

**Test:**
```typescript
// Quick test script
const multicall = new MultiCall(chainClient);
const calls = [
  { target: tokenA, callData: balanceOfCalldata },
  { target: tokenB, callData: balanceOfCalldata },
];
const results = await multicall.aggregate(calls);
console.log('Results:', results.length); // Should be 2
```

---

### **Task 1.3: Implement RPC Provider** ⏱️ 3-4 hours

**File:** `packages/agent-kit/src/core/rpcProvider.ts`

**Structure:**
```typescript
// 1. Types
interface ProviderConfig {
  urls: string[];
  strategy: 'round-robin' | 'fastest' | 'random';
  timeout?: number;
  retries?: number;
}

// 2. RPCLoadBalancer Class
export class RPCLoadBalancer {
  constructor(config: ProviderConfig)
  
  // Core methods
  async getProvider(): Promise<ethers.JsonRpcProvider>
  async checkHealth(url: string): Promise<boolean>
  private selectProvider(): string
  
  // Strategy methods
  private roundRobin(): string
  private fastest(): Promise<string>
  private random(): string
}
```

**Implementation Steps:**

1. **Create file:**
   ```bash
   touch packages/agent-kit/src/core/rpcProvider.ts
   ```

2. **Implement health check:**
   ```typescript
   async checkHealth(url: string): Promise<boolean> {
     try {
       const provider = new ethers.JsonRpcProvider(url);
       await provider.getBlockNumber();
       return true;
     } catch {
       return false;
     }
   }
   ```

3. **Implement strategies:**
   ```typescript
   private roundRobin(): string {
     const url = this.urls[this.currentIndex];
     this.currentIndex = (this.currentIndex + 1) % this.urls.length;
     return url;
   }
   ```

**Test:**
```typescript
const balancer = new RPCLoadBalancer({
  urls: ['https://dream-rpc.somnia.network/'],
  strategy: 'round-robin'
});
const provider = await balancer.getProvider();
console.log('Block:', await provider.getBlockNumber());
```

---

### **Task 1.4: Unit Tests** ⏱️ 2-3 hours

**Files:**
- `packages/agent-kit/src/core/multicall.test.ts`
- `packages/agent-kit/src/core/rpcProvider.test.ts`

**MultiCall Tests:**
```typescript
describe('MultiCall', () => {
  it('should batch multiple calls', async () => {
    const calls = [
      { target: mockToken, callData: '0x...' },
      { target: mockToken, callData: '0x...' },
    ];
    const results = await multicall.aggregate(calls);
    expect(results).toHaveLength(2);
  });
  
  it('should handle failures in tryAggregate', async () => {
    const calls = [
      { target: validContract, callData: '0x...' },
      { target: invalidContract, callData: '0x...' },
    ];
    const results = await multicall.tryAggregate(calls, false);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });
});
```

**Run tests:**
```bash
npm test -- multicall.test.ts
npm test -- rpcProvider.test.ts
```

---

### **Task 1.5: Performance Benchmarks** ⏱️ 1-2 hours

**File:** `packages/agent-kit/benchmarks/multicall.bench.ts`

**Benchmark script:**
```typescript
// Without MultiCall
console.time('Sequential calls');
for (let i = 0; i < 100; i++) {
  await contract.balanceOf(accounts[i]);
}
console.timeEnd('Sequential calls');

// With MultiCall
console.time('MultiCall batch');
const calls = accounts.map(acc => ({
  target: contract.address,
  callData: contract.interface.encodeFunctionData('balanceOf', [acc])
}));
await multicall.aggregate(calls);
console.timeEnd('MultiCall batch');
```

**Expected results:**
```
Sequential calls: 15000ms
MultiCall batch: 2000ms
→ 87% reduction ✅
```

---

### **Task 1.6: Update Documentation** ⏱️ 1 hour

**Files to update:**
- `docs/sdk-usage.md` - Add MultiCall examples
- `API_REFERENCE.md` - Add MultiCall API docs
- `README.md` - Add performance improvements note

**Example section:**
```markdown
### Batch Operations with MultiCall

```typescript
import { MultiCall } from '@somnia/agent-kit/core';

const multicall = new MultiCall(chainClient);

// Batch 100 balance checks in 1 RPC call
const calls = accounts.map(account => ({
  target: tokenAddress,
  callData: token.interface.encodeFunctionData('balanceOf', [account])
}));

const results = await multicall.aggregate(calls);
// → 80-90% faster than sequential calls
```
```

---

### **Phase 1 Completion Checklist:**

- [ ] All 6 tasks completed
- [ ] Tests passing (100% coverage for new code)
- [ ] Benchmarks show >80% improvement
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Merged to main branch

---

## 🟠 PHASE 2: Token Management

### 📋 Task List

- [ ] **Task 2.1:** Create `tokens/` folder structure
- [ ] **Task 2.2:** Implement `tokens/erc20.ts`
- [ ] **Task 2.3:** Implement `tokens/erc721.ts`
- [ ] **Task 2.4:** Implement `tokens/native.ts`
- [ ] **Task 2.5:** Create `deployment/` folder
- [ ] **Task 2.6:** Implement `deployment/deployer.ts`
- [ ] **Task 2.7:** Implement `deployment/verifier.ts`
- [ ] **Task 2.8:** Add ERC20/721 contract templates
- [ ] **Task 2.9:** Add unit tests
- [ ] **Task 2.10:** Add integration tests
- [ ] **Task 2.11:** Create example projects
- [ ] **Task 2.12:** Update documentation

---

### **Task 2.1: Create Folder Structure** ⏱️ 15 mins

```bash
mkdir -p packages/agent-kit/src/tokens
mkdir -p packages/agent-kit/src/deployment
mkdir -p packages/agent-kit/src/contracts/templates

touch packages/agent-kit/src/tokens/index.ts
touch packages/agent-kit/src/tokens/erc20.ts
touch packages/agent-kit/src/tokens/erc721.ts
touch packages/agent-kit/src/tokens/native.ts
touch packages/agent-kit/src/deployment/index.ts
touch packages/agent-kit/src/deployment/deployer.ts
touch packages/agent-kit/src/deployment/verifier.ts
```

---

### **Task 2.2: Implement ERC20Manager** ⏱️ 6-8 hours

**File:** `packages/agent-kit/src/tokens/erc20.ts`

**Class structure:**
```typescript
export class ERC20Manager {
  constructor(private chainClient: ChainClient)
  
  // Deployment
  async deployToken(params: DeployTokenParams): Promise<string>
  
  // Standard operations
  async balanceOf(token: string, account: string): Promise<bigint>
  async totalSupply(token: string): Promise<bigint>
  async transfer(token: string, to: string, amount: bigint): Promise<TxReceipt>
  async approve(token: string, spender: string, amount: bigint): Promise<TxReceipt>
  async transferFrom(token: string, from: string, to: string, amount: bigint): Promise<TxReceipt>
  async allowance(token: string, owner: string, spender: string): Promise<bigint>
  
  // Helpers
  async getTokenInfo(token: string): Promise<TokenInfo>
  async batchBalanceOf(token: string, accounts: string[]): Promise<bigint[]>
  
  // Private
  private getERC20Contract(address: string): Contract
}
```

**Key methods:**
```typescript
async deployToken(params: {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply?: bigint;
}): Promise<string> {
  const factory = new ethers.ContractFactory(
    ERC20_ABI,
    ERC20_BYTECODE,
    this.chainClient.getSigner()
  );
  
  const token = await factory.deploy(
    params.name,
    params.symbol,
    params.decimals || 18,
    params.initialSupply || 0n
  );
  
  await token.waitForDeployment();
  return await token.getAddress();
}

async transfer(
  token: string,
  to: string,
  amount: bigint
): Promise<ethers.TransactionReceipt> {
  const contract = this.getERC20Contract(token);
  const tx = await contract.transfer(to, amount);
  return await tx.wait();
}
```

---

### **Task 2.3: Implement ERC721Manager** ⏱️ 6-8 hours

**Similar structure to ERC20Manager**

**Key methods:**
```typescript
async deployCollection(params: DeployCollectionParams): Promise<string>
async mint(collection: string, to: string, tokenURI?: string): Promise<bigint>
async ownerOf(collection: string, tokenId: bigint): Promise<string>
async safeTransferFrom(collection: string, from: string, to: string, tokenId: bigint): Promise<TxReceipt>
async approve(collection: string, to: string, tokenId: bigint): Promise<TxReceipt>
async setApprovalForAll(collection: string, operator: string, approved: boolean): Promise<TxReceipt>
```

---

### **Task 2.4-2.7: Other Modules** ⏱️ 8-10 hours

**Similar pattern for:**
- `native.ts` - Native token utilities
- `deployer.ts` - Generic contract deployment
- `verifier.ts` - Explorer verification

---

### **Task 2.8: Contract Templates** ⏱️ 3-4 hours

**Create Solidity templates:**

```bash
touch packages/agent-kit/src/contracts/templates/ERC20Template.sol
touch packages/agent-kit/src/contracts/templates/ERC721Template.sol
```

**Compile and export ABIs:**
```bash
# Use hardhat or solc to compile
npx hardhat compile

# Export ABIs to TypeScript
node scripts/exportABIs.js
```

---

### **Phase 2 Completion Checklist:**

- [ ] All tokens/ modules implemented
- [ ] All deployment/ modules implemented
- [ ] Contract templates ready
- [ ] Tests passing (80%+ coverage)
- [ ] 4 example projects created
- [ ] Documentation complete

---

## 🟡 PHASE 3: Frontend Support

### 📋 Task List

- [ ] **Task 3.1:** Create `wallets/` folder
- [ ] **Task 3.2:** Implement `wallets/metamask.ts`
- [ ] **Task 3.3:** Implement `wallets/privy.ts`
- [ ] **Task 3.4:** Create `storage/` folder
- [ ] **Task 3.5:** Implement `storage/ipfs.ts`
- [ ] **Task 3.6:** Update `tokens/native.ts`
- [ ] **Task 3.7:** Add browser compatibility
- [ ] **Task 3.8:** Add React hooks (optional)
- [ ] **Task 3.9:** Create example dApp
- [ ] **Task 3.10:** Update documentation

---

### **Task 3.2: MetaMask Connector** ⏱️ 6-8 hours

**File:** `packages/agent-kit/src/wallets/metamask.ts`

**Key methods:**
```typescript
class MetaMaskConnector {
  async isInstalled(): Promise<boolean>
  async connect(): Promise<string>
  async switchToSomnia(network: 'testnet'): Promise<void>
  async addSomniaNetwork(): Promise<void>
  on(event: 'accountsChanged' | 'chainChanged', handler: Function): void
}
```

**Usage example:**
```typescript
const metamask = new MetaMaskConnector();
await metamask.connect();
await metamask.switchToSomnia('testnet');
```

---

## 🟢 PHASE 4: Advanced Features

### 📋 Task List

- [ ] **Task 4.1:** Implement `events/websocket.ts`
- [ ] **Task 4.2:** Add DAO support (optional)
- [ ] **Task 4.3:** Add DEX support (optional)
- [ ] **Task 4.4:** Documentation

---

## 📅 Timeline

| Week | Phase | Focus | Deliverable |
|------|-------|-------|-------------|
| Week 1 | Phase 1 | Core improvements | MultiCall + RPC balancer |
| Week 2 | Phase 2 | Token management | ERC20/721 managers |
| Week 3 | Phase 3 | Frontend support | Wallet connectors + IPFS |
| Week 4-5 | Phase 4 | Advanced features | WebSocket + DAO/DEX |

---

**Status:** Ready to start Phase 1  
**Next Action:** Begin Task 1.1 (Add MultiCall config)  
**Last Updated:** October 2024

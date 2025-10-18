# 📚 Somnia Agent Kit Examples

This directory contains working examples demonstrating how to use the Somnia Agent Kit SDK with deployed contracts on Somnia testnet.

**All examples tested and working! ✅**

---

## 🎯 Quick Start Examples

### 1. Simple Demo ✅ **TESTED**
Basic SDK initialization and contract queries.

**Location**: [`simple-agent-demo/`](./simple-agent-demo/)

**What it does**:
- Initialize SDK with deployed contracts
- Connect to Somnia testnet
- Query wallet balance
- Query registry statistics

**Run**:
```bash
cd examples/simple-agent-demo
npx ts-node index.ts
```

**Expected output**: SDK initialization, contract addresses, wallet info

---

### 2. Register Agent ✅ **TESTED**
Complete agent registration on-chain.

**Location**: [`register-agent-demo/`](./register-agent-demo/)

**What it does**:
- Register new agent on AgentRegistry
- Set agent capabilities
- Verify registration on-chain
- Query agent details

**Run**:
```bash
cd examples/register-agent-demo
npx ts-node index.ts
```

**Expected output**: Agent registered with ID, transaction hash, explorer links

**Live Example**:
- Agent ID: 1
- TX: `0x3d29d2796a5ec1b42540628b5919916b9a8c0fde42c695a1b80530d95039cc8c`
- Explorer: https://explorer.somnia.network/tx/0x3d29d2796a5ec1b42540628b5919916b9a8c0fde42c695a1b80530d95039cc8c

---

### 3. Vault Management ✅ **TESTED**
Create and manage agent vaults.

**Location**: [`vault-demo/`](./vault-demo/)

**What it does**:
- Create vault with daily limits
- Deposit native tokens (STT)
- Query vault balance and status
- Track daily spending limits

**Run**:
```bash
cd examples/vault-demo
npx ts-node index.ts
```

**Expected output**: Vault created, funds deposited, balance and limits displayed

**Live Example**:
- Create TX: `0x6bf820939044af19231c1cd482c34c37b94ef5b13947af254178d396b00d7e7f`
- Deposit TX: `0xb8891e592e4cc8241ed646a2d0af56cbce38a1780ab647349565bc5608a1e975`
- Balance: 0.1 STT
- Daily Limit: 1.0 STT

---

## 🏗️ Deployment Model Examples

### Option 1: Shared Platform (Recommended)
Use official contracts deployed by Somnia team.

**Best for**: Individual developers, startups, prototypes

**Example**: [`shared-platform-example/`](./shared-platform-example/)

**Deployed Contracts** (Use these!):
```typescript
{
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
}
```

```bash
cd examples/shared-platform-example
npx ts-node index.ts
```

---

### Option 2: Self-Hosted
Deploy and use your own contracts.

**Best for**: Enterprises, privacy-sensitive projects, high volume

**Example**: [`self-hosted-example/`](./self-hosted-example/)

```bash
# 1. Deploy contracts first
cd contracts
pnpm hardhat run scripts/deploy.ts --network testnet

# 2. Add addresses to .env
# AGENT_REGISTRY_ADDRESS=0x...
# AGENT_MANAGER_ADDRESS=0x...
# AGENT_EXECUTOR_ADDRESS=0x...
# AGENT_VAULT_ADDRESS=0x...

# 3. Run example
cd examples/self-hosted-example
npx ts-node index.ts
```

---

## 📊 Comparison

| Feature | Shared Platform | Self-Hosted |
|---------|----------------|-------------|
| **Setup Time** | 5 minutes | 30 minutes |
| **Cost** | FREE | ~0.5 STT |
| **Platform Fees** | 2.5% per task | 0% |
| **Privacy** | Public | Private |
| **Customization** | Limited | Full |
| **Examples** | ✅ Tested | ⏳ Ready |

---

## 🧪 Testing Results

All examples have been tested on Somnia Dream Testnet:

| Example | Status | Transactions | Gas Used |
|---------|--------|--------------|----------|
| Simple Demo | ✅ PASS | 0 (read-only) | 0 |
| Register Agent | ✅ PASS | 1 | 3,403,102 |
| Vault Demo | ✅ PASS | 2 | 1,113,100 |

**Total**: 3 examples, 3 transactions, ~4.5M gas used

**See**: [`../TESTING_RESULTS.md`](../TESTING_RESULTS.md) for detailed results

---

## 🚀 More Examples (Coming Soon)

### On-Chain Chatbot ⏳
AI chatbot with on-chain memory.

**Location**: [`onchain-chatbot/`](./onchain-chatbot/)

```bash
cd examples/onchain-chatbot
npm install
node index.ts
```

---

## 📖 Documentation

- **Testing Results**: [`../TESTING_RESULTS.md`](../TESTING_RESULTS.md) ⭐ NEW!
- **Deployment Options**: [`../DEPLOYMENT_OPTIONS.md`](../DEPLOYMENT_OPTIONS.md)
- **Architecture Comparison**: [`../ARCHITECTURE_COMPARISON.md`](../ARCHITECTURE_COMPARISON.md)
- **Contracts & SDK Explained**: [`../CONTRACTS_AND_SDK_EXPLAINED.md`](../CONTRACTS_AND_SDK_EXPLAINED.md)
- **API Reference**: [`../API_REFERENCE.md`](../API_REFERENCE.md)
- **Deployment Complete**: [`../DEPLOYMENT_COMPLETE.md`](../DEPLOYMENT_COMPLETE.md)

---

## 🔧 Prerequisites

### Required:
- Node.js 18+
- TypeScript
- Private key with STT tokens

### Setup:
```bash
# 1. Clone repository
git clone https://github.com/your-org/somnia-ai.git
cd somnia-ai

# 2. Install dependencies
pnpm install

# 3. Setup .env
cp .env.example .env
# Add your PRIVATE_KEY

# 4. Run examples
cd examples/simple-agent-demo
npx ts-node index.ts
```

---

## 💰 Get Test Tokens

**Discord (Recommended)**:
1. Join: https://discord.gg/somnia
2. Go to `#dev-chat`
3. Request: `@emma_odia Hi, I need STT tokens for testing. Wallet: 0xYOUR_ADDRESS`

**Faucet** (if available):
- https://faucet.somnia.network

---

## 🆘 Need Help?

- **Discord**: https://discord.gg/somnia
- **GitHub Issues**: https://github.com/your-org/somnia-ai/issues
- **Documentation**: https://docs.somnia.network
- **Testing Results**: See `TESTING_RESULTS.md`

---

## ✅ Verified Working

All examples in this directory have been tested and verified working on:
- **Network**: Somnia Dream Testnet
- **Chain ID**: 50312
- **Date**: October 18, 2025
- **Status**: ✅ **PRODUCTION READY**

**Start building your AI agents now!** 🚀


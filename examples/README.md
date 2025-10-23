# Examples

Simple, focused examples to get you started with Somnia Agent Kit.

## 📋 Examples

### 1. Quickstart
**File**: `01-quickstart/index.ts`  
**What it does**: Initialize SDK, connect to network, query agents  
**Run**: `npx ts-node 01-quickstart/index.ts`

### 2. Register Agent
**File**: `02-register-agent/index.ts`  
**What it does**: Register a new AI agent on-chain  
**Run**: `npx ts-node 02-register-agent/index.ts`

### 3. AI Agent
**File**: `03-ai-agent/index.ts`  
**What it does**: Use FREE local AI (Ollama) with agent  
**Setup**: Install Ollama first (see file comments)  
**Run**: `npx ts-node 03-ai-agent/index.ts`

### 4. Task Execution
**File**: `04-task-execution/index.ts`  
**What it does**: Create, start, and complete tasks  
**Run**: `npx ts-node 04-task-execution/index.ts`

### 5. Monitoring
**File**: `05-monitoring/index.ts`  
**What it does**: Use Logger, Metrics, and Dashboard  
**Run**: `npx ts-node 05-monitoring/index.ts`

### 6. MultiCall Batch Operations 🆕
**File**: `06-multicall-batch/index.ts`  
**What it does**: Batch multiple contract calls into 1 RPC request (80-90% faster!)  
**Features**: Balance checks, token metadata, block aggregation  
**Run**: `npx ts-node 06-multicall-batch/index.ts`

### 7. Token Management 🆕
**File**: `07-token-management/index.ts`  
**What it does**: Manage ERC20, ERC721, and native tokens  
**Features**: Balances, transfers, approvals, NFT operations  
**Run**: `npx ts-node 07-token-management/index.ts`

### 8. Convenience API Demo 🆕
**File**: `08-convenience-api/index.ts`  
**What it does**: Demonstrate new convenient getter methods for all SDK modules  
**Features**: Easy access to all managers (tokens, multicall, IPFS, WebSocket, deployment, wallets)  
**Run**: `npx ts-node 08-convenience-api/index.ts`

---

## 🚀 Quick Start

### 1. Setup Environment

Create `.env` file in project root:

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Private Key (optional for read-only)
PRIVATE_KEY=0x...

# Contracts
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Examples

```bash
# Start with quickstart
npx ts-node examples/01-quickstart/index.ts

# Then try others
npx ts-node examples/02-register-agent/index.ts
npx ts-node examples/03-ai-agent/index.ts
npx ts-node examples/04-task-execution/index.ts
npx ts-node examples/05-monitoring/index.ts

# New: Try advanced features
npx ts-node examples/06-multicall-batch/index.ts
npx ts-node examples/07-token-management/index.ts
npx ts-node examples/08-convenience-api/index.ts
```

---

## 📝 Notes

- **Quickstart**: No private key needed (read-only)
- **Register Agent**: Requires private key
- **AI Agent**: Requires Ollama installed
- **Task Execution**: Requires private key + existing agent
- **Monitoring**: No blockchain needed
- **MultiCall Batch** 🆕: Requires valid ERC20 token address
- **Token Management** 🆕: Works with any token/NFT on Somnia testnet
- **Convenience API** 🆕: No special requirements, demonstrates all module access

---

## 🔗 Links

- **Main README**: [../README.md](../README.md)
- **API Reference**: [../API_REFERENCE.md](../API_REFERENCE.md)
- **Documentation**: [../docs/](../docs/)

---

**Happy coding!** 🚀

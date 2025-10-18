# 🚀 Deploy Contracts to Somnia Testnet - Hướng Dẫn Chi Tiết

## 📋 Chuẩn Bị

### Bước 1: Lấy Test Tokens (STT)

**Option A: Discord (Khuyến nghị)**
1. Truy cập Somnia Discord: https://discord.gg/somnia
2. Vào channel `#dev-chat`
3. Tag @emma_odia và request tokens:
   ```
   @emma_odia Hello, I need STT tokens for testing on Somnia Dream testnet.
   My wallet address: 0xYOUR_ADDRESS_HERE
   ```
4. Đợi Emma gửi tokens (thường trong vài phút đến vài giờ)

**Option B: Faucet Website** (nếu có)
- Kiểm tra https://faucet.somnia.network (nếu có)
- Nhập wallet address và request tokens

**Lấy Wallet Address:**
```bash
# Nếu bạn đã có private key trong .env
cd contracts
node -e "const ethers = require('ethers'); require('dotenv').config({path:'../.env'}); const wallet = new ethers.Wallet(process.env.PRIVATE_KEY); console.log('Address:', wallet.address)"
```

### Bước 2: Setup Environment

**Tạo/Update file `.env` ở root project:**
```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai
nano .env  # hoặc code .env
```

**Nội dung `.env`:**
```bash
# Somnia Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311

# Your Private Key (KHÔNG SHARE cho ai!)
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Contract Addresses (sẽ update sau khi deploy)
AGENT_REGISTRY_ADDRESS=
AGENT_EXECUTOR_ADDRESS=
AGENT_MANAGER_ADDRESS=
AGENT_VAULT_ADDRESS=

# LLM APIs (optional - cho SDK testing)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Monitoring (optional)
MONITORING_PORT=3001
```

⚠️ **LƯU Ý QUAN TRỌNG:**
- KHÔNG commit file `.env` lên GitHub
- KHÔNG share private key
- Backup private key an toàn

---

## 🎯 Deployment Process

### Step 1: Kiểm Tra Balance

```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai/contracts

# Check balance
node << 'EOF'
const ethers = require('ethers');
require('dotenv').config({path:'../.env'});

const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

(async () => {
  const balance = await provider.getBalance(wallet.address);
  console.log('Wallet Address:', wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'STT');
  
  if (balance === 0n) {
    console.log('\n❌ Balance is 0! Please request tokens from faucet first.');
    console.log('Discord: https://discord.gg/somnia (#dev-chat, tag @emma_odia)');
  } else {
    console.log('\n✅ Ready to deploy!');
  }
})();
EOF
```

### Step 2: Compile Contracts

```bash
# Clean and compile
pnpm run clean
pnpm run compile

# Kiểm tra compilation
ls -la artifacts/contracts/
```

Bạn sẽ thấy:
```
AgentRegistry.sol/
AgentExecutor.sol/
AgentManager.sol/
AgentVault.sol/
```

### Step 3: Deploy to Testnet

```bash
# Deploy contracts
pnpm run deploy

# Hoặc explicit:
pnpm hardhat run scripts/deploy.ts --network testnet
```

**Output mong đợi:**
```
🚀 Starting Somnia Agent Kit deployment...

📋 Deployment Info:
  Network: somnia
  Chain ID: 50311
  Deployer: 0xYourAddress...
  Balance: 10.0 STT

📦 Deploying AgentRegistry...
✅ AgentRegistry deployed to: 0x1234...

📦 Deploying AgentManager...
✅ AgentManager deployed to: 0x5678...

📦 Deploying AgentExecutor...
✅ AgentExecutor deployed to: 0x9abc...

📦 Deploying AgentVault...
✅ AgentVault deployed to: 0xdef0...

✨ Deployment Summary:
==========================================
AgentRegistry:   0x1234...
AgentManager:    0x5678...
AgentExecutor:   0x9abc...
AgentVault:      0xdef0...
==========================================
```

### Step 4: Save Contract Addresses

**Deployment file được tự động lưu tại:**
```
contracts/deployments/latest-somnia.json
contracts/deployments/deployment-somnia-<timestamp>.json
```

**Update `.env` file:**
```bash
# Copy addresses từ output
AGENT_REGISTRY_ADDRESS=0x1234...
AGENT_MANAGER_ADDRESS=0x5678...
AGENT_EXECUTOR_ADDRESS=0x9abc...
AGENT_VAULT_ADDRESS=0xdef0...
```

### Step 5: Verify Contracts (Optional nhưng khuyến nghị)

```bash
# Verify AgentRegistry
pnpm hardhat verify --network testnet 0xYOUR_REGISTRY_ADDRESS

# Verify AgentManager  
pnpm hardhat verify --network testnet 0xYOUR_MANAGER_ADDRESS

# Verify AgentExecutor
pnpm hardhat verify --network testnet 0xYOUR_EXECUTOR_ADDRESS

# Verify AgentVault
pnpm hardhat verify --network testnet 0xYOUR_VAULT_ADDRESS
```

**Nếu verify thành công:**
```
✅ Contract successfully verified on Somnia Explorer!
View at: https://explorer.somnia.network/address/0xYourAddress
```

---

## 🧪 Test Deployed Contracts

### Test 1: Kiểm Tra Contracts Deployed

```bash
cd contracts
node << 'EOF'
const ethers = require('ethers');
require('dotenv').config({path:'../.env'});

const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);

(async () => {
  const registryCode = await provider.getCode(process.env.AGENT_REGISTRY_ADDRESS);
  const executorCode = await provider.getCode(process.env.AGENT_EXECUTOR_ADDRESS);
  
  console.log('AgentRegistry deployed:', registryCode !== '0x');
  console.log('AgentExecutor deployed:', executorCode !== '0x');
})();
EOF
```

### Test 2: Register Agent on Testnet

Tạo file `contracts/scripts/test-testnet.ts`:

```typescript
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  console.log("🧪 Testing Somnia Agent Kit on Testnet\n");

  // Get deployed contract addresses
  const registryAddress = process.env.AGENT_REGISTRY_ADDRESS;
  const executorAddress = process.env.AGENT_EXECUTOR_ADDRESS;

  if (!registryAddress || !executorAddress) {
    throw new Error("Contract addresses not found in .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "STT\n");

  // Connect to AgentRegistry
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = AgentRegistry.attach(registryAddress);

  console.log("📝 Registering test agent...");
  const tx = await registry.registerAgent(
    "Test Agent",
    "A test agent on Somnia Testnet",
    "QmTestHash123",
    ["testing", "demo"]
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Agent registered! Gas used:", receipt?.gasUsed.toString());

  // Get agent details
  const totalAgents = await registry.getTotalAgents();
  console.log("\n📊 Total agents registered:", totalAgents.toString());

  const agentInfo = await registry.getAgent(totalAgents);
  console.log("\n🤖 Agent Details:");
  console.log("  Name:", agentInfo.name);
  console.log("  Description:", agentInfo.description);
  console.log("  Owner:", agentInfo.owner);
  console.log("  Active:", agentInfo.isActive);
  console.log("  IPFS Hash:", agentInfo.ipfsMetadata);

  console.log("\n✨ Testnet testing completed successfully!");
  console.log("🌐 View on Explorer:");
  console.log(`   https://explorer.somnia.network/tx/${tx.hash}`);
  console.log(`   https://explorer.somnia.network/address/${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
```

**Run test:**
```bash
pnpm hardhat run scripts/test-testnet.ts --network testnet
```

---

## 📊 Monitor Deployment

### Check on Explorer

**Somnia Explorer:**
- https://explorer.somnia.network

**View Your Contracts:**
1. Registry: `https://explorer.somnia.network/address/0xYOUR_REGISTRY`
2. Executor: `https://explorer.somnia.network/address/0xYOUR_EXECUTOR`
3. Manager: `https://explorer.somnia.network/address/0xYOUR_MANAGER`
4. Vault: `https://explorer.somnia.network/address/0xYOUR_VAULT`

**View Transactions:**
- Your deployments: `https://explorer.somnia.network/address/0xYourWallet`

---

## 🐛 Troubleshooting

### Issue 1: "insufficient funds for intrinsic transaction cost"

**Problem**: Không đủ STT để deploy

**Solution**:
```bash
# Check balance
node -e "const ethers = require('ethers'); require('dotenv').config({path:'../.env'}); const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_RPC_URL); const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); (async () => { const balance = await provider.getBalance(wallet.address); console.log('Balance:', ethers.formatEther(balance), 'STT'); })();"

# Request more tokens from faucet
```

### Issue 2: "nonce too low" 

**Problem**: Nonce conflict

**Solution**:
```bash
# Reset Hardhat
pnpm hardhat clean

# Try deploy again
pnpm run deploy
```

### Issue 3: "network does not support ENS"

**Problem**: Hardhat config issue

**Solution**: Đã fix trong hardhat.config.ts, compile lại:
```bash
pnpm run compile
pnpm run deploy
```

### Issue 4: "Contract verification failed"

**Solution**:
```bash
# Make sure contract is deployed first
# Wait a few seconds after deployment
# Then verify with constructor args if needed

pnpm hardhat verify --network testnet <ADDRESS>
```

### Issue 5: "ETIMEDOUT" or connection issues

**Solution**:
```bash
# Check RPC URL
curl https://dream-rpc.somnia.network

# Try again with different network endpoint (if available)
# Or wait a few minutes and retry
```

---

## ✅ Success Checklist

Sau khi deploy thành công:

- [ ] Contracts deployed và có addresses
- [ ] Addresses saved trong `.env`
- [ ] Deployment files created in `contracts/deployments/`
- [ ] Contracts verified on Explorer (optional)
- [ ] Test registration worked
- [ ] Explorer shows contract code và transactions

---

## 📝 Next Steps After Deployment

### 1. Update SDK Configuration

SDK sẽ tự động đọc từ `.env`, nhưng double-check:

```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai
cat .env | grep ADDRESS
```

### 2. Test SDK Integration

```bash
# From root
pnpm test

# Or test SDK specifically
cd packages/agent-kit
pnpm test
```

### 3. Run Example Application

```bash
cd examples/simple-agent-demo
node index.ts
```

### 4. Start Monitoring Dashboard (Optional)

```bash
cd packages/agent-kit
pnpm run start:monitor
# Open http://localhost:3001
```

---

## 💰 Token Requirements

**Estimated Gas Costs:**
- AgentRegistry deployment: ~1.8M gas ≈ 0.002 STT
- AgentManager deployment: ~1.5M gas ≈ 0.0015 STT  
- AgentExecutor deployment: ~2M gas ≈ 0.002 STT
- AgentVault deployment: ~2M gas ≈ 0.002 STT

**Total: ~7.3M gas ≈ 0.0075 STT**

**Recommended**: Request **1-2 STT** from faucet để có đủ cho deployment + testing

---

## 🎉 Deployment Complete!

Khi hoàn thành, bạn sẽ có:
- ✅ 4 contracts deployed trên Somnia Testnet
- ✅ Contract addresses trong `.env`
- ✅ Verified contracts (optional)
- ✅ Test registration đã chạy thành công
- ✅ Explorer có thể view contracts

**Share với team:**
```
🚀 Somnia Agent Kit Deployed!

📍 Network: Somnia Dream Testnet
🔗 Chain ID: 50311

📦 Contracts:
- Registry: 0x...
- Executor: 0x...
- Manager: 0x...
- Vault: 0x...

🌐 Explorer:
https://explorer.somnia.network/address/0xYOUR_ADDRESS
```

---

**Created**: 2025-10-18
**For**: Somnia Hackathon
**Network**: Dream Testnet (50311)


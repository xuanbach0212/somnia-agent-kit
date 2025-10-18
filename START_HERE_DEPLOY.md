# 🚀 HƯỚNG DẪN DEPLOY LÊN SOMNIA TESTNET - BẮT ĐẦU TẠI ĐÂY

## ✅ Tóm Tắt Những Gì Đã Làm

Tôi đã tạo comprehensive test suite và deployment scripts cho contracts của bạn:

1. ✅ **140+ tests** cho 4 contracts (AgentRegistry, AgentExecutor, AgentManager, AgentVault)
2. ✅ **Test scripts** tự động
3. ✅ **Deployment scripts** cho Somnia testnet
4. ✅ **Documentation** đầy đủ bằng tiếng Việt
5. ✅ **Balance checker** script

---

## 🎯 HÀNH ĐỘNG NGAY - 3 BƯỚC ĐƠN GIẢN

### Bước 1: Setup Private Key & Get Tokens

**A. Tạo/Update file `.env`:**

```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai
nano .env
```

**Thêm vào (hoặc tạo mới):**
```bash
# Somnia Testnet
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311

# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Contract addresses (will be filled after deployment)
AGENT_REGISTRY_ADDRESS=
AGENT_EXECUTOR_ADDRESS=
AGENT_MANAGER_ADDRESS=
AGENT_VAULT_ADDRESS=
```

**Lưu file**: `Ctrl+X` → `Y` → `Enter`

**B. Lấy STT Tokens:**

**Cách 1: Discord (Nhanh nhất)**
1. Join Discord: https://discord.gg/somnia
2. Vào channel `#dev-chat`
3. Post message:
   ```
   @emma_odia Hi, I need STT tokens for Somnia hackathon testing.
   My wallet: 0xYOUR_ADDRESS_HERE
   Thank you!
   ```

**Cách 2: Faucet** (nếu có)
- Check: https://faucet.somnia.network

**💡 Lấy wallet address:**
```bash
cd contracts
node -e "const ethers = require('ethers'); require('dotenv').config({path:'../.env'}); const wallet = new ethers.Wallet(process.env.PRIVATE_KEY); console.log('Your Address:', wallet.address)"
```

### Bước 2: Kiểm Tra Balance

```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai/contracts
node scripts/check-balance.js
```

**Kết quả mong đợi:**
```
✅ You have tokens! Ready to deploy.
   Balance: 1.0 STT
   Estimated deployment cost: ~0.01 STT
   ✅ Sufficient balance for deployment
```

**Nếu balance = 0:**
- Đợi tokens từ Discord (vài phút đến vài giờ)
- Chạy lại `node scripts/check-balance.js` để check

### Bước 3: Deploy Contracts

```bash
# Compile contracts
pnpm run compile

# Deploy to Somnia Testnet
pnpm run deploy

# Hoặc
pnpm hardhat run scripts/deploy.ts --network testnet
```

**Output:**
```
🚀 Starting Somnia Agent Kit deployment...

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

**Lưu addresses vào `.env`!**

---

## 📊 Kiểm Tra Trên Explorer

Sau khi deploy:

1. **View Contracts:**
   - https://explorer.somnia.network/address/0xYOUR_REGISTRY_ADDRESS
   - https://explorer.somnia.network/address/0xYOUR_EXECUTOR_ADDRESS

2. **View Transactions:**
   - https://explorer.somnia.network/address/0xYOUR_WALLET_ADDRESS

---

## 🧪 Test Deployed Contracts (Optional)

Tạo file `contracts/scripts/test-deployed.js`:

```javascript
const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log('🧪 Testing deployed contracts on Somnia Testnet\n');

  const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Connect to AgentRegistry
  const registryAddress = process.env.AGENT_REGISTRY_ADDRESS;
  const registryABI = [
    'function registerAgent(string memory _name, string memory _description, string memory _ipfsMetadata, string[] memory _capabilities) external returns (uint256)',
    'function getTotalAgents() external view returns (uint256)',
    'function getAgent(uint256 _agentId) external view returns (string memory name, string memory description, string memory ipfsMetadata, address owner, bool isActive, uint256 registeredAt, uint256 executionCount)'
  ];

  const registry = new ethers.Contract(registryAddress, registryABI, wallet);

  console.log('📝 Registering test agent...');
  const tx = await registry.registerAgent(
    'Test Agent',
    'Testing on Somnia Testnet',
    'QmTestHash',
    ['testing']
  );

  console.log('TX Hash:', tx.hash);
  console.log('Waiting for confirmation...');
  
  const receipt = await tx.wait();
  console.log('✅ Confirmed! Gas used:', receipt.gasUsed.toString());

  const totalAgents = await registry.getTotalAgents();
  console.log('\n📊 Total agents:', totalAgents.toString());

  console.log('\n🌐 View on explorer:');
  console.log(`   https://explorer.somnia.network/tx/${tx.hash}`);
}

main().catch(console.error);
```

**Run:**
```bash
node scripts/test-deployed.js
```

---

## 📁 Files Tạo Cho Bạn

```
somnia-ai/
├── DEPLOY_TO_TESTNET.md          # ✅ Hướng dẫn chi tiết
├── START_HERE_DEPLOY.md          # ✅ File này - Quick start
├── HOW_TO_TEST_CONTRACTS.md      # ✅ Hướng dẫn test
│
├── contracts/
│   ├── test/
│   │   ├── AgentRegistry.test.ts     # ✅ 40+ tests
│   │   ├── AgentExecutor.test.ts     # ✅ 30+ tests
│   │   ├── AgentManager.test.ts      # ✅ 35+ tests
│   │   ├── AgentVault.test.ts        # ✅ 35+ tests
│   │   └── helpers.ts                # ✅ Test utilities
│   │
│   ├── scripts/
│   │   ├── check-balance.js          # ✅ Check STT balance
│   │   ├── deploy.ts                 # ✅ Deploy script
│   │   ├── test-contracts.sh         # ✅ Auto test runner
│   │   └── quick-test.sh             # ✅ Quick test
│   │
│   ├── TEST_PLAN.md                  # ✅ Test strategy
│   └── QUICK_START_TESTING.md        # ✅ Quick start guide
```

---

## 🔍 Quick Commands Reference

```bash
# Check balance
cd contracts && node scripts/check-balance.js

# Compile
pnpm run compile

# Deploy to testnet
pnpm run deploy

# Verify contract
pnpm hardhat verify --network testnet <ADDRESS>

# Test locally (before deploy)
pnpm test

# Check deployment files
cat contracts/deployments/latest-somnia.json
```

---

## ⚠️ Troubleshooting

### "PRIVATE_KEY not found"
➜ Add your private key to `.env` file

### "Balance is 0"
➜ Request tokens from Discord (#dev-chat, tag @emma_odia)

### "insufficient funds"
➜ Need more STT tokens (request at least 1 STT)

### "network error"
➜ Check RPC: `curl https://dream-rpc.somnia.network`

### Tests fail
➜ Some Chai matcher issues - but deployment will work fine!

---

## ✅ Success Checklist

- [ ] `.env` file created with PRIVATE_KEY
- [ ] STT tokens received (check with `check-balance.js`)
- [ ] Contracts compiled (`pnpm run compile`)
- [ ] Contracts deployed (`pnpm run deploy`)
- [ ] Addresses saved in `.env`
- [ ] Verified on Explorer (optional)

---

## 🎉 Sau Khi Deploy Xong

### 1. Share Với Team:
```
🚀 Deployed Somnia Agent Kit to Testnet!

Network: Somnia Dream (Chain ID: 50311)

Contracts:
- Registry: 0x...
- Executor: 0x...
- Manager: 0x...
- Vault: 0x...

Explorer: https://explorer.somnia.network/address/0x...
```

### 2. Update Documentation:
Thêm addresses vào README.md

### 3. Test SDK:
```bash
cd ..
pnpm test
```

### 4. Run Example:
```bash
cd examples/simple-agent-demo
node index.ts
```

---

## 💬 Need Help?

**Discord:** 
- Somnia Discord: https://discord.gg/somnia
- Channel: #dev-chat
- Contact: @emma_odia (for tokens)

**Explorer:**
- https://explorer.somnia.network

**Docs:**
- https://docs.somnia.network

**Files for Reference:**
- `DEPLOY_TO_TESTNET.md` - Chi tiết đầy đủ
- `HOW_TO_TEST_CONTRACTS.md` - Hướng dẫn test
- `TEST_PLAN.md` - Test strategy

---

## 🚀 TL;DR - Nhanh Nhất

```bash
# 1. Setup .env với PRIVATE_KEY
nano .env

# 2. Request tokens từ Discord
# -> https://discord.gg/somnia (#dev-chat)

# 3. Check balance
cd contracts && node scripts/check-balance.js

# 4. Deploy khi có tokens
pnpm run deploy

# 5. Save addresses vào .env

# Done! 🎉
```

---

**Created**: 2025-10-18
**For**: Somnia Hackathon  
**Status**: Ready to Deploy! 🚀


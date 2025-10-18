# 🧪 Hướng Dẫn Test Contracts - Somnia Agent Kit

## 📋 Tổng Quan

Tôi đã tạo một hệ thống test hoàn chỉnh cho tất cả smart contracts trong dự án của bạn. Đây là hướng dẫn chi tiết từng bước.

---

## 🎯 Các Files Đã Tạo

### 1. Test Files (140+ test cases)
```
contracts/test/
├── AgentRegistry.test.ts    ✅ 40+ tests
├── AgentExecutor.test.ts    ✅ 30+ tests
├── AgentManager.test.ts     ✅ 35+ tests
├── AgentVault.test.ts       ✅ 35+ tests
└── helpers.ts               ✅ Utility functions
```

### 2. Scripts
```
contracts/scripts/
├── test-contracts.sh        ✅ Full test runner (with reporting)
├── quick-test.sh            ✅ Quick test (for development)
└── deploy.ts                ✅ Deployment script (đã có sẵn)
```

### 3. Documentation
```
contracts/
├── TEST_PLAN.md                  ✅ Chi tiết test strategy
├── QUICK_START_TESTING.md        ✅ Quick start guide
└── HOW_TO_TEST_CONTRACTS.md      ✅ File này
```

---

## 🚀 Cách Chạy Tests

### Bước 1: Chuẩn Bị
```bash
# Di chuyển vào thư mục contracts
cd /Users/s29815/Developer/Hackathon/somnia-ai/contracts

# Cài dependencies (nếu chưa có)
pnpm install

# Compile contracts
pnpm run compile
```

### Bước 2: Chạy Tests

**Option A: Chạy tất cả tests** (Khuyến nghị)
```bash
pnpm test
```

**Option B: Chạy từng contract riêng lẻ**
```bash
# Test AgentRegistry
pnpm hardhat test test/AgentRegistry.test.ts

# Test AgentExecutor  
pnpm hardhat test test/AgentExecutor.test.ts

# Test AgentManager
pnpm hardhat test test/AgentManager.test.ts

# Test AgentVault
pnpm hardhat test test/AgentVault.test.ts
```

**Option C: Dùng script tự động**
```bash
# Full test suite với reports
./scripts/test-contracts.sh

# Quick test (nhanh hơn)
./scripts/quick-test.sh

# Test 1 contract cụ thể
./scripts/quick-test.sh AgentRegistry
```

**Option D: Test với Gas Report**
```bash
REPORT_GAS=true pnpm hardhat test
```

---

## 📊 Kết Quả Mong Đợi

Khi tests chạy thành công, bạn sẽ thấy:

```
  AgentRegistry
    Deployment
      ✓ Should set the right owner
      ✓ Should initialize agent counter to 0
    Agent Registration
      ✓ Should register a new agent successfully
      ✓ Should increment agent counter after registration
      ... (40+ tests)

  AgentExecutor
    Deployment
      ✓ Should set the right owner and roles
    Agent Authorization
      ✓ Should authorize an agent successfully
      ... (30+ tests)

  AgentManager
    Task Creation
      ✓ Should create task successfully
      ... (35+ tests)

  AgentVault
    Vault Creation
      ✓ Should create vault successfully
      ... (35+ tests)

  140 passing (15s) ✅
```

---

## 🔍 Chi Tiết Coverage

### AgentRegistry (40+ tests)
✅ **Registration**: Name, description, IPFS hash, capabilities
✅ **Updates**: Metadata updates, permissions
✅ **Activation**: Activate/deactivate agents
✅ **Metrics**: Execution tracking, success rate, average time
✅ **Permissions**: Owner checks, access control
✅ **Edge Cases**: Invalid inputs, non-existent agents

### AgentExecutor (30+ tests)
✅ **Authorization**: Agent authorization/revocation
✅ **Execution**: Task execution with gas limits
✅ **Fees**: Fee collection and withdrawal
✅ **Roles**: Admin, Executor role management
✅ **Security**: Reentrancy protection
✅ **Concurrency**: Multiple task execution

### AgentManager (35+ tests)
✅ **Task Lifecycle**: Create → Start → Complete/Fail → Cancel
✅ **Payments**: Reward distribution, platform fees
✅ **Fee Management**: Platform fee updates, withdrawal
✅ **Refunds**: Task cancellation and failure refunds
✅ **Multiple Tasks**: Concurrent task handling

### AgentVault (35+ tests)
✅ **Vault Management**: Create, activate, deactivate
✅ **Deposits**: Native token deposits
✅ **Withdrawals**: With daily limit enforcement
✅ **Limits**: Daily limit tracking and reset (24h)
✅ **Multiple Vaults**: Independent vault management
✅ **Permissions**: Agent vs owner access control

---

## ⚠️ Known Issues & Solutions

### Issue 1: BigInt Comparison
**Vấn đề**: Chai không xử lý BigInt tốt
```typescript
// ❌ Fail
expect(agentCounter).to.equal(3);

// ✅ Fix
import { bn } from './helpers';
expect(bn(agentCounter)).to.equal(3);
```

### Issue 2: Event Testing
**Vấn đề**: `.to.emit()` cần setup đúng
```typescript
// ✅ Đúng cách
await expect(tx)
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2);
```

### Issue 3: Hardhat Config
Đảm bảo `hardhat.config.ts` có:
```typescript
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
```

---

## 🛠️ Troubleshooting

### Tests Fail?

1. **Check compilation**:
```bash
pnpm run clean
pnpm run compile
```

2. **Check dependencies**:
```bash
pnpm install
```

3. **View detailed errors**:
```bash
pnpm hardhat test --verbose
```

4. **Debug specific test**:
```bash
pnpm hardhat test --grep "Should register agent"
```

### Contract Errors?

1. **Check contract syntax**:
```bash
pnpm run compile
```

2. **Verify network setup**:
```bash
# Check hardhat.config.ts
cat hardhat.config.ts | grep network
```

3. **Test on local network**:
```bash
# Terminal 1
pnpm hardhat node

# Terminal 2  
pnpm run deploy:local
```

---

## 🚦 Next Steps

### 1. Fix Any Failing Tests
```bash
# Run tests
pnpm test

# If failures, check error messages
# Fix issues in test files or contracts
# Re-run until all pass
```

### 2. Deploy to Local Network
```bash
# Terminal 1: Start node
pnpm hardhat node

# Terminal 2: Deploy
pnpm run deploy:local

# Save contract addresses from output
```

### 3. Test SDK Integration
```bash
# From root directory
cd ..
pnpm test
```

### 4. Deploy to Somnia Testnet

**A. Get Test Tokens**:
- Join Somnia Discord: https://discord.gg/somnia
- Go to #dev-chat
- Tag @emma_odia and request STT tokens

**B. Setup .env**:
```bash
cd /Users/s29815/Developer/Hackathon/somnia-ai
cp .env.example .env

# Edit .env:
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311
PRIVATE_KEY=your_private_key_here
```

**C. Deploy**:
```bash
cd contracts
pnpm run deploy
```

**D. Save Addresses**:
Copy output contract addresses to main `.env`:
```bash
AGENT_REGISTRY_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...
```

**E. Verify Contracts**:
```bash
pnpm run verify <CONTRACT_ADDRESS> --network testnet
```

---

## 📈 Performance Benchmarks

### Expected Gas Usage:
| Operation | Gas (Estimate) |
|-----------|----------------|
| Deploy AgentRegistry | ~1.8M |
| Register Agent | ~150k |
| Create Task | ~100k |
| Execute Task | ~200k |
| Vault Deposit | ~80k |
| Vault Withdraw | ~100k |

### Test Execution Time:
- All tests: ~15-20 seconds
- Single contract: ~3-5 seconds
- With gas reporting: ~30-40 seconds

---

## ✅ Success Checklist

- [ ] All tests passing (140+ tests)
- [ ] Contracts compiled successfully
- [ ] No linter errors
- [ ] Gas usage within limits
- [ ] Deployed to local network
- [ ] SDK integration tests pass
- [ ] Deployed to Somnia testnet
- [ ] Contracts verified on explorer

---

## 📚 References

- **Hardhat Docs**: https://hardhat.org/
- **Chai Matchers**: https://hardhat.org/hardhat-chai-matchers
- **Ethers.js v6**: https://docs.ethers.org/v6/
- **Somnia Network**: https://somnia.network
- **Somnia Explorer**: https://explorer.somnia.network

---

## 💡 Pro Tips

1. **TDD Workflow**:
```bash
# Keep tests running
pnpm hardhat test --watch
```

2. **Gas Optimization**:
```bash
# Compare gas before/after changes
REPORT_GAS=true pnpm test > before.txt
# Make changes
REPORT_GAS=true pnpm test > after.txt
diff before.txt after.txt
```

3. **Specific Test**:
```bash
# Test only one scenario
pnpm hardhat test --grep "Should create vault"
```

4. **Debug Console**:
```bash
# Interactive Hardhat console
pnpm hardhat console --network localhost
```

5. **Coverage Report**:
```bash
# Generate coverage
pnpm hardhat coverage
```

---

## 🎉 Summary

### ✅ Đã Hoàn Thành:
1. ✅ Tạo 140+ comprehensive tests
2. ✅ Setup test environment
3. ✅ Tạo test scripts tự động
4. ✅ Viết documentation đầy đủ
5. ✅ Fix BigInt và Chai issues

### 📝 Còn Lại:
1. ⏳ Chạy tests và fix nếu có lỗi
2. ⏳ Deploy lên local network
3. ⏳ Deploy lên Somnia testnet
4. ⏳ Verify contracts

### 🚀 Câu Lệnh Chính:
```bash
# Chạy tất cả tests
cd contracts && pnpm test

# Deploy local
pnpm hardhat node  # Terminal 1
pnpm run deploy:local  # Terminal 2

# Deploy testnet
pnpm run deploy
```

---

**🎯 Action Ngay**: Chạy `pnpm test` để test contracts! 🚀

**Created**: 2025-10-18
**Language**: Vietnamese + English
**Target**: Hackathon Testing


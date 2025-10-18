# 🧪 Somnia Agent Kit - Comprehensive Contract Testing Plan

## 📋 Testing Strategy

### Phase 1: Local Testing with Hardhat
- ✅ Unit tests for each contract
- ✅ Integration tests between contracts
- ✅ Gas optimization checks
- ✅ Security tests (reentrancy, access control)

### Phase 2: Local Network Deployment
- 🔄 Deploy to Hardhat local network
- 🔄 Test SDK integration
- 🔄 End-to-end workflow testing

### Phase 3: Somnia Testnet Deployment
- 🔄 Deploy to Somnia Dream testnet
- 🔄 Verify contracts on explorer
- 🔄 Production-like testing

---

## 🎯 Test Coverage Goals

### AgentRegistry Contract
- [x] Agent registration
- [x] Agent metadata updates
- [x] Agent activation/deactivation
- [x] Execution metrics recording
- [x] Owner permissions
- [x] Event emissions
- [x] Edge cases (invalid inputs, non-existent agents)

### AgentExecutor Contract
- [x] Agent authorization
- [x] Task execution with gas limits
- [x] Fee collection
- [x] Role-based access control
- [x] Task result handling
- [x] Security (reentrancy, unauthorized access)

### AgentManager Contract
- [x] Task creation with rewards
- [x] Task lifecycle (pending → in-progress → completed/failed)
- [x] Payment distribution
- [x] Platform fee calculation
- [x] Task cancellation and refunds
- [x] Multiple concurrent tasks

### AgentVault Contract
- [x] Vault creation and management
- [x] Native token deposits/withdrawals
- [x] ERC20 token support
- [x] Daily spending limits
- [x] Token whitelist management
- [x] Vault activation/deactivation

### Integration Tests
- [x] Complete agent lifecycle (register → execute → track metrics)
- [x] Task flow (create → assign → execute → payment)
- [x] Fund management (deposit → approve → spend)
- [x] Multi-agent scenarios

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd contracts
pnpm install
```

### 2. Compile Contracts
```bash
pnpm run compile
```

### 3. Run Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm hardhat test test/AgentRegistry.test.ts

# Run with gas reporting
pnpm hardhat test --gas-reporter

# Run with coverage
pnpm hardhat coverage
```

### 4. Deploy to Local Network
```bash
# Terminal 1: Start local node
pnpm hardhat node

# Terminal 2: Deploy contracts
pnpm run deploy:local
```

### 5. Deploy to Somnia Testnet
```bash
# Make sure .env has PRIVATE_KEY and SOMNIA_RPC_URL
pnpm run deploy
```

---

## 📊 Test Execution Order

### Step 1: Unit Tests (Individual Contract Testing)
```bash
pnpm hardhat test test/AgentRegistry.test.ts
pnpm hardhat test test/AgentExecutor.test.ts
pnpm hardhat test test/AgentManager.test.ts
pnpm hardhat test test/AgentVault.test.ts
```

### Step 2: Integration Tests
```bash
pnpm hardhat test test/Integration.test.ts
```

### Step 3: Gas Optimization Check
```bash
pnpm hardhat test --gas-reporter
```

### Step 4: Security Audit
```bash
# Run Slither (if installed)
slither .

# Check for common vulnerabilities
pnpm hardhat check
```

---

## 🔍 Test Scenarios

### Scenario 1: Basic Agent Registration & Execution
1. Deploy AgentRegistry
2. Register new agent with metadata
3. Verify agent exists on-chain
4. Record execution metrics
5. Check success rate calculations

### Scenario 2: Task Creation & Payment Flow
1. Deploy AgentManager
2. Create task with reward
3. Start task execution
4. Complete task with result
5. Verify payment distribution
6. Check platform fee collection

### Scenario 3: Agent Vault Management
1. Deploy AgentVault
2. Create vault for agent
3. Deposit native tokens
4. Deposit ERC20 tokens (with whitelist)
5. Withdraw within daily limits
6. Test limit enforcement

### Scenario 4: Full Integration
1. Register agent in registry
2. Create vault for agent
3. Deposit funds to vault
4. Create task via manager
5. Execute task via executor
6. Track metrics and payments

---

## 📝 Expected Test Results

### Success Criteria
- ✅ All unit tests pass (100%)
- ✅ Integration tests pass
- ✅ No critical security vulnerabilities
- ✅ Gas usage within acceptable limits
- ✅ Events properly emitted
- ✅ Access control working correctly

### Gas Benchmarks (Target)
- AgentRegistry deployment: < 2M gas
- Agent registration: < 150k gas
- Task creation: < 100k gas
- Task execution: < 200k gas
- Vault deposit: < 80k gas

---

## 🐛 Common Issues & Solutions

### Issue 1: "Vault does not exist"
**Solution**: Create vault before depositing funds
```typescript
await agentVault.createVault(agentAddress, ethers.parseEther("1"));
```

### Issue 2: "Agent not authorized"
**Solution**: Authorize agent in AgentExecutor first
```typescript
await agentExecutor.authorizeAgent(agentAddress);
```

### Issue 3: "Daily limit exceeded"
**Solution**: Check current limit or wait for reset
```typescript
const limitInfo = await agentVault.getDailyLimitInfo(agentAddress);
console.log("Remaining:", limitInfo.remaining);
```

### Issue 4: "Insufficient execution fee"
**Solution**: Send enough ETH with executeTask call
```typescript
await agentExecutor.executeTask(agent, data, gasLimit, {
  value: ethers.parseEther("0.001") // minimum fee
});
```

---

## 📈 Continuous Testing

### GitHub Actions CI/CD (Recommended)
```yaml
# .github/workflows/test.yml
name: Contract Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: cd contracts && pnpm install
      - name: Run tests
        run: cd contracts && pnpm test
      - name: Gas report
        run: cd contracts && pnpm test --gas-reporter
```

### Pre-commit Hook
```bash
# .husky/pre-commit
cd contracts && pnpm test
```

---

## 🔐 Security Checklist

Before deploying to mainnet:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Access control verified
- [ ] Reentrancy protection tested
- [ ] Gas optimization done
- [ ] Emergency pause mechanism tested
- [ ] Upgrade path considered
- [ ] Multi-sig admin setup
- [ ] Time-lock for critical functions
- [ ] Circuit breakers implemented

---

## 📞 Need Help?

If tests fail or you encounter issues:
1. Check the error message carefully
2. Verify contract addresses in deployment files
3. Ensure sufficient gas and ETH for transactions
4. Review the test logs in detail
5. Check Hardhat console output
6. Verify network configuration in hardhat.config.ts

---

**Last Updated**: 2025-10-18
**Test Coverage Target**: 90%+
**Maintained By**: Somnia Agent Kit Team


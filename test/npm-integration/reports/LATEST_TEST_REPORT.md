# Somnia Agent Kit - NPM Package Test Report

**Generated**: 10/21/2025, 4:48:53 PM
**Duration**: 24.65s
**Status**: ❌ FAIL

## Summary

- **Total Tests**: 72
- **Passed**: 62 ✅
- **Failed**: 10 ❌

- **Pass Rate**: 86.1%

## Test Results

### 02-Package Structure ✅ PASS

**Tests**: 6/6 passed

| Test | Status | Details |
|------|--------|----------|
| Package.json | ✅ PASS | - |
| Main Exports | ✅ PASS | - |
| TypeScript Types | ✅ PASS | - |
| CLI Binaries | ✅ PASS | - |
| LLM Adapters | ✅ PASS | - |
| Monitoring Exports | ✅ PASS | - |

### Core SDK Tests ❌ FAIL

**Tests**: 0/2 passed

| Test | Status | Details |
|------|--------|----------|
| SDK: Constructor | ❌ FAIL | AgentRegistry contract address is required |
| SDK: Partial config | ❌ FAIL | AgentRegistry contract address is required |

### Contract Tests ❌ FAIL

**Tests**: 0/1 passed

| Test | Status | Details |
|------|--------|----------|
| SDK Init | ❌ FAIL | AgentRegistry contract address is required |

### LLM Tests ✅ PASS

**Tests**: 8/8 passed

| Test | Status | Details |
|------|--------|----------|
| LLM: OllamaAdapter creation | ✅ PASS | - |
| LLM: OpenAIAdapter creation | ✅ PASS | - |
| LLM: DeepSeekAdapter creation | ✅ PASS | - |
| LLM: LLMPlanner creation | ✅ PASS | - |
| LLM: LLMPlanner with adapter | ✅ PASS | - |
| LLM: config validation | ✅ PASS | - |
| LLM: multiple adapters | ✅ PASS | - |
| LLM: Adapter flexibility | ✅ PASS | - |

### Monitoring Tests ❌ FAIL

**Tests**: 11/13 passed

| Test | Status | Details |
|------|--------|----------|
| Monitor: Logger creation | ✅ PASS | - |
| Monitor: Logger levels | ✅ PASS | - |
| Monitor: Logger data types | ✅ PASS | - |
| Monitor: Metrics creation | ✅ PASS | - |
| Monitor: Metrics LLM calls | ✅ PASS | - |
| Monitor: Metrics transactions | ✅ PASS | - |
| Monitor: Metrics histogram | ✅ PASS | - |
| Monitor: Metrics export | ✅ PASS | - |
| Monitor: Dashboard creation | ✅ PASS | - |
| Monitor: EventRecorder creation | ❌ FAIL | Cannot read properties of undefined (reading 'maxEvents') |
| Monitor: EventRecorder events | ❌ FAIL | Cannot read properties of undefined (reading 'maxEvents') |
| Monitor: Telemetry creation | ✅ PASS | - |
| Monitor: Logger + Metrics integration | ✅ PASS | - |

### Runtime Tests ✅ PASS

**Tests**: 6/6 passed

| Test | Status | Details |
|------|--------|----------|
| Runtime: Agent creation | ✅ PASS | - |
| Runtime: Agent config | ✅ PASS | - |
| Runtime: Planner creation | ✅ PASS | - |
| Runtime: Executor creation | ✅ PASS | - |
| Runtime: Planner + Executor integration | ✅ PASS | - |
| Runtime: Multiple agents | ✅ PASS | - |

### 01-Quickstart ❌ FAIL

**Tests**: 1/2 passed

| Test | Status | Details |
|------|--------|----------|
| SDK Import | ✅ PASS | - |
| SDK Initialization | ❌ FAIL | AgentRegistry contract address is required |

### 03-Monitoring ❌ FAIL

**Tests**: 3/4 passed

| Test | Status | Details |
|------|--------|----------|
| Logger Functionality | ✅ PASS | - |
| Metrics Recording | ❌ FAIL | Metrics summary incomplete |
| Dashboard Creation | ✅ PASS | - |
| Metrics Export Format | ✅ PASS | - |

### CLI Commands ✅ PASS

**Tests**: 9/9 passed

| Test | Status | Details |
|------|--------|----------|
| CLI: version | ✅ PASS | - |
| CLI: help | ✅ PASS | - |
| CLI: help agent:list | ✅ PASS | - |
| CLI: network:info | ✅ PASS | - |
| CLI: network:contracts | ✅ PASS | - |
| CLI: agent:list | ✅ PASS | - |
| CLI: agent:info | ✅ PASS | - |
| CLI: sak alias | ✅ PASS | - |
| CLI: error handling | ✅ PASS | - |

### Complete CLI Tests ❌ FAIL

**Tests**: 18/21 passed

| Test | Status | Details |
|------|--------|----------|
| CLI: init --network testnet | ✅ PASS | - |
| CLI: init --network mainnet | ✅ PASS | - |
| CLI: init --network devnet | ✅ PASS | - |
| CLI: init --rpc-url | ✅ PASS | - |
| CLI: agent:list --limit | ✅ PASS | - |
| CLI: agent:list --format json | ❌ FAIL | Unexpected token 'd', "[dotenv@17."... is not valid JSON |
| CLI: agent:info --format json | ❌ FAIL | Unexpected token 'd', "[dotenv@17."... is not valid JSON |
| CLI: agent:info invalid ID | ✅ PASS | - |
| CLI: agent:list --active | ✅ PASS | - |
| CLI: task:status error handling | ✅ PASS | - |
| CLI: task:create error handling | ✅ PASS | - |
| CLI: wallet:balance <address> | ✅ PASS | - |
| CLI: help init | ✅ PASS | - |
| CLI: help agent:register | ✅ PASS | - |
| CLI: help agent:list | ✅ PASS | - |
| CLI: help task:create | ✅ PASS | - |
| CLI: help task:status | ✅ PASS | - |
| CLI: help wallet:balance | ✅ PASS | - |
| CLI: help wallet:info | ✅ PASS | - |
| CLI: multiple flags | ❌ FAIL | Unexpected token 'd', "[dotenv@17."... is not valid JSON |
| CLI: invalid network | ✅ PASS | - |

## 📋 Feedback & Recommendations

### ⚠️ Issues Found

Please review the failed tests above and address the following:

**Core SDK Tests**:
- ❌ SDK: Constructor: AgentRegistry contract address is required
- ❌ SDK: Partial config: AgentRegistry contract address is required

**Contract Tests**:
- ❌ SDK Init: AgentRegistry contract address is required

**Monitoring Tests**:
- ❌ Monitor: EventRecorder creation: Cannot read properties of undefined (reading 'maxEvents')
- ❌ Monitor: EventRecorder events: Cannot read properties of undefined (reading 'maxEvents')

**01-Quickstart**:
- ❌ SDK Initialization: AgentRegistry contract address is required

**03-Monitoring**:
- ❌ Metrics Recording: Metrics summary incomplete

**Complete CLI Tests**:
- ❌ CLI: agent:list --format json: Unexpected token 'd', "[dotenv@17."... is not valid JSON
- ❌ CLI: agent:info --format json: Unexpected token 'd', "[dotenv@17."... is not valid JSON
- ❌ CLI: multiple flags: Unexpected token 'd', "[dotenv@17."... is not valid JSON

## 🔍 Detailed Analysis

### Package Structure
- Package exports are correctly configured
- TypeScript definitions are present
- CLI binaries are installed

### SDK Functionality
- Network connectivity: Failed ❌
- Contract interaction: Failed ❌

### CLI Functionality
- Basic commands: Working ✅
- Network commands: Working ✅
- Agent commands: Working ✅

### Monitoring
- Logger: Working ✅
- Metrics: Failed ❌
- Dashboard: Working ✅

## 🚀 Next Steps


1. Fix the failing tests identified above
2. Re-run tests to verify fixes
3. Update documentation if needed
4. Consider adding more error handling


---

**Test Framework**: Custom Integration Tests
**Package Version**: 2.1.0
**Node Version**: v24.6.0

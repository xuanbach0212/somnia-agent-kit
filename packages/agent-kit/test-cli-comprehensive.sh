#!/bin/bash

# Comprehensive CLI Testing Script
# Tests all commands in various scenarios

# Don't exit on error - we want to test error cases
# set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              CLI COMPREHENSIVE TEST - ALL SCENARIOS                        ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

passed=0
failed=0
warnings=0

# Change to package directory
cd "$(dirname "$0")"

test_command() {
  local description="$1"
  local command="$2"
  local expected_result="$3" # "pass", "fail", "warning"
  local check_pattern="$4" # Optional: pattern to check in output
  
  echo -n "  Testing: $description... "
  
  output=$(eval "$command" 2>&1) || true
  exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    if [ "$expected_result" = "pass" ]; then
      if [ -n "$check_pattern" ]; then
        if echo "$output" | grep -q "$check_pattern"; then
          echo -e "${GREEN}✅ PASS${NC}"
          ((passed++))
        else
          echo -e "${RED}❌ FAIL (pattern not found)${NC}"
          ((failed++))
        fi
      else
        echo -e "${GREEN}✅ PASS${NC}"
        ((passed++))
      fi
    else
      echo -e "${RED}❌ FAIL (expected to fail but passed)${NC}"
      ((failed++))
    fi
  else
    if [ "$expected_result" = "fail" ] || [ "$expected_result" = "warning" ]; then
      # Check if error message is helpful
      if echo "$output" | grep -q "help\|usage\|Usage"; then
        echo -e "${YELLOW}⚠️  EXPECTED FAIL (with helpful error)${NC}"
        ((warnings++))
      else
        echo -e "${YELLOW}⚠️  EXPECTED FAIL (error could be more helpful)${NC}"
        ((warnings++))
      fi
    else
      echo -e "${RED}❌ FAIL${NC}"
      echo "     Output: $output"
      ((failed++))
    fi
  fi
}

# ============================================================================
# Scenario 1: Commands that should ALWAYS work (no ENV needed)
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Scenario 1: Commands That Should Work WITHOUT ENV${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Save current ENV
OLD_RPC=$SOMNIA_RPC_URL
OLD_KEY=$PRIVATE_KEY
OLD_REGISTRY=$AGENT_REGISTRY_ADDRESS
OLD_MANAGER=$AGENT_MANAGER_ADDRESS
OLD_EXECUTOR=$AGENT_EXECUTOR_ADDRESS
OLD_VAULT=$AGENT_VAULT_ADDRESS

# Unset all ENV
unset SOMNIA_RPC_URL PRIVATE_KEY AGENT_REGISTRY_ADDRESS AGENT_MANAGER_ADDRESS AGENT_EXECUTOR_ADDRESS AGENT_VAULT_ADDRESS

test_command "General help (no args)" "node dist/cli/bin.js" "pass" "Somnia Agent Kit CLI"
test_command "General help (help command)" "node dist/cli/bin.js help" "pass" "Somnia Agent Kit CLI"
test_command "General help (-h)" "node dist/cli/bin.js -h" "pass" "Somnia Agent Kit CLI"
test_command "General help (--help)" "node dist/cli/bin.js --help" "pass" "Somnia Agent Kit CLI"
test_command "Version (version)" "node dist/cli/bin.js version" "pass" "v3.0.12"
test_command "Version (--version)" "node dist/cli/bin.js --version" "pass" "v3.0.12"
test_command "Version (-v)" "node dist/cli/bin.js -v" "pass" "v3.0.12"

echo ""
echo "  Command-specific help tests:"
test_command "Help: agent:register" "node dist/cli/bin.js help agent:register" "pass" "Register a new agent"
test_command "Help: token:balance" "node dist/cli/bin.js help token:balance" "pass" "Check token balance"
test_command "Help: deploy:contract" "node dist/cli/bin.js help deploy:contract" "pass" "Deploy smart contract"
test_command "Help: nft:owner" "node dist/cli/bin.js help nft:owner" "pass" "Get NFT owner"
test_command "Help: multicall:batch" "node dist/cli/bin.js help multicall:batch" "pass" "Execute batch calls"
test_command "Help: ipfs:upload" "node dist/cli/bin.js help ipfs:upload" "pass" "Upload file to IPFS"

echo ""
echo "  -h flag tests:"
test_command "-h: agent:register" "node dist/cli/bin.js agent:register -h" "pass" "Register a new agent"
test_command "-h: token:balance" "node dist/cli/bin.js token:balance -h" "pass" "Check token balance"
test_command "-h: wallet:info" "node dist/cli/bin.js wallet:info -h" "pass" "Show wallet information"

echo ""
echo "  --help flag tests:"
test_command "--help: deploy:verify" "node dist/cli/bin.js deploy:verify --help" "pass" "Verify contract"
test_command "--help: task:create" "node dist/cli/bin.js task:create --help" "pass" "Create a new task"
test_command "--help: network:info" "node dist/cli/bin.js network:info --help" "pass" "Show network information"

# ============================================================================
# Scenario 2: Commands that should fail gracefully without ENV
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Scenario 2: Commands That Should Fail Gracefully Without ENV${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_command "Agent list (no ENV)" "node dist/cli/bin.js agent:list" "fail"
test_command "Agent info (no ENV)" "node dist/cli/bin.js agent:info 1" "fail"
test_command "Token balance (no ENV)" "node dist/cli/bin.js token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" "fail"
test_command "Wallet info (no ENV)" "node dist/cli/bin.js wallet:info" "fail"
test_command "Network info (no ENV)" "node dist/cli/bin.js network:info" "fail"

# ============================================================================
# Scenario 3: Error handling tests
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Scenario 3: Error Handling${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_command "Unknown command" "node dist/cli/bin.js unknown:command" "fail"
test_command "Missing required arg (agent:register)" "node dist/cli/bin.js agent:register" "fail"
test_command "Missing required arg (token:balance)" "node dist/cli/bin.js token:balance" "fail"
test_command "Missing required option (nft:owner)" "node dist/cli/bin.js nft:owner 123" "fail"
test_command "Missing required option (token:approve)" "node dist/cli/bin.js token:approve 0x123 100" "fail"
test_command "File not found (deploy:contract)" "node dist/cli/bin.js deploy:contract nonexistent.txt" "fail"
test_command "File not found (multicall:batch)" "node dist/cli/bin.js multicall:batch nonexistent.json" "fail"

# ============================================================================
# Scenario 4: Test with ENV (if available)
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Scenario 4: Commands With ENV (if available)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Restore ENV
export SOMNIA_RPC_URL=$OLD_RPC
export PRIVATE_KEY=$OLD_KEY
export AGENT_REGISTRY_ADDRESS=$OLD_REGISTRY
export AGENT_MANAGER_ADDRESS=$OLD_MANAGER
export AGENT_EXECUTOR_ADDRESS=$OLD_EXECUTOR
export AGENT_VAULT_ADDRESS=$OLD_VAULT

if [ -n "$SOMNIA_RPC_URL" ]; then
  echo "  ENV variables detected. Testing with real connection..."
  test_command "Agent list (with ENV)" "node dist/cli/bin.js agent:list --limit 1" "warning"
  test_command "Network info (with ENV)" "node dist/cli/bin.js network:info" "warning"
  
  if [ -n "$PRIVATE_KEY" ]; then
    echo "  Private key detected. Testing wallet commands..."
    test_command "Wallet info (with ENV)" "node dist/cli/bin.js wallet:info" "warning"
  else
    echo "  No PRIVATE_KEY set. Skipping wallet tests."
  fi
else
  echo "  No ENV variables set. Skipping live connection tests."
  echo "  To test with real connection, set:"
  echo "    export SOMNIA_RPC_URL=https://dream-rpc.somnia.network"
  echo "    export PRIVATE_KEY=0x..."
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Passed: $passed${NC}"
echo -e "${RED}❌ Failed: $failed${NC}"
echo -e "${YELLOW}⚠️  Expected Failures: $warnings${NC}"
echo ""

total=$((passed + failed + warnings))
success_rate=$((passed * 100 / total))

echo "Success Rate: $success_rate% ($passed/$total)"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                      ✅ ALL TESTS PASSED!                                  ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                      ❌ SOME TESTS FAILED                                  ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi


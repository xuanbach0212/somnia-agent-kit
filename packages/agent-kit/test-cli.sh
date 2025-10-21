#!/bin/bash

# CLI Test Script for Somnia Agent Kit
# Run: bash test-cli.sh

echo "🧪 Testing Somnia Agent Kit CLI..."
echo ""

CLI="node dist/cli/bin.js"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_command() {
  local cmd="$1"
  local desc="$2"
  
  echo -e "${YELLOW}Testing:${NC} $desc"
  echo "Command: $CLI $cmd"
  
  if $CLI $cmd > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
  echo ""
}

# Build first
echo "📦 Building CLI..."
pnpm build > /dev/null 2>&1
echo ""

# Test basic commands
test_command "version" "Version command"
test_command "help" "Help command"
test_command "help agent:register" "Command-specific help"

# Test network commands (no auth needed)
test_command "network:info" "Network info"
test_command "network:contracts" "Contract addresses"

# Test wallet commands (may fail without config)
echo -e "${YELLOW}Testing:${NC} Wallet commands (may fail without config)"
$CLI wallet:balance 2>&1 | head -3
echo ""

# Test agent list (may fail without config)
echo -e "${YELLOW}Testing:${NC} Agent list (may fail without config)"
$CLI agent:list 2>&1 | head -3
echo ""

echo "✅ Basic CLI tests complete!"
echo ""
echo "💡 To test with real config:"
echo "   1. Run: $CLI init"
echo "   2. Then test: $CLI agent:list"


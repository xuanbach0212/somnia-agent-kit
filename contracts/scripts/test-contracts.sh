#!/bin/bash

# Somnia Agent Kit - Comprehensive Contract Testing Script
# This script runs all tests in sequence and generates reports

set -e  # Exit on error

echo "🧪 Somnia Agent Kit - Contract Testing Suite"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the contracts directory
if [ ! -f "hardhat.config.ts" ]; then
    echo -e "${RED}❌ Error: Must be run from contracts directory${NC}"
    exit 1
fi

# Step 1: Clean previous build
echo -e "${BLUE}📦 Step 1: Cleaning previous builds...${NC}"
pnpm run clean || true
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    pnpm install
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 3: Compile contracts
echo -e "${BLUE}🔨 Step 3: Compiling contracts...${NC}"
pnpm run compile
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
else
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi
echo ""

# Step 4: Run individual contract tests
echo -e "${BLUE}🧪 Step 4: Running individual contract tests...${NC}"
echo ""

echo -e "${YELLOW}Testing AgentRegistry...${NC}"
pnpm hardhat test test/AgentRegistry.test.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AgentRegistry tests passed${NC}"
else
    echo -e "${RED}❌ AgentRegistry tests failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Testing AgentExecutor...${NC}"
pnpm hardhat test test/AgentExecutor.test.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AgentExecutor tests passed${NC}"
else
    echo -e "${RED}❌ AgentExecutor tests failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Testing AgentManager...${NC}"
pnpm hardhat test test/AgentManager.test.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AgentManager tests passed${NC}"
else
    echo -e "${RED}❌ AgentManager tests failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Testing AgentVault...${NC}"
pnpm hardhat test test/AgentVault.test.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AgentVault tests passed${NC}"
else
    echo -e "${RED}❌ AgentVault tests failed${NC}"
    exit 1
fi
echo ""

# Step 5: Run all tests together
echo -e "${BLUE}🧪 Step 5: Running all tests together...${NC}"
pnpm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
echo ""

# Step 6: Gas reporting (optional)
echo -e "${BLUE}⛽ Step 6: Generating gas report...${NC}"
REPORT_GAS=true pnpm hardhat test || true
echo ""

# Step 7: Generate TypeChain types
echo -e "${BLUE}📝 Step 7: Generating TypeChain types...${NC}"
pnpm run typechain
echo -e "${GREEN}✅ TypeChain types generated${NC}"
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✨ All tests completed successfully!${NC}"
echo ""
echo "📊 Summary:"
echo "  - AgentRegistry: ✅ Passed"
echo "  - AgentExecutor: ✅ Passed"
echo "  - AgentManager: ✅ Passed"
echo "  - AgentVault: ✅ Passed"
echo ""
echo "🎯 Next steps:"
echo "  1. Deploy to local network: pnpm run deploy:local"
echo "  2. Deploy to Somnia testnet: pnpm run deploy"
echo "  3. Verify contracts: pnpm run verify"
echo ""


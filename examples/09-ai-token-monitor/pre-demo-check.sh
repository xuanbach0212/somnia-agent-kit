#!/bin/bash

# Pre-Demo Checklist Script
# Run this before your demo to ensure everything is ready

echo "🔍 Pre-Demo Checklist for AI Token Monitor"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Node.js
echo -n "1. Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Install Node.js: https://nodejs.org"
    exit 1
fi

# Check 2: npm
echo -n "2. Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check 3: Dependencies
echo -n "3. Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "   Running npm install..."
    npm install
fi

# Check 4: Ollama
echo -n "4. Checking Ollama... "
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Install: brew install ollama"
    exit 1
fi

# Check 5: Ollama running
echo -n "5. Checking Ollama service... "
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running"
else
    echo -e "${YELLOW}⚠${NC} Not running"
    echo "   Starting Ollama..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} Ollama started"
    else
        echo -e "   ${RED}✗${NC} Failed to start Ollama"
        exit 1
    fi
fi

# Check 6: Llama 3.2 model
echo -n "6. Checking Llama 3.2 model... "
if ollama list | grep -q "llama3.2"; then
    echo -e "${GREEN}✓${NC} Available"
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "   Pulling llama3.2 model (this may take a few minutes)..."
    ollama pull llama3.2
fi

# Check 7: .env file
echo -n "7. Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check for required variables
    if grep -q "PRIVATE_KEY=" .env && grep -q "AGENT_REGISTRY_ADDRESS=" .env; then
        echo -e "   ${GREEN}✓${NC} Configuration looks good"
    else
        echo -e "   ${YELLOW}⚠${NC} Missing some variables"
    fi
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "   Copying from root..."
    if [ -f "../../.env" ]; then
        cp ../../.env .env
        echo -e "   ${GREEN}✓${NC} .env copied"
    else
        echo -e "   ${RED}✗${NC} No .env file found in root either"
        exit 1
    fi
fi

# Check 8: Agent Kit build
echo -n "8. Checking Agent Kit build... "
if [ -f "../../packages/agent-kit/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} Built"
else
    echo -e "${YELLOW}⚠${NC} Not built"
    echo "   Building Agent Kit..."
    cd ../../packages/agent-kit && npm run build && cd ../../examples/09-ai-token-monitor
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "🚀 Ready to run demo:"
echo "   npm run demo"
echo ""
echo "📋 Demo will:"
echo "   1. Deploy token (~2 sec)"
echo "   2. Monitor 3 transfers (~30 sec)"
echo "   3. Show AI analysis for each"
echo ""
echo "⏱️  Total time: ~35 seconds"
echo ""


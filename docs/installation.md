# 📦 Installation Guide

Complete guide to installing and setting up Somnia Agent Kit.

## 📋 Prerequisites

Before installing, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm**, **pnpm**, or **yarn** package manager
- ✅ **Git** for cloning repositories
- ✅ **Code editor** (VS Code recommended)

### Check Your Environment

```bash
# Check Node.js version
node --version
# Should be v18.0.0 or higher

# Check npm version
npm --version

# Check Git
git --version
```

## 🚀 Installation Methods

### Method 1: NPM Package (Recommended)

Install the published package from npm:

```bash
# Using npm
npm install somnia-agent-kit

# Using pnpm (recommended - faster)
pnpm add somnia-agent-kit

# Using yarn
yarn add somnia-agent-kit
```

### Method 2: From Source

Clone and build from the repository:

```bash
# Clone the repository
git clone https://github.com/xuanbach0212/somnia-agent-kit.git
cd somnia-agent-kit

# Install dependencies (uses pnpm workspace)
pnpm install

# Build the package
pnpm build

# Link locally (optional)
cd packages/agent-kit
npm link
```

## ⚙️ Environment Setup

### Step 1: Create Environment File

Create a `.env` file in your project root:

```bash
# Create .env file
touch .env
```

### Step 2: Configure Environment Variables

Add the following to your `.env` file:

```bash
# ============================================
# Blockchain Configuration
# ============================================
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# ============================================
# Smart Contract Addresses (Somnia Testnet)
# ============================================
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# ============================================
# LLM Provider Configuration (Choose One)
# ============================================

# OpenAI (GPT-4, GPT-3.5)
OPENAI_API_KEY=sk-...

# DeepSeek (Alternative to OpenAI)
DEEPSEEK_API_KEY=sk-...

# Ollama (FREE Local AI - No API key needed)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# ============================================
# Monitoring (Optional)
# ============================================
MONITORING_ENABLED=true
MONITORING_PORT=3001
LOG_LEVEL=info
```

{% hint style="warning" %}
**Security Best Practices:**
- Never commit `.env` to Git
- Add `.env` to your `.gitignore`
- Use different keys for development and production
- Rotate keys regularly
{% endhint %}

### Step 3: Get Testnet Tokens

You need testnet tokens to interact with smart contracts:

1. **Get a Wallet Address**
   ```bash
   # Your wallet address from private key
   # Use MetaMask or generate with ethers.js
   ```

2. **Visit Somnia Faucet**
   - URL: https://faucet.somnia.network
   - Enter your wallet address
   - Request testnet tokens
   - Wait for confirmation

3. **Verify Balance**
   ```typescript
   import { ethers } from 'ethers';
   
   const provider = new ethers.JsonRpcProvider(
     'https://dream-rpc.somnia.network'
   );
   
   const balance = await provider.getBalance('YOUR_ADDRESS');
   console.log('Balance:', ethers.formatEther(balance), 'STM');
   ```

## 🧠 LLM Setup

### Option 1: Ollama (FREE - Recommended for Development)

**Install Ollama:**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

**Start Ollama:**

```bash
# Start the service
ollama serve

# In another terminal, pull a model
ollama pull llama3.2

# Test it
ollama run llama3.2 "Hello!"
```

**Verify Installation:**

```bash
# Check available models
ollama list

# Test API
curl http://localhost:11434/api/tags
```

### Option 2: OpenAI

**Get API Key:**

1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy and add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

**Test API Key:**

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Option 3: DeepSeek

**Get API Key:**

1. Visit https://platform.deepseek.com
2. Sign up and get API key
3. Add to `.env`:
   ```bash
   DEEPSEEK_API_KEY=sk-...
   ```

## ✅ Verify Installation

Create a test file `test-install.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import 'dotenv/config';

async function testInstallation() {
  try {
    console.log('🧪 Testing Somnia Agent Kit installation...\n');

    // Test 1: SDK Import
    console.log('✅ SDK imported successfully');

    // Test 2: Configuration
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentManager: process.env.AGENT_MANAGER_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
        agentVault: process.env.AGENT_VAULT_ADDRESS!,
      },
    });
    console.log('✅ SDK configured successfully');

    // Test 3: Network Connection
    await kit.initialize();
    console.log('✅ Connected to Somnia network');

    // Test 4: Contract Interaction
    const agentCount = await kit.contracts.registry.agentCount();
    console.log(`✅ Contract interaction working (${agentCount} agents registered)`);

    // Test 5: Network Info
    const networkInfo = kit.getNetworkInfo();
    console.log('✅ Network info:', networkInfo);

    console.log('\n🎉 Installation verified successfully!');
    console.log('\n📚 Next steps:');
    console.log('   - Read the Quick Start guide: docs/quickstart.md');
    console.log('   - Try examples: examples/');
    console.log('   - Join Discord: https://discord.gg/somnia');

  } catch (error) {
    console.error('\n❌ Installation test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file');
    console.log('   2. Verify contract addresses');
    console.log('   3. Ensure you have testnet tokens');
    console.log('   4. Check network connectivity');
    process.exit(1);
  }
}

testInstallation();
```

**Run the test:**

```bash
# Install TypeScript tools
npm install -D typescript ts-node @types/node

# Run test
npx ts-node test-install.ts
```

**Expected Output:**

```
🧪 Testing Somnia Agent Kit installation...

✅ SDK imported successfully
✅ SDK configured successfully
✅ Connected to Somnia network
✅ Contract interaction working (5 agents registered)
✅ Network info: {
  name: 'Somnia Dream Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network',
  chainId: 50312
}

🎉 Installation verified successfully!

📚 Next steps:
   - Read the Quick Start guide: docs/quickstart.md
   - Try examples: examples/
   - Join Discord: https://discord.gg/somnia
```

## 📦 Additional Dependencies

### TypeScript Project Setup

If starting a new TypeScript project:

```bash
# Initialize project
npm init -y

# Install TypeScript
npm install -D typescript @types/node

# Create tsconfig.json
npx tsc --init
```

**Recommended `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Development Tools

```bash
# Linting
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Formatting
npm install -D prettier

# Testing
npm install -D vitest

# Environment variables
npm install dotenv
```

## 🐳 Docker Setup (Optional)

If you prefer Docker:

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm build

CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  agent:
    build: .
    env_file: .env
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama-data:
```

**Run with Docker:**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔧 Troubleshooting

### Issue: Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

```bash
# Install type definitions
npm install -D @types/node

# Rebuild
npm run build
```

### Issue: Network Connection Failed

```bash
# Test RPC endpoint
curl https://dream-rpc.somnia.network

# Try alternative RPC (if available)
SOMNIA_RPC_URL=https://alt-rpc.somnia.network
```

### Issue: Contract Not Found

```bash
# Verify contract addresses
# Check: https://explorer.somnia.network

# Ensure using testnet addresses
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
```

### Issue: Insufficient Funds

```bash
# Get testnet tokens
# Visit: https://faucet.somnia.network

# Check balance
npx ts-node -e "
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
provider.getBalance('YOUR_ADDRESS').then(b => console.log(ethers.formatEther(b)));
"
```

## 📚 Next Steps

Now that you have Somnia Agent Kit installed:

1. **📖 Read the Quick Start** - [quickstart.md](./quickstart.md)
2. **🏗️ Understand Architecture** - [architecture.md](./architecture.md)
3. **💡 Try Examples** - [examples/](../examples/)
4. **📊 Setup Monitoring** - [examples/monitoring.md](./examples/monitoring.md)
5. **🚀 Deploy to Production** - [deployment/production.md](./deployment/production.md)

## 🆘 Get Help

If you encounter issues:

- 📖 **Documentation**: https://github.com/xuanbach0212/somnia-agent-kit/tree/main/docs
- 🐛 **GitHub Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues
- 💬 **Discord**: https://discord.gg/somnia
- 📧 **Email**: support@somnia.network

## 🎓 Learning Resources

- **Examples**: https://github.com/xuanbach0212/somnia-agent-kit/tree/main/examples
- **API Reference**: https://github.com/xuanbach0212/somnia-agent-kit/blob/main/API_REFERENCE.md
- **Video Tutorials**: Coming soon
- **Blog Posts**: Coming soon

---

**Installation complete!** 🎉 Ready to build your first AI agent? → [Quick Start Guide](./quickstart.md)

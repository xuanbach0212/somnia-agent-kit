# 📦 Installation

## Prerequisites

Before installing Somnia AI, ensure you have:

- **Node.js**: v16 or higher
- **npm** or **pnpm**: Latest version
- **Git**: For cloning the repository

## Installation Methods

### Method 1: NPM Package (Recommended)

```bash
npm install @somnia/agent-sdk
```

Or with pnpm:

```bash
pnpm add @somnia/agent-sdk
```

### Method 2: From Source

```bash
# Clone the repository
git clone https://github.com/your-repo/somnia-ai.git
cd somnia-ai

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Environment Setup

Create a `.env` file in your project root:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://your-rpc-endpoint

# LLM Provider Keys (choose one or more)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key

# Contract Addresses (if using deployed contracts)
AGENT_REGISTRY_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...

# Monitoring (optional)
MONITORING_PORT=3001
```

## Verify Installation

Create a test file `test-install.ts`:

```typescript
import { SomniaAgentSDK } from '@somnia/agent-sdk';

console.log('✅ Somnia AI SDK installed successfully!');
console.log('SDK version:', require('@somnia/agent-sdk/package.json').version);
```

Run it:

```bash
npx ts-node test-install.ts
```

## Smart Contract Deployment

If you need to deploy your own contracts:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network testnet
```

## Troubleshooting

### Common Issues

**Issue: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript errors**
```bash
# Ensure TypeScript is installed
npm install -D typescript @types/node
```

**Issue: Contract deployment fails**
```bash
# Check your RPC URL and private key
# Ensure you have enough gas tokens
```

## Next Steps

- 📖 Follow the [Quick Start Guide](quickstart.md)
- 🏗️ Learn about the [Architecture](architecture.md)
- 💡 Explore [Examples](../examples/README.md)

## Getting Help

- 📚 [API Reference](../API_REFERENCE.md)
- 🐛 [Report Issues](https://github.com/your-repo/somnia-ai/issues)
- 💬 [Join Discord](https://discord.gg/somnia-ai)


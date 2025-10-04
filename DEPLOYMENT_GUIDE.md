# Deployment Guide - Somnia AI Agent Framework

This guide will walk you through deploying your AI agent framework to the Somnia Testnet.

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **Somnia Test Tokens (STT)**: Required for contract deployment
3. **Wallet**: MetaMask or any Web3 wallet with private key

## Step 1: Get Somnia Test Tokens

### Option A: Discord
1. Join the [Somnia Discord](https://discord.gg/somnia)
2. Go to the #dev-chat channel
3. Tag @emma_odia and request test tokens
4. Provide your wallet address

### Option B: Email
Send an email to [email protected] with:
- Your wallet address
- Brief description of your project
- Your GitHub profile

## Step 2: Setup Environment

1. **Clone and install dependencies**:
```bash
cd somnia-ai
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

3. **Edit `.env` file**:
```bash
# Required
PRIVATE_KEY=your_wallet_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311

# Optional (for AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **Important**: Never commit your `.env` file or share your private key!

## Step 3: Deploy Smart Contracts

1. **Build the project**:
```bash
npm run build
```

2. **Deploy contracts to Somnia Testnet**:
```bash
npm run deploy:contracts
```

Expected output:
```
🚀 Deploying Somnia AI Agent Framework contracts...

Deploying contracts with account: 0x...
Account balance: 10.0 STT

📝 Deploying AgentRegistry...
✅ AgentRegistry deployed to: 0x...

📝 Deploying AgentManager...
✅ AgentManager deployed to: 0x...

🔗 Linking contracts...
✅ Contracts linked successfully

📄 Deployment info saved to: deployments/deployment-1234567890.json

✨ Deployment complete!
```

3. **Verify deployment**:
- Contract addresses are automatically saved to:
  - `.env` file
  - `deployments/latest.json`

## Step 4: Verify Contracts (Optional but Recommended)

Verify your contracts on the Somnia Explorer:

```bash
# Verify AgentRegistry
npx hardhat verify --network somnia <AGENT_REGISTRY_ADDRESS>

# Verify AgentManager
npx hardhat verify --network somnia <AGENT_MANAGER_ADDRESS>
```

## Step 5: Test Your Deployment

1. **Run a simple agent example**:
```bash
ts-node examples/simple-agent.ts
```

Expected output:
```
🤖 Creating a simple AI agent...
✅ Agent created with ID: 1
🧪 Testing agent execution...
Test result: { success: true, result: { answer: 15 } }
```

2. **Start monitoring server**:
```bash
npm run start:monitor
```

The server should start on http://localhost:3001

## Step 6: Create Your First Agent

Create a new file `my-agent.ts`:

```typescript
import { SomniaAgentSDK, AgentBuilder } from './src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const sdk = new SomniaAgentSDK({
    rpcUrl: process.env.SOMNIA_RPC_URL!,
    chainId: Number(process.env.SOMNIA_CHAIN_ID),
    privateKey: process.env.PRIVATE_KEY!,
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS!,
  });

  const agent = await AgentBuilder.quick(
    'My Custom Agent',
    'Description of what my agent does',
    {
      execute: async (input: any) => {
        // Your agent logic here
        console.log('Processing:', input);
        return {
          success: true,
          result: { message: 'Task completed!' }
        };
      }
    }
  )
    .addCapability('custom-capability')
    .connectSDK(sdk)
    .build();

  console.log('Agent ID:', agent.getAgentId());

  // Test execution
  const result = await agent.execute({ test: 'data' });
  console.log('Result:', result);
}

main().catch(console.error);
```

Run it:
```bash
ts-node my-agent.ts
```

## Deployment Checklist

- [ ] Obtained STT test tokens
- [ ] Configured `.env` file with private key
- [ ] Deployed AgentRegistry contract
- [ ] Deployed AgentManager contract
- [ ] Contracts linked successfully
- [ ] Contract addresses saved to `.env`
- [ ] Verified contracts on explorer (optional)
- [ ] Tested with example agent
- [ ] Monitoring server running
- [ ] Created custom agent

## Troubleshooting

### Issue: Insufficient funds
**Solution**: Request more STT tokens from Discord or email

### Issue: Contract deployment fails
**Solutions**:
- Check your private key is correct
- Ensure you have enough STT for gas
- Verify RPC URL is correct: `https://dream-rpc.somnia.network`

### Issue: TypeScript errors
**Solution**: 
```bash
npm install
npm run build
```

### Issue: Can't connect to Somnia network
**Solution**:
- Check RPC URL in `.env`
- Verify network is up: https://docs.somnia.network/
- Try alternative RPC endpoints if available

### Issue: Contract addresses not in .env
**Solution**: 
- Check `deployments/latest.json` for addresses
- Manually copy addresses to `.env`:
```bash
AGENT_REGISTRY_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...
```

## Network Information

**Somnia Testnet Details**:
- Network Name: Somnia Testnet
- RPC URL: https://dream-rpc.somnia.network
- Chain ID: 50311
- Currency Symbol: STT
- Block Explorer: https://explorer.somnia.network

## Next Steps

1. **Build your agents**: Create agents with custom logic
2. **Monitor performance**: Use the monitoring dashboard
3. **Scale**: Deploy multiple agents
4. **Integrate AI**: Add OpenAI or other AI models
5. **Create dApp**: Build a frontend for your agents

## Resources

- **Somnia Docs**: https://docs.somnia.network/developer/infrastructure-dev-tools
- **Example Code**: Check the `examples/` directory
- **Discord Support**: https://discord.gg/somnia
- **GitHub Issues**: Create an issue for bugs or questions

## Security Notes

⚠️ **Important Security Practices**:

1. **Never commit private keys**
2. **Use environment variables** for sensitive data
3. **Keep `.env` in `.gitignore`**
4. **For production**: Use hardware wallets or key management systems
5. **Test thoroughly** on testnet before mainnet deployment

## Hackathon Submission

For the Somnia Hackathon, ensure you have:

✅ Public GitHub repository  
✅ Minimum 2 commits  
✅ Detailed README  
✅ Open-source license (MIT)  
✅ Working dApp deployed on Somnia Testnet  
✅ Contract addresses documented  
✅ Architecture diagram  

---

Good luck with your deployment! 🚀


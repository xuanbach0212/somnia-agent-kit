# Quick Start Guide - 5 Minutes to Your First AI Agent

Get your first AI agent running on Somnia in just 5 minutes!

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Get Test Tokens (1 min)

Join [Somnia Discord](https://discord.gg/somnia), go to #dev-chat, and request STT tokens:
```
@emma_odia Can I get some test tokens for address 0xYourAddress?
I'm building an AI agent framework for the hackathon.
```

## 3. Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env`:
```bash
PRIVATE_KEY=your_private_key_here
```

## 4. Deploy Contracts (1 min)

```bash
npm run build
npm run deploy:contracts
```

You'll see:
```
✅ AgentRegistry deployed to: 0x...
✅ AgentManager deployed to: 0x...
```

## 5. Create Your First Agent (1 min)

```bash
ts-node examples/simple-agent.ts
```

You'll see:
```
🤖 Creating a simple AI agent...
✅ Agent created with ID: 1
🧪 Testing agent execution...
Test result: { success: true, result: { answer: 15 } }
```

## 🎉 Congratulations!

You've successfully:
- ✅ Deployed smart contracts to Somnia Testnet
- ✅ Created and registered an AI agent
- ✅ Executed your first agent task

## Next Steps

### Start Monitoring
```bash
npm run start:monitor
```
Visit http://localhost:3001/health

### Try AI Integration
```bash
# Add OpenAI key to .env
OPENAI_API_KEY=sk-...

# Run AI agent
ts-node examples/ai-agent-with-openai.ts
```

### Build Your Own Agent

Create `my-custom-agent.ts`:
```typescript
import { SomniaAgentSDK, AgentBuilder } from './src';

const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL!,
  privateKey: process.env.PRIVATE_KEY!,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS!,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS!,
});

const agent = await AgentBuilder.quick(
  'My Agent',
  'Does something cool',
  {
    execute: async (input) => {
      // Your logic here
      return { success: true, result: 'Done!' };
    }
  }
)
  .connectSDK(sdk)
  .build();
```

## Troubleshooting

**No test tokens?** → Email [email protected]  
**Deployment fails?** → Check PRIVATE_KEY in .env  
**TypeScript errors?** → Run `npm install` again  

## Resources

- 📖 [Full README](README.md)
- 🏗️ [Architecture](ARCHITECTURE.md)
- 🚀 [Deployment Guide](DEPLOYMENT_GUIDE.md)
- 💬 [Discord Support](https://discord.gg/somnia)

---

Happy building! 🚀


# ❓ Frequently Asked Questions (FAQ)

Common questions and answers about Somnia AI Agent Kit.

## 🚀 Getting Started

### Q: What is Somnia AI?

**A:** Somnia AI is a comprehensive platform for building, deploying, and managing AI agents on the blockchain. It combines AI capabilities (via OpenAI, Anthropic, etc.) with blockchain technology (smart contracts, on-chain registry) to create decentralized, autonomous AI agents.

### Q: Do I need blockchain experience to use Somnia AI?

**A:** Not necessarily! While understanding blockchain basics helps, our SDK abstracts away most of the complexity. If you can write TypeScript/JavaScript, you can build AI agents with Somnia.

### Q: What programming languages are supported?

**A:** Currently, we support **TypeScript** and **JavaScript**. Support for Python, Go, and Rust is planned for future releases.

### Q: Is Somnia AI free to use?

**A:** The SDK is open-source and free to use. However, you'll need to pay for:
- Gas fees on the blockchain (very low on Somnia)
- LLM API costs (OpenAI, Anthropic, etc.)
- Optional: IPFS pinning services

## 🤖 AI & LLM

### Q: Which AI models are supported?

**A:** We support:
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3 Opus, Sonnet, Haiku
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder
- **Ollama**: Any local model (Llama, Mistral, etc.)
- **Custom**: Bring your own LLM provider

### Q: Where does the AI run? On-chain or off-chain?

**A:** AI inference runs **off-chain** (client-side or via API). The blockchain stores:
- Agent metadata and configuration
- Execution results
- Transaction history
- Agent registry

This keeps costs low while maintaining decentralization. See [LLM Architecture](./LLM_ARCHITECTURE.md) for details.

### Q: Can I use local AI models (no API keys)?

**A:** Yes! Use Ollama to run models locally:

```typescript
import { OllamaAdapter } from '@somnia/agent-kit/llm';

const llm = new OllamaAdapter({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
});
```

### Q: How much do LLM API calls cost?

**A:** Costs vary by provider:
- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **GPT-3.5**: ~$0.001 per 1K tokens
- **Claude 3**: ~$0.015 per 1K tokens
- **Ollama (local)**: Free (but requires local compute)

Use our monitoring tools to track costs in real-time.

### Q: Can I switch between different AI models?

**A:** Yes! You can:
1. Switch models for different agents
2. Change models at runtime
3. Use different models for different tasks
4. Fallback to cheaper models when needed

```typescript
const gpt4 = new OpenAIAdapter({ model: 'gpt-4' });
const gpt35 = new OpenAIAdapter({ model: 'gpt-3.5-turbo' });

// Use GPT-4 for complex tasks
const complexResponse = await gpt4.generate({ ... });

// Use GPT-3.5 for simple tasks
const simpleResponse = await gpt35.generate({ ... });
```

## ⛓️ Blockchain & Smart Contracts

### Q: Which blockchains are supported?

**A:** Currently:
- **Somnia Testnet** (recommended)
- **Somnia Mainnet** (coming soon)
- Any **EVM-compatible chain** (with custom deployment)

### Q: How much do transactions cost?

**A:** On Somnia:
- **Agent registration**: ~0.001 STM (~$0.001)
- **Task execution**: ~0.0001 STM (~$0.0001)
- **Vault operations**: ~0.0002 STM (~$0.0002)

Somnia is optimized for high-throughput, low-cost transactions.

### Q: Do I need to deploy smart contracts myself?

**A:** No! We provide pre-deployed contracts on Somnia Testnet and Mainnet. Just use the contract addresses from our docs.

If you want to deploy on a custom network:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network your-network
```

### Q: Can I modify the smart contracts?

**A:** Yes! The contracts are open-source. You can:
1. Fork the repository
2. Modify contracts
3. Deploy your own version
4. Point the SDK to your contracts

### Q: What happens if a transaction fails?

**A:** The SDK handles failures gracefully:
- Automatic retry with exponential backoff
- Clear error messages
- Transaction receipts for debugging
- No funds lost (failed transactions are reverted)

### Q: How do I get testnet tokens?

**A:** Visit the [Somnia Faucet](https://faucet.somnia.network):
1. Enter your wallet address
2. Complete captcha
3. Receive testnet STM tokens
4. Start building!

## 💰 Agent Vault & Funds

### Q: What is an Agent Vault?

**A:** An Agent Vault is a smart contract that:
- Stores funds for your agent
- Enforces daily spending limits
- Supports multiple tokens (native + ERC20)
- Provides secure withdrawals

Think of it as a bank account for your AI agent.

### Q: Why do I need a vault?

**A:** Vaults provide:
- **Security**: Funds are locked in a smart contract
- **Control**: Only you can withdraw
- **Limits**: Prevent agents from overspending
- **Transparency**: All transactions are on-chain

### Q: How do daily limits work?

**A:** Daily limits reset every 24 hours:
- Set a limit when creating the vault
- Agent can spend up to the limit per day
- Limit resets automatically
- Owner can adjust limits anytime

```typescript
// Create vault with 1 STM daily limit
await vault.createVault(agentId, ethers.utils.parseEther('1.0'));

// Agent can spend up to 1 STM per day
// After 24 hours, limit resets
```

### Q: Can I use stablecoins (USDC, USDT)?

**A:** Yes! Enable ERC20 tokens:

```typescript
// Allow USDC
await vault.allowToken(agentId, usdcAddress);

// Deposit USDC
await vault.depositToken(agentId, usdcAddress, amount);
```

### Q: What if my agent runs out of funds?

**A:** The agent will:
1. Fail to execute tasks
2. Emit an error event
3. Wait for you to deposit more funds

Set up monitoring to get alerts when funds are low.

## 🔒 Security & Privacy

### Q: Is my private key safe?

**A:** Your private key:
- **Never leaves your machine** (unless you deploy to a server)
- **Never sent to our servers**
- **Never stored in smart contracts**
- **Should be in `.env` file** (never commit to Git!)

Best practices:
- Use environment variables
- Use hardware wallets for production
- Rotate keys regularly
- Use separate keys for testing

### Q: Can others see my agent's prompts?

**A:** It depends:
- **LLM prompts**: Sent to LLM provider (OpenAI, etc.) - they may log them
- **Blockchain data**: Public and visible to everyone
- **IPFS metadata**: Public if not encrypted

For privacy:
- Use local models (Ollama)
- Encrypt sensitive data
- Use private IPFS nodes

### Q: How do I secure my agent in production?

**A:** Follow these best practices:
1. Use environment variables for secrets
2. Enable rate limiting
3. Set up monitoring and alerts
4. Use daily spending limits
5. Implement access controls
6. Regular security audits
7. Keep dependencies updated

See [Security Best Practices](./security/best-practices.md) for details.

### Q: Can my agent be hacked?

**A:** Potential risks:
- **Private key theft**: Use hardware wallets
- **Smart contract bugs**: We've audited our contracts
- **LLM prompt injection**: Validate inputs
- **Excessive spending**: Use vault limits

We follow security best practices, but you should too!

## 🛠️ Development & Debugging

### Q: How do I debug my agent?

**A:** Several approaches:
1. **Console logging**: Use `console.log()` liberally
2. **Monitoring**: Use our monitoring tools
3. **Transaction explorer**: View transactions on block explorer
4. **Error handling**: Wrap code in try-catch
5. **Test mode**: Use testnet before mainnet

```typescript
try {
  const result = await agent.execute(task);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error);
  console.error('Stack:', error.stack);
}
```

### Q: How do I test without spending real money?

**A:** Use testnet:
1. Deploy to Somnia Testnet
2. Use testnet tokens (free from faucet)
3. Use free LLM models or Ollama
4. Test thoroughly before mainnet

### Q: Can I run agents locally for development?

**A:** Yes! Perfect for development:

```bash
# Run local blockchain
npx hardhat node

# Deploy contracts locally
npx hardhat run scripts/deploy.ts --network localhost

# Run Ollama locally
ollama run llama2

# Develop your agent
npx ts-node my-agent.ts
```

### Q: How do I handle errors gracefully?

**A:** Implement proper error handling:

```typescript
async function safeExecute(agent, task) {
  try {
    return await agent.execute(task);
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Out of funds!');
      // Alert admin, pause agent, etc.
    } else if (error.code === 'RATE_LIMIT') {
      console.error('Rate limited, retrying...');
      await sleep(60000);
      return await safeExecute(agent, task);
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

## 📊 Monitoring & Analytics

### Q: How do I monitor my agent in production?

**A:** Use our monitoring tools:

```typescript
import { AgentMonitor } from '@somnia/agent-kit/monitoring';

const monitor = new AgentMonitor(agentId);

// Track metrics
await monitor.recordMetric('requests', 1);
await monitor.recordMetric('response_time', 150);

// Set up alerts
monitor.on('high_error_rate', (data) => {
  console.error('Alert:', data);
});
```

See [Monitoring Demo](./examples/monitoring.md) for full example.

### Q: Can I export metrics to external services?

**A:** Yes! We support:
- **Prometheus**: `/metrics` endpoint
- **Grafana**: Import our dashboards
- **DataDog**: Custom integration
- **CloudWatch**: AWS integration
- **Custom**: Export via API

### Q: How do I track LLM costs?

**A:** Our monitoring automatically tracks:
- Token usage (prompt + completion)
- Estimated costs per request
- Total costs over time
- Cost per agent/user

View in the dashboard or export to your analytics platform.

## 🚀 Deployment & Production

### Q: How do I deploy to production?

**A:** Follow our deployment guide:
1. Test thoroughly on testnet
2. Deploy to mainnet
3. Set up monitoring
4. Configure alerts
5. Use PM2 or Docker for reliability

See [Deployment Guide](./deployment/production.md).

### Q: Can I run multiple agents on one server?

**A:** Yes! You can:
- Run multiple agent instances
- Use different wallets for each
- Share the same SDK instance
- Load balance across agents

```typescript
const agents = await Promise.all([
  createAgent({ name: 'Agent 1', privateKey: key1 }),
  createAgent({ name: 'Agent 2', privateKey: key2 }),
  createAgent({ name: 'Agent 3', privateKey: key3 }),
]);
```

### Q: What are the system requirements?

**A:** Minimum:
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB
- **Network**: Stable internet connection

Recommended for production:
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: High bandwidth, low latency

### Q: How do I scale my agents?

**A:** Scaling strategies:
1. **Vertical**: Increase server resources
2. **Horizontal**: Run multiple instances
3. **Load balancing**: Distribute requests
4. **Caching**: Cache frequent responses
5. **Async processing**: Use queues for tasks

## 💡 Use Cases & Examples

### Q: What can I build with Somnia AI?

**A:** Popular use cases:
- **Chatbots**: Customer support, Q&A
- **Trading bots**: Automated trading strategies
- **Content generation**: Articles, social media
- **Data analysis**: Process and analyze data
- **Gaming NPCs**: Intelligent game characters
- **Personal assistants**: Task automation
- **Research agents**: Information gathering

### Q: Where can I find examples?

**A:** Check out our examples:
- [Simple Agent Demo](./examples/simple-agent.md)
- [On-chain Chatbot](./examples/onchain-chatbot.md)
- [Monitoring Demo](./examples/monitoring.md)
- [Vault Demo](./examples/vault.md)
- [More examples](../examples/)

### Q: Can I monetize my agents?

**A:** Yes! Several approaches:
1. **Pay-per-use**: Charge users per request
2. **Subscriptions**: Monthly/yearly access
3. **Token gating**: Require token ownership
4. **Revenue sharing**: Split fees with users
5. **NFT agents**: Sell agents as NFTs

## 🆘 Troubleshooting

### Q: "Module not found" error

**A:** Install dependencies:

```bash
npm install @somnia/agent-kit ethers dotenv
```

### Q: "Insufficient funds" error

**A:** You need more tokens:
- Get testnet tokens from faucet
- Check your wallet balance
- Ensure you're on the right network

### Q: "Contract not deployed" error

**A:** Check contract addresses:
- Verify addresses in `.env`
- Ensure you're on the correct network
- Use our pre-deployed contracts

### Q: "LLM API key invalid" error

**A:** Check your API key:
- Verify key format (starts with `sk-`)
- Ensure key is active
- Check API quota/limits
- Try regenerating the key

### Q: "Transaction failed" error

**A:** Common causes:
- Insufficient gas
- Contract reverted (check error message)
- Network congestion
- Invalid parameters

View transaction on block explorer for details.

## 📚 Resources

### Q: Where can I get help?

**A:** Multiple channels:
- **Documentation**: You're reading it!
- **Discord**: [Join our community](https://discord.gg/somnia-ai)
- **GitHub Issues**: [Report bugs](https://github.com/your-repo/somnia-ai/issues)
- **Email**: support@somnia.network
- **Twitter**: [@somnia_ai](https://twitter.com/somnia_ai)

### Q: How do I contribute?

**A:** We welcome contributions!
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Q: Is there a community?

**A:** Yes! Join us:
- **Discord**: Daily discussions, help, announcements
- **GitHub**: Code, issues, pull requests
- **Twitter**: Updates, news, showcases
- **Blog**: Tutorials, case studies, updates

### Q: Where's the roadmap?

**A:** Check our [GitHub Projects](https://github.com/your-repo/somnia-ai/projects) for:
- Planned features
- In-progress work
- Released features
- Community requests

---

## 🤔 Still have questions?

If your question isn't answered here:
1. Check the [full documentation](./README.md)
2. Search [GitHub Issues](https://github.com/your-repo/somnia-ai/issues)
3. Ask in [Discord](https://discord.gg/somnia-ai)
4. Email us at support@somnia.network

We're here to help! 🚀


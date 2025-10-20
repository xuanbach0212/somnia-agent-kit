# 🔧 Troubleshooting Guide

Comprehensive guide to solving common issues with Somnia AI Agent Kit.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Blockchain & Transaction Errors](#blockchain--transaction-errors)
- [LLM & AI Issues](#llm--ai-issues)
- [Smart Contract Errors](#smart-contract-errors)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)

---

## 🔨 Installation Issues

### Problem: `npm install` fails

**Symptoms:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use legacy peer deps:**
```bash
npm install --legacy-peer-deps
```

3. **Update npm:**
```bash
npm install -g npm@latest
```

4. **Try pnpm instead:**
```bash
npm install -g pnpm
pnpm install
```

### Problem: TypeScript errors during installation

**Symptoms:**
```bash
error TS2307: Cannot find module '@somnia/agent-kit'
```

**Solutions:**

1. **Install TypeScript:**
```bash
npm install -D typescript @types/node
```

2. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

3. **Rebuild TypeScript:**
```bash
npx tsc --build --clean
npx tsc
```

### Problem: Module not found at runtime

**Symptoms:**
```bash
Error: Cannot find module '@somnia/agent-kit'
```

**Solutions:**

1. **Verify installation:**
```bash
npm list @somnia/agent-kit
```

2. **Reinstall package:**
```bash
npm uninstall @somnia/agent-kit
npm install @somnia/agent-kit
```

3. **Check node_modules:**
```bash
ls -la node_modules/@somnia/
```

---

## ⚙️ Configuration Problems

### Problem: Environment variables not loading

**Symptoms:**
```bash
Error: PRIVATE_KEY is undefined
```

**Solutions:**

1. **Check .env file exists:**
```bash
ls -la .env
```

2. **Load dotenv:**
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

console.log('Private key loaded:', !!process.env.PRIVATE_KEY);
```

3. **Check .env format:**
```bash
# ✅ Correct
PRIVATE_KEY=0x1234567890abcdef...

# ❌ Wrong (no quotes, no spaces)
PRIVATE_KEY = "0x1234..."
```

4. **Verify .env location:**
```bash
# .env should be in project root
project-root/
  ├── .env          ← Here
  ├── src/
  │   └── index.ts
  └── package.json
```

### Problem: Wrong network configuration

**Symptoms:**
```bash
Error: Contract not deployed at address
```

**Solutions:**

1. **Verify network:**
```typescript
console.log('Network:', kit.network);
console.log('RPC URL:', process.env.RPC_URL);
```

2. **Check contract addresses:**
```typescript
const addresses = {
  testnet: {
    agentRegistry: '0x...',
    agentExecutor: '0x...',
  },
  mainnet: {
    agentRegistry: '0x...',
    agentExecutor: '0x...',
  },
};

const network = 'testnet';
const config = addresses[network];
```

3. **Test RPC connection:**
```typescript
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL
);

const blockNumber = await provider.getBlockNumber();
console.log('Connected! Block:', blockNumber);
```

### Problem: Invalid private key

**Symptoms:**
```bash
Error: invalid private key
```

**Solutions:**

1. **Check format:**
```typescript
// ✅ Correct formats
const key1 = '0x1234567890abcdef...'; // With 0x prefix
const key2 = '1234567890abcdef...';   // Without prefix

// ❌ Wrong
const key3 = 'my-private-key'; // Not hex
const key4 = '0x123';          // Too short
```

2. **Validate private key:**
```typescript
function isValidPrivateKey(key: string): boolean {
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  return /^[0-9a-fA-F]{64}$/.test(cleanKey);
}

if (!isValidPrivateKey(process.env.PRIVATE_KEY!)) {
  throw new Error('Invalid private key format');
}
```

3. **Generate new key:**
```typescript
import { ethers } from 'ethers';

const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
```

---

## ⛓️ Blockchain & Transaction Errors

### Problem: Insufficient funds for gas

**Symptoms:**
```bash
Error: insufficient funds for intrinsic transaction cost
```

**Solutions:**

1. **Check balance:**
```typescript
const balance = await kit.signer.getBalance();
console.log('Balance:', ethers.utils.formatEther(balance), 'STM');
```

2. **Get testnet tokens:**
```bash
# Visit faucet
https://faucet.somnia.network

# Enter your address
# Receive tokens
```

3. **Estimate gas before transaction:**
```typescript
try {
  const gasEstimate = await contract.estimateGas.functionName(...args);
  const gasPrice = await provider.getGasPrice();
  const cost = gasEstimate.mul(gasPrice);
  
  console.log('Estimated cost:', ethers.utils.formatEther(cost), 'STM');
  
  const balance = await signer.getBalance();
  if (balance.lt(cost)) {
    throw new Error('Insufficient balance for transaction');
  }
  
  // Proceed with transaction
  const tx = await contract.functionName(...args);
  
} catch (error) {
  console.error('Gas estimation failed:', error);
}
```

### Problem: Transaction reverted

**Symptoms:**
```bash
Error: transaction failed (execution reverted)
```

**Solutions:**

1. **Check revert reason:**
```typescript
try {
  const tx = await contract.functionName(...args);
  await tx.wait();
} catch (error) {
  if (error.reason) {
    console.error('Revert reason:', error.reason);
  }
  if (error.error?.data) {
    console.error('Error data:', error.error.data);
  }
  throw error;
}
```

2. **Common revert reasons:**
```typescript
// "Not agent owner" → You don't own this agent
// "Agent not found" → Invalid agent ID
// "Insufficient balance" → Vault has no funds
// "Daily limit exceeded" → Hit spending limit
// "Agent not active" → Agent is deactivated
```

3. **Debug with Hardhat:**
```bash
# Run local node with verbose logging
npx hardhat node --verbose

# Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# Test transaction
npx hardhat run scripts/test-tx.ts --network localhost
```

### Problem: Nonce too low

**Symptoms:**
```bash
Error: nonce has already been used
```

**Solutions:**

1. **Reset nonce:**
```typescript
const nonce = await signer.getTransactionCount('pending');
const tx = await contract.functionName(...args, {
  nonce: nonce,
});
```

2. **Wait for pending transactions:**
```typescript
// Get all pending transactions
const pendingNonce = await signer.getTransactionCount('pending');
const minedNonce = await signer.getTransactionCount('latest');

if (pendingNonce > minedNonce) {
  console.log(`Waiting for ${pendingNonce - minedNonce} pending transactions...`);
  
  // Wait for all to be mined
  while (await signer.getTransactionCount('pending') > minedNonce) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

3. **Use transaction queue:**
```typescript
class TransactionQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
    }
    
    this.processing = false;
  }
}

const txQueue = new TransactionQueue();

// Use it
await txQueue.add(() => contract.functionName(...args));
```

### Problem: Transaction timeout

**Symptoms:**
```bash
Error: timeout exceeded
```

**Solutions:**

1. **Increase timeout:**
```typescript
const tx = await contract.functionName(...args);

// Wait with custom timeout (default: 120s)
const receipt = await tx.wait(1, 300000); // 5 minutes
```

2. **Check transaction status:**
```typescript
const tx = await contract.functionName(...args);
console.log('Transaction hash:', tx.hash);

// Poll for receipt
let receipt = null;
let attempts = 0;
const maxAttempts = 60;

while (!receipt && attempts < maxAttempts) {
  receipt = await provider.getTransactionReceipt(tx.hash);
  
  if (!receipt) {
    console.log(`Waiting... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
}

if (!receipt) {
  throw new Error('Transaction not mined after 2 minutes');
}
```

3. **Speed up transaction:**
```typescript
// Replace transaction with higher gas price
const newTx = await signer.sendTransaction({
  ...tx,
  gasPrice: tx.gasPrice.mul(120).div(100), // +20% gas price
  nonce: tx.nonce, // Same nonce to replace
});
```

---

## 🤖 LLM & AI Issues

### Problem: OpenAI API key invalid

**Symptoms:**
```bash
Error: Incorrect API key provided
```

**Solutions:**

1. **Verify API key:**
```typescript
// OpenAI keys start with 'sk-'
if (!process.env.OPENAI_API_KEY?.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}
```

2. **Test API key:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

3. **Check API quota:**
```typescript
// Visit: https://platform.openai.com/account/usage
// Ensure you have credits and haven't hit rate limits
```

### Problem: Rate limit exceeded

**Symptoms:**
```bash
Error: Rate limit reached for requests
```

**Solutions:**

1. **Implement exponential backoff:**
```typescript
async function generateWithRetry(
  llm: LLMProvider,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await llm.generate({ messages: [{ role: 'user', content: prompt }] });
    } catch (error) {
      if (error.code === 'rate_limit_exceeded' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

2. **Implement request queue:**
```typescript
class RateLimitedLLM {
  private queue: Array<() => Promise<any>> = [];
  private requestsPerMinute = 60;
  private requestTimestamps: number[] = [];
  
  async generate(params: any): Promise<any> {
    await this.waitForRateLimit();
    
    this.requestTimestamps.push(Date.now());
    
    return await this.llm.generate(params);
  }
  
  private async waitForRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      t => t > oneMinuteAgo
    );
    
    // Wait if at limit
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}
```

3. **Use multiple API keys:**
```typescript
class LoadBalancedLLM {
  private apiKeys: string[];
  private currentIndex = 0;
  
  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys;
  }
  
  async generate(params: any): Promise<any> {
    const key = this.apiKeys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    
    const llm = new OpenAIAdapter({ apiKey: key, ...params });
    return await llm.generate(params);
  }
}
```

### Problem: Ollama connection failed

**Symptoms:**
```bash
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**

1. **Check Ollama is running:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve
```

2. **Verify Ollama URL:**
```typescript
const llm = new OllamaAdapter({
  baseUrl: 'http://localhost:11434', // Default
  model: 'llama2',
});

// Test connection
try {
  const models = await fetch('http://localhost:11434/api/tags');
  console.log('Available models:', await models.json());
} catch (error) {
  console.error('Ollama not reachable:', error);
}
```

3. **Pull model if missing:**
```bash
# List available models
ollama list

# Pull model
ollama pull llama2

# Test model
ollama run llama2 "Hello!"
```

### Problem: LLM response too slow

**Symptoms:**
- Responses take >10 seconds
- Timeouts occur frequently

**Solutions:**

1. **Use streaming:**
```typescript
const response = await llm.generateStream({
  messages: [{ role: 'user', content: prompt }],
  onToken: (token) => {
    process.stdout.write(token); // Show progress
  },
});
```

2. **Reduce max tokens:**
```typescript
const response = await llm.generate({
  messages: [...],
  maxTokens: 500, // Instead of 2000
});
```

3. **Use faster models:**
```typescript
// ❌ Slow
const llm = new OpenAIAdapter({ model: 'gpt-4' });

// ✅ Faster
const llm = new OpenAIAdapter({ model: 'gpt-3.5-turbo' });
```

4. **Cache responses:**
```typescript
const cache = new Map<string, string>();

async function generateCached(prompt: string): Promise<string> {
  const cacheKey = createHash('md5').update(prompt).digest('hex');
  
  if (cache.has(cacheKey)) {
    console.log('Cache hit!');
    return cache.get(cacheKey)!;
  }
  
  const response = await llm.generate({ messages: [{ role: 'user', content: prompt }] });
  cache.set(cacheKey, response.content);
  
  return response.content;
}
```

---

## 📝 Smart Contract Errors

### Problem: Agent not found

**Symptoms:**
```bash
Error: Agent with ID 123 does not exist
```

**Solutions:**

1. **Verify agent ID:**
```typescript
const agentCount = await registry.agentCount();
console.log('Total agents:', agentCount.toString());

if (agentId >= agentCount) {
  throw new Error(`Agent ${agentId} does not exist`);
}
```

2. **List your agents:**
```typescript
const myAddress = await signer.getAddress();
const myAgents = await registry.getAgentsByOwner(myAddress);

console.log('Your agents:', myAgents.map(id => id.toString()));
```

3. **Check agent status:**
```typescript
const agent = await registry.getAgent(agentId);

if (!agent.isActive) {
  console.warn('Agent is deactivated');
}
```

### Problem: Not agent owner

**Symptoms:**
```bash
Error: Caller is not the agent owner
```

**Solutions:**

1. **Verify ownership:**
```typescript
const agent = await registry.getAgent(agentId);
const myAddress = await signer.getAddress();

console.log('Agent owner:', agent.owner);
console.log('Your address:', myAddress);

if (agent.owner.toLowerCase() !== myAddress.toLowerCase()) {
  throw new Error('You do not own this agent');
}
```

2. **Use correct wallet:**
```typescript
// Make sure you're using the wallet that created the agent
const correctWallet = new ethers.Wallet(
  process.env.AGENT_OWNER_PRIVATE_KEY!,
  provider
);
```

### Problem: Vault daily limit exceeded

**Symptoms:**
```bash
Error: Daily withdrawal limit exceeded
```

**Solutions:**

1. **Check available amount:**
```typescript
const available = await vault.getAvailableDailyAmount(agentId);
console.log('Available today:', ethers.utils.formatEther(available));
```

2. **Wait for reset:**
```typescript
const vaultInfo = await vault.getVault(agentId);
const lastReset = vaultInfo.lastResetTime.toNumber() * 1000;
const nextReset = lastReset + 86400000; // +24 hours
const timeUntilReset = nextReset - Date.now();

if (timeUntilReset > 0) {
  console.log(`Limit resets in ${(timeUntilReset / 1000 / 60).toFixed(0)} minutes`);
}
```

3. **Increase limit:**
```typescript
const newLimit = ethers.utils.parseEther('2.0'); // Increase to 2 STM/day

const tx = await vault.updateDailyLimit(agentId, newLimit);
await tx.wait();

console.log('Daily limit increased');
```

---

## ⚡ Performance Issues

### Problem: Slow agent responses

**Diagnosis:**
```typescript
const startTime = Date.now();

// Your code here
const response = await agent.execute(task);

const duration = Date.now() - startTime;
console.log(`Execution took ${duration}ms`);

// Identify bottleneck
// - LLM call: 1000-5000ms
// - Blockchain tx: 500-2000ms
// - IPFS upload: 200-1000ms
```

**Solutions:**

1. **Parallel operations:**
```typescript
// ❌ Sequential (slow)
const llmResponse = await llm.generate(...);
const ipfsUri = await ipfs.upload(data);
const tx = await contract.function(...);

// ✅ Parallel (fast)
const [llmResponse, ipfsUri] = await Promise.all([
  llm.generate(...),
  ipfs.upload(data),
]);
const tx = await contract.function(...);
```

2. **Cache frequently used data:**
```typescript
class CachedRegistry {
  private cache = new Map();
  private ttl = 60000; // 1 minute
  
  async getAgent(id: number) {
    const cacheKey = `agent-${id}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const data = await registry.getAgent(id);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }
}
```

3. **Batch operations:**
```typescript
// Instead of multiple calls
for (const id of agentIds) {
  const agent = await registry.getAgent(id); // ❌ Slow
}

// Use multicall
const agents = await Promise.all(
  agentIds.map(id => registry.getAgent(id)) // ✅ Faster
);
```

### Problem: High memory usage

**Diagnosis:**
```typescript
console.log('Memory usage:', process.memoryUsage());
// {
//   rss: 100MB,
//   heapTotal: 50MB,
//   heapUsed: 30MB,
//   external: 5MB
// }
```

**Solutions:**

1. **Clear caches periodically:**
```typescript
setInterval(() => {
  cache.clear();
  console.log('Cache cleared');
}, 3600000); // Every hour
```

2. **Limit conversation history:**
```typescript
// Keep only last 10 messages
if (conversation.messages.length > 10) {
  conversation.messages = conversation.messages.slice(-10);
}
```

3. **Stream large responses:**
```typescript
// Instead of loading entire response
const response = await llm.generateStream({
  messages: [...],
  onToken: (token) => {
    // Process token immediately
    processToken(token);
  },
});
```

---

## 🔍 Debugging Tools

### Enable Debug Logging

```typescript
// Set environment variable
process.env.DEBUG = 'somnia:*';

// Or in code
import debug from 'debug';
const log = debug('somnia:agent');

log('Agent initialized');
log('Executing task:', task);
```

### Transaction Explorer

View transactions on block explorer:
```typescript
const tx = await contract.functionName(...);
console.log(`View transaction: https://explorer.somnia.network/tx/${tx.hash}`);
```

### Network Inspector

```typescript
// Log all network requests
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};
```

### Contract Event Monitoring

```typescript
// Listen to all events
contract.on('*', (event) => {
  console.log('Event:', event);
});

// Listen to specific events
contract.on('AgentRegistered', (agentId, owner, name) => {
  console.log(`New agent: ${name} (${agentId})`);
});
```

---

## 🆘 Still Need Help?

If you're still experiencing issues:

1. **Check logs:** Enable verbose logging
2. **Search issues:** [GitHub Issues](https://github.com/your-repo/somnia-ai/issues)
3. **Ask community:** [Discord](https://discord.gg/somnia-ai)
4. **Contact support:** support@somnia.network

**When reporting issues, include:**
- Error message (full stack trace)
- Code snippet (minimal reproducible example)
- Environment (OS, Node version, package versions)
- Steps to reproduce
- Expected vs actual behavior

---

**Happy debugging!** 🐛🔨


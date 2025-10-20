# 🤖 Simple Agent Demo

This example demonstrates how to create a basic AI agent using Somnia AI.

## Overview

The simple agent demo shows:
- Creating an agent with minimal configuration
- Executing basic tasks
- Handling responses
- Error management

## Code Example

```typescript
import { SomniaAgentSDK } from '@somnia/agent-sdk';
import { OpenAIProvider } from '@somnia/agent-sdk/llm';

async function main() {
  // Initialize SDK
  const sdk = new SomniaAgentSDK({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.RPC_URL!,
  });

  // Create LLM provider
  const llmProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  });

  // Create agent
  const agent = await sdk.createAgent({
    name: 'Simple Assistant',
    description: 'A helpful AI assistant',
    llmProvider,
    capabilities: ['chat', 'analysis'],
  });

  console.log(`✅ Agent created with ID: ${agent.id}`);

  // Execute a task
  const response = await agent.execute({
    prompt: 'What is blockchain technology?',
    maxTokens: 500,
  });

  console.log('Agent Response:', response.content);

  // Get agent info
  const info = await sdk.getAgentInfo(agent.id);
  console.log('Agent Info:', info);
}

main().catch(console.error);
```

## Running the Example

```bash
# Navigate to examples directory
cd examples/simple-agent-demo

# Install dependencies (if needed)
npm install

# Set environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="your_rpc_url"
export OPENAI_API_KEY="your_openai_key"

# Run the example
npx ts-node index.ts
```

## Expected Output

```
✅ Agent created with ID: 0x1234...
Agent Response: Blockchain technology is a decentralized, distributed ledger...
Agent Info: {
  id: '0x1234...',
  name: 'Simple Assistant',
  owner: '0xabcd...',
  isActive: true
}
```

## Key Concepts

### 1. SDK Initialization
The SDK requires a private key and RPC URL to interact with the blockchain.

### 2. LLM Provider
Choose from multiple providers:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- DeepSeek
- Ollama (self-hosted)

### 3. Agent Creation
Agents are registered on-chain and can be discovered by others.

### 4. Task Execution
Execute prompts and receive AI-generated responses.

## Customization

### Using Different LLM Providers

**Anthropic:**
```typescript
import { AnthropicProvider } from '@somnia/agent-sdk/llm';

const llmProvider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-3-opus-20240229',
});
```

**DeepSeek:**
```typescript
import { DeepSeekProvider } from '@somnia/agent-sdk/llm';

const llmProvider = new DeepSeekProvider({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  model: 'deepseek-chat',
});
```

### Adding Capabilities

```typescript
const agent = await sdk.createAgent({
  name: 'Advanced Assistant',
  description: 'Multi-capability agent',
  llmProvider,
  capabilities: [
    'chat',
    'analysis',
    'code-generation',
    'data-processing',
  ],
});
```

## Error Handling

```typescript
try {
  const response = await agent.execute({
    prompt: 'Your prompt here',
  });
  console.log(response.content);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough funds in vault');
  } else if (error.code === 'RATE_LIMIT') {
    console.error('LLM API rate limit exceeded');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

- 🔗 [On-chain Chatbot Example](onchain-chatbot.md)
- 📊 [Monitoring Demo](monitoring.md)
- 💰 [Vault Demo](vault.md)
- 📚 [API Reference](../../API_REFERENCE.md)


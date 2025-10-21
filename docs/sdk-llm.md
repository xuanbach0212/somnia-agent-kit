# 🧠 LLM Integration

Guide for integrating Large Language Models with your AI agents.

## Overview

The SDK supports multiple LLM providers including OpenAI, Ollama (local), and DeepSeek.

## Supported Providers

- **OpenAI** - GPT-3.5, GPT-4, etc.
- **Ollama** - Local LLMs (Llama, Mistral, etc.)
- **DeepSeek** - DeepSeek models

## OpenAI Adapter

### Setup

```typescript
import { OpenAIAdapter } from 'somnia-agent-kit';

const llm = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4',
});
```

### Generate Response

```typescript
const response = await llm.generate('Analyze the current crypto market trends');

console.log(response.content);
// Output: Detailed market analysis...
```

### With Options

```typescript
const response = await llm.generate('Explain blockchain in simple terms', {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 500,
});
```

## Ollama Adapter (Local AI)

### Setup

```bash
# Install Ollama
brew install ollama

# Start Ollama
ollama serve

# Pull a model
ollama pull llama3.2
```

### Use in Code

```typescript
import { OllamaAdapter } from 'somnia-agent-kit';

const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  defaultModel: 'llama3.2',
});

const response = await llm.generate('What is Somnia blockchain?');
console.log(response.content);
```

### Available Models

```typescript
// Llama models
defaultModel: 'llama3.2'
defaultModel: 'llama2'

// Mistral models
defaultModel: 'mistral'

// Code models
defaultModel: 'codellama'
```

## DeepSeek Adapter

### Setup

```typescript
import { DeepSeekAdapter } from 'somnia-agent-kit';

const llm = new DeepSeekAdapter({
  apiKey: process.env.DEEPSEEK_API_KEY,
  defaultModel: 'deepseek-chat',
});
```

### Generate Response

```typescript
const response = await llm.generate('Write a trading strategy for ETH/USD');
console.log(response.content);
```

## Complete Example with Agent

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS, OllamaAdapter } from 'somnia-agent-kit';

async function main() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
      agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
      agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
      agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  // Initialize LLM (using free local Ollama)
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  // Use AI to generate agent description
  const descResponse = await llm.generate(
    'Write a professional 1-sentence description for an AI trading bot'
  );

  // Register agent with AI-generated description
  const tx = await kit.contracts.registry.registerAgent(
    'AI Trading Bot',
    descResponse.content.trim(),
    'ipfs://QmExample',
    ['trading', 'ai-analysis']
  );

  await tx.wait();
  console.log('Agent registered with AI-generated description!');

  // Use AI for decision making
  const decision = await llm.generate(
    'Should I buy ETH now? Answer with YES or NO and explain in 1 sentence.'
  );

  console.log('AI Decision:', decision.content);
}

main().catch(console.error);
```

## Advanced Usage

### Streaming Responses

```typescript
const stream = await llm.generateStream('Explain DeFi protocols');

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

### Chat History

```typescript
const messages = [
  { role: 'user', content: 'What is Somnia?' },
  { role: 'assistant', content: 'Somnia is a high-performance blockchain...' },
  { role: 'user', content: 'How fast is it?' },
];

const response = await llm.chat(messages);
console.log(response.content);
```

### Custom System Prompt

```typescript
const response = await llm.generate('Analyze ETH price', {
  systemPrompt: 'You are an expert crypto trader with 10 years of experience.',
  temperature: 0.3,
});
```

## Best Practices

### 1. Use Local LLMs for Development

```typescript
// Development: Free local Ollama
const llm = new OllamaAdapter({
  baseURL: 'http://localhost:11434',
  defaultModel: 'llama3.2',
});

// Production: OpenAI for better quality
const llm = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4',
});
```

### 2. Handle Errors

```typescript
try {
  const response = await llm.generate(prompt);
  return response.content;
} catch (error) {
  console.error('LLM error:', error);
  return 'Failed to generate response';
}
```

### 3. Set Appropriate Temperature

```typescript
// Creative tasks (high temperature)
const creative = await llm.generate('Write a story', {
  temperature: 0.9,
});

// Analytical tasks (low temperature)
const analysis = await llm.generate('Analyze data', {
  temperature: 0.2,
});
```

### 4. Limit Token Usage

```typescript
const response = await llm.generate(prompt, {
  maxTokens: 500, // Limit response length
});
```

## Example: AI-Powered Task Execution

```typescript
import { SomniaAgentKit, OllamaAdapter } from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function executeAITask() {
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: { /* ... */ },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  // Listen for new tasks
  kit.contracts.manager.on('TaskCreated', async (taskId, agentId) => {
    console.log(`New task ${taskId.toString()} received`);

    // Get task data
    const task = await kit.contracts.manager.getTask(taskId);
    const taskData = JSON.parse(task.taskData);

    // Use AI to process task
    const aiResponse = await llm.generate(
      `Analyze ${taskData.target} and provide insights`
    );

    // Complete task with AI result
    const result = JSON.stringify({
      status: 'success',
      analysis: aiResponse.content,
      timestamp: Date.now(),
    });

    const tx = await kit.contracts.manager.completeTask(taskId, result);
    await tx.wait();

    console.log('Task completed with AI analysis!');
  });
}

executeAITask().catch(console.error);
```

## See Also

- [Working with Agents](sdk-agents.md)
- [Task Management](sdk-tasks.md)
- [API Reference](../API_REFERENCE.md)
- [AI Agent Example](../examples/03-ai-agent/index.ts)


# Somnia AI Agent Framework - Examples

This directory contains comprehensive examples demonstrating how to use the Somnia AI Agent Framework SDK.

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
# Somnia Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50311
PRIVATE_KEY=your_private_key_here

# Contract Addresses (deploy first)
AGENT_REGISTRY_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...

# LLM Providers (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Examples

### 1. Basic Agent (`1-basic-agent.ts`)
Learn the fundamentals of creating a simple agent with custom executor logic.

**Features:**
- Client connection
- Agent configuration
- Custom executor function
- Agent registration
- Task processing
- Metrics tracking

**Run:**
```bash
npm run example:basic
```

### 2. LLM Agent with OpenAI (`2-llm-agent-openai.ts`)
Create an AI agent powered by OpenAI's GPT models.

**Features:**
- OpenAI integration
- Chat completion
- Multiple AI tasks (Q&A, creative writing, analysis)
- Token estimation
- Event handling

**Run:**
```bash
npm run example:openai
```

### 3. LLM Agent with Claude (`3-llm-agent-claude.ts`)
Build an AI agent using Anthropic's Claude for advanced reasoning.

**Features:**
- Anthropic Claude integration
- Complex reasoning tasks
- System prompts
- Long-form responses
- Model information

**Run:**
```bash
npm run example:claude
```

### 4. Event-Driven Agent (`4-event-driven-agent.ts`)
Demonstrate agent lifecycle management and comprehensive event handling.

**Features:**
- Lifecycle management (start/stop/restart)
- Event listeners
- State management
- Task processing events
- Metrics updates

**Run:**
```bash
npm run example:events
```

### 5. Task Management (`5-task-management.ts`)
Direct task management using SomniaClient for fine-grained control.

**Features:**
- Low-level task creation
- Task status tracking
- Task completion
- Task cancellation
- Payment/rewards
- Balance checking

**Run:**
```bash
npm run example:tasks
```

### 6. Monitoring Client (`monitoring-client-example.ts`)
Real-time agent monitoring and metrics collection.

**Features:**
- Monitoring server connection
- Real-time metrics
- WebSocket updates
- Alert handling
- Aggregated metrics

**Run:**
```bash
npm run example:client
```

## Quick Start

### Basic Agent
```typescript
import { SomniaClient, SomniaAgent } from '@somnia/sdk';

const client = new SomniaClient();
await client.connect(config);

const agent = new SomniaAgent(client)
  .configure({
    name: 'My Agent',
    description: 'A simple agent',
    capabilities: ['task-processing'],
  })
  .withExecutor(async (input, context) => {
    // Your agent logic here
    return { success: true, result: 'done' };
  });

const agentId = await agent.register();
await agent.start();
```

### AI Agent with LLM
```typescript
import { OpenAIProvider } from '@somnia/sdk';

const agent = new SomniaAgent(client)
  .configure({...})
  .withLLM(new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }))
  .withExecutor(async (input, context) => {
    const response = await context.llm.chat([
      { role: 'user', content: input.prompt }
    ]);
    return { success: true, result: { response } };
  });
```

## Architecture

```
┌─────────────────────────────────────────┐
│  Your Application                       │
├─────────────────────────────────────────┤
│  SomniaAgent (High-level)              │
│  - Lifecycle management                 │
│  - Event system                         │
│  - Task processing                      │
├─────────────────────────────────────────┤
│  SomniaClient (Low-level)              │
│  - Blockchain transactions              │
│  - Contract interactions                │
│  - Event subscriptions                  │
├─────────────────────────────────────────┤
│  LLM Providers (Core)                   │
│  - OpenAI                               │
│  - Anthropic                            │
│  - Mock (testing)                       │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Deploy Contracts**: Use `npm run deploy:contracts` to deploy AgentRegistry and AgentManager
2. **Choose Your Example**: Start with `1-basic-agent.ts` if you're new
3. **Add LLM**: Configure OpenAI or Anthropic API keys to use AI features
4. **Build Your Agent**: Create your own agent based on these examples
5. **Monitor**: Use the monitoring system to track agent performance

## Support

- Documentation: See main [README.md](../README.md)
- Smart Contracts: See [contracts/](../contracts/)
- Deployment: See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## License

MIT

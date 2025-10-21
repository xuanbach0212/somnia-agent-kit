# 💬 On-Chain Chatbot Example

Build a fully functional AI chatbot that stores conversation history on-chain and uses decentralized AI.

## 🎯 What You'll Build

A chatbot that:
- ✅ Stores conversations on the blockchain
- ✅ Uses AI (OpenAI/Anthropic/Ollama) for responses
- ✅ Maintains conversation context
- ✅ Supports multiple users
- ✅ Has personality and memory

## 📋 Prerequisites

- Somnia AI SDK installed
- Wallet with testnet tokens
- LLM API key (or local Ollama)
- Basic TypeScript knowledge

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           User Interface                 │
│  (CLI / Web / Discord / Telegram)       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│        Chatbot Application               │
│  - Message handling                      │
│  - Context management                    │
│  - Response generation                   │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐      ┌──────────┐
│   LLM    │      │Blockchain│
│ Provider │      │ (Somnia) │
│          │      │          │
│ - OpenAI │      │ - Agent  │
│ - Claude │      │ - History│
│ - Ollama │      │ - State  │
└──────────┘      └──────────┘
```

## 📝 Step 1: Setup

Create a new project:

```bash
mkdir onchain-chatbot
cd onchain-chatbot
npm init -y
npm install @somnia/agent-kit ethers dotenv
npm install -D typescript @types/node ts-node
```

Create `.env`:

```bash
PRIVATE_KEY=your_private_key
RPC_URL=https://dream-rpc.somnia.network
AGENT_REGISTRY_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...
OPENAI_API_KEY=sk-...
```

## 💻 Step 2: Core Chatbot Implementation

Create `chatbot.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';
import { OpenAIAdapter } from '@somnia/agent-kit/llm';
import { ethers } from 'ethers';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ConversationState {
  messages: Message[];
  userId: string;
  agentId: number;
}

export class OnChainChatbot {
  private kit: SomniaAgentKit;
  private llm: OpenAIAdapter;
  private agentId: number;
  private conversations: Map<string, ConversationState>;
  
  constructor(
    private config: {
      privateKey: string;
      rpcUrl: string;
      openaiKey: string;
      systemPrompt?: string;
    }
  ) {
    this.conversations = new Map();
  }

  async initialize() {
    console.log('🔧 Initializing chatbot...');
    
    // 1. Initialize SDK
    this.kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      },
      privateKey: this.config.privateKey,
    });
    
    await this.kit.initialize();
    
    // 2. Setup LLM
    this.llm = new OpenAIAdapter({
      apiKey: this.config.openaiKey,
      model: 'gpt-4',
      temperature: 0.8,
    });
    
    // 3. Register chatbot agent
    await this.registerAgent();
    
    console.log('✅ Chatbot initialized!');
  }

  private async registerAgent() {
    const metadata = {
      name: 'On-Chain Chatbot',
      description: 'An AI chatbot with blockchain-stored conversations',
      version: '1.0.0',
      capabilities: ['chat', 'conversation', 'memory'],
      systemPrompt: this.config.systemPrompt || 
        'You are a helpful, friendly AI assistant. You remember past conversations and provide thoughtful, engaging responses.',
    };
    
    const metadataUri = await this.kit.uploadToIPFS(metadata);
    
    const tx = await this.kit.contracts.AgentRegistry.registerAgent(
      metadata.name,
      metadata.description,
      metadataUri,
      metadata.capabilities
    );
    
    await tx.wait();
    
    // Get agent ID
    const agents = await this.kit.contracts.AgentRegistry.getAgentsByOwner(
      await this.kit.signer.getAddress()
    );
    
    this.agentId = agents[agents.length - 1].toNumber();
    console.log('🤖 Agent registered with ID:', this.agentId);
  }

  async chat(userId: string, message: string): Promise<string> {
    // 1. Get or create conversation
    let conversation = this.conversations.get(userId);
    
    if (!conversation) {
      conversation = {
        messages: [],
        userId,
        agentId: this.agentId,
      };
      this.conversations.set(userId, conversation);
    }
    
    // 2. Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    
    conversation.messages.push(userMessage);
    
    // 3. Generate response
    const response = await this.generateResponse(conversation);
    
    // 4. Add assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };
    
    conversation.messages.push(assistantMessage);
    
    // 5. Store on-chain (async, don't wait)
    this.storeConversationOnChain(userId, conversation).catch(console.error);
    
    return response;
  }

  private async generateResponse(
    conversation: ConversationState
  ): Promise<string> {
    // Build message history for context
    const messages = [
      {
        role: 'system' as const,
        content: this.config.systemPrompt || 
          'You are a helpful AI assistant with access to blockchain.',
      },
      ...conversation.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];
    
    const response = await this.llm.generate({
      messages,
      maxTokens: 500,
      temperature: 0.8,
    });
    
    return response.content;
  }

  private async storeConversationOnChain(
    userId: string,
    conversation: ConversationState
  ) {
    try {
      // Store conversation summary on-chain
      const summary = {
        userId,
        agentId: this.agentId,
        messageCount: conversation.messages.length,
        lastMessage: conversation.messages[conversation.messages.length - 1],
        timestamp: Date.now(),
      };
      
      const summaryUri = await this.kit.uploadToIPFS(summary);
      
      // Update agent metadata with conversation reference
      const tx = await this.kit.contracts.AgentRegistry.updateAgent(
        this.agentId,
        `Chatbot with ${conversation.messages.length} messages`,
        summaryUri,
        ['chat', 'conversation', 'memory']
      );
      
      await tx.wait();
      console.log('💾 Conversation stored on-chain');
      
    } catch (error) {
      console.error('Failed to store on-chain:', error);
    }
  }

  async getConversationHistory(userId: string): Promise<Message[]> {
    const conversation = this.conversations.get(userId);
    return conversation?.messages || [];
  }

  async clearConversation(userId: string) {
    this.conversations.delete(userId);
    console.log(`🗑️ Cleared conversation for user ${userId}`);
  }

  async getStats() {
    return {
      agentId: this.agentId,
      activeConversations: this.conversations.size,
      totalMessages: Array.from(this.conversations.values())
        .reduce((sum, conv) => sum + conv.messages.length, 0),
    };
  }
}
```

## 🖥️ Step 3: CLI Interface

Create `cli.ts`:

```typescript
import { OnChainChatbot } from './chatbot';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize chatbot
  const chatbot = new OnChainChatbot({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.RPC_URL!,
    openaiKey: process.env.OPENAI_API_KEY!,
    systemPrompt: 'You are a friendly AI assistant on the Somnia blockchain. You help users understand blockchain and AI technology.',
  });
  
  await chatbot.initialize();
  
  // Setup CLI
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const userId = 'cli-user-' + Date.now();
  
  console.log('\n🤖 Chatbot ready! Type your message (or "exit" to quit)\n');
  
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const message = input.trim();
      
      if (message.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        const stats = await chatbot.getStats();
        console.log('📊 Stats:', stats);
        rl.close();
        process.exit(0);
      }
      
      if (message.toLowerCase() === 'clear') {
        await chatbot.clearConversation(userId);
        console.log('🗑️ Conversation cleared\n');
        askQuestion();
        return;
      }
      
      if (message.toLowerCase() === 'history') {
        const history = await chatbot.getConversationHistory(userId);
        console.log('\n📜 Conversation History:');
        history.forEach((msg, i) => {
          console.log(`${i + 1}. [${msg.role}]: ${msg.content}`);
        });
        console.log();
        askQuestion();
        return;
      }
      
      if (!message) {
        askQuestion();
        return;
      }
      
      try {
        // Get response
        console.log('\n🤔 Thinking...');
        const response = await chatbot.chat(userId, message);
        console.log(`\n🤖 Bot: ${response}\n`);
        
      } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

main().catch(console.error);
```

## ▶️ Step 4: Run the Chatbot

```bash
npx ts-node cli.ts
```

## 💬 Example Conversation

```
🔧 Initializing chatbot...
✅ Chatbot initialized!
🤖 Agent registered with ID: 1

🤖 Chatbot ready! Type your message (or "exit" to quit)

You: Hello! What can you do?

🤔 Thinking...

🤖 Bot: Hello! I'm an AI chatbot running on the Somnia blockchain. 
I can help you with:
- Answering questions about blockchain and AI
- Having natural conversations
- Remembering our chat history
- Explaining technical concepts
- And much more!

What would you like to talk about?

You: Explain what Somnia is

🤔 Thinking...

🤖 Bot: Somnia is a high-performance blockchain network designed for 
real-time applications and AI agents. It features:

1. Ultra-fast transactions (400,000+ TPS)
2. Low latency (sub-second finality)
3. EVM compatibility
4. Built for AI and gaming applications

It's perfect for running AI agents like me because it can handle 
the high throughput needed for real-time interactions!

💾 Conversation stored on-chain
```

## 🌐 Step 5: Web Interface (Optional)

Create `server.ts` for a web interface:

```typescript
import express from 'express';
import { OnChainChatbot } from './chatbot';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let chatbot: OnChainChatbot;

// Initialize chatbot
async function init() {
  chatbot = new OnChainChatbot({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.RPC_URL!,
    openaiKey: process.env.OPENAI_API_KEY!,
  });
  
  await chatbot.initialize();
}

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }
    
    const response = await chatbot.chat(userId, message);
    
    res.json({
      success: true,
      response,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get history
app.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await chatbot.getConversationHistory(userId);
    
    res.json({
      success: true,
      history,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear conversation
app.delete('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await chatbot.clearConversation(userId);
    
    res.json({
      success: true,
      message: 'Conversation cleared',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const stats = await chatbot.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Chatbot server running on port ${PORT}`);
  });
});
```

Create `public/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>On-Chain Chatbot</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    
    #chat-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      height: 500px;
      overflow-y: auto;
      padding: 20px;
      margin-bottom: 20px;
      background: #f9f9f9;
    }
    
    .message {
      margin: 10px 0;
      padding: 10px;
      border-radius: 8px;
    }
    
    .user-message {
      background: #007bff;
      color: white;
      text-align: right;
    }
    
    .bot-message {
      background: #e9ecef;
      color: #333;
    }
    
    #input-container {
      display: flex;
      gap: 10px;
    }
    
    #message-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <h1>🤖 On-Chain Chatbot</h1>
  
  <div id="chat-container"></div>
  
  <div id="input-container">
    <input 
      type="text" 
      id="message-input" 
      placeholder="Type your message..."
      onkeypress="handleKeyPress(event)"
    />
    <button onclick="sendMessage()">Send</button>
    <button onclick="clearChat()">Clear</button>
  </div>
  
  <script>
    const userId = 'web-user-' + Date.now();
    const API_URL = 'http://localhost:3000';
    
    async function sendMessage() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Add user message to UI
      addMessage('user', message);
      input.value = '';
      
      try {
        // Send to API
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, message }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          addMessage('bot', data.response);
        } else {
          addMessage('bot', 'Error: ' + data.error);
        }
        
      } catch (error) {
        addMessage('bot', 'Connection error: ' + error.message);
      }
    }
    
    function addMessage(role, content) {
      const container = document.getElementById('chat-container');
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}-message`;
      messageDiv.textContent = content;
      container.appendChild(messageDiv);
      container.scrollTop = container.scrollHeight;
    }
    
    async function clearChat() {
      try {
        await fetch(`${API_URL}/conversation/${userId}`, {
          method: 'DELETE',
        });
        
        document.getElementById('chat-container').innerHTML = '';
        addMessage('bot', 'Conversation cleared!');
        
      } catch (error) {
        console.error('Clear failed:', error);
      }
    }
    
    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }
  </script>
</body>
</html>
```

Run the web server:

```bash
npm install express cors
npx ts-node server.ts
```

Open http://localhost:3000 in your browser!

## 🎨 Advanced Features

### 1. Add Personality

```typescript
const personalities = {
  friendly: 'You are a warm, friendly assistant who loves helping people.',
  professional: 'You are a professional, concise assistant.',
  funny: 'You are a witty, humorous assistant who makes people laugh.',
};

const chatbot = new OnChainChatbot({
  // ...
  systemPrompt: personalities.funny,
});
```

### 2. Add Commands

```typescript
// In chat method
if (message.startsWith('/')) {
  return await this.handleCommand(message, userId);
}

private async handleCommand(command: string, userId: string): Promise<string> {
  const [cmd, ...args] = command.slice(1).split(' ');
  
  switch (cmd) {
    case 'help':
      return 'Available commands: /help, /stats, /clear, /personality';
      
    case 'stats':
      const stats = await this.getStats();
      return `Stats: ${JSON.stringify(stats, null, 2)}`;
      
    case 'clear':
      await this.clearConversation(userId);
      return 'Conversation cleared!';
      
    default:
      return `Unknown command: ${cmd}`;
  }
}
```

### 3. Add Rate Limiting

```typescript
private rateLimits = new Map<string, number[]>();

private checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = this.rateLimits.get(userId) || [];
  
  // Keep only requests from last minute
  const recentRequests = userRequests.filter(t => now - t < 60000);
  
  if (recentRequests.length >= 10) {
    return false; // Too many requests
  }
  
  recentRequests.push(now);
  this.rateLimits.set(userId, recentRequests);
  
  return true;
}
```

## 📊 Monitoring

Add monitoring to track chatbot performance:

```typescript
import { AgentMonitor } from '@somnia/agent-kit/monitoring';

const monitor = new AgentMonitor(this.agentId);

// Track metrics
await monitor.recordMetric('messages_sent', 1);
await monitor.recordMetric('response_time_ms', responseTime);
await monitor.recordMetric('tokens_used', tokensUsed);
```

## 🚀 Deployment

Deploy to production:

```bash
# Build
npm run build

# Run with PM2
pm2 start dist/server.js --name chatbot

# Monitor
pm2 logs chatbot
```

## 📚 Next Steps

- **[Monitoring Demo](./monitoring.md)** - Add comprehensive monitoring
- **[Vault Demo](./vault.md)** - Manage chatbot funds
- **[API Reference](../../API_REFERENCE.md)** - Full API docs

## 🎓 Key Learnings

1. ✅ Store conversation state on-chain
2. ✅ Maintain context across messages
3. ✅ Handle multiple concurrent users
4. ✅ Integrate with various interfaces (CLI, Web)
5. ✅ Add personality and commands

---

**Congratulations!** 🎉 You've built a fully functional on-chain AI chatbot!


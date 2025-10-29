# 🎬 Video Demo Script - Somnia Agent Kit

## 📊 Overview
**Duration**: 3-5 minutes  
**Format**: Screen recording + voiceover  
**Goal**: Show how easy it is to build autonomous AI agents on Somnia

---

## 🎯 Demo Structure

### Part 1: Introduction (30 seconds)
### Part 2: Quick Setup (1 minute)
### Part 3: Register Agent (1 minute)
### Part 4: AI Agent Demo (1.5 minutes)
### Part 5: Closing (30 seconds)

---

## 📝 Detailed Script

---

### 🎬 PART 1: Introduction (30 seconds)

**[Screen: Terminal with clean background]**

**Voiceover:**
> "Hi! Today I'll show you how to build an autonomous AI agent on Somnia blockchain in just 5 minutes using Somnia Agent Kit."

**[Screen: Show browser with npm page]**
**URL**: https://www.npmjs.com/package/somnia-agent-kit

**Voiceover:**
> "Somnia Agent Kit is a production-ready SDK with over 27 pages of documentation, 7 working examples, and it's completely free to run with local LLM."

**[Screen: Quick flash of key features]**
- v3.0.11 on npm ✅
- 4 deployed smart contracts ✅
- Multi-LLM support ✅
- Full TypeScript ✅

---

### 🎬 PART 2: Quick Setup (1 minute)

**[Screen: Terminal, start in empty directory]**

**Voiceover:**
> "Let's start from scratch. First, we'll install the SDK."

**Type:**
```bash
npm install somnia-agent-kit
```

**[Wait for installation to complete - speed up in editing if needed]**

**Voiceover (during installation):**
> "The SDK includes everything you need: blockchain client, smart contract wrappers, LLM integration, monitoring tools, and CLI utilities."

**[After installation completes]**

**Voiceover:**
> "Now let's initialize our project."

**Type:**
```bash
npx sak init
```

**[Show interactive prompts]**
- Network: Somnia Testnet ✓
- Create .env file? Yes ✓
- Install dependencies? Yes ✓

**Voiceover:**
> "The CLI automatically sets up everything - network configuration, environment variables, and project structure."

**[Show created files]**
```bash
ls -la
```

**Voiceover:**
> "Perfect! We now have a complete project setup."

---

### 🎬 PART 3: Register Agent (1 minute)

**[Screen: Terminal]**

**Voiceover:**
> "Let's register our first agent on the Somnia blockchain."

**Type:**
```bash
npx sak agent:register \
  --name "Trading Bot" \
  --description "AI-powered DeFi trading assistant" \
  --capabilities "trading,analysis,monitoring"
```

**[Show transaction being sent]**

**Voiceover:**
> "This creates an agent on-chain with metadata and capabilities. The transaction is being confirmed on Somnia's high-performance network."

**[Transaction confirmed]**

**Output shows:**
```
✅ Agent registered successfully!
   ID: 1
   Name: Trading Bot
   Owner: 0x742d35Cc...
   Capabilities: trading, analysis, monitoring
   
   View on explorer:
   https://explorer.somnia.network/tx/0xabc123...
```

**Voiceover:**
> "Great! Our agent is now registered on-chain. Let's verify it."

**Type:**
```bash
npx sak agent:info --id 1
```

**[Show agent details]**

**Voiceover:**
> "Perfect! We can see all the agent information stored on the blockchain."

---

### 🎬 PART 4: AI Agent Demo (1.5 minutes)

**[Screen: Code editor - create new file `demo-agent.ts`]**

**Voiceover:**
> "Now let's create an autonomous agent with AI capabilities. I'll use Ollama for free local AI - no API costs!"

**[Start typing code - use snippets to speed up]**

```typescript
import { SomniaAgentKit, Agent, OllamaAdapter } from 'somnia-agent-kit';

// Initialize SDK
const kit = new SomniaAgentKit();
await kit.initialize();

console.log('✅ Connected to Somnia Testnet');
```

**Voiceover:**
> "First, we initialize the SDK and connect to Somnia."

**[Continue typing]**

```typescript
// Create AI-powered agent
const agent = new Agent({
  name: 'Trading Bot',
  description: 'Analyzes market data and suggests trades',
  capabilities: ['analyze', 'trade', 'monitor'],
  
  // Use local LLM - FREE!
  llm: new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2'
  }),
  
  // Run every minute
  triggers: [{
    type: 'interval',
    config: { interval: 60000 }
  }],
  
  // Enable memory for context
  memory: { enabled: true, maxSize: 1000 }
});

console.log('✅ Agent created');
```

**Voiceover:**
> "We configure the agent with a local LLM model, set it to run every minute, and enable memory for maintaining context."

**[Continue typing]**

```typescript
// Define what the agent should do
agent.on('trigger', async (context) => {
  console.log('🤖 Agent triggered at', new Date().toISOString());
  
  // Agent analyzes market data
  const analysis = await agent.think(
    'Analyze current ETH/USD market conditions and suggest action'
  );
  
  console.log('💭 Agent analysis:', analysis);
  
  // Agent can execute actions based on analysis
  if (analysis.includes('buy')) {
    console.log('📈 Agent suggests: BUY');
  } else if (analysis.includes('sell')) {
    console.log('📉 Agent suggests: SELL');
  } else {
    console.log('⏸️  Agent suggests: HOLD');
  }
});

// Start the agent
await agent.start();
console.log('🚀 Agent is now running autonomously!');
```

**Voiceover:**
> "We define the agent's behavior - it will analyze market conditions using AI and suggest trading actions. Now let's run it!"

**[Screen: Terminal]**

**Type:**
```bash
npx ts-node demo-agent.ts
```

**[Show output]**

```
✅ Connected to Somnia Testnet
✅ Agent created
🚀 Agent is now running autonomously!

🤖 Agent triggered at 2025-01-15T10:30:00.000Z
💭 Agent analysis: Based on current market conditions, ETH/USD shows bullish momentum with strong support at $3,200. Volume is increasing. Suggest buy opportunity.
📈 Agent suggests: BUY

🤖 Agent triggered at 2025-01-15T10:31:00.000Z
💭 Agent analysis: Market consolidating, waiting for breakout confirmation. Suggest hold position.
⏸️  Agent suggests: HOLD
```

**Voiceover:**
> "Amazing! The agent is now running autonomously, analyzing market data every minute using local AI, and making trading suggestions - all for free!"

**[Let it run for 2-3 triggers]**

**Voiceover:**
> "And this is just the beginning. The agent can also execute on-chain transactions, manage funds through the AgentVault, and track all activities with built-in monitoring."

---

### 🎬 PART 5: Closing (30 seconds)

**[Screen: Split screen showing code + terminal output]**

**Voiceover:**
> "In just 5 minutes, we've installed the SDK, registered an agent on-chain, and created an autonomous AI agent that runs 24/7 for free."

**[Screen: Show key points]**

**Text overlay:**
- ✅ 5-minute setup
- ✅ FREE to run (local LLM)
- ✅ Production-ready (v3.0.11)
- ✅ Full TypeScript support
- ✅ 27 pages documentation

**Voiceover:**
> "Somnia Agent Kit makes it incredibly easy to build autonomous AI agents on blockchain. Check out the links in the description for documentation, examples, and source code."

**[Screen: Final slide with resources]**

**Text overlay:**
```
📦 npm: npmjs.com/package/somnia-agent-kit
💻 GitHub: github.com/xuanbach0212/somnia-agent-kit
📖 Docs: somnia-agent-kit.gitbook.io
🔍 Explorer: explorer.somnia.network

Start building today! 🚀
```

**Voiceover:**
> "Start building autonomous AI agents on Somnia today. Thanks for watching!"

**[Fade out]**

---

## 🎥 Production Tips

### Recording Setup

**Screen Recording:**
- Use OBS Studio or QuickTime (Mac)
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 fps
- Hide desktop icons and notifications

**Terminal Setup:**
```bash
# Increase font size for readability
# Use clean theme (e.g., Dracula, Nord)
# Clear history before recording
clear && history -c
```

**Code Editor Setup:**
- Use VS Code with clean theme
- Font size: 16-18pt
- Hide sidebar/minimap
- Enable Prettier for auto-formatting

### Editing

**Speed Up:**
- Installation processes (2x speed)
- Typing code (use snippets, then speed up to 1.5x)
- Waiting for transactions (cut or 2x speed)

**Keep Normal Speed:**
- Voiceover explanations
- Key moments (agent registration, first trigger)
- Final output display

**Add:**
- Smooth transitions between sections
- Text overlays for key points
- Background music (subtle, low volume)
- Captions/subtitles

### Voiceover

**Tips:**
- Speak clearly and at moderate pace
- Pause between sections
- Show enthusiasm (this is cool tech!)
- Avoid filler words ("um", "uh")
- Record in quiet environment

**Tone:**
- Professional but friendly
- Excited about the technology
- Confident (you know this works!)

---

## 📋 Pre-Recording Checklist

### Environment Setup
- [ ] Clean terminal (no history)
- [ ] Clean desktop (hide icons)
- [ ] Disable notifications
- [ ] Close unnecessary apps
- [ ] Test Ollama is running (`ollama list`)
- [ ] Test network connection
- [ ] Have test wallet with STT tokens

### Code Preparation
- [ ] Test all commands work
- [ ] Prepare code snippets
- [ ] Have example outputs ready
- [ ] Test agent actually runs
- [ ] Verify contract addresses

### Recording Tools
- [ ] OBS/QuickTime configured
- [ ] Microphone tested
- [ ] Audio levels checked
- [ ] Recording folder ready
- [ ] Backup recording method

---

## 🎬 Alternative Demo Ideas

### Option 1: NFT Sniper Bot (3 min)
Show agent monitoring NFT listings and executing purchases

### Option 2: DAO Governance Assistant (3 min)
Show agent analyzing proposals and providing voting recommendations

### Option 3: Multi-Agent System (4 min)
Show multiple agents working together on a complex task

### Option 4: Live Trading Demo (5 min)
Show agent actually executing trades on testnet (more advanced)

---

## 📊 Video Description Template

```
🤖 Build Autonomous AI Agents on Blockchain in 5 Minutes | Somnia Agent Kit

In this video, I show you how to build and deploy an autonomous AI agent 
on Somnia blockchain using Somnia Agent Kit - a production-ready SDK that 
makes it incredibly easy to create intelligent agents.

⏱️ Timestamps:
0:00 - Introduction
0:30 - Installing Somnia Agent Kit
1:30 - Registering Agent On-Chain
2:30 - Creating AI-Powered Agent
4:00 - Running Autonomous Agent
4:30 - Conclusion

✨ Key Features:
• 5-minute setup
• FREE to run with local LLM (Ollama)
• Production-ready (v3.0.11 on npm)
• Full TypeScript support
• 4 deployed smart contracts
• 27 pages of documentation
• 7 working examples

🔗 Resources:
📦 npm: https://npmjs.com/package/somnia-agent-kit
💻 GitHub: https://github.com/xuanbach0212/somnia-agent-kit
📖 Docs: https://somnia-agent-kit.gitbook.io
🔍 Explorer: https://explorer.somnia.network

🏷️ Tags:
#Blockchain #AI #Somnia #Web3 #Agents #TypeScript #LLM #DeFi #Crypto

Built for Somnia Network Hackathon 2025 🚀
```

---

## 🎯 Success Metrics

Your demo video is successful if viewers can:
1. ✅ Understand what Somnia Agent Kit does
2. ✅ See how easy it is to use (5 minutes!)
3. ✅ Realize it's FREE to run (local LLM)
4. ✅ Want to try it themselves
5. ✅ Know where to find documentation

---

**Good luck with your video! 🎬🚀**


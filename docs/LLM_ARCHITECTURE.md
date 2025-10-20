# LLM Architecture - Where Does AI Live?

## 🤔 The Question

**When User A creates an agent and User B uses it, where is the LLM?**

This is a critical architectural decision that affects:
- Privacy
- Cost
- Consistency
- Decentralization
- User experience

## 🏗️ Architecture Models

### Model 1: Client-Side LLM (Current Implementation) ⭐

```
┌─────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN (On-chain)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Agent Registry                                     │ │
│  │  - Agent metadata (name, capabilities, owner)      │ │
│  │  - NO LLM stored here                              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↑
                            │ Read/Write
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  OFF-CHAIN (Client Side)                 │
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │   User A         │         │   User B         │      │
│  │  ┌────────────┐  │         │  ┌────────────┐  │      │
│  │  │ Ollama     │  │         │  │ OpenAI     │  │      │
│  │  │ (Local)    │  │         │  │ (Cloud)    │  │      │
│  │  └────────────┘  │         │  └────────────┘  │      │
│  │       ↓          │         │       ↓          │      │
│  │  SDK Instance    │         │  SDK Instance    │      │
│  └──────────────────┘         └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

**How it works:**

```typescript
// USER A creates agent
const userA = new SomniaAgentKit({ privateKey: A_KEY });
const llmA = new OllamaAdapter(); // A's LLM (local)

const agentDetails = await llmA.generate("Create agent details");
await userA.contracts.registry.registerAgent(...agentDetails);
// → Agent stored on-chain, LLM stays with User A

// USER B uses agent
const userB = new SomniaAgentKit({ privateKey: B_KEY });
const llmB = new OpenAIAdapter({ apiKey: B_API_KEY }); // B's LLM (cloud)

const task = await llmB.generate("Plan task for agent #1");
await userB.contracts.manager.createTask(agentId: 1, ...task);
// → B uses their own LLM to interact with A's agent
```

**Pros:**
- ✅ **Privacy**: LLM reasoning happens client-side
- ✅ **Flexibility**: Each user chooses their LLM
- ✅ **Cost control**: Users pay for their own LLM
- ✅ **No vendor lock-in**: Switch LLMs anytime
- ✅ **Decentralized**: No central LLM service

**Cons:**
- ❌ **Inconsistent**: Different LLMs → different results
- ❌ **Setup required**: Users must configure LLM
- ❌ **No agent "personality"**: Agent behavior varies by user

**Best for:**
- Development/testing
- Privacy-focused applications
- Cost-conscious users
- Decentralized systems

---

### Model 2: Agent-Owned LLM (Centralized)

```
┌─────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN (On-chain)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Agent Registry                                     │ │
│  │  - Agent ID: 1                                      │ │
│  │  - LLM Endpoint: "https://api.openai.com"         │ │
│  │  - LLM Model: "gpt-4"                              │ │
│  │  - API Key Hash: 0x...                             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↑
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  LLM SERVICE (Centralized)               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  OpenAI / Anthropic / DeepSeek                     │ │
│  │  - Agent #1 → GPT-4                                │ │
│  │  - Agent #2 → Claude                               │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↑
                            │ All users call same LLM
                            ↓
┌─────────────────────────────────────────────────────────┐
│                         USERS                            │
│  User A, User B, User C → All use agent's LLM          │
└─────────────────────────────────────────────────────────┘
```

**How it works:**

```solidity
// Smart contract
struct Agent {
    uint256 id;
    string name;
    address owner;
    string llmProvider;  // "openai"
    string llmModel;     // "gpt-4"
    string llmEndpoint;  // "https://api.openai.com/v1/chat"
    bytes32 apiKeyHash;  // Hash of API key (not the key itself!)
}
```

```typescript
// USER A creates agent with LLM config
await registry.registerAgent(
    "TradingBot",
    "AI trading agent",
    "ipfs://metadata",
    ["trading"],
    {
        llmProvider: "openai",
        llmModel: "gpt-4",
        llmEndpoint: "https://api.openai.com/v1/chat"
    }
);

// USER B uses agent - SDK automatically uses agent's LLM
const agent = await kit.contracts.registry.getAgent(1);
const agentLLM = createLLMFromAgent(agent); // Factory pattern

const result = await agentLLM.generate("Execute task");
// → Uses agent's configured LLM, not user's
```

**Pros:**
- ✅ **Consistent**: Same LLM for all users
- ✅ **Agent personality**: Predictable behavior
- ✅ **No user setup**: Just use the agent
- ✅ **Professional**: Enterprise-grade

**Cons:**
- ❌ **Cost**: Who pays for LLM API calls?
- ❌ **API key management**: Security risk
- ❌ **Centralized**: Depends on LLM provider
- ❌ **Privacy**: LLM provider sees all data

**Best for:**
- Production applications
- Enterprise agents
- Consistent user experience
- Monetized agents

---

### Model 3: Hybrid (Recommended) ⭐

```
┌─────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN (On-chain)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Agent Metadata (IPFS)                             │ │
│  │  {                                                  │ │
│  │    "name": "TradingBot",                           │ │
│  │    "llm": {                                        │ │
│  │      "recommended": {                              │ │
│  │        "provider": "openai",                       │ │
│  │        "model": "gpt-4",                           │ │
│  │        "temperature": 0.7                          │ │
│  │      },                                            │ │
│  │      "fallback": "user-choice"                     │ │
│  │    }                                               │ │
│  │  }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**How it works:**

```typescript
// Agent metadata includes LLM recommendation
const agentMetadata = {
    name: "TradingBot",
    llm: {
        recommended: {
            provider: "openai",
            model: "gpt-4",
            temperature: 0.7,
            systemPrompt: "You are a professional trading agent..."
        },
        fallback: "user-choice"
    }
};

// User can choose:
// Option 1: Use recommended LLM (if they have API key)
const llm = new OpenAIAdapter({
    apiKey: user.openaiKey,
    model: agentMetadata.llm.recommended.model,
    temperature: agentMetadata.llm.recommended.temperature
});

// Option 2: Use their own LLM
const llm = new OllamaAdapter(); // User's choice

// Option 3: SDK auto-selects based on availability
const llm = await kit.createLLMForAgent(agentId, {
    preferRecommended: true,
    fallbackToUserLLM: true
});
```

**Pros:**
- ✅ **Flexible**: User can choose
- ✅ **Consistent (optional)**: Can follow recommendation
- ✅ **Privacy**: User controls their LLM
- ✅ **Cost control**: User pays
- ✅ **Best of both worlds**

**Cons:**
- ⚠️ **Complexity**: More options to manage
- ⚠️ **Partial consistency**: Not guaranteed

**Best for:**
- Most production use cases
- Balancing flexibility and consistency
- Progressive enhancement

---

### Model 4: Decentralized LLM Network (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN (On-chain)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Agent → Decentralized LLM Request                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              DECENTRALIZED LLM NETWORK                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Node 1   │  │ Node 2   │  │ Node 3   │              │
│  │ (Llama)  │  │ (Mistral)│  │ (GPT)    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  Incentivized network (Bittensor, Gensyn, etc.)         │
└─────────────────────────────────────────────────────────┘
```

**Examples:**
- **Bittensor**: Decentralized AI network
- **Gensyn**: Decentralized compute
- **Ritual**: On-chain AI inference

**Pros:**
- ✅ **Truly decentralized**
- ✅ **Censorship resistant**
- ✅ **Incentivized providers**
- ✅ **No single point of failure**

**Cons:**
- ❌ **Not mature yet**
- ❌ **High latency**
- ❌ **Unpredictable cost**
- ❌ **Complex integration**

**Best for:**
- Future-proof architecture
- Fully decentralized apps
- Research projects

---

## 🎯 Recommendation for Somnia Agent Kit

### **Use Hybrid Model (Model 3)**

**Implementation:**

1. **Agent metadata includes LLM recommendation**
   ```json
   {
     "name": "TradingBot",
     "llm": {
       "recommended": {
         "provider": "openai",
         "model": "gpt-4",
         "systemPrompt": "You are a trading agent..."
       }
     }
   }
   ```

2. **SDK provides helper to create LLM**
   ```typescript
   // Auto-create LLM based on agent metadata
   const llm = await kit.createLLMForAgent(agentId, {
     preferRecommended: true,
     userApiKey: process.env.OPENAI_API_KEY,
     fallback: new OllamaAdapter()
   });
   ```

3. **Users have full control**
   ```typescript
   // Option A: Follow recommendation
   const llm = await kit.createLLMForAgent(agentId);
   
   // Option B: Use own LLM
   const llm = new OllamaAdapter();
   
   // Option C: Mix
   const llm = agent.llm.recommended.provider === "openai" 
     ? new OpenAIAdapter() 
     : new OllamaAdapter();
   ```

---

## 📊 Comparison Table

| Model | Privacy | Cost | Consistency | Decentralization | Complexity |
|-------|---------|------|-------------|------------------|------------|
| Client-Side | ✅ High | ✅ User pays | ❌ Low | ✅ High | ✅ Low |
| Agent-Owned | ❌ Low | ❌ Agent pays | ✅ High | ❌ Low | ⚠️ Medium |
| Hybrid | ✅ High | ✅ User pays | ⚠️ Medium | ✅ High | ⚠️ Medium |
| Decentralized | ✅ High | ⚠️ Variable | ⚠️ Medium | ✅ Very High | ❌ High |

---

## 💡 Key Insights

1. **LLM is NOT stored on-chain**
   - Too expensive
   - Not practical
   - Privacy concerns

2. **LLM lives client-side**
   - Each user has their own LLM instance
   - Blockchain only stores results

3. **Agent metadata can recommend LLM**
   - Stored in IPFS
   - Users can follow or ignore

4. **Cost model**
   - User pays for their LLM usage
   - Agent owner doesn't pay for others' LLM calls

5. **Future: Decentralized LLM**
   - On-chain inference
   - Incentivized network
   - Still experimental

---

## 🚀 Implementation Path

### Phase 1: Client-Side (Current) ✅
- Each user brings their own LLM
- Simple, works today

### Phase 2: Hybrid (Next) 🔄
- Agent metadata includes LLM recommendation
- SDK helpers for LLM creation
- User still controls and pays

### Phase 3: Decentralized (Future) 🔮
- Integration with Bittensor/Gensyn
- On-chain LLM inference
- Fully decentralized

---

**Bottom Line**: LLM lives **client-side**, blockchain stores **results**. This keeps costs low, privacy high, and system decentralized. 🎯


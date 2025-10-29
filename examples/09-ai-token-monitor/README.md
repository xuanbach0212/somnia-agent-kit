# 🤖 AI Token Monitor Demo

> **5-minute demo**: AI-powered blockchain monitoring on Somnia Network

## ⚡ Quick Start

```bash
# 1. Check everything is ready
./pre-demo-check.sh

# 2. Run demo
npm run demo
```

**That's it!** Demo runs in ~35 seconds.

## 🎯 What It Does

1. ✅ Deploy ERC20 token on Somnia testnet
2. ✅ Monitor transfers in real-time  
3. ✅ AI analyzes each transaction (Ollama + Llama 3.2)
4. ✅ Display intelligent insights

## 📺 Expected Output

```
🚀 AI Token Monitor - Simple Demo

✅ Wallet connected: 0xde92...78b9
✅ Token deployed at: 0xbA04...d576

💸 Transfer #1
   From: 0xde92...78b9
   To:   Alice (0x069c...1E8D)
   Amount: 100.0 AITT

🧠 AI analyzing transfer...
💡 AI Insight (1077ms):
   "Transfer of 100.0 AITT tokens to Alice indicates 
    a potential investment or partnership..."

[... 2 more transfers with AI analysis ...]

✅ Demo Completed Successfully!
📊 Summary:
   • Transfers monitored: 3
   • AI analyses performed: 3
```

## 🎯 For Hackathon Demo

**See detailed guide:**
- 📋 [QUICK-START.md](QUICK-START.md) - Complete demo guide & script

## 🛠️ SDK Features Showcased

| Feature | Lines of Code |
|---------|---------------|
| Contract Deployment | 3 lines |
| Event Monitoring | 5 lines |
| AI Integration | 2 lines |
| **Total** | **~50 lines** |

## 💡 Use Cases

- 🏦 DeFi risk monitoring
- 🔍 Fraud detection  
- 📊 Trading pattern analysis
- 🤖 Autonomous agents
- 🔔 Smart alerts

## 📁 Files

```
09-ai-token-monitor/
├── index.ts               # Main demo
├── pre-demo-check.sh      # Setup verification
├── QUICK-START.md         # Demo guide
├── README.md              # This file
├── package.json           # Dependencies
└── contracts/
    ├── SimpleToken.sol    # Token source
    └── SimpleToken.json   # Compiled contract
```

## 📋 Prerequisites

- Node.js >= 18.0.0
- Ollama with llama3.2 model
- Somnia testnet wallet

**Don't have these?** The pre-demo check script will help you set up!

---

**Built with Somnia Agent Kit** 🚀  
https://github.com/xuanbach0212/somnia-agent-kit

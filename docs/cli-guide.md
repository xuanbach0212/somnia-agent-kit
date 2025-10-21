# 🖥️ CLI Guide

Complete guide for the Somnia Agent Kit command-line interface.

## 📦 Installation

### Global Installation

```bash
# Install globally
npm install -g somnia-agent-kit

# Or with pnpm
pnpm add -g somnia-agent-kit

# Or with yarn
yarn global add somnia-agent-kit
```

### Local Installation

```bash
# Install in your project
npm install somnia-agent-kit

# Use with npx
npx somnia-agent help
```

## 🚀 Quick Start

### Initialize Configuration

```bash
# Interactive setup
somnia-agent init --interactive
sak init --interactive

# Quick setup with defaults
somnia-agent init
sak init

# Custom network
somnia-agent init --network testnet
sak init --network testnet
```

### Check Version

```bash
somnia-agent version
sak version
```

### Get Help

```bash
# General help
somnia-agent help
sak help

# Command-specific help
somnia-agent help agent:register
sak help agent:register
```

## 📋 Commands

### 🔧 Initialization

#### `init` - Initialize Configuration

Initialize CLI configuration with network settings and contract addresses.

```bash
somnia-agent init [options]
sak init [options]
```

**Options:**
- `-n, --network <network>` - Network (testnet/mainnet/devnet) [default: testnet]
- `--rpc-url <url>` - Custom RPC URL
- `-k, --private-key <key>` - Private key
- `-i, --interactive` - Interactive setup

**Examples:**

```bash
# Interactive setup (recommended)
sak init --interactive

# Quick setup with testnet
sak init --network testnet

# Custom RPC URL
sak init --rpc-url https://custom-rpc.somnia.network

# With private key
sak init --network testnet --private-key 0x...
```

**Configuration File:**

The CLI stores configuration in `~/.somnia-agent/config.json`:

```json
{
  "network": "testnet",
  "rpcUrl": "https://dream-rpc.somnia.network",
  "chainId": 50312,
  "privateKey": "0x...",
  "contracts": {
    "agentRegistry": "0xC9f3452090EEB519467DEa4a390976D38C008347",
    "agentManager": "0x77F6dC5924652e32DBa0B4329De0a44a2C95691E",
    "agentExecutor": "0x157C56dEdbAB6caD541109daabA4663Fc016026e",
    "agentVault": "0x7cEe3142A9c6d15529C322035041af697B2B5129"
  }
}
```

---

### 🤖 Agent Management

#### `agent:register` - Register Agent

Register a new AI agent on-chain.

```bash
somnia-agent agent:register [options]
sak agent:register [options]
```

**Options:**
- `-n, --name <name>` - Agent name (required)
- `-d, --description <desc>` - Agent description
- `-m, --metadata <uri>` - IPFS metadata URI
- `-c, --capabilities <list>` - Comma-separated capabilities
- `--config <file>` - Load from config file

**Examples:**

```bash
# Basic registration
sak agent:register --name "Trading Bot" --description "AI-powered trading assistant"

# With capabilities
sak agent:register \
  --name "Analytics Agent" \
  --description "Market analysis" \
  --capabilities "trading,analysis,portfolio-management"

# With metadata
sak agent:register \
  --name "My Agent" \
  --metadata "ipfs://QmExample123"

# From config file
sak agent:register --config ./agent-config.json
```

**Config File Format:**

```json
{
  "name": "Trading Bot",
  "description": "AI-powered trading assistant",
  "metadata": "ipfs://QmExample123",
  "capabilities": ["trading", "analysis", "portfolio-management"]
}
```

**Output:**

```
📝 Registering agent on-chain...

👤 Registering as: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

⏳ Sending transaction...
📤 Transaction hash: 0x123...
⏳ Waiting for confirmation...

✅ Transaction confirmed!

🎉 Agent registered successfully!

📋 Agent Details:
   ID:           1
   Name:         Trading Bot
   Description:  AI-powered trading assistant
   Owner:        0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   Capabilities: trading, analysis, portfolio-management
   Metadata:     ipfs://QmExample123

💡 Next steps:
   - View agent: sak agent:info 1
   - Create task: sak task:create 1 --data '{...}'
```

---

#### `agent:list` - List Agents

List all registered agents.

```bash
somnia-agent agent:list [options]
sak agent:list [options]
```

**Options:**
- `-o, --owner <address>` - Filter by owner address
- `-a, --active` - Show only active agents
- `-l, --limit <n>` - Limit results [default: 10]
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# List all agents
sak agent:list

# List only active agents
sak agent:list --active

# List agents by owner
sak agent:list --owner 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# List with custom limit
sak agent:list --limit 20

# JSON output
sak agent:list --format json
```

**Table Output:**

```
📋 Fetching agents...

Total agents: 5

┌──────┬─────────────────────┬──────────────────────────────────────────────┬────────┐
│ ID   │ Name                │ Owner                                        │ Active │
├──────┼─────────────────────┼──────────────────────────────────────────────┼────────┤
│ 1    │ Trading Bot         │ 0x742d...f0bEb                               │ ✓      │
│ 2    │ Analytics Agent     │ 0x742d...f0bEb                               │ ✓      │
│ 3    │ Portfolio Manager   │ 0x123a...456ef                               │ ✓      │
└──────┴─────────────────────┴──────────────────────────────────────────────┴────────┘
```

**JSON Output:**

```json
{
  "agents": [
    {
      "id": 1,
      "name": "Trading Bot",
      "description": "AI-powered trading assistant",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "isActive": true,
      "metadata": "ipfs://QmExample123"
    }
  ]
}
```

---

#### `agent:info` - Get Agent Info

Get detailed information about a specific agent.

```bash
somnia-agent agent:info <id> [options]
sak agent:info <id> [options]
```

**Options:**
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Get agent info
sak agent:info 1

# JSON output
sak agent:info 1 --format json
```

**Table Output:**

```
📋 Fetching agent #1...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Agent #1                                                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Name:         Trading Bot                                                ║
║  Description:  AI-powered trading assistant                               ║
║  Owner:        0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb                 ║
║  Active:       ✓ Yes                                                      ║
║  Metadata:     ipfs://QmExample123                                        ║
║  Capabilities: trading, analysis, portfolio-management                    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### ⚡ Task Management

#### `task:create` - Create Task

Create a new task for an agent.

```bash
somnia-agent task:create <agent-id> [options]
sak task:create <agent-id> [options]
```

**Options:**
- `-d, --data <json>` - Task data (JSON string)
- `-f, --file <path>` - Load task data from file
- `-p, --payment <amount>` - Payment amount in STT [default: 0]

**Examples:**

```bash
# Create task with inline data
sak task:create 1 --data '{"action":"analyze","target":"ETH/USD"}'

# Create task from file
sak task:create 1 --file ./task-data.json

# Create task with payment
sak task:create 1 \
  --data '{"action":"trade","pair":"ETH/USD","amount":1}' \
  --payment 0.001
```

**Task Data Format:**

```json
{
  "action": "analyze",
  "target": "ETH/USD",
  "params": {
    "timeframe": "1h",
    "indicators": ["RSI", "MACD"]
  }
}
```

**Output:**

```
📝 Creating task for agent #1...

👤 Creating task as: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

⏳ Sending transaction...
📤 Transaction hash: 0x456...
⏳ Waiting for confirmation...

✅ Transaction confirmed!

🎉 Task created successfully!

📋 Task Details:
   ID:       123
   Agent ID: 1
   Payment:  0.001 STT
   Data:     {"action":"analyze","target":"ETH/USD"}

💡 Next steps:
   - Check status: sak task:status 123
```

---

#### `task:status` - Get Task Status

Get the status and result of a task.

```bash
somnia-agent task:status <task-id> [options]
sak task:status <task-id> [options]
```

**Options:**
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Get task status
sak task:status 123

# JSON output
sak task:status 123 --format json
```

**Table Output:**

```
📋 Fetching task #123...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Task #123                                                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Agent ID:  1                                                             ║
║  Status:    Completed                                                     ║
║  Data:      {"action":"analyze","target":"ETH/USD"}                       ║
║  Result:    {"status":"success","analysis":"Bullish momentum"}            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 💰 Wallet Commands

#### `wallet:balance` - Show Balance

Show wallet balance.

```bash
somnia-agent wallet:balance [address]
sak wallet:balance [address]
```

**Examples:**

```bash
# Show your balance
sak wallet:balance

# Show balance of specific address
sak wallet:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Output:**

```
💰 Fetching balance for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Wallet Balance                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Address:  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb                     ║
║  Balance:  1.5                                                            ║
║  Wei:      1500000000000000000                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

#### `wallet:info` - Show Wallet Info

Show detailed wallet information.

```bash
somnia-agent wallet:info
sak wallet:info
```

**Output:**

```
👤 Fetching wallet info...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Wallet Information                                                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Address:     0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb                  ║
║  Balance:     1.5                                                         ║
║  TX Count:    42                                                          ║
║  Network:     testnet                                                     ║
║  Chain ID:    50312                                                       ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 🌐 Network Commands

#### `network:info` - Show Network Info

Show current network information.

```bash
somnia-agent network:info
sak network:info
```

**Output:**

```
🌐 Fetching network information...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Network Information                                                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Name:         testnet                                                    ║
║  Chain ID:     50312                                                      ║
║  RPC URL:      https://dream-rpc.somnia.network                           ║
║  Block Number: 1234567                                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

#### `network:contracts` - Show Contract Addresses

Show deployed contract addresses.

```bash
somnia-agent network:contracts
sak network:contracts
```

**Output:**

```
📋 Fetching contract addresses...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Contract Addresses (testnet)                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  AgentRegistry:  0xC9f3452090EEB519467DEa4a390976D38C008347              ║
║  AgentManager:   0x77F6dC5924652e32DBa0B4329De0a44a2C95691E              ║
║  AgentExecutor:  0x157C56dEdbAB6caD541109daabA4663Fc016026e              ║
║  AgentVault:     0x7cEe3142A9c6d15529C322035041af697B2B5129              ║
╚═══════════════════════════════════════════════════════════════════════════╝

💡 You can verify these contracts on the block explorer:
   https://explorer.somnia.network/testnet
```

---

## 🎯 Common Workflows

### Complete Agent Lifecycle

```bash
# 1. Initialize CLI
sak init --interactive

# 2. Register an agent
sak agent:register \
  --name "Trading Bot" \
  --description "AI-powered trading" \
  --capabilities "trading,analysis"

# 3. List agents to get ID
sak agent:list

# 4. Create a task
sak task:create 1 \
  --data '{"action":"analyze","target":"ETH/USD"}' \
  --payment 0.001

# 5. Check task status
sak task:status 1

# 6. View agent details
sak agent:info 1
```

### Monitor Your Agents

```bash
# List your agents
sak agent:list --owner $(sak wallet:info --format json | jq -r .address)

# Check wallet balance
sak wallet:balance

# View network status
sak network:info
```

### Batch Operations

```bash
# Register multiple agents
for name in "Bot1" "Bot2" "Bot3"; do
  sak agent:register --name "$name" --description "Agent $name"
done

# Create multiple tasks
for i in {1..5}; do
  sak task:create 1 --data "{\"task\":$i}"
done
```

---

## ⚙️ Configuration

### Environment Variables

You can use environment variables instead of CLI flags:

```bash
# Set in .env or shell
export PRIVATE_KEY=0x...
export SOMNIA_RPC_URL=https://dream-rpc.somnia.network
export AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
export AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
export AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
export AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# Then use CLI without flags
sak agent:list
```

### Config File Location

```bash
# View config
cat ~/.somnia-agent/config.json

# Edit config
nano ~/.somnia-agent/config.json

# Remove config
rm ~/.somnia-agent/config.json
```

---

## 🐛 Troubleshooting

### Configuration Not Found

```bash
❌ Error: Configuration not found. Run "somnia-agent init" first.

# Solution:
sak init
```

### Private Key Required

```bash
❌ Error: Private key required for registration. Set PRIVATE_KEY or use --private-key

# Solutions:
# 1. Set in config
sak init --private-key 0x...

# 2. Set as environment variable
export PRIVATE_KEY=0x...

# 3. Pass as flag
sak agent:register --name "Bot" --private-key 0x...
```

### Insufficient Funds

```bash
❌ Error: Insufficient funds

# Check balance
sak wallet:balance

# Get testnet tokens from faucet
# https://faucet.somnia.network
```

### Network Connection Issues

```bash
❌ Error: Network connection failed

# Check network info
sak network:info

# Try custom RPC
sak init --rpc-url https://alternative-rpc.somnia.network
```

---

## 💡 Tips & Best Practices

### 1. Use Short Alias

```bash
# Use 'sak' for faster typing
sak agent:list  # instead of somnia-agent agent:list
```

### 2. JSON Output for Scripting

```bash
# Use JSON output for scripts
AGENT_ID=$(sak agent:list --format json | jq -r '.agents[0].id')
sak agent:info $AGENT_ID
```

### 3. Save Common Commands as Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias sak-list='sak agent:list --active'
alias sak-balance='sak wallet:balance'
alias sak-info='sak network:info'
```

### 4. Use Config Files for Complex Agents

```bash
# Create agent-config.json
cat > agent-config.json << EOF
{
  "name": "Advanced Trading Bot",
  "description": "Multi-strategy trading agent",
  "capabilities": ["trading", "analysis", "risk-management"],
  "metadata": "ipfs://QmExample123"
}
EOF

# Register from config
sak agent:register --config agent-config.json
```

### 5. Debug Mode

```bash
# Enable debug output
DEBUG=1 sak agent:list
```

---

## 📚 See Also

- [Quick Start Guide](quickstart.md)
- [API Reference](../API_REFERENCE.md)
- [Smart Contracts](contracts-overview.md)
- [Examples](../examples/README.md)

---

## 🆘 Need Help?

- **Documentation**: https://github.com/xuanbach0212/somnia-agent-kit
- **Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues
- **Discord**: [Join our community](#)

---

**Happy building with Somnia Agent Kit CLI!** 🚀


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
sak -h
sak --help

# Command-specific help
somnia-agent help agent:register
sak help agent:register
sak agent:register -h
sak agent:register --help
```

> **Note:** All commands support `-h` and `--help` flags for quick help access!

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

### 💰 Token Management

#### `token:balance` - Check Token Balance

Check ERC20 token or native STT balance.

```bash
somnia-agent token:balance <address> [options]
sak token:balance <address> [options]
```

**Options:**
- `-t, --token <address>` - ERC20 token contract address (omit for native STT)
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Check native STT balance
sak token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Check ERC20 token balance
sak token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  --token 0x1234567890123456789012345678901234567890

# JSON output
sak token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --format json
```

**Output:**

```
💰 Checking balance...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Token Balance                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Address:  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb                     ║
║  Token:    STT (Native)                                                   ║
║  Balance:  1.5 STT                                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

#### `token:transfer` - Transfer Tokens

Transfer ERC20 tokens or native STT.

```bash
somnia-agent token:transfer <to> <amount> [options]
sak token:transfer <to> <amount> [options]
```

**Options:**
- `-t, --token <address>` - ERC20 token contract address (omit for native STT)
- `-d, --decimals <n>` - Token decimals [default: 18]

**Examples:**

```bash
# Transfer native STT
sak token:transfer 0x123...456 1.5

# Transfer ERC20 tokens
sak token:transfer 0x123...456 100 \
  --token 0x1234567890123456789012345678901234567890

# Transfer with custom decimals
sak token:transfer 0x123...456 100 \
  --token 0x1234567890123456789012345678901234567890 \
  --decimals 6
```

**Output:**

```
💸 Transferring tokens...

⏳ Sending transaction...
📤 Transaction hash: 0x789...
⏳ Waiting for confirmation...

✅ Transfer successful!

📋 Transfer Details:
   To:      0x123...456
   Amount:  1.5 STT
   Tx Hash: 0x789...
```

---

#### `token:info` - Get Token Information

Get detailed information about an ERC20 token.

```bash
somnia-agent token:info <token-address> [options]
sak token:info <token-address> [options]
```

**Options:**
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Get token info
sak token:info 0x1234567890123456789012345678901234567890

# JSON output
sak token:info 0x1234567890123456789012345678901234567890 --format json
```

**Output:**

```
📋 Fetching token information...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Token Information                                                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Address:      0x1234567890123456789012345678901234567890                ║
║  Name:         Example Token                                              ║
║  Symbol:       EXT                                                        ║
║  Decimals:     18                                                         ║
║  Total Supply: 1,000,000 EXT                                              ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

#### `token:approve` - Approve Token Spending

Approve a spender to use your ERC20 tokens.

```bash
somnia-agent token:approve <token> <spender> <amount> [options]
sak token:approve <token> <spender> <amount> [options]
```

**Options:**
- `-d, --decimals <n>` - Token decimals [default: 18]

**Examples:**

```bash
# Approve spending
sak token:approve \
  0x1234567890123456789012345678901234567890 \
  0x9876543210987654321098765432109876543210 \
  1000

# Approve with custom decimals
sak token:approve \
  0x1234567890123456789012345678901234567890 \
  0x9876543210987654321098765432109876543210 \
  1000 \
  --decimals 6
```

**Output:**

```
✅ Approval successful!

📋 Approval Details:
   Token:   0x1234...7890
   Spender: 0x9876...3210
   Amount:  1000 EXT
   Tx Hash: 0xabc...
```

---

### 🎨 NFT Management

#### `nft:owner` - Get NFT Owner

Get the owner of a specific NFT.

```bash
somnia-agent nft:owner <token-id> [options]
sak nft:owner <token-id> [options]
```

**Options:**
- `-c, --collection <address>` - NFT collection contract address (required)
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Get NFT owner
sak nft:owner 123 --collection 0x1234567890123456789012345678901234567890

# JSON output
sak nft:owner 123 \
  --collection 0x1234567890123456789012345678901234567890 \
  --format json
```

**Output:**

```
🎨 Fetching NFT owner...

╔═══════════════════════════════════════════════════════════════════════════╗
║  NFT #123                                                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Collection: 0x1234567890123456789012345678901234567890                  ║
║  Token ID:   123                                                          ║
║  Owner:      0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb                   ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

#### `nft:transfer` - Transfer NFT

Transfer an NFT to another address.

```bash
somnia-agent nft:transfer <token-id> <to> [options]
sak nft:transfer <token-id> <to> [options]
```

**Options:**
- `-c, --collection <address>` - NFT collection contract address (required)

**Examples:**

```bash
# Transfer NFT
sak nft:transfer 123 0x123...456 \
  --collection 0x1234567890123456789012345678901234567890
```

**Output:**

```
🎨 Transferring NFT...

⏳ Sending transaction...
📤 Transaction hash: 0xdef...
⏳ Waiting for confirmation...

✅ Transfer successful!

📋 Transfer Details:
   Token ID: 123
   To:       0x123...456
   Tx Hash:  0xdef...
```

---

#### `nft:metadata` - Get NFT Metadata

Get metadata for an NFT.

```bash
somnia-agent nft:metadata <token-id> [options]
sak nft:metadata <token-id> [options]
```

**Options:**
- `-c, --collection <address>` - NFT collection contract address (required)
- `-f, --format <type>` - Output format (table/json) [default: table]

**Examples:**

```bash
# Get NFT metadata
sak nft:metadata 123 --collection 0x1234567890123456789012345678901234567890

# JSON output
sak nft:metadata 123 \
  --collection 0x1234567890123456789012345678901234567890 \
  --format json
```

**Output:**

```
🎨 Fetching NFT metadata...

╔═══════════════════════════════════════════════════════════════════════════╗
║  NFT Metadata                                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Token ID:    123                                                         ║
║  Name:        Cool NFT #123                                               ║
║  Description: An awesome NFT                                              ║
║  Image:       ipfs://QmExample123                                         ║
║  Attributes:  Rarity: Rare, Type: Art                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 🚀 Contract Deployment

#### `deploy:contract` - Deploy Smart Contract

Deploy a smart contract to Somnia network.

```bash
somnia-agent deploy:contract [options]
sak deploy:contract [options]
```

**Options:**
- `-b, --bytecode <path>` - Path to bytecode file (required)
- `-a, --abi <path>` - Path to ABI file (required)
- `--args <json>` - Constructor arguments as JSON array
- `--gas-limit <n>` - Gas limit for deployment

**Examples:**

```bash
# Deploy without constructor args
sak deploy:contract \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json

# Deploy with constructor args
sak deploy:contract \
  --bytecode ./MyToken.bin \
  --abi ./MyToken.json \
  --args '["MyToken", "MTK", 1000000]'

# Deploy with custom gas limit
sak deploy:contract \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json \
  --gas-limit 5000000
```

**Output:**

```
🚀 Deploying contract...

⏳ Estimating gas...
💰 Estimated cost: 0.005 STT

⏳ Sending deployment transaction...
📤 Transaction hash: 0xghi...
⏳ Waiting for confirmation...

✅ Contract deployed successfully!

📋 Deployment Details:
   Contract Address: 0xabcd...ef01
   Transaction Hash: 0xghi...
   Gas Used:         2,500,000
   Block Number:     1234567

💡 Next steps:
   - Verify: sak deploy:verify 0xabcd...ef01 --bytecode ./MyContract.bin
   - Interact with your contract using the SDK
```

---

#### `deploy:create2` - Deploy with CREATE2

Deploy a contract using CREATE2 for deterministic addresses.

```bash
somnia-agent deploy:create2 [options]
sak deploy:create2 [options]
```

**Options:**
- `-b, --bytecode <path>` - Path to bytecode file (required)
- `-a, --abi <path>` - Path to ABI file (required)
- `-s, --salt <hex>` - Salt for CREATE2 (32 bytes hex)
- `--args <json>` - Constructor arguments as JSON array

**Examples:**

```bash
# Deploy with CREATE2
sak deploy:create2 \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json \
  --salt 0x0000000000000000000000000000000000000000000000000000000000000001

# With constructor args
sak deploy:create2 \
  --bytecode ./MyToken.bin \
  --abi ./MyToken.json \
  --salt 0x0000000000000000000000000000000000000000000000000000000000000001 \
  --args '["MyToken", "MTK"]'
```

**Output:**

```
🚀 Deploying contract with CREATE2...

📍 Predicted Address: 0x1234...5678

⏳ Sending deployment transaction...
✅ Contract deployed at predicted address!

📋 Deployment Details:
   Contract Address: 0x1234...5678
   Salt:             0x0000...0001
   Transaction Hash: 0xjkl...
```

---

#### `deploy:verify` - Verify Contract

Verify a deployed contract on block explorer.

```bash
somnia-agent deploy:verify <address> [options]
sak deploy:verify <address> [options]
```

**Options:**
- `-b, --bytecode <path>` - Path to bytecode file (required)
- `-a, --abi <path>` - Path to ABI file
- `--args <json>` - Constructor arguments as JSON array
- `--name <name>` - Contract name
- `--compiler <version>` - Solidity compiler version

**Examples:**

```bash
# Verify contract
sak deploy:verify 0xabcd...ef01 \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json \
  --name "MyContract" \
  --compiler "0.8.20"

# Verify with constructor args
sak deploy:verify 0xabcd...ef01 \
  --bytecode ./MyToken.bin \
  --abi ./MyToken.json \
  --args '["MyToken", "MTK", 1000000]' \
  --name "MyToken"
```

**Output:**

```
🔍 Verifying contract...

⏳ Submitting verification request...
✅ Verification submitted!

📋 Verification Details:
   Contract:  0xabcd...ef01
   Status:    Pending
   GUID:      abc123def456

💡 Check status: sak deploy:check 0xabcd...ef01
```

---

#### `deploy:check` - Check Verification Status

Check the verification status of a contract.

```bash
somnia-agent deploy:check <address>
sak deploy:check <address>
```

**Examples:**

```bash
# Check verification status
sak deploy:check 0xabcd...ef01
```

**Output:**

```
🔍 Checking verification status...

╔═══════════════════════════════════════════════════════════════════════════╗
║  Verification Status                                                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Contract: 0xabcd...ef01                                                  ║
║  Status:   ✅ Verified                                                    ║
║  Explorer: https://explorer.somnia.network/address/0xabcd...ef01          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### ⚡ Multicall

#### `multicall:batch` - Execute Batch Calls

Execute multiple contract calls in a single transaction using Multicall3.

```bash
somnia-agent multicall:batch <calls-file>
sak multicall:batch <calls-file>
```

**Calls File Format (JSON):**

```json
[
  {
    "target": "0x1234567890123456789012345678901234567890",
    "callData": "0x70a08231000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb"
  },
  {
    "target": "0x9876543210987654321098765432109876543210",
    "callData": "0x18160ddd"
  }
]
```

**Examples:**

```bash
# Execute batch calls
sak multicall:batch ./calls.json

# Create calls file and execute
cat > calls.json << EOF
[
  {
    "target": "0x1234567890123456789012345678901234567890",
    "callData": "0x70a08231000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb"
  }
]
EOF
sak multicall:batch calls.json
```

**Output:**

```
⚡ Executing batch calls...

📋 Calls to execute: 2

⏳ Sending multicall transaction...
✅ Batch executed successfully!

📊 Results:
   Call 1: Success - 0x0000000000000000000000000000000000000000000000000de0b6b3a7640000
   Call 2: Success - 0x00000000000000000000000000000000000000000000003635c9adc5dea00000
```

---

#### `multicall:aggregate` - Aggregate Multiple Calls

Aggregate multiple read-only calls without sending a transaction.

```bash
somnia-agent multicall:aggregate <calls-file>
sak multicall:aggregate <calls-file>
```

**Examples:**

```bash
# Aggregate calls (read-only)
sak multicall:aggregate ./calls.json
```

**Output:**

```
⚡ Aggregating calls...

📋 Calls to aggregate: 2

✅ Aggregation complete!

📊 Results:
   Block Number: 1234567
   Call 1: 0x0000000000000000000000000000000000000000000000000de0b6b3a7640000
   Call 2: 0x00000000000000000000000000000000000000000000003635c9adc5dea00000
```

---

### 📦 IPFS

#### `ipfs:upload` - Upload File to IPFS

Upload a file to IPFS.

```bash
somnia-agent ipfs:upload <file-path>
sak ipfs:upload <file-path>
```

**Examples:**

```bash
# Upload file
sak ipfs:upload ./image.png

# Upload JSON metadata
sak ipfs:upload ./metadata.json
```

**Output:**

```
📦 Uploading to IPFS...

⏳ Uploading file...
✅ Upload successful!

📋 IPFS Details:
   File:      image.png
   Hash:      QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
   Size:      1.2 MB
   IPFS URI:  ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
   HTTP URL:  https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG

💡 Use this URI in your NFT metadata or agent configuration
```

---

#### `ipfs:get` - Download from IPFS

Download a file from IPFS.

```bash
somnia-agent ipfs:get <hash> [output-path]
sak ipfs:get <hash> [output-path]
```

**Examples:**

```bash
# Download file
sak ipfs:get QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG

# Download to specific path
sak ipfs:get QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG ./downloaded.png
```

**Output:**

```
📦 Downloading from IPFS...

⏳ Fetching file...
✅ Download successful!

📋 Download Details:
   Hash:      QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
   Saved to:  ./downloaded.png
   Size:      1.2 MB
```

---

#### `ipfs:metadata` - Upload NFT Metadata

Upload NFT metadata to IPFS.

```bash
somnia-agent ipfs:metadata [options]
sak ipfs:metadata [options]
```

**Options:**
- `-n, --name <name>` - NFT name (required)
- `-d, --description <desc>` - NFT description (required)
- `-i, --image <uri>` - Image URI (IPFS or HTTP) (required)
- `-a, --attributes <json>` - Attributes as JSON array

**Examples:**

```bash
# Upload NFT metadata
sak ipfs:metadata \
  --name "Cool NFT #1" \
  --description "An awesome NFT" \
  --image "ipfs://QmImage123"

# With attributes
sak ipfs:metadata \
  --name "Cool NFT #1" \
  --description "An awesome NFT" \
  --image "ipfs://QmImage123" \
  --attributes '[{"trait_type":"Rarity","value":"Rare"}]'
```

**Output:**

```
📦 Uploading NFT metadata to IPFS...

⏳ Creating metadata...
⏳ Uploading to IPFS...
✅ Upload successful!

📋 Metadata Details:
   Name:        Cool NFT #1
   Description: An awesome NFT
   Image:       ipfs://QmImage123
   Metadata URI: ipfs://QmMetadata456
   HTTP URL:    https://ipfs.io/ipfs/QmMetadata456

💡 Use this URI when minting your NFT
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

### Token & NFT Management

```bash
# Check token balances
sak token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
sak token:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  --token 0x1234567890123456789012345678901234567890

# Transfer tokens
sak token:transfer 0x123...456 100 \
  --token 0x1234567890123456789012345678901234567890

# Get NFT info
sak nft:owner 123 --collection 0x1234567890123456789012345678901234567890
sak nft:metadata 123 --collection 0x1234567890123456789012345678901234567890

# Transfer NFT
sak nft:transfer 123 0x123...456 \
  --collection 0x1234567890123456789012345678901234567890
```

### Contract Deployment Workflow

```bash
# 1. Deploy contract
sak deploy:contract \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json \
  --args '["arg1", "arg2"]'

# 2. Verify contract
sak deploy:verify 0xContractAddress \
  --bytecode ./MyContract.bin \
  --abi ./MyContract.json \
  --args '["arg1", "arg2"]' \
  --name "MyContract" \
  --compiler "0.8.20"

# 3. Check verification
sak deploy:check 0xContractAddress
```

### IPFS & NFT Metadata

```bash
# 1. Upload image to IPFS
sak ipfs:upload ./nft-image.png
# Returns: ipfs://QmImageHash

# 2. Create and upload metadata
sak ipfs:metadata \
  --name "Cool NFT #1" \
  --description "An awesome NFT" \
  --image "ipfs://QmImageHash" \
  --attributes '[{"trait_type":"Rarity","value":"Rare"}]'
# Returns: ipfs://QmMetadataHash

# 3. Use metadata URI when minting NFT
```

### Multicall for Batch Operations

```bash
# 1. Create calls file
cat > batch-calls.json << EOF
[
  {
    "target": "0xTokenContract",
    "callData": "0x70a08231..." 
  },
  {
    "target": "0xNFTContract",
    "callData": "0x6352211e..."
  }
]
EOF

# 2. Execute batch (read-only)
sak multicall:aggregate batch-calls.json

# 3. Execute batch (with transaction)
sak multicall:batch batch-calls.json
```

### Monitor Your Agents

```bash
# List your agents
sak agent:list --owner $(sak wallet:info --format json | jq -r .address)

# Check wallet balance
sak wallet:balance

# View network status
sak network:info

# Check contract addresses
sak network:contracts
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

# Check multiple token balances
for token in "0xToken1" "0xToken2" "0xToken3"; do
  sak token:balance 0xYourAddress --token "$token"
done
```

---

## ⚙️ Configuration

The CLI supports **multiple configuration methods** with the following priority (highest to lowest):

1. **Command-line arguments** (highest priority)
2. **Environment variables**
3. **.env file** (automatic loading)
4. **Config file** (~/.somnia-agent/config.json)
5. **Defaults** (lowest priority)

### Method 1: .env File (Recommended) ⭐

The CLI **automatically loads** configuration from a `.env` file in your current directory!

```bash
# Create .env file (recommended for development)
cat > .env << EOF
# Network Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network

# Your Wallet
PRIVATE_KEY=0x...

# Contract Addresses (Testnet)
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129
EOF

# Now all commands work automatically!
sak agent:list
sak wallet:info
sak token:balance 0x...
```

**Benefits:**
- ✅ No need to export variables every time
- ✅ Works across terminal sessions
- ✅ Easy to manage and version control (add to .gitignore!)
- ✅ Industry best practice

**.env.example Template:**

```bash
# Copy this to .env and fill in your values
# DO NOT commit .env to git!

# Network Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network

# Your Wallet Private Key
PRIVATE_KEY=0x...

# Somnia Testnet Contract Addresses
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# Optional: IPFS Gateway
IPFS_GATEWAY=https://ipfs.io
```

### Method 2: Environment Variables

Export variables in your shell:

```bash
# Set in shell
export PRIVATE_KEY=0x...
export SOMNIA_RPC_URL=https://dream-rpc.somnia.network
export AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
export AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
export AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
export AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# Then use CLI
sak agent:list
```

### Method 3: Config File

Initialize and use persistent config file:

```bash
# Initialize config file
sak init --network testnet

# View config
cat ~/.somnia-agent/config.json

# Edit config
nano ~/.somnia-agent/config.json

# Remove config
rm ~/.somnia-agent/config.json
```

**Config File Format:**

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

### Method 4: Command-line Arguments

Override any config with CLI flags:

```bash
# Override RPC URL
sak agent:list --rpc-url https://custom-rpc.somnia.network

# Override private key
sak agent:register --name "Bot" --private-key 0x...
```

### Configuration Priority Example

```bash
# If you have all config methods set:
# 1. CLI flag wins
sak agent:list --rpc-url https://custom.com  # Uses https://custom.com

# 2. Then ENV variable
export SOMNIA_RPC_URL=https://env.com
sak agent:list  # Uses https://env.com

# 3. Then .env file
# .env: SOMNIA_RPC_URL=https://dotenv.com
sak agent:list  # Uses https://dotenv.com

# 4. Then config file
# ~/.somnia-agent/config.json: "rpcUrl": "https://config.com"
sak agent:list  # Uses https://config.com

# 5. Finally defaults
sak agent:list  # Uses https://dream-rpc.somnia.network (default)
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

## 📊 Command Summary

The CLI provides **28 commands** across 9 categories:

| Category | Commands | Description |
|----------|----------|-------------|
| **Initialization** | `init` | Initialize configuration |
| **Agent Management** | `agent:register`, `agent:list`, `agent:info` | Manage AI agents |
| **Task Management** | `task:create`, `task:status` | Create and track tasks |
| **Token Management** | `token:balance`, `token:transfer`, `token:info`, `token:approve` | ERC20 & native tokens |
| **NFT Management** | `nft:owner`, `nft:transfer`, `nft:metadata` | ERC721 NFTs |
| **Contract Deployment** | `deploy:contract`, `deploy:create2`, `deploy:verify`, `deploy:check` | Deploy & verify contracts |
| **Multicall** | `multicall:batch`, `multicall:aggregate` | Batch RPC calls |
| **IPFS** | `ipfs:upload`, `ipfs:get`, `ipfs:metadata` | Decentralized storage |
| **Wallet** | `wallet:balance`, `wallet:info` | Wallet information |
| **Network** | `network:info`, `network:contracts` | Network details |

**Total: 28 commands** - All support `-h` and `--help` flags!

---

## 💡 Tips & Best Practices

### 1. Use .env File (Recommended)

```bash
# Set up once, use everywhere
cat > .env << EOF
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=0x...
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129
EOF

# All commands work automatically!
sak agent:list
```

### 2. Use Short Alias

```bash
# Use 'sak' for faster typing
sak agent:list  # instead of somnia-agent agent:list
```

### 3. Get Help Anytime

```bash
# Multiple ways to get help
sak -h
sak help
sak agent:register -h
sak agent:register --help
sak help agent:register
```

### 4. JSON Output for Scripting

```bash
# Use JSON output for scripts
AGENT_ID=$(sak agent:list --format json | jq -r '.agents[0].id')
sak agent:info $AGENT_ID

# Get token balance programmatically
BALANCE=$(sak token:balance 0x... --format json | jq -r '.balance')
```

### 5. Save Common Commands as Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias sak-list='sak agent:list --active'
alias sak-balance='sak wallet:balance'
alias sak-info='sak network:info'
alias sak-contracts='sak network:contracts'
```

### 6. Use Config Files for Complex Data

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

# Create multicall batch file
cat > batch-calls.json << EOF
[
  {"target": "0xToken1", "callData": "0x..."},
  {"target": "0xToken2", "callData": "0x..."}
]
EOF
sak multicall:batch batch-calls.json
```

### 7. Combine with Other Tools

```bash
# Use with jq for JSON processing
sak agent:list --format json | jq '.agents[] | select(.isActive == true)'

# Use with watch for monitoring
watch -n 10 'sak wallet:balance'

# Use with curl for automation
curl -X POST https://api.example.com/agents \
  -d "$(sak agent:list --format json)"
```

### 8. Batch Operations with Loops

```bash
# Check multiple addresses
for addr in 0xAddr1 0xAddr2 0xAddr3; do
  echo "Balance for $addr:"
  sak token:balance $addr
done

# Deploy multiple contracts
for contract in Contract1 Contract2 Contract3; do
  sak deploy:contract \
    --bytecode ./${contract}.bin \
    --abi ./${contract}.json
done
```

### 9. Security Best Practices

```bash
# ✅ DO: Use .env file (add to .gitignore)
echo ".env" >> .gitignore

# ✅ DO: Use config file with restricted permissions
chmod 600 ~/.somnia-agent/config.json

# ❌ DON'T: Commit private keys to git
# ❌ DON'T: Share your .env file
# ❌ DON'T: Use private keys in command history
```

### 10. Debug Mode

```bash
# Enable debug output
DEBUG=1 sak agent:list

# Verbose error messages
NODE_ENV=development sak agent:register --name "Test"
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


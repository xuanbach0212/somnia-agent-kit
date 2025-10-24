# 📋 AgentRegistry Contract

The **AgentRegistry** is the core smart contract for managing AI agent registration and discovery on the Somnia blockchain.

## 🎯 Overview

The AgentRegistry contract provides:
- ✅ **Agent Registration** - Register new AI agents on-chain
- ✅ **Agent Discovery** - Find and query registered agents
- ✅ **Ownership Management** - Control agent ownership and transfers
- ✅ **Metadata Storage** - Store agent information via IPFS
- ✅ **Status Management** - Activate/deactivate agents

## 📊 Contract Architecture

```solidity
contract AgentRegistry {
    struct Agent {
        string name;             // Agent name
        string description;      // Agent description
        string ipfsMetadata;     // IPFS hash for metadata
        address owner;           // Agent owner address
        bool isActive;           // Active status
        uint256 registeredAt;    // Registration timestamp
        uint256 lastUpdated;     // Last update timestamp
        string[] capabilities;   // Agent capabilities
        uint256 executionCount;  // Execution counter
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public ownerAgents;
    uint256 public agentCounter;
}
```

## 🔧 Core Functions

### 1. Register Agent

Register a new AI agent on the blockchain.

```solidity
function registerAgent(
    string memory _name,
    string memory _description,
    string memory _ipfsMetadata,
    string[] memory _capabilities
) external returns (uint256)
```

**Parameters:**
- `_name` - Agent name
- `_description` - Agent description
- `_ipfsMetadata` - IPFS hash containing full metadata
- `_capabilities` - Array of agent capabilities

**Returns:**
- `uint256` - Unique ID of the registered agent

**Events Emitted:**
```solidity
event AgentRegistered(
    uint256 indexed agentId,
    address indexed owner,
    string name
);
```

**Example Usage:**

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';
import 'dotenv/config';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    agentVault: process.env.AGENT_VAULT_ADDRESS!,
  },
  privateKey: process.env.PRIVATE_KEY!,
});

await kit.initialize();

// Register agent
const tx = await kit.contracts.registry.registerAgent(
  'Trading Bot',
  'AI-powered trading assistant',
  'QmExample123', // IPFS hash
  ['trading', 'analysis', 'risk-management'] // capabilities
);

const receipt = await tx.wait();
console.log('Agent registered:', receipt.hash);

// Get agent ID from event
const event = receipt.logs.find(
  (log: any) =>
    log.topics[0] ===
    kit.contracts.registry.interface.getEvent('AgentRegistered').topicHash
);

if (event) {
  const parsed = kit.contracts.registry.interface.parseLog(event);
  const agentId = parsed?.args.agentId;
  console.log('Agent ID:', agentId.toString());
}
```

### 2. Get Agent Info

Retrieve complete information about an agent.

```solidity
function getAgent(uint256 _agentId) 
    external 
    view 
    returns (Agent memory)
```

**Parameters:**
- `_agentId` - ID of the agent to query

**Returns:**
- Tuple containing agent details

**Example:**

```typescript
const agentId = 1n;
const agent = await kit.contracts.registry.getAgent(agentId);

console.log('Agent Info:', {
  name: agent.name,
  description: agent.description,
  owner: agent.owner,
  ipfsMetadata: agent.ipfsMetadata,
  isActive: agent.isActive,
  capabilities: agent.capabilities,
  registeredAt: new Date(Number(agent.registeredAt) * 1000),
});
```

### 3. Update Agent

Update agent information (owner only).

```solidity
function updateAgent(
    uint256 _agentId,
    string memory _name,
    string memory _description,
    string memory _ipfsMetadata,
    string[] memory _capabilities
) external
```

**Requirements:**
- Caller must be agent owner

**Events Emitted:**
```solidity
event AgentUpdated(uint256 indexed agentId);
```

**Example:**

```typescript
const agentId = 1n;

const tx = await kit.contracts.registry.updateAgent(
  agentId,
  'Updated Trading Bot',
  'Enhanced AI trading assistant',
  'QmNewHash456'
);

await tx.wait();
console.log('Agent updated');
```

### 4. Set Agent Status

Activate or deactivate an agent (owner only).

```solidity
function setAgentStatus(
    uint256 _agentId,
    bool _isActive
) external
```

**Requirements:**
- Caller must be agent owner

**Events Emitted:**
```solidity
event AgentStatusChanged(
    uint256 indexed agentId,
    bool isActive
);
```

**Example:**

```typescript
// Deactivate agent
const tx1 = await kit.contracts.registry.setAgentStatus(agentId, false);
await tx1.wait();
console.log('Agent deactivated');

// Reactivate agent
const tx2 = await kit.contracts.registry.setAgentStatus(agentId, true);
await tx2.wait();
console.log('Agent reactivated');
```

{% hint style="info" %}
**Note:** Use `setAgentStatus(agentId, isActive)` instead of separate `deactivateAgent()` and `reactivateAgent()` methods.
{% endhint %}

### 5. Transfer Ownership

Transfer agent ownership to another address.

```solidity
function transferAgentOwnership(
    uint256 _agentId,
    address _newOwner
) external
```

**Requirements:**
- Caller must be current owner
- New owner cannot be zero address

**Events Emitted:**
```solidity
event AgentOwnershipTransferred(
    uint256 indexed agentId,
    address indexed previousOwner,
    address indexed newOwner
);
```

**Example:**

```typescript
const newOwner = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

const tx = await kit.contracts.registry.transferAgentOwnership(
  agentId,
  newOwner
);

await tx.wait();
console.log('Ownership transferred to:', newOwner);
```

## 🔍 Query Functions

### Get Total Agents

```solidity
function getTotalAgents() external view returns (uint256)
```

**Example:**

```typescript
const total = await kit.contracts.registry.getTotalAgents();
console.log('Total agents:', total.toString());
```

### Get Agents by Owner

```solidity
function getAgentsByOwner(address _owner) 
    external 
    view 
    returns (uint256[] memory)
```

**Example:**

```typescript
const myAddress = await kit.getSigner()?.getAddress();
const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);

console.log('My agents:', myAgents.map(id => id.toString()));
```

### Iterate Through All Agents

{% hint style="warning" %}
**Note:** The contract does not have `getAllAgents()` or `getActiveAgents()` methods. You need to iterate through agent IDs from 1 to `getTotalAgents()`.
{% endhint %}

**Example:**

```typescript
const totalAgents = await kit.contracts.registry.getTotalAgents();

for (let i = 1n; i <= totalAgents; i++) {
  try {
    const agent = await kit.contracts.registry.getAgent(i);
    console.log(`Agent #${i}: ${agent.name}`);
  } catch (error) {
    // Agent might not exist or be deleted
    console.log(`Agent #${i} not found`);
  }
}
```

## 📡 Events

### AgentRegistered

```solidity
event AgentRegistered(
    uint256 indexed agentId,
    address indexed owner,
    string name
);
```

**Listen for new agents:**

```typescript
kit.contracts.registry.on('AgentRegistered', (agentId, owner, name) => {
  console.log(`New agent registered: ${name} (ID: ${agentId.toString()})`);
  console.log(`Owner: ${owner}`);
});
```

### AgentUpdated

```solidity
event AgentUpdated(uint256 indexed agentId);
```

**Example:**

```typescript
kit.contracts.registry.on('AgentUpdated', (agentId) => {
  console.log(`Agent ${agentId.toString()} was updated`);
});
```

### AgentStatusChanged

```solidity
event AgentStatusChanged(
    uint256 indexed agentId,
    bool isActive
);
```

**Example:**

```typescript
kit.contracts.registry.on('AgentStatusChanged', (agentId, isActive) => {
  console.log(`Agent ${agentId.toString()} is now ${isActive ? 'active' : 'inactive'}`);
});
```

### AgentOwnershipTransferred

```solidity
event AgentOwnershipTransferred(
    uint256 indexed agentId,
    address indexed previousOwner,
    address indexed newOwner
);
```

## 🔒 Access Control

### Owner-Only Functions

These functions can only be called by the agent owner:
- `updateAgent()`
- `setAgentStatus()`
- `transferAgentOwnership()`

### Public Functions

These functions can be called by anyone:
- `registerAgent()` - Anyone can register a new agent
- All query functions (read-only)

## 💡 Best Practices

### 1. Metadata Structure

Store comprehensive metadata in IPFS:

```json
{
  "name": "Trading Bot",
  "description": "AI-powered trading assistant",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "MIT",
  "llm": {
    "recommended": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 1000
    }
  },
  "capabilities": [
    "trading",
    "analysis",
    "risk-management"
  ],
  "tags": ["finance", "trading", "ai"],
  "documentation": "https://docs.example.com/trading-bot",
  "repository": "https://github.com/user/trading-bot"
}
```


### 2. Error Handling

Always handle potential errors:

```typescript
try {
  const tx = await kit.contracts.registry.registerAgent(
    name,
    description,
    ipfsMetadata,
    capabilities
  );
  
  const receipt = await tx.wait();
  console.log('Success:', receipt.hash);
  
} catch (error: any) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough gas');
  } else if (error.message?.includes('Agent name already exists')) {
    console.error('Name taken, choose another');
  } else {
    console.error('Registration failed:', error);
  }
}
```

### 3. Verify Ownership

```typescript
const agent = await kit.contracts.registry.getAgent(agentId);
const signer = kit.getSigner();
const myAddress = await signer.getAddress();

if (agent.owner.toLowerCase() === myAddress.toLowerCase()) {
  // You own this agent
  await kit.contracts.registry.updateAgent(...);
}
```

## 📚 Related Documentation

- **[AgentManager Contract](./agent-manager.md)** - Task management
- **[AgentVault Contract](./agent-vault.md)** - Manage agent funds
- **[AgentExecutor Contract](./agent-executor.md)** - Execute agent tasks
- **[Smart Contracts Overview](../contracts-overview.md)** - All contracts

## 🔗 Contract Addresses

### Somnia Testnet
```
AgentRegistry: 0xC9f3452090EEB519467DEa4a390976D38C008347
```

### Somnia Mainnet
```
AgentRegistry: Coming soon
```

## ⚠️ Security Considerations

1. **Metadata Validation** - Always validate metadata before uploading to IPFS
2. **Owner Verification** - Verify ownership before sensitive operations
3. **IPFS Availability** - Ensure IPFS content is pinned and accessible
4. **Gas Costs** - Be aware of gas costs for operations

---

**Next:** Learn about [AgentManager](./agent-manager.md) for managing agent tasks.

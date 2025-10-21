# 📋 AgentRegistry Contract

The **AgentRegistry** is the core smart contract for managing AI agent registration and discovery on the Somnia blockchain.

## 🎯 Overview

The AgentRegistry contract provides:
- ✅ **Agent Registration** - Register new AI agents on-chain
- ✅ **Agent Discovery** - Find and query registered agents
- ✅ **Ownership Management** - Control agent ownership and transfers
- ✅ **Metadata Storage** - Store agent information via IPFS
- ✅ **Capability Tracking** - Define what agents can do

## 📊 Contract Architecture

```solidity
contract AgentRegistry {
    struct Agent {
        uint256 id;              // Unique agent identifier
        string name;             // Human-readable name
        string description;      // Agent description
        address owner;           // Agent owner address
        string metadataURI;      // IPFS URI for metadata
        string[] capabilities;   // List of capabilities
        bool isActive;           // Active status
        uint256 createdAt;       // Creation timestamp
        uint256 updatedAt;       // Last update timestamp
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public ownerAgents;
    uint256 public agentCount;
}
```

## 🔧 Core Functions

### 1. Register Agent

Register a new AI agent on the blockchain.

```solidity
function registerAgent(
    string memory name,
    string memory description,
    string memory metadataURI,
    string[] memory capabilities
) external returns (uint256 agentId)
```

**Parameters:**
- `name` - Agent name (max 100 characters)
- `description` - Agent description (max 500 characters)
- `metadataURI` - IPFS URI containing full metadata
- `capabilities` - Array of capability strings

**Returns:**
- `agentId` - Unique ID of the registered agent

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
  'ipfs://QmExample', // Metadata URI
  ['trading', 'analysis', 'risk-management']
);

const receipt = await tx.wait();
console.log('Agent registered:', receipt.hash);

// Get agent ID
const myAddress = await kit.getSigner()?.getAddress();
const myAgents = await kit.contracts.registry.getAgentsByOwner(myAddress!);
const agentId = myAgents[myAgents.length - 1];
console.log('Agent ID:', agentId.toString());
```

### 2. Get Agent Info

Retrieve complete information about an agent.

```solidity
function getAgent(uint256 agentId) 
    external 
    view 
    returns (Agent memory)
```

**Parameters:**
- `agentId` - ID of the agent to query

**Returns:**
- `Agent` - Complete agent struct

**Example:**

```typescript
const agentId = 1n;
const agent = await kit.contracts.registry.getAgent(agentId);

console.log('Agent Info:', {
  id: agent.id.toString(),
  name: agent.name,
  owner: agent.owner,
  capabilities: agent.capabilities,
  isActive: agent.isActive,
});
```

### 3. Update Agent

Update agent information (owner only).

```solidity
function updateAgent(
    uint256 agentId,
    string memory description,
    string memory metadataURI,
    string[] memory capabilities
) external
```

**Requirements:**
- Caller must be agent owner
- Agent must be active

**Example:**

```typescript
const agentId = 1n;

const tx = await kit.contracts.registry.updateAgent(
  agentId,
  'Updated description',
  'ipfs://QmNewMetadata',
  ['new-capability', 'another-capability']
);

await tx.wait();
console.log('Agent updated');
```

### 4. Deactivate Agent

Deactivate an agent (owner only).

```solidity
function deactivateAgent(uint256 agentId) external
```

**Requirements:**
- Caller must be agent owner
- Agent must be active

**Example:**

```typescript
const tx = await kit.contracts.registry.deactivateAgent(agentId);
await tx.wait();
console.log('Agent deactivated');
```

### 5. Reactivate Agent

Reactivate a previously deactivated agent.

```solidity
function reactivateAgent(uint256 agentId) external
```

**Example:**

```typescript
const tx = await kit.contracts.registry.reactivateAgent(agentId);
await tx.wait();
console.log('Agent reactivated');
```

### 6. Transfer Ownership

Transfer agent ownership to another address.

```solidity
function transferAgentOwnership(
    uint256 agentId,
    address newOwner
) external
```

**Requirements:**
- Caller must be current owner
- New owner cannot be zero address

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

### Get Agents by Owner

```solidity
function getAgentsByOwner(address owner) 
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

### Get All Agents

```solidity
function getAllAgents() 
    external 
    view 
    returns (Agent[] memory)
```

**Example:**

```typescript
const agentCount = await kit.contracts.registry.agentCount();
console.log('Total agents:', agentCount.toString());

// Get individual agents
for (let i = 1n; i <= agentCount; i++) {
  const agent = await kit.contracts.registry.getAgent(i);
  console.log(`${agent.name} (ID: ${agent.id}) - ${agent.description}`);
}
```

### Get Active Agents

```solidity
function getActiveAgents() 
    external 
    view 
    returns (Agent[] memory)
```

### Search Agents by Capability

```solidity
function getAgentsByCapability(string memory capability) 
    external 
    view 
    returns (uint256[] memory)
```

**Example:**

```typescript
// Note: This function may not be available in current contract version
// Alternative: Query all agents and filter by capability
const agentCount = await kit.contracts.registry.agentCount();
const tradingAgents = [];

for (let i = 1n; i <= agentCount; i++) {
  const agent = await kit.contracts.registry.getAgent(i);
  if (agent.capabilities.includes('trading')) {
    tradingAgents.push(agent);
  }
}

console.log('Trading agents:', tradingAgents);
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
});
```

### AgentUpdated

```solidity
event AgentUpdated(
    uint256 indexed agentId,
    string metadataURI
);
```

### AgentDeactivated

```solidity
event AgentDeactivated(
    uint256 indexed agentId
);
```

### AgentReactivated

```solidity
event AgentReactivated(
    uint256 indexed agentId
);
```

### OwnershipTransferred

```solidity
event OwnershipTransferred(
    uint256 indexed agentId,
    address indexed previousOwner,
    address indexed newOwner
);
```

## 🔒 Access Control

### Owner-Only Functions

These functions can only be called by the agent owner:
- `updateAgent()`
- `deactivateAgent()`
- `reactivateAgent()`
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

### 2. Capability Naming

Use consistent, lowercase capability names:

```typescript
// ✅ Good
capabilities: ['trading', 'analysis', 'risk-management']

// ❌ Bad
capabilities: ['Trading', 'ANALYSIS', 'Risk Management']
```

### 3. Error Handling

Always handle potential errors:

```typescript
try {
  const tx = await kit.contracts.registry.registerAgent(
    name,
    description,
    metadataURI,
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

### 4. Gas Optimization

Batch operations when possible:

```typescript
// Instead of multiple single registrations
for (const agent of agents) {
  await registerAgent(agent); // ❌ Expensive
}

// Use batch registration (if available)
await registerAgentBatch(agents); // ✅ Cheaper
```

## 🧪 Testing

### Unit Test Example

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('AgentRegistry', () => {
  it('should register a new agent', async () => {
    const [owner] = await ethers.getSigners();
    const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
    const registry = await AgentRegistry.deploy();
    
    const tx = await registry.registerAgent(
      'Test Agent',
      'A test agent',
      'ipfs://QmTest',
      ['test']
    );
    
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'AgentRegistered');
    
    expect(event).to.not.be.undefined;
    expect(event?.args?.name).to.equal('Test Agent');
  });
});
```

## 📚 Related Documentation

- **[AgentExecutor Contract](./agent-executor.md)** - Execute agent tasks
- **[AgentVault Contract](./agent-vault.md)** - Manage agent funds
- **[AgentManager Contract](./agent-manager.md)** - Task management
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
3. **Gas Limits** - Be aware of gas costs for large capability arrays
4. **IPFS Availability** - Ensure IPFS content is pinned and accessible

---

**Next:** Learn about [AgentExecutor](./agent-executor.md) for executing agent tasks.


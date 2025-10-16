# Smart Contracts Overview

## Contracts

### AgentRegistry.sol
Manages agent registration and metadata.

**Key Functions:**
- `registerAgent()`: Register new agent
- `deregisterAgent()`: Remove agent
- `getAgentInfo()`: Get agent details
- `getAgentList()`: List all agents

### AgentExecutor.sol
Handles task execution with authorization and gas management.

**Key Functions:**
- `authorizeAgent()`: Authorize agent for execution
- `executeTask()`: Execute agent task
- `getExecution()`: Get execution details

### AgentVault.sol
Manages agent funds with daily limits and token support.

**Key Functions:**
- `createVault()`: Create vault for agent
- `depositNative()`: Deposit native tokens
- `withdrawNative()`: Withdraw with daily limit
- `allowToken()`: Enable ERC20 token

### AgentManager.sol (Legacy)
Task queue and payment escrow management.

## Deployment

```bash
pnpm --filter contracts run deploy
```

## Verification

```bash
pnpm --filter contracts run verify
```

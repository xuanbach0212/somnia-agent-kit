# Quick Start Guide

Get started with Somnia Agent Kit in 5 minutes.

## Installation

```bash
pnpm add @somnia/agent-kit
```

## Basic Usage

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

// Create SDK instance
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0x...',
    agentExecutor: '0x...',
  },
  privateKey: 'your-private-key',
});

// Initialize
await kit.initialize();

// Use contracts
const agents = await kit.contracts.AgentRegistry.getAgentList();
console.log('Registered agents:', agents);
```

## Next Steps

- [Architecture Overview](./architecture.md)
- [SDK Design](./sdk-design.md)
- [Smart Contracts](./contracts-overview.md)
- [Examples](./examples/)

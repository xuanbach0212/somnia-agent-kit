# Minimal Agent Example

A minimal agent that responds to blockchain events.

## Code

```typescript
import { SomniaAgentKit, Agent, Trigger, TriggerType } from '@somnia/agent-kit';

async function main() {
  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: '0x...',
      agentExecutor: '0x...',
    },
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();

  // Create agent
  const agent = new Agent({
    name: 'MinimalAgent',
    description: 'A simple agent',
    owner: await kit.getSigner()!.getAddress(),
  });

  await agent.initialize(
    kit.contracts.AgentRegistry,
    kit.contracts.AgentExecutor
  );

  // Register on-chain
  const agentAddress = await agent.register(kit.getSigner()!);
  console.log('Agent registered:', agentAddress);

  // Start agent
  await agent.start();
  console.log('Agent started');
}

main().catch(console.error);
```

## Run

```bash
ts-node minimal-agent.ts
```

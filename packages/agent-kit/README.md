# @somnia/agent-kit

Core SDK for building AI agents on Somnia Network.

## Installation

```bash
pnpm add @somnia/agent-kit
```

## Quick Start

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

// Create SDK instance
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0x...',
    agentExecutor: '0x...',
  },
  privateKey: 'your-private-key', // optional
});

// Initialize
await kit.initialize();

// Check status
console.log('Initialized:', kit.isInitialized());
console.log('Network:', kit.getNetworkInfo());
```

## Features

- ✅ TypeScript support with full type definitions
- ✅ ESM and CommonJS support
- ✅ Tree-shakeable exports
- ✅ Comprehensive test coverage

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Type check
pnpm typecheck

# Watch mode
pnpm dev
```

## License

MIT

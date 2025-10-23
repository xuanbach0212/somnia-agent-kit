# ⚖️ RPC Load Balancer

Complete guide for optimizing RPC reliability and performance with automatic failover.

## Overview

The RPC Load Balancer distributes blockchain requests across multiple RPC endpoints, providing:

- 🔄 **Automatic Failover**: Switch to backup RPCs when primary fails
- ⚡ **Load Distribution**: Balance requests across multiple providers
- 🏥 **Health Monitoring**: Automatic health checks for all endpoints
- 📊 **Multiple Strategies**: Round-robin, fastest, or random selection
- 🛡️ **Reliability**: Improved uptime and reduced downtime

## Installation

The RPC Load Balancer is included in the main package:

```bash
npm install somnia-agent-kit
```

## Initialize Load Balancer

```typescript
import { RPCLoadBalancer } from 'somnia-agent-kit';

// Create load balancer with multiple RPC endpoints
const balancer = new RPCLoadBalancer({
  urls: [
    'https://dream-rpc.somnia.network/',
    'https://backup-rpc.somnia.network/', // If available
    'https://rpc3.somnia.network/',
  ],
  strategy: 'round-robin', // Load balancing strategy
  timeout: 10000,           // Request timeout (10 seconds)
  retries: 3,               // Retry failed requests
  enableHealthCheck: true,  // Enable automatic health checks
  healthCheckInterval: 60000, // Health check every 60 seconds
});

// Get a provider instance
const provider = await balancer.getProvider();

// Use provider for blockchain calls
const blockNumber = await provider.getBlockNumber();
console.log('Current block:', blockNumber);
```

## Load Balancing Strategies

### 1. Round-Robin (Default)

Distributes requests evenly across all healthy providers.

```typescript
const balancer = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  strategy: 'round-robin',
});

// Request 1 → RPC 1
// Request 2 → RPC 2
// Request 3 → RPC 1
// Request 4 → RPC 2
// ...
```

**Best for**: Balanced load distribution, predictable behavior

### 2. Fastest

Selects the provider with the lowest latency.

```typescript
const balancer = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  strategy: 'fastest',
});

// Automatically selects the fastest responding RPC
```

**Best for**: Performance-critical applications, low latency requirements

### 3. Random

Randomly selects a healthy provider for each request.

```typescript
const balancer = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  strategy: 'random',
});

// Random selection for each request
```

**Best for**: Simple load distribution, avoiding patterns

## Health Monitoring

### Enable Health Checks

```typescript
const balancer = new RPCLoadBalancer({
  urls: [
    'https://rpc1.somnia.network',
    'https://rpc2.somnia.network',
    'https://rpc3.somnia.network',
  ],
  strategy: 'round-robin',
  enableHealthCheck: true,      // Enable automatic health checks
  healthCheckInterval: 60000,   // Check every 60 seconds
});

// Health checks run automatically in the background
// Unhealthy providers are automatically excluded
```

### Get Provider Status

```typescript
// Get status of all providers
const statuses = balancer.getProviderStatus();

statuses.forEach(status => {
  console.log('RPC:', status.url);
  console.log('Healthy:', status.healthy ? '✅' : '❌');
  console.log('Requests:', status.requestCount);
  console.log('Failures:', status.failureCount);
  console.log('Last Check:', new Date(status.lastCheck));
  console.log('---');
});
```

### Manual Health Check

```typescript
// Manually trigger health check for all providers
await balancer.checkHealth();

console.log('Health check completed!');
```

## Integration with SDK

### Use Load Balancer with SomniaAgentKit

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  RPCLoadBalancer
} from 'somnia-agent-kit';

// Create load balancer
const balancer = new RPCLoadBalancer({
  urls: [
    'https://dream-rpc.somnia.network/',
    'https://backup-rpc.somnia.network/',
  ],
  strategy: 'fastest',
  timeout: 10000,
  retries: 3,
});

// Get provider from load balancer
const provider = await balancer.getProvider();

// Initialize SDK with load-balanced provider
const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
    agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
    agentVault: process.env.AGENT_VAULT_ADDRESS!,
  },
  privateKey: process.env.PRIVATE_KEY,
  provider: provider, // Use load-balanced provider
});

await kit.initialize();

// All SDK operations now use load-balanced RPC
const totalAgents = await kit.contracts.registry.getTotalAgents();
console.log('Total agents:', totalAgents.toString());
```

## Complete Example: High Availability Setup

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  RPCLoadBalancer
} from 'somnia-agent-kit';
import { ethers } from 'ethers';

async function setupHighAvailability() {
  console.log('🔄 Setting up high-availability RPC...\n');

  // Create load balancer with multiple endpoints
  const balancer = new RPCLoadBalancer({
    urls: [
      'https://dream-rpc.somnia.network/',
      'https://backup-rpc.somnia.network/',
      'https://rpc3.somnia.network/',
    ],
    strategy: 'fastest',
    timeout: 10000,
    retries: 3,
    enableHealthCheck: true,
    healthCheckInterval: 30000, // Check every 30 seconds
  });

  console.log('✅ Load balancer initialized');
  console.log('📊 Endpoints:', balancer.getProviderStatus().length);

  // Get provider
  const provider = await balancer.getProvider();
  console.log('✅ Provider ready\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
    provider: provider,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // Monitor provider health
  setInterval(async () => {
    const statuses = balancer.getProviderStatus();
    const healthy = statuses.filter(s => s.healthy).length;
    const total = statuses.length;

    console.log(`\n📊 Health Check: ${healthy}/${total} providers healthy`);

    statuses.forEach(status => {
      const icon = status.healthy ? '✅' : '❌';
      const uptime = ((status.requestCount - status.failureCount) / status.requestCount * 100).toFixed(1);
      
      console.log(`${icon} ${status.url}`);
      console.log(`   Requests: ${status.requestCount}, Failures: ${status.failureCount}, Uptime: ${uptime}%`);
    });
  }, 60000); // Log every 60 seconds

  // Perform operations
  console.log('🤖 Fetching agents...');
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log('Total agents:', totalAgents.toString());

  // Get network info
  const blockNumber = await provider.getBlockNumber();
  const network = await provider.getNetwork();
  
  console.log('\n🌐 Network Info:');
  console.log('Block number:', blockNumber);
  console.log('Chain ID:', network.chainId.toString());

  // Register an agent
  console.log('\n📝 Registering agent...');
  
  const tx = await kit.contracts.registry.registerAgent(
    'HA Agent',
    'High-availability agent with load-balanced RPC',
    'ipfs://QmExample',
    ['trading', 'analysis']
  );

  console.log('Transaction sent:', tx.hash);
  console.log('⏳ Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('✅ Agent registered!');
  console.log('Block:', receipt.blockNumber);

  // Show final provider status
  console.log('\n📊 Final Provider Status:');
  const finalStatuses = balancer.getProviderStatus();
  
  finalStatuses.forEach(status => {
    console.log(`\n${status.url}:`);
    console.log(`  Healthy: ${status.healthy ? '✅' : '❌'}`);
    console.log(`  Requests: ${status.requestCount}`);
    console.log(`  Failures: ${status.failureCount}`);
    console.log(`  Success Rate: ${((status.requestCount - status.failureCount) / status.requestCount * 100).toFixed(2)}%`);
  });

  console.log('\n✅ High-availability setup complete!');
}

setupHighAvailability().catch(console.error);
```

## Automatic Failover

### How Failover Works

```typescript
const balancer = new RPCLoadBalancer({
  urls: [
    'https://primary-rpc.somnia.network',   // Primary
    'https://backup-rpc.somnia.network',    // Backup
    'https://fallback-rpc.somnia.network',  // Fallback
  ],
  strategy: 'round-robin',
  retries: 3,
});

// If primary RPC fails:
// 1. Marks primary as unhealthy
// 2. Automatically retries with backup RPC
// 3. If backup fails, tries fallback RPC
// 4. Health checks will re-enable primary when it recovers
```

### Retry Configuration

```typescript
const balancer = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  retries: 5,        // Retry up to 5 times
  timeout: 15000,    // 15 second timeout per request
});

// Failed requests are automatically retried with different providers
```

## Performance Optimization

### Fastest Strategy with Caching

```typescript
const balancer = new RPCLoadBalancer({
  urls: [
    'https://rpc1.somnia.network',
    'https://rpc2.somnia.network',
    'https://rpc3.somnia.network',
  ],
  strategy: 'fastest',
  enableHealthCheck: true,
  healthCheckInterval: 30000, // Frequent checks for fastest detection
});

// The 'fastest' strategy continuously monitors latency
// and automatically routes to the fastest provider
```

### Reduce Health Check Overhead

```typescript
// For production: Less frequent health checks
const balancer = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  strategy: 'round-robin',
  enableHealthCheck: true,
  healthCheckInterval: 300000, // Check every 5 minutes
});

// For development: More frequent health checks
const balancerDev = new RPCLoadBalancer({
  urls: ['https://rpc1.somnia.network', 'https://rpc2.somnia.network'],
  strategy: 'round-robin',
  enableHealthCheck: true,
  healthCheckInterval: 10000, // Check every 10 seconds
});
```

## Monitoring & Debugging

### Log Provider Performance

```typescript
const balancer = new RPCLoadBalancer({
  urls: [
    'https://rpc1.somnia.network',
    'https://rpc2.somnia.network',
  ],
  strategy: 'round-robin',
});

// Get provider and track performance
const provider = await balancer.getProvider();

// Make requests
const start = Date.now();
const blockNumber = await provider.getBlockNumber();
const duration = Date.now() - start;

console.log('Block number:', blockNumber);
console.log('Request duration:', duration, 'ms');

// Check which provider was used
const statuses = balancer.getProviderStatus();
console.log('Provider stats:', statuses);
```

### Custom Health Check Logic

```typescript
// Manually check health and react
async function monitorHealth(balancer: RPCLoadBalancer) {
  const statuses = balancer.getProviderStatus();
  
  const unhealthy = statuses.filter(s => !s.healthy);
  
  if (unhealthy.length > 0) {
    console.warn('⚠️ Unhealthy providers detected:');
    unhealthy.forEach(s => {
      console.warn(`  - ${s.url}: ${s.failureCount} failures`);
    });
    
    // Send alert, log to monitoring service, etc.
  }
  
  const healthy = statuses.filter(s => s.healthy);
  if (healthy.length === 0) {
    console.error('❌ No healthy providers available!');
    // Emergency fallback logic
  }
}

// Check every minute
setInterval(() => monitorHealth(balancer), 60000);
```

## Best Practices

### 1. Use Multiple RPC Endpoints

```typescript
// ✅ GOOD: Multiple endpoints for redundancy
const balancer = new RPCLoadBalancer({
  urls: [
    'https://primary-rpc.somnia.network',
    'https://backup-rpc.somnia.network',
    'https://fallback-rpc.somnia.network',
  ],
  strategy: 'fastest',
});

// ❌ BAD: Single endpoint (no benefit from load balancer)
const balancer = new RPCLoadBalancer({
  urls: ['https://single-rpc.somnia.network'],
});
```

### 2. Choose Appropriate Strategy

```typescript
// For read-heavy applications: Use 'fastest'
const readBalancer = new RPCLoadBalancer({
  urls: [...],
  strategy: 'fastest', // Optimize for latency
});

// For write-heavy applications: Use 'round-robin'
const writeBalancer = new RPCLoadBalancer({
  urls: [...],
  strategy: 'round-robin', // Distribute load evenly
});
```

### 3. Enable Health Checks in Production

```typescript
// ✅ GOOD: Health checks enabled
const balancer = new RPCLoadBalancer({
  urls: [...],
  enableHealthCheck: true,
  healthCheckInterval: 60000,
});

// ❌ BAD: No health checks (won't detect failures)
const balancer = new RPCLoadBalancer({
  urls: [...],
  enableHealthCheck: false,
});
```

### 4. Set Reasonable Timeouts

```typescript
// ✅ GOOD: Reasonable timeout
const balancer = new RPCLoadBalancer({
  urls: [...],
  timeout: 10000, // 10 seconds
  retries: 3,
});

// ❌ BAD: Too short (may fail unnecessarily)
const balancer = new RPCLoadBalancer({
  urls: [...],
  timeout: 1000, // 1 second (too short)
});

// ❌ BAD: Too long (slow failover)
const balancer = new RPCLoadBalancer({
  urls: [...],
  timeout: 60000, // 60 seconds (too long)
});
```

### 5. Monitor Provider Health

```typescript
// Set up monitoring
setInterval(async () => {
  const statuses = balancer.getProviderStatus();
  
  // Log to monitoring service
  statuses.forEach(status => {
    logMetric('rpc.health', status.healthy ? 1 : 0, {
      url: status.url,
      requests: status.requestCount,
      failures: status.failureCount,
    });
  });
}, 60000);
```

### 6. Clean Up Resources

```typescript
// Clean up when done
process.on('SIGINT', () => {
  console.log('Cleaning up...');
  balancer.destroy(); // Stop health checks and clean up
  process.exit(0);
});
```

## Configuration Options

### Complete Configuration

```typescript
const balancer = new RPCLoadBalancer({
  // Required: Array of RPC URLs
  urls: [
    'https://rpc1.somnia.network',
    'https://rpc2.somnia.network',
  ],
  
  // Optional: Load balancing strategy
  // Options: 'round-robin' | 'fastest' | 'random'
  // Default: 'round-robin'
  strategy: 'fastest',
  
  // Optional: Request timeout in milliseconds
  // Default: 10000 (10 seconds)
  timeout: 15000,
  
  // Optional: Number of retries on failure
  // Default: 3
  retries: 5,
  
  // Optional: Health check interval in milliseconds
  // Default: 60000 (1 minute)
  healthCheckInterval: 30000,
  
  // Optional: Enable automatic health checks
  // Default: true
  enableHealthCheck: true,
});
```

## Error Handling

### Handle No Healthy Providers

```typescript
try {
  const provider = await balancer.getProvider();
  const blockNumber = await provider.getBlockNumber();
  console.log('Block:', blockNumber);
} catch (error) {
  if (error.message.includes('No healthy RPC providers')) {
    console.error('❌ All RPC providers are down!');
    
    // Fallback logic
    // - Use cached data
    // - Show maintenance message
    // - Alert operations team
  } else {
    console.error('Error:', error.message);
  }
}
```

### Retry with Exponential Backoff

```typescript
async function makeRequestWithBackoff(
  balancer: RPCLoadBalancer,
  maxRetries: number = 5
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const provider = await balancer.getProvider();
      return await provider.getBlockNumber();
    } catch (error) {
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All retries failed');
}
```

## See Also

- [SDK Usage](sdk-usage.md)
- [Working with Agents](sdk-agents.md)
- [Monitoring & Observability](sdk-monitoring.md)
- [API Reference](../API_REFERENCE.md)


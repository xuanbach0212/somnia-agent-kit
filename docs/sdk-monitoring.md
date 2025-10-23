# 📊 Monitoring & Observability

Complete guide for monitoring your AI agents with logging, metrics, and real-time dashboards.

## Overview

The SDK provides comprehensive monitoring tools including structured logging, performance metrics, event recording, and a web-based dashboard for real-time visualization.

## Logger

### Initialize Logger

```typescript
import { Logger, LogLevel } from 'somnia-agent-kit';

// Create logger
const logger = new Logger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/agent.log'
});
```

### Log Levels

```typescript
// Available log levels
logger.debug('Debug message');    // Detailed debugging info
logger.info('Info message');      // General information
logger.warn('Warning message');   // Warning but not error
logger.error('Error message');    // Error occurred
```

### Structured Logging

```typescript
// Log with metadata
logger.info('Agent started', {
  agentId: 1,
  timestamp: Date.now(),
  network: 'testnet'
});

// Log with error
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    agentId: 1
  });
}
```

### Child Loggers

```typescript
// Create child logger with context
const agentLogger = logger.child({ agentId: 1, component: 'agent' });

agentLogger.info('Task started');
// Output: [INFO] Task started { agentId: 1, component: 'agent' }
```

### Get Log History

```typescript
// Get recent logs
const logs = logger.getLogs(100); // Last 100 logs

logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`, log.metadata);
});
```

## Metrics

### Initialize Metrics

```typescript
import { Metrics } from 'somnia-agent-kit';

const metrics = new Metrics({
  enabled: true,
  flushInterval: 60000, // Flush every 60 seconds
});
```

### Record Metrics

```typescript
// Increment counter
metrics.increment('tasks.completed');
metrics.increment('tasks.failed');

// Set gauge (current value)
metrics.gauge('agents.active', 5);
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);

// Record histogram (duration, size, etc.)
metrics.histogram('task.duration', 1250); // milliseconds
metrics.histogram('response.size', 2048); // bytes
```

### Track LLM Calls

```typescript
const startTime = Date.now();

try {
  const response = await llm.generate(prompt);
  const duration = Date.now() - startTime;
  
  // Record successful LLM call
  metrics.recordLLMCall(duration, true);
  metrics.increment('llm.success');
} catch (error) {
  const duration = Date.now() - startTime;
  
  // Record failed LLM call
  metrics.recordLLMCall(duration, false);
  metrics.increment('llm.failed');
}
```

### Track Transactions

```typescript
const startTime = Date.now();

try {
  const tx = await contract.someMethod();
  const receipt = await tx.wait();
  const duration = Date.now() - startTime;
  
  // Record transaction metrics
  metrics.recordTransaction(
    receipt.hash,
    true,
    Number(receipt.gasUsed)
  );
  
  metrics.histogram('tx.duration', duration);
  metrics.increment('tx.success');
} catch (error) {
  metrics.increment('tx.failed');
}
```

### Get Metrics Summary

```typescript
// Get all metrics
const summary = metrics.getSummary();

console.log({
  counters: summary.counters,
  gauges: summary.gauges,
  histograms: summary.histograms
});

// Get specific metric
const taskCount = metrics.getCounter('tasks.completed');
console.log('Tasks completed:', taskCount);
```

### Export Metrics

```typescript
// Export as JSON
const data = metrics.export();

console.log({
  tx_sent: data.tx_sent,
  tx_success_rate: data.tx_success_rate,
  avg_gas_used: data.avg_gas_used,
  llm_calls: data.llm_calls,
  reasoning_time: data.reasoning_time,
  uptime: data.uptime
});
```

## Dashboard

### Start Dashboard

```typescript
import { Dashboard } from 'somnia-agent-kit';

// Create dashboard
const dashboard = new Dashboard({
  port: 3001,
  logger: logger,
  metrics: metrics,
  enableUI: true,
  enableCORS: true
});

// Start dashboard server
await dashboard.start();
console.log('📊 Dashboard running at http://localhost:3001');
```

### Dashboard Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get metrics
curl http://localhost:3001/metrics

# Get logs
curl http://localhost:3001/logs?limit=50

# Get status
curl http://localhost:3001/status
```

### Access Web UI

Open your browser and navigate to:
```
http://localhost:3001
```

The dashboard shows:
- 📊 Real-time metrics
- 📝 Recent logs
- 🤖 Agent status
- ⏱️ Uptime
- 📈 Performance graphs

### Stop Dashboard

```typescript
// Stop dashboard server
await dashboard.stop();
console.log('Dashboard stopped');
```

## Event Recorder

### Initialize Event Recorder

```typescript
import { EventRecorder } from 'somnia-agent-kit';

const recorder = new EventRecorder({
  maxEvents: 1000,
  enablePersistence: true,
  storagePath: './data/events'
});
```

### Record Events

```typescript
// Record agent event
recorder.recordEvent('agent.started', {
  agentId: 1,
  timestamp: Date.now(),
  network: 'testnet'
});

// Record task event
recorder.recordEvent('task.completed', {
  taskId: 123,
  agentId: 1,
  duration: 1250,
  success: true
});

// Record error event
recorder.recordEvent('error.occurred', {
  error: 'Connection timeout',
  component: 'llm',
  severity: 'high'
});
```

### Query Events

```typescript
// Get all events
const allEvents = recorder.getEvents();

// Get events by type
const agentEvents = recorder.getEventsByType('agent.started');

// Get recent events
const recentEvents = recorder.getRecentEvents(50);

// Get events in time range
const events = recorder.getEventsByTimeRange(
  Date.now() - 3600000, // 1 hour ago
  Date.now()
);
```

### Replay Events

```typescript
// Replay events for debugging
recorder.replayEvents((event) => {
  console.log(`[${event.type}]`, event.data);
});
```

## Complete Example: Monitored Agent

```typescript
import {
  SomniaAgentKit,
  SOMNIA_NETWORKS,
  Logger,
  Metrics,
  Dashboard,
  OllamaAdapter
} from 'somnia-agent-kit';

async function monitoredAgent() {
  // Initialize logger
  const logger = new Logger({
    level: LogLevel.INFO,
    enableConsole: true
  });
  
  logger.info('🚀 Starting monitored agent...');
  
  // Initialize metrics
  const metrics = new Metrics({ enabled: true });
  
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
  });
  
  await kit.initialize();
  logger.info('✅ SDK initialized');
  metrics.increment('sdk.initialized');
  
  // Start dashboard
  const dashboard = new Dashboard({
    port: 3001,
    logger: logger,
    metrics: metrics
  });
  
  await dashboard.start();
  logger.info('📊 Dashboard started at http://localhost:3001');
  
  // Initialize LLM
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    model: 'llama3.2'
  });
  
  // Process tasks with monitoring
  async function processTask(taskId: number) {
    const taskLogger = logger.child({ taskId });
    taskLogger.info('📝 Processing task...');
    
    const startTime = Date.now();
    
    try {
      // Get task
      const task = await kit.contracts.manager.getTask(taskId);
      taskLogger.info('Task retrieved', { status: task.status });
      
      // Use LLM
      const llmStart = Date.now();
      const response = await llm.generate('Analyze task');
      const llmDuration = Date.now() - llmStart;
      
      metrics.recordLLMCall(llmDuration, true);
      taskLogger.info('LLM response generated', { duration: llmDuration });
      
      // Execute task
      const tx = await kit.contracts.executor.execute(taskId);
      await tx.wait();
      
      const totalDuration = Date.now() - startTime;
      
      // Record metrics
      metrics.increment('tasks.completed');
      metrics.histogram('task.duration', totalDuration);
      
      taskLogger.info('✅ Task completed', {
        duration: totalDuration,
        txHash: tx.hash
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      metrics.increment('tasks.failed');
      metrics.histogram('task.duration', duration);
      
      taskLogger.error('❌ Task failed', {
        error: error.message,
        duration
      });
    }
  }
  
  // Listen for new tasks
  kit.contracts.manager.on('TaskCreated', async (taskId, agentId) => {
    logger.info('🔔 New task received', {
      taskId: taskId.toString(),
      agentId: agentId.toString()
    });
    
    metrics.increment('tasks.received');
    
    await processTask(Number(taskId));
  });
  
  logger.info('👂 Listening for tasks...');
  
  // Log metrics every minute
  setInterval(() => {
    const summary = metrics.getSummary();
    logger.info('📊 Metrics summary', summary);
  }, 60000);
}

monitoredAgent().catch(console.error);
```

## Telemetry

### Initialize Telemetry

```typescript
import { Telemetry } from 'somnia-agent-kit';

const telemetry = new Telemetry({
  enabled: true,
  endpoint: 'https://telemetry.example.com',
  format: 'json', // 'json' | 'prometheus' | 'datadog' | 'opentelemetry'
  flushInterval: 60000
});
```

### Send Telemetry Data

```typescript
// Send custom telemetry
telemetry.send({
  metric: 'agent.performance',
  value: 95.5,
  tags: {
    agentId: '1',
    network: 'testnet'
  },
  timestamp: Date.now()
});
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Debug: Detailed info for debugging
logger.debug('Detailed state', { state: agentState });

// Info: General information
logger.info('Agent started', { agentId: 1 });

// Warn: Something unusual but not error
logger.warn('High memory usage', { usage: '85%' });

// Error: Something failed
logger.error('Task failed', { error: error.message });
```

### 2. Add Context to Logs

```typescript
// Bad: No context
logger.info('Task completed');

// Good: With context
logger.info('Task completed', {
  taskId: 123,
  agentId: 1,
  duration: 1250,
  success: true
});
```

### 3. Track Key Metrics

```typescript
// Track important business metrics
metrics.increment('tasks.completed');
metrics.increment('revenue.generated');
metrics.gauge('active.users', userCount);
metrics.histogram('response.time', duration);
```

### 4. Monitor Resource Usage

```typescript
// Track memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  metrics.gauge('memory.heap', usage.heapUsed);
  metrics.gauge('memory.rss', usage.rss);
}, 10000);
```

### 5. Set Up Alerts

```typescript
// Monitor critical metrics
const errorRate = metrics.getCounter('tasks.failed') / 
                  metrics.getCounter('tasks.total');

if (errorRate > 0.1) { // More than 10% errors
  logger.error('⚠️  High error rate detected', {
    errorRate: errorRate * 100 + '%'
  });
  
  // Send alert notification
  // await sendAlert('High error rate');
}
```

## See Also

- [Working with Agents](sdk-agents.md)
- [LLM Integration](sdk-llm.md)
- [API Reference](../API_REFERENCE.md)
- [Monitoring Example](../examples/05-monitoring/)


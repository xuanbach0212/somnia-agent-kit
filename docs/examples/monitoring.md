# 📊 Monitoring & Metrics Demo

Learn how to monitor your AI agents in production with comprehensive metrics, alerts, and dashboards.

## 🎯 What You'll Learn

- ✅ Track agent performance metrics
- ✅ Monitor LLM usage and costs
- ✅ Set up alerts for issues
- ✅ Create real-time dashboards
- ✅ Analyze agent behavior

## 📋 Prerequisites

- Somnia AI SDK installed
- Running agent (from previous examples)
- Basic understanding of metrics

## 🏗️ Monitoring Architecture

```
┌─────────────────────────────────────────┐
│         Your AI Agent                    │
│  - Executes tasks                        │
│  - Generates metrics                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Metrics Collector                   │
│  - Collects metrics                      │
│  - Aggregates data                       │
│  - Stores in memory/DB                   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Monitoring Dashboard                │
│  - Real-time charts                      │
│  - Historical data                       │
│  - Alerts                                │
└─────────────────────────────────────────┘
```

## 💻 Step 1: Setup Monitoring

Create `monitoring-agent.ts`:

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';
import { OpenAIAdapter } from '@somnia/agent-kit/llm';
import { AgentMonitor, MetricsCollector } from '@somnia/agent-kit/monitoring';
import * as dotenv from 'dotenv';

dotenv.config();

interface AgentMetrics {
  // Performance
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  
  // LLM Usage
  totalTokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  
  // Agent Health
  uptime: number;
  lastRequestTime: number;
  errorRate: number;
  
  // Custom Metrics
  customMetrics: Map<string, number>;
}

export class MonitoredAgent {
  private kit: SomniaAgentKit;
  private llm: OpenAIAdapter;
  private monitor: AgentMonitor;
  private metrics: AgentMetrics;
  private startTime: number;
  
  constructor(private config: {
    privateKey: string;
    rpcUrl: string;
    openaiKey: string;
  }) {
    this.startTime = Date.now();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCost: 0,
      uptime: 0,
      lastRequestTime: 0,
      errorRate: 0,
      customMetrics: new Map(),
    };
  }

  async initialize() {
    console.log('🔧 Initializing monitored agent...');
    
    // Initialize SDK
    this.kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
        agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      },
      privateKey: this.config.privateKey,
    });
    
    await this.kit.initialize();
    
    // Setup LLM
    this.llm = new OpenAIAdapter({
      apiKey: this.config.openaiKey,
      model: 'gpt-4',
      temperature: 0.7,
    });
    
    // Initialize monitoring
    this.monitor = new AgentMonitor({
      agentId: 1, // Your agent ID
      metricsInterval: 60000, // Collect every minute
      alertThresholds: {
        errorRate: 0.1, // Alert if >10% errors
        responseTime: 5000, // Alert if >5s response
        tokenUsage: 100000, // Alert if >100k tokens/hour
      },
    });
    
    // Setup alert handlers
    this.setupAlerts();
    
    // Start background monitoring
    this.startBackgroundMonitoring();
    
    console.log('✅ Monitoring initialized!');
  }

  async executeTask(prompt: string): Promise<string> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      console.log('🤔 Processing request...');
      
      // Execute with LLM
      const response = await this.llm.generate({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        maxTokens: 500,
      });
      
      // Calculate metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics({
        success: true,
        responseTime,
        tokensUsed: response.usage.totalTokens,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
      });
      
      // Record to monitor
      await this.monitor.recordExecution({
        success: true,
        responseTime,
        tokensUsed: response.usage.totalTokens,
        cost: this.calculateCost(response.usage),
      });
      
      console.log(`✅ Request completed in ${responseTime}ms`);
      
      return response.content;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.updateMetrics({
        success: false,
        responseTime,
        error: error.message,
      });
      
      await this.monitor.recordError({
        error: error.message,
        timestamp: Date.now(),
      });
      
      console.error('❌ Request failed:', error.message);
      throw error;
    }
  }

  private updateMetrics(data: {
    success: boolean;
    responseTime: number;
    tokensUsed?: number;
    promptTokens?: number;
    completionTokens?: number;
    error?: string;
  }) {
    if (data.success) {
      this.metrics.successfulRequests++;
      
      if (data.tokensUsed) {
        this.metrics.totalTokensUsed += data.tokensUsed;
        this.metrics.promptTokens += data.promptTokens || 0;
        this.metrics.completionTokens += data.completionTokens || 0;
        
        // Estimate cost (GPT-4 pricing)
        const promptCost = (data.promptTokens || 0) * 0.00003; // $0.03/1K tokens
        const completionCost = (data.completionTokens || 0) * 0.00006; // $0.06/1K tokens
        this.metrics.estimatedCost += promptCost + completionCost;
      }
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + data.responseTime) 
      / this.metrics.totalRequests;
    
    // Update error rate
    this.metrics.errorRate = 
      this.metrics.failedRequests / this.metrics.totalRequests;
    
    this.metrics.lastRequestTime = Date.now();
    this.metrics.uptime = Date.now() - this.startTime;
  }

  private calculateCost(usage: {
    promptTokens: number;
    completionTokens: number;
  }): number {
    // GPT-4 pricing
    const promptCost = usage.promptTokens * 0.00003;
    const completionCost = usage.completionTokens * 0.00006;
    return promptCost + completionCost;
  }

  private setupAlerts() {
    // High error rate alert
    this.monitor.on('high_error_rate', (data) => {
      console.error('🚨 ALERT: High error rate detected!');
      console.error(`   Error rate: ${(data.errorRate * 100).toFixed(2)}%`);
      console.error(`   Threshold: ${(data.threshold * 100).toFixed(2)}%`);
      
      // Send notification (email, Slack, etc.)
      this.sendAlert('High Error Rate', data);
    });
    
    // Slow response alert
    this.monitor.on('slow_response', (data) => {
      console.warn('⚠️ ALERT: Slow response detected!');
      console.warn(`   Response time: ${data.responseTime}ms`);
      console.warn(`   Threshold: ${data.threshold}ms`);
    });
    
    // High token usage alert
    this.monitor.on('high_token_usage', (data) => {
      console.warn('💰 ALERT: High token usage!');
      console.warn(`   Tokens used: ${data.tokensUsed}`);
      console.warn(`   Estimated cost: $${data.estimatedCost.toFixed(4)}`);
    });
  }

  private async sendAlert(type: string, data: any) {
    // Implement your alert mechanism here
    // Examples: Email, Slack, Discord, PagerDuty, etc.
    
    console.log(`📧 Sending ${type} alert...`);
    
    // Example: Send to Slack
    // await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 ${type}`,
    //     attachments: [{
    //       color: 'danger',
    //       fields: Object.entries(data).map(([key, value]) => ({
    //         title: key,
    //         value: String(value),
    //         short: true,
    //       })),
    //     }],
    //   }),
    // });
  }

  private startBackgroundMonitoring() {
    // Collect metrics every minute
    setInterval(() => {
      this.collectAndReportMetrics();
    }, 60000);
    
    // Health check every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private async collectAndReportMetrics() {
    const metrics = this.getMetrics();
    
    console.log('\n📊 Metrics Report:');
    console.log('─────────────────────────────────────');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
    console.log(`Avg Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Total Tokens: ${metrics.totalTokensUsed}`);
    console.log(`Estimated Cost: $${metrics.estimatedCost.toFixed(4)}`);
    console.log(`Uptime: ${(metrics.uptime / 1000 / 60).toFixed(2)} minutes`);
    console.log('─────────────────────────────────────\n');
    
    // Store metrics
    await this.monitor.storeMetrics(metrics);
  }

  private async performHealthCheck() {
    const timeSinceLastRequest = Date.now() - this.metrics.lastRequestTime;
    
    // Check if agent is idle for too long
    if (timeSinceLastRequest > 300000 && this.metrics.totalRequests > 0) {
      console.warn('⚠️ Agent idle for 5+ minutes');
    }
    
    // Check error rate
    if (this.metrics.errorRate > 0.2) {
      console.error('🚨 Error rate above 20%!');
    }
    
    // Check response time
    if (this.metrics.averageResponseTime > 3000) {
      console.warn('⚠️ Average response time above 3s');
    }
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  recordCustomMetric(name: string, value: number) {
    this.metrics.customMetrics.set(name, value);
    this.monitor.recordCustomMetric(name, value);
  }

  async getHistoricalMetrics(timeRange: {
    start: number;
    end: number;
  }) {
    return await this.monitor.getMetrics(timeRange);
  }
}
```

## 📊 Step 2: Create Dashboard

Create `dashboard.ts`:

```typescript
import express from 'express';
import { MonitoredAgent } from './monitoring-agent';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let agent: MonitoredAgent;

async function init() {
  agent = new MonitoredAgent({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.RPC_URL!,
    openaiKey: process.env.OPENAI_API_KEY!,
  });
  
  await agent.initialize();
}

// Get current metrics
app.get('/api/metrics', (req, res) => {
  const metrics = agent.getMetrics();
  res.json({ success: true, metrics });
});

// Get historical metrics
app.get('/api/metrics/history', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const metrics = await agent.getHistoricalMetrics({
      start: Number(start) || Date.now() - 3600000, // Last hour
      end: Number(end) || Date.now(),
    });
    
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute task (for testing)
app.post('/api/execute', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await agent.executeTask(prompt);
    
    res.json({
      success: true,
      response,
      metrics: agent.getMetrics(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Record custom metric
app.post('/api/metrics/custom', (req, res) => {
  try {
    const { name, value } = req.body;
    agent.recordCustomMetric(name, value);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Agent Monitoring Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #007bff;
    }
    
    .metric-label {
      color: #666;
      margin-top: 5px;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .status-good { color: #28a745; }
    .status-warning { color: #ffc107; }
    .status-error { color: #dc3545; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Agent Monitoring Dashboard</h1>
    <p>Real-time metrics and performance monitoring</p>
  </div>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value" id="total-requests">0</div>
      <div class="metric-label">Total Requests</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-value" id="success-rate">0%</div>
      <div class="metric-label">Success Rate</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-value" id="avg-response">0ms</div>
      <div class="metric-label">Avg Response Time</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-value" id="total-tokens">0</div>
      <div class="metric-label">Total Tokens Used</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-value" id="estimated-cost">$0.00</div>
      <div class="metric-label">Estimated Cost</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-value" id="uptime">0m</div>
      <div class="metric-label">Uptime</div>
    </div>
  </div>
  
  <div class="chart-container">
    <h3>Response Time Over Time</h3>
    <canvas id="response-time-chart"></canvas>
  </div>
  
  <div class="chart-container">
    <h3>Token Usage</h3>
    <canvas id="token-usage-chart"></canvas>
  </div>
  
  <script>
    let responseTimeChart, tokenUsageChart;
    
    // Initialize charts
    function initCharts() {
      const ctx1 = document.getElementById('response-time-chart').getContext('2d');
      responseTimeChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Response Time (ms)',
            data: [],
            borderColor: '#007bff',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      
      const ctx2 = document.getElementById('token-usage-chart').getContext('2d');
      tokenUsageChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Prompt Tokens', 'Completion Tokens'],
          datasets: [{
            label: 'Tokens',
            data: [0, 0],
            backgroundColor: ['#007bff', '#28a745']
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
    
    // Update metrics
    async function updateMetrics() {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        const metrics = data.metrics;
        
        // Update metric cards
        document.getElementById('total-requests').textContent = metrics.totalRequests;
        
        const successRate = (metrics.successfulRequests / metrics.totalRequests * 100) || 0;
        document.getElementById('success-rate').textContent = successRate.toFixed(1) + '%';
        document.getElementById('success-rate').className = 
          successRate > 95 ? 'metric-value status-good' :
          successRate > 80 ? 'metric-value status-warning' :
          'metric-value status-error';
        
        document.getElementById('avg-response').textContent = 
          metrics.averageResponseTime.toFixed(0) + 'ms';
        
        document.getElementById('total-tokens').textContent = 
          metrics.totalTokensUsed.toLocaleString();
        
        document.getElementById('estimated-cost').textContent = 
          '$' + metrics.estimatedCost.toFixed(4);
        
        const uptimeMinutes = (metrics.uptime / 1000 / 60).toFixed(1);
        document.getElementById('uptime').textContent = uptimeMinutes + 'm';
        
        // Update charts
        const now = new Date().toLocaleTimeString();
        
        if (responseTimeChart.data.labels.length > 20) {
          responseTimeChart.data.labels.shift();
          responseTimeChart.data.datasets[0].data.shift();
        }
        
        responseTimeChart.data.labels.push(now);
        responseTimeChart.data.datasets[0].data.push(metrics.averageResponseTime);
        responseTimeChart.update();
        
        tokenUsageChart.data.datasets[0].data = [
          metrics.promptTokens,
          metrics.completionTokens
        ];
        tokenUsageChart.update();
        
      } catch (error) {
        console.error('Failed to update metrics:', error);
      }
    }
    
    // Initialize
    initCharts();
    updateMetrics();
    
    // Update every 5 seconds
    setInterval(updateMetrics, 5000);
  </script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 3001;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`📊 Dashboard running at http://localhost:${PORT}`);
  });
});
```

## ▶️ Step 3: Run the Dashboard

```bash
npx ts-node dashboard.ts
```

Open http://localhost:3001 to see your dashboard!

## 🧪 Step 4: Test with Load

Create `load-test.ts`:

```typescript
import { MonitoredAgent } from './monitoring-agent';

async function runLoadTest() {
  const agent = new MonitoredAgent({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.RPC_URL!,
    openaiKey: process.env.OPENAI_API_KEY!,
  });
  
  await agent.initialize();
  
  const prompts = [
    'What is blockchain?',
    'Explain AI in simple terms',
    'How does Somnia work?',
    'What are smart contracts?',
    'Tell me about decentralization',
  ];
  
  console.log('🚀 Starting load test...\n');
  
  for (let i = 0; i < 20; i++) {
    const prompt = prompts[i % prompts.length];
    
    try {
      await agent.executeTask(prompt);
      
      // Random delay between requests
      await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 2000 + 1000)
      );
      
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
  
  console.log('\n✅ Load test complete!');
  console.log('\n📊 Final Metrics:');
  console.log(JSON.stringify(agent.getMetrics(), null, 2));
}

runLoadTest();
```

Run it:

```bash
npx ts-node load-test.ts
```

## 📈 Advanced Monitoring

### Export Metrics to External Services

```typescript
// Export to Prometheus
app.get('/metrics', (req, res) => {
  const metrics = agent.getMetrics();
  
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP agent_requests_total Total number of requests
# TYPE agent_requests_total counter
agent_requests_total ${metrics.totalRequests}

# HELP agent_errors_total Total number of errors
# TYPE agent_errors_total counter
agent_errors_total ${metrics.failedRequests}

# HELP agent_response_time_ms Average response time in milliseconds
# TYPE agent_response_time_ms gauge
agent_response_time_ms ${metrics.averageResponseTime}

# HELP agent_tokens_used_total Total tokens used
# TYPE agent_tokens_used_total counter
agent_tokens_used_total ${metrics.totalTokensUsed}

# HELP agent_cost_usd_total Total estimated cost in USD
# TYPE agent_cost_usd_total counter
agent_cost_usd_total ${metrics.estimatedCost}
  `);
});
```

## 📚 Next Steps

- **[Vault Demo](./vault.md)** - Manage agent funds
- **[API Reference](../../API_REFERENCE.md)** - Full API docs
- **[Production Deployment](../deployment/production.md)** - Deploy to production

---

**Congratulations!** 🎉 You now have comprehensive monitoring for your AI agents!


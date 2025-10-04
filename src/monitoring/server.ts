/**
 * Monitoring Server - REST API and WebSocket for real-time metrics
 */

import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Server } from 'http';
import WebSocket from 'ws';
import { SomniaAgentSDK } from '../sdk/SomniaAgentSDK';
import { Logger } from '../utils/logger';
import { AgentMonitor } from './AgentMonitor';
import { MetricsCollector } from './MetricsCollector';

dotenv.config();

const logger = new Logger('MonitoringServer');

// Initialize SDK
const sdk = new SomniaAgentSDK({
  rpcUrl: process.env.SOMNIA_RPC_URL,
  chainId: Number(process.env.SOMNIA_CHAIN_ID),
  privateKey: process.env.PRIVATE_KEY,
  agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS,
  agentManagerAddress: process.env.AGENT_MANAGER_ADDRESS,
});

// Initialize monitoring components
const metricsCollector = new MetricsCollector(sdk);
const monitor = new AgentMonitor(sdk, metricsCollector, {
  updateInterval: 30000,
  autoStart: true,
});

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// REST API Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    monitoring: monitor.isMonitorRunning(),
  });
});

// Get all monitored agents
app.get('/api/agents', (req: Request, res: Response) => {
  const agents = monitor.getMonitoredAgents();
  res.json({ agents });
});

// Add agent to monitoring
app.post('/api/agents/:agentId', (req: Request, res: Response) => {
  const { agentId } = req.params;
  monitor.addAgent(agentId);
  res.json({ success: true, agentId });
});

// Remove agent from monitoring
app.delete('/api/agents/:agentId', (req: Request, res: Response) => {
  const { agentId } = req.params;
  monitor.removeAgent(agentId);
  res.json({ success: true, agentId });
});

// Get metrics for specific agent
app.get('/api/agents/:agentId/metrics', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const metrics = await monitor.getCurrentMetrics(agentId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get metrics history
app.get('/api/agents/:agentId/history', (req: Request, res: Response) => {
  const { agentId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const history = monitor.getMetricsHistory(agentId, limit);
  res.json({ history });
});

// Get aggregated metrics
app.get('/api/metrics/aggregated', (req: Request, res: Response) => {
  const aggregated = metricsCollector.getAggregatedMetrics();
  res.json(aggregated);
});

// Start/stop monitor
app.post('/api/monitor/start', (req: Request, res: Response) => {
  monitor.start();
  res.json({ success: true, status: 'started' });
});

app.post('/api/monitor/stop', (req: Request, res: Response) => {
  monitor.stop();
  res.json({ success: true, status: 'stopped' });
});

// Force metrics collection
app.post('/api/monitor/collect', async (req: Request, res: Response) => {
  try {
    await monitor.forceCollection();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create HTTP server
const PORT = process.env.MONITORING_PORT || 3001;
const server: Server = app.listen(PORT, () => {
  logger.info(`Monitoring server running on port ${PORT}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  logger.info('WebSocket client connected');

  // Send initial data
  ws.send(
    JSON.stringify({
      type: 'connected',
      timestamp: Date.now(),
      agents: monitor.getMonitoredAgents(),
    })
  );

  // Forward monitor events to WebSocket clients
  const metricsHandler = (metrics: any) => {
    ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
  };

  const aggregatedHandler = (aggregated: any) => {
    ws.send(JSON.stringify({ type: 'aggregated', data: aggregated }));
  };

  const alertHandler = (alert: any) => {
    ws.send(JSON.stringify({ type: 'alert', data: alert }));
  };

  monitor.on('metrics:collected', metricsHandler);
  monitor.on('metrics:aggregated', aggregatedHandler);
  monitor.on('alerts', alertHandler);
  monitor.on('alert:critical', alertHandler);
  monitor.on('alert:warning', alertHandler);

  // Handle client messages
  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'subscribe':
          if (data.agentId) {
            monitor.addAgent(data.agentId);
          }
          break;
        case 'unsubscribe':
          if (data.agentId) {
            monitor.removeAgent(data.agentId);
          }
          break;
        case 'getMetrics':
          if (data.agentId) {
            const metrics = await monitor.getCurrentMetrics(data.agentId);
            ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
          }
          break;
      }
    } catch (error) {
      logger.error(`WebSocket message error: ${error}`);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
    monitor.off('metrics:collected', metricsHandler);
    monitor.off('metrics:aggregated', aggregatedHandler);
    monitor.off('alerts', alertHandler);
    monitor.off('alert:critical', alertHandler);
    monitor.off('alert:warning', alertHandler);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  monitor.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  monitor.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, server, wss };


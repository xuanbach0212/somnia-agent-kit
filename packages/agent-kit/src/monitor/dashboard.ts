/**
 * Dashboard Module - Development Monitoring UI
 * Simple Express-based dashboard for real-time agent monitoring
 * Dev mode only - view logs, metrics, and agent status in browser
 */

import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import type { Server } from 'http';
import type { Logger, LogEntry } from './logger';
import type { Metrics } from './metrics';

export interface DashboardConfig {
  port?: number; // Default: 3001
  enableUI?: boolean; // HTML UI (default: true)
  enableCORS?: boolean; // CORS (default: true)
  logger?: Logger; // Logger instance
  metrics?: Metrics; // Metrics instance
  agent?: any; // Agent instance for status
  onError?: (error: Error) => void; // Error callback
}

/**
 * Dashboard class for real-time agent monitoring
 * Provides REST API and HTML UI for development
 */
export class Dashboard {
  private config: Required<DashboardConfig>;
  private app: Express;
  private server: Server | null = null;

  constructor(config: DashboardConfig = {}) {
    this.config = {
      port: config.port || 3001,
      enableUI: config.enableUI !== false,
      enableCORS: config.enableCORS !== false,
      logger: config.logger as any,
      metrics: config.metrics as any,
      agent: config.agent,
      onError: config.onError || ((error) => console.error('[Dashboard Error]', error)),
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // JSON parsing
    this.app.use(express.json());

    // CORS support
    if (this.config.enableCORS) {
      this.app.use(cors());
    }

    // Error handling
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      this.config.onError(err);
      res.status(500).json({ error: err.message });
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      if (!this.config.metrics) {
        return res.status(503).json({ error: 'Metrics not configured' });
      }

      try {
        const snapshot = this.config.metrics.getSnapshot();
        res.json(snapshot);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Logs endpoint
    this.app.get('/logs', (req, res) => {
      if (!this.config.logger) {
        return res.status(503).json({ error: 'Logger not configured' });
      }

      try {
        const limit = parseInt(req.query.limit as string) || 20;
        const logs = this.config.logger.getLogs(limit);
        res.json({ logs, total: logs.length });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      try {
        const status: any = {
          online: true,
          uptime: this.config.metrics?.getUptime() || 0,
          version: '2.0.0',
          timestamp: Date.now(),
        };

        // Add agent info if available
        if (this.config.agent) {
          status.agent = {
            state: this.config.agent.getState?.() || 'unknown',
            address: this.config.agent.getAddress?.() || null,
            name: this.config.agent.getConfig?.().name || 'Unknown',
          };
        }

        res.json(status);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // HTML UI
    if (this.config.enableUI) {
      this.app.get('/', (req, res) => {
        res.send(this.getHTMLUI());
      });
    }
  }

  /**
   * Get embedded HTML UI
   */
  private getHTMLUI(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent Dashboard - Somnia Agent Kit</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #60a5fa; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .card {
      background: #1e293b;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card h2 { color: #60a5fa; margin-bottom: 15px; font-size: 1.2rem; }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #334155;
    }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #94a3b8; }
    .metric-value { color: #fff; font-weight: 600; }
    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .status-online { background: #10b981; }
    .log-entry {
      background: #0f172a;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 0.9rem;
      border-left: 3px solid #334155;
    }
    .log-entry.error { border-left-color: #ef4444; }
    .log-entry.warn { border-left-color: #f59e0b; }
    .log-entry.info { border-left-color: #3b82f6; }
    .log-entry.debug { border-left-color: #8b5cf6; }
    .log-timestamp { color: #64748b; font-size: 0.85rem; }
    .log-message { color: #e2e8f0; margin: 5px 0; }
    .log-metadata { color: #94a3b8; font-size: 0.85rem; }
    .refresh-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-bottom: 15px;
    }
    .refresh-btn:hover { background: #2563eb; }
    .auto-refresh {
      display: inline-block;
      margin-left: 15px;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading { animation: spin 1s linear infinite; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Agent Dashboard</h1>
    <p class="subtitle">Real-time monitoring for Somnia Agent Kit</p>

    <div class="grid">
      <!-- Status Card -->
      <div class="card">
        <h2>Agent Status</h2>
        <div id="status-content">Loading...</div>
      </div>

      <!-- Metrics Card -->
      <div class="card">
        <h2>Performance Metrics</h2>
        <div id="metrics-content">Loading...</div>
      </div>
    </div>

    <!-- Logs Card -->
    <div class="card">
      <h2>Recent Logs</h2>
      <button class="refresh-btn" onclick="refreshLogs()">🔄 Refresh</button>
      <span class="auto-refresh">Auto-refresh: <span id="countdown">10</span>s</span>
      <div id="logs-content">Loading...</div>
    </div>
  </div>

  <script>
    let countdownTimer;
    let countdown = 10;

    // Fetch status
    async function fetchStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();

        const uptime = Math.floor(data.uptime / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        document.getElementById('status-content').innerHTML = \`
          <div class="metric">
            <span class="metric-label">Status</span>
            <span class="metric-value">
              <span class="status-indicator status-online"></span>Online
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Uptime</span>
            <span class="metric-value">\${hours}h \${minutes}m \${seconds}s</span>
          </div>
          <div class="metric">
            <span class="metric-label">Version</span>
            <span class="metric-value">\${data.version}</span>
          </div>
          \${data.agent ? \`
            <div class="metric">
              <span class="metric-label">Agent State</span>
              <span class="metric-value">\${data.agent.state}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Agent Name</span>
              <span class="metric-value">\${data.agent.name}</span>
            </div>
          \` : ''}
        \`;
      } catch (error) {
        document.getElementById('status-content').innerHTML = '<div class="metric"><span class="metric-value" style="color: #ef4444;">Error loading status</span></div>';
      }
    }

    // Fetch metrics
    async function fetchMetrics() {
      try {
        const res = await fetch('/metrics');
        const data = await res.json();

        document.getElementById('metrics-content').innerHTML = \`
          <div class="metric">
            <span class="metric-label">Transactions Sent</span>
            <span class="metric-value">\${data.tx_sent || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Success Rate</span>
            <span class="metric-value">\${(data.tx_success_rate || 0).toFixed(1)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Avg Gas Used</span>
            <span class="metric-value">\${Math.round(data.avg_gas_used || 0)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">LLM Calls</span>
            <span class="metric-value">\${data.llm_calls || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Avg Reasoning Time</span>
            <span class="metric-value">\${Math.round(data.reasoning_time || 0)}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">TPS</span>
            <span class="metric-value">\${(data.tps || 0).toFixed(2)}</span>
          </div>
        \`;
      } catch (error) {
        document.getElementById('metrics-content').innerHTML = '<div class="metric"><span class="metric-value" style="color: #ef4444;">Error loading metrics</span></div>';
      }
    }

    // Fetch logs
    async function fetchLogs() {
      try {
        const res = await fetch('/logs?limit=20');
        const data = await res.json();

        if (data.logs.length === 0) {
          document.getElementById('logs-content').innerHTML = '<div style="color: #94a3b8; padding: 20px; text-align: center;">No logs yet</div>';
          return;
        }

        const logsHTML = data.logs.map(log => {
          const date = new Date(log.timestamp);
          const time = date.toLocaleTimeString();
          const metadata = log.metadata ? JSON.stringify(log.metadata) : '';

          return \`
            <div class="log-entry \${log.level}">
              <div class="log-timestamp">\${time} [\${log.level.toUpperCase()}]\${log.context ? ' [' + log.context + ']' : ''}</div>
              <div class="log-message">\${log.message}</div>
              \${metadata ? \`<div class="log-metadata">\${metadata}</div>\` : ''}
            </div>
          \`;
        }).join('');

        document.getElementById('logs-content').innerHTML = logsHTML;
      } catch (error) {
        document.getElementById('logs-content').innerHTML = '<div style="color: #ef4444;">Error loading logs</div>';
      }
    }

    // Refresh logs button
    function refreshLogs() {
      fetchLogs();
      resetCountdown();
    }

    // Countdown timer
    function startCountdown() {
      countdownTimer = setInterval(() => {
        countdown--;
        document.getElementById('countdown').textContent = countdown;

        if (countdown <= 0) {
          fetchLogs();
          resetCountdown();
        }
      }, 1000);
    }

    function resetCountdown() {
      countdown = 10;
      document.getElementById('countdown').textContent = countdown;
      clearInterval(countdownTimer);
      startCountdown();
    }

    // Initial load
    fetchStatus();
    fetchMetrics();
    fetchLogs();
    startCountdown();

    // Auto-refresh status and metrics every 5 seconds
    setInterval(() => {
      fetchStatus();
      fetchMetrics();
    }, 5000);
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Start dashboard server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          console.log(`📊 Dashboard running on ${this.getURL()}`);
          resolve();
        });

        this.server.on('error', (error) => {
          this.config.onError(error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop dashboard server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('📊 Dashboard stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get dashboard URL
   */
  getURL(): string {
    return `http://localhost:${this.config.port}`;
  }

  /**
   * Check if dashboard is running
   */
  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }
}

/**
 * Convenience function to start dashboard
 */
export function startDashboard(config: DashboardConfig): Dashboard {
  const dashboard = new Dashboard(config);
  dashboard.start().catch(config.onError || console.error);
  return dashboard;
}

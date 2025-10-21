# 🚀 Production Deployment Guide

Complete guide to deploying Somnia AI agents to production.

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

- ✅ Tested thoroughly on testnet
- ✅ Security audit completed
- ✅ Monitoring and alerts configured
- ✅ Backup and recovery plan
- ✅ Rate limiting implemented
- ✅ Error handling robust
- ✅ Secrets management secure
- ✅ Documentation complete

## 🏗️ Deployment Architecture

### Option 1: Single Server (Small Scale)

```
┌─────────────────────────────────────┐
│         Production Server            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Your AI Agent Application    │ │
│  │   - Node.js Process            │ │
│  │   - PM2 Process Manager        │ │
│  │   - Nginx Reverse Proxy        │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Monitoring & Logging         │ │
│  │   - Prometheus                 │ │
│  │   - Grafana                    │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
         │                    │
         ↓                    ↓
   Blockchain            LLM Provider
   (Somnia)             (OpenAI/etc)
```

### Option 2: Containerized (Medium Scale)

```
┌─────────────────────────────────────┐
│         Docker Host / K8s            │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │ Agent 1  │  │ Agent 2  │        │
│  │Container │  │Container │  ...   │
│  └──────────┘  └──────────┘        │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Load Balancer (Nginx)        │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Monitoring Stack             │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Option 3: Cloud-Native (Large Scale)

```
┌─────────────────────────────────────────────┐
│              Cloud Provider                  │
│         (AWS / GCP / Azure)                  │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │   Kubernetes Cluster                   │ │
│  │   ┌──────┐ ┌──────┐ ┌──────┐          │ │
│  │   │Agent │ │Agent │ │Agent │   ...    │ │
│  │   │ Pod  │ │ Pod  │ │ Pod  │          │ │
│  │   └──────┘ └──────┘ └──────┘          │ │
│  │                                         │ │
│  │   Auto-scaling, Load Balancing         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │   Managed Services                     │ │
│  │   - RDS (Database)                     │ │
│  │   - ElastiCache (Redis)                │ │
│  │   - CloudWatch (Monitoring)            │ │
│  │   - Secrets Manager                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 🔧 Deployment Steps

### Step 1: Prepare Your Application

**1.1 Build for Production**

```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Test build
node dist/index.js
```

**1.2 Environment Configuration**

Create `.env.production`:

```bash
# Blockchain
PRIVATE_KEY=0x...
RPC_URL=https://rpc.somnia.network
NETWORK=mainnet

# Contracts (Mainnet addresses)
AGENT_REGISTRY_ADDRESS=0x...
AGENT_EXECUTOR_ADDRESS=0x...
AGENT_MANAGER_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...

# LLM Provider
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Monitoring
MONITORING_ENABLED=true
MONITORING_PORT=3001
PROMETHEUS_PORT=9090

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/somnia-agent/app.log

# Security
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://yourdomain.com

# Performance
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30000
```

**1.3 Production Configuration**

Create `config/production.ts`:

```typescript
export const productionConfig = {
  // Server
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  
  // Security
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // Performance
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  
  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    port: parseInt(process.env.MONITORING_PORT || '3001'),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE,
  },
};
```

### Step 2: Server Setup

**2.1 Install Node.js**

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**2.2 Install PM2**

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

**2.3 Install Nginx**

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: Deploy Application

**3.1 Upload Code**

```bash
# From your local machine
rsync -avz --exclude 'node_modules' \
  ./ user@your-server:/opt/somnia-agent/

# Or use Git
ssh user@your-server
cd /opt
git clone https://github.com/your-repo/somnia-agent.git
cd somnia-agent
git checkout main
```

**3.2 Install Dependencies**

```bash
# On server
cd /opt/somnia-agent
npm ci --production
npm run build
```

**3.3 Configure PM2**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'somnia-agent',
    script: './dist/index.js',
    instances: 2, // Number of instances
    exec_mode: 'cluster',
    
    // Environment
    env_production: {
      NODE_ENV: 'production',
    },
    
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // Logging
    error_file: '/var/log/somnia-agent/error.log',
    out_file: '/var/log/somnia-agent/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Graceful shutdown
    kill_timeout: 5000,
  }],
};
```

**3.4 Start with PM2**

```bash
# Create log directory
sudo mkdir -p /var/log/somnia-agent
sudo chown $USER:$USER /var/log/somnia-agent

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

**3.5 Verify Deployment**

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs somnia-agent

# Monitor resources
pm2 monit
```

### Step 4: Configure Nginx

**4.1 Create Nginx Configuration**

Create `/etc/nginx/sites-available/somnia-agent`:

```nginx
upstream somnia_agent {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Logging
    access_log /var/log/nginx/somnia-agent-access.log;
    error_log /var/log/nginx/somnia-agent-error.log;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://somnia_agent;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://somnia_agent/health;
    }
    
    # Metrics endpoint (restrict access)
    location /metrics {
        allow 10.0.0.0/8;  # Your monitoring server
        deny all;
        proxy_pass http://somnia_agent/metrics;
    }
}
```

**4.2 Enable Configuration**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/somnia-agent \
  /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

**4.3 Setup SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### Step 5: Setup Monitoring

**5.1 Install Prometheus**

```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Create user
sudo useradd --no-create-home --shell /bin/false prometheus

# Move files
sudo mv prometheus promtool /usr/local/bin/
sudo mv prometheus.yml /etc/prometheus/

# Create directories
sudo mkdir -p /var/lib/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus
```

Create `/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'somnia-agent'
    static_configs:
      - targets: ['localhost:3000']
        labels:
          instance: 'agent-1'
```

**5.2 Install Grafana**

```bash
# Add Grafana repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Install Grafana
sudo apt-get update
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

Access Grafana at `http://your-server:3000`

### Step 6: Setup Logging

**6.1 Configure Log Rotation**

Create `/etc/logrotate.d/somnia-agent`:

```
/var/log/somnia-agent/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

**6.2 Centralized Logging (Optional)**

```bash
# Install Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.8.0-amd64.deb
sudo dpkg -i filebeat-8.8.0-amd64.deb

# Configure Filebeat to send logs to your ELK stack
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt-get install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow monitoring (from specific IP)
sudo ufw allow from YOUR_MONITORING_IP to any port 9090

# Enable firewall
sudo ufw enable
```

### 2. Secrets Management

**Option A: Environment Variables**

```bash
# Use systemd environment file
sudo mkdir -p /etc/somnia-agent
sudo nano /etc/somnia-agent/secrets.env

# Add secrets (restrict permissions)
sudo chmod 600 /etc/somnia-agent/secrets.env
sudo chown $USER:$USER /etc/somnia-agent/secrets.env
```

**Option B: HashiCorp Vault**

```typescript
import vault from 'node-vault';

const vaultClient = vault({
  endpoint: 'https://vault.yourdomain.com',
  token: process.env.VAULT_TOKEN,
});

const secrets = await vaultClient.read('secret/data/somnia-agent');
const privateKey = secrets.data.data.PRIVATE_KEY;
```

**Option C: AWS Secrets Manager**

```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });

const response = await client.getSecretValue({
  SecretId: 'somnia-agent/production',
});

const secrets = JSON.parse(response.SecretString);
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### 4. Input Validation

```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/execute',
  body('prompt').isString().trim().isLength({ min: 1, max: 1000 }),
  body('agentId').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Process request
  }
);
```

## 📊 Monitoring & Alerts

### Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check blockchain connection
    const blockNumber = await provider.getBlockNumber();
    
    // Check LLM provider
    const llmHealth = await llm.healthCheck();
    
    // Check database (if applicable)
    // const dbHealth = await db.ping();
    
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      checks: {
        blockchain: { status: 'up', blockNumber },
        llm: { status: llmHealth ? 'up' : 'down' },
        // database: { status: dbHealth ? 'up' : 'down' },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

### Alert Configuration

```typescript
import nodemailer from 'nodemailer';

async function sendAlert(type: string, message: string) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: 'alerts@yourdomain.com',
    to: 'admin@yourdomain.com',
    subject: `🚨 Alert: ${type}`,
    text: message,
  });
}

// Use it
monitor.on('high_error_rate', async (data) => {
  await sendAlert('High Error Rate', 
    `Error rate: ${(data.errorRate * 100).toFixed(2)}%`
  );
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/somnia-agent
            git pull origin main
            npm ci --production
            npm run build
            pm2 reload ecosystem.config.js --env production
```

## 🔧 Maintenance

### Regular Tasks

**Daily:**
- Check logs for errors
- Monitor resource usage
- Verify agent health

**Weekly:**
- Review metrics and performance
- Check for security updates
- Backup configuration

**Monthly:**
- Update dependencies
- Security audit
- Performance optimization
- Cost analysis

### Backup Strategy

```bash
# Backup script
#!/bin/bash

BACKUP_DIR="/backups/somnia-agent"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup configuration
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" /opt/somnia-agent/.env*

# Backup logs
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" /var/log/somnia-agent/

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Update Process

```bash
# 1. Backup current version
pm2 save
cp -r /opt/somnia-agent /opt/somnia-agent.backup

# 2. Pull updates
cd /opt/somnia-agent
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Build
npm run build

# 5. Reload (zero-downtime)
pm2 reload ecosystem.config.js --env production

# 6. Verify
pm2 status
curl http://localhost:3000/health
```

## 📚 Next Steps

- **[Monitoring Guide](../examples/monitoring.md)** - Detailed monitoring setup
- **[Security Best Practices](../security/best-practices.md)** - Security hardening
- **[Troubleshooting](../troubleshooting.md)** - Common issues

---

**Congratulations!** 🎉 Your agent is now running in production!


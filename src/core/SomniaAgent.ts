/**
 * SomniaAgent - High-level agent abstraction with lifecycle and event system
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { LLMProvider } from './LLMProvider';
import { SomniaClient } from './SomniaClient';
import {
  AgentConfig,
  AgentData,
  AgentMetrics,
  AgentState,
  ExecutionResult,
  ExecutorContext,
  ExecutorFunction,
  TaskData,
  UpdateAgentParams,
} from './types';

export class SomniaAgent extends EventEmitter {
  private client: SomniaClient;
  private config?: AgentConfig;
  private executor?: ExecutorFunction;
  private llm?: LLMProvider;
  private logger: Logger;
  private state: AgentState = 'idle';
  private agentId?: string;
  private isListening: boolean = false;
  private pollingInterval?: NodeJS.Timeout;
  private processedTasks: Set<string> = new Set();

  constructor(client: SomniaClient) {
    super();
    this.client = client;
    this.logger = new Logger('SomniaAgent');
  }

  // ========================================================================
  // Configuration
  // ========================================================================

  configure(config: AgentConfig): SomniaAgent {
    this.config = config;
    return this;
  }

  withExecutor(executor: ExecutorFunction): SomniaAgent {
    this.executor = executor;
    return this;
  }

  withLLM(llm: LLMProvider): SomniaAgent {
    this.llm = llm;
    if (llm.isConfigured()) {
      this.logger.info(
        `LLM configured: ${llm.getModelInfo().provider} - ${llm.getModel()}`
      );
    } else {
      this.logger.warn('LLM provider configured without API key');
    }
    return this;
  }

  getLLM(): LLMProvider | undefined {
    return this.llm;
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  async start(): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not registered. Call register() before starting.');
    }

    if (this.state === 'running') {
      this.logger.warn('Agent already running');
      return;
    }

    this.logger.info(`Starting agent: ${this.agentId}`);
    this.state = 'running';

    // Activate agent on-chain
    await this.client.activateAgent(this.agentId);

    // Start listening for tasks if configured
    if (this.config?.autoStart !== false) {
      await this.listenForTasks();
    }

    this.emit('agent:started');
    this.logger.info('Agent started successfully');
  }

  async stop(): Promise<void> {
    if (this.state === 'stopped') {
      this.logger.warn('Agent already stopped');
      return;
    }

    this.logger.info('Stopping agent...');
    this.state = 'stopped';

    // Stop listening for tasks
    this.stopListening();

    // Deactivate agent on-chain
    if (this.agentId) {
      await this.client.deactivateAgent(this.agentId);
    }

    this.emit('agent:stopped');
    this.logger.info('Agent stopped');
  }

  async restart(): Promise<void> {
    this.logger.info('Restarting agent...');
    await this.stop();
    await this.start();
  }

  getState(): AgentState {
    return this.state;
  }

  // ========================================================================
  // Registration & Deployment
  // ========================================================================

  async register(): Promise<string> {
    if (!this.config) {
      throw new Error('Agent not configured. Call configure() first.');
    }

    if (this.agentId) {
      this.logger.warn(`Agent already registered with ID: ${this.agentId}`);
      return this.agentId;
    }

    this.logger.info(`Registering agent: ${this.config.name}`);

    // Upload metadata to IPFS
    const metadata = {
      ...this.config.metadata,
      version: '1.0.0',
      framework: 'somnia-ai-agent',
      llm: this.llm
        ? {
            provider: this.llm.getModelInfo().provider,
            model: this.llm.getModel(),
          }
        : undefined,
    };

    const ipfsHash = await this.client.uploadToIPFS(metadata);

    // Register on-chain
    this.agentId = await this.client.registerAgent({
      name: this.config.name,
      description: this.config.description,
      ipfsMetadata: ipfsHash,
      capabilities: this.config.capabilities,
    });

    this.emit('agent:registered', this.agentId);
    this.logger.info(`Agent registered with ID: ${this.agentId}`);

    return this.agentId;
  }

  async update(params: UpdateAgentParams): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    await this.client.updateAgent(this.agentId, params);
    this.emit('agent:updated', params);
  }

  async activate(): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    await this.client.activateAgent(this.agentId);
    this.emit('agent:activated');
  }

  async deactivate(): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    await this.client.deactivateAgent(this.agentId);
    this.emit('agent:deactivated');
  }

  // ========================================================================
  // Task Management
  // ========================================================================

  async processTask(taskId: string): Promise<ExecutionResult> {
    if (!this.executor) {
      throw new Error('No executor configured');
    }

    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    this.logger.info(`Processing task: ${taskId}`);
    this.emit('task:started', taskId);

    const startTime = Date.now();

    try {
      // Get task data
      const task = await this.client.getTask(taskId);

      // Parse task data from IPFS if needed
      let taskInput = task.taskData;
      if (taskInput.startsWith('Qm') || taskInput.startsWith('bafy')) {
        taskInput = await this.client.fetchFromIPFS(taskInput);
      } else {
        try {
          taskInput = JSON.parse(taskInput);
        } catch {
          // Keep as string if not JSON
        }
      }

      // Create executor context
      const context: ExecutorContext = {
        llm: this.llm,
        agentId: this.agentId,
        logger: this.logger,
        ipfs: this.client.getIPFSManager(),
      };

      // Start task on-chain
      await this.client.startTask(taskId);

      // Execute task
      const result = await this.executor(taskInput, context);
      const executionTime = Date.now() - startTime;

      // Record execution on-chain
      await this.client.recordExecution(this.agentId, result.success, executionTime);

      // Complete task if successful
      if (result.success) {
        await this.client.completeTask(taskId, result.result || '');
        this.emit('task:completed', { taskId, result });
        this.logger.info(`Task ${taskId} completed successfully`);
      } else {
        await this.client.failTask(taskId);
        this.emit('task:failed', { taskId, error: result.error });
        this.logger.error(`Task ${taskId} failed: ${result.error}`);
      }

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Record failed execution
      await this.client.recordExecution(this.agentId, false, executionTime);

      // Fail task on-chain
      try {
        await this.client.failTask(taskId);
      } catch (failError) {
        this.logger.error(
          `Failed to mark task as failed: ${failError instanceof Error ? failError.message : 'Unknown error'}`
        );
      }

      this.emit('task:failed', { taskId, error: errorMessage });
      this.logger.error(`Task ${taskId} error: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        executionTime,
      };
    } finally {
      this.processedTasks.add(taskId);
    }
  }

  async listenForTasks(): Promise<void> {
    if (this.isListening) {
      this.logger.warn('Already listening for tasks');
      return;
    }

    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    this.logger.info('Starting to listen for tasks...');
    this.isListening = true;

    const pollingInterval = this.config?.pollingInterval || 5000; // 5 seconds default

    // Subscribe to TaskCreated events for this agent
    this.client.subscribeToEvent('TaskCreated', async (...args: any[]) => {
      const taskId = args[0];
      const agentId = args[1];

      // Check if task is for this agent
      if (agentId && agentId.toString() === this.agentId && this.state === 'running') {
        // Check if already processed
        if (this.processedTasks.has(taskId.toString())) {
          return;
        }

        this.emit('task:created', {
          taskId: taskId.toString(),
          agentId: agentId.toString(),
        });

        // Process task
        try {
          await this.processTask(taskId.toString());
        } catch (error) {
          this.logger.error(
            `Error processing task ${taskId}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    });

    // Also poll for pending tasks
    this.pollingInterval = setInterval(async () => {
      if (this.state !== 'running') {
        return;
      }

      try {
        await this.checkForPendingTasks();
      } catch (error) {
        this.logger.error(
          `Error checking for tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }, pollingInterval);

    this.logger.info(`Listening for tasks (polling every ${pollingInterval}ms)`);
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.logger.info('Stopping task listener...');
    this.isListening = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    this.logger.info('Task listener stopped');
  }

  private async checkForPendingTasks(): Promise<void> {
    // This is a simplified implementation
    // In production, you might want to query tasks from a subgraph or indexer
    // For now, we rely on event subscription
  }

  // ========================================================================
  // Metrics & Info
  // ========================================================================

  async getMetrics(): Promise<AgentMetrics> {
    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    const metrics = await this.client.getAgentMetrics(this.agentId);
    this.emit('metrics:updated', metrics);
    return metrics;
  }

  async getDetails(): Promise<AgentData> {
    if (!this.agentId) {
      throw new Error('Agent not registered');
    }

    return await this.client.getAgent(this.agentId);
  }

  getAgentId(): string | undefined {
    return this.agentId;
  }

  getConfig(): AgentConfig | undefined {
    return this.config;
  }

  // ========================================================================
  // Event Handlers
  // ========================================================================

  on(event: 'task:created', handler: (task: TaskData) => void): this;
  on(event: 'task:started', handler: (taskId: string) => void): this;
  on(
    event: 'task:completed',
    handler: (result: { taskId: string; result: ExecutionResult }) => void
  ): this;
  on(
    event: 'task:failed',
    handler: (error: { taskId: string; error: string }) => void
  ): this;
  on(event: 'agent:registered', handler: (agentId: string) => void): this;
  on(event: 'agent:started', handler: () => void): this;
  on(event: 'agent:stopped', handler: () => void): this;
  on(event: 'agent:updated', handler: (params: UpdateAgentParams) => void): this;
  on(event: 'agent:activated', handler: () => void): this;
  on(event: 'agent:deactivated', handler: () => void): this;
  on(event: 'metrics:updated', handler: (metrics: AgentMetrics) => void): this;
  on(event: 'error', handler: (error: Error) => void): this;
  on(event: string, handler: (...args: any[]) => void): this {
    return super.on(event, handler);
  }
}

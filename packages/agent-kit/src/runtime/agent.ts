/**
 * Agent Lifecycle Management
 * Handles agent creation, registration, execution, and termination
 * Orchestrates Trigger → Planner → Executor → Storage → Policy flow
 */

import { ethers } from 'ethers';
import type { AgentRegistry, AgentExecutor } from '../../../../contracts/typechain-types';
import { Trigger, TriggerConfig } from './trigger';
import { Planner } from './planner';
import { Executor } from './executor';
import { IStorage, MemoryStorage, FileStorage } from './storage';
import { Policy } from './policy';
import { Memory, MemoryBackend, InMemoryBackend, FileBackend } from './memoryManager';
import { ContextBuilder } from '../llm/context';
import { EventEmitter } from '../utils/logger';
import type { Logger } from '../monitor/logger';
import type { ChainClient } from '../core/chainClient';
import type {
  AgentConfig,
  AgentTask,
  AgentOptions,
  AgentEvents,
} from '../types/agent';
import { AgentState } from '../types/agent'; // Enum must be imported as value
import { StorageBackend } from '../types/storage';

// Re-export types for backward compatibility
export { AgentState, AgentConfig, AgentTask, AgentOptions, AgentEvents };

/**
 * Agent class for managing autonomous agent lifecycle
 * Orchestrates runtime modules: Trigger, Planner, Executor, Storage, Policy
 */
export class Agent extends EventEmitter<AgentEvents> {
  private state: AgentState = AgentState.Created;
  private config: AgentConfig;
  private registryContract: AgentRegistry | null = null;
  private executorContract: AgentExecutor | null = null;
  private agentAddress: string | null = null;
  private agentId: bigint | null = null;
  private tasks: Map<string, AgentTask> = new Map();

  // Runtime modules
  private trigger: Trigger;
  private planner: Planner;
  private executor: Executor;
  private storage: IStorage;
  private policy: Policy;
  private memory: Memory;
  private contextBuilder: ContextBuilder;
  private logger?: Logger;
  private enableMemory: boolean;
  private chainClient?: ChainClient;

  constructor(config: AgentConfig, options?: AgentOptions) {
    super();
    this.config = config;
    this.logger = options?.logger;
    this.enableMemory = options?.enableMemory !== false;

    // Initialize runtime modules
    this.trigger = new Trigger();
    this.planner = new Planner();
    this.executor = new Executor();

    // Initialize storage based on backend type
    const backend = options?.storageBackend || StorageBackend.Memory;
    this.storage = backend === StorageBackend.File
      ? new FileStorage(options?.storagePath || './data')
      : new MemoryStorage();

    this.policy = new Policy();

    // Initialize memory
    const memoryBackendType = options?.memoryBackend || 'memory';
    const memoryBackend = memoryBackendType === 'file'
      ? new FileBackend(options?.memoryPath || './data/memory')
      : new InMemoryBackend();

    this.memory = new Memory({
      backend: memoryBackend,
      sessionId: options?.sessionId,
    });

    // Initialize context builder
    this.contextBuilder = new ContextBuilder(
      this.config,
      undefined, // chainClient will be set in initialize()
      this.storage,
      this.memory
    );
  }

  /**
   * Initialize agent with contracts
   */
  async initialize(
    registry: AgentRegistry,
    executor: AgentExecutor
  ): Promise<void> {
    this.registryContract = registry;
    this.executorContract = executor;
  }

  /**
   * Register agent on-chain
   */
  async register(signer: ethers.Signer): Promise<string> {
    if (!this.registryContract) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    if (this.state !== AgentState.Created) {
      throw new Error(`Cannot register agent in state: ${this.state}`);
    }

    // Register on AgentRegistry contract
    const tx = await this.registryContract
      .connect(signer)
      .registerAgent(
        this.config.name,
        this.config.description,
        this.config.metadata?.ipfsHash || '', // IPFS metadata hash
        this.config.capabilities || []
      );

    const receipt = await tx.wait();

    // Extract agentId from event
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = this.registryContract!.interface.parseLog(log);
        return parsed?.name === 'AgentRegistered';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = this.registryContract.interface.parseLog(event);
      this.agentId = parsed?.args[0]; // agentId (uint256)
      this.agentAddress = parsed?.args[1]; // owner address
    }

    this.state = AgentState.Registered;
    return this.agentAddress || '';
  }

  /**
   * Start agent execution
   */
  async start(): Promise<void> {
    if (this.state !== AgentState.Registered && this.state !== AgentState.Paused) {
      throw new Error(`Cannot start agent in state: ${this.state}`);
    }

    this.state = AgentState.Active;
    await this.run();
  }

  /**
   * Main event processing loop
   * Subscribes to trigger events and processes them
   */
  private async run(): Promise<void> {
    if (!this.isActive()) {
      throw new Error('Agent must be active to run');
    }

    // Subscribe to trigger events
    this.trigger.on('triggered', async (data: any) => {
      await this.onEvent(data);
    });

    this.emit('started', { agentId: this.agentAddress });
    this.logger?.info('Agent started', {
      agentId: this.agentAddress,
      name: this.config.name,
    });
  }

  /**
   * Event handler - orchestrates the event → plan → execute flow
   * @param event Event data from trigger
   */
  private async onEvent(event: any): Promise<void> {
    try {
      this.emit('event:received', event);
      this.logger?.debug('Event received', { event });

      // Add event to memory as input
      if (this.enableMemory) {
        await this.memory.addInput(event, { agentId: this.agentAddress });
      }

      // 1. Check policy permissions
      if (event.sender && !this.policy.checkPermission(event.sender, 'execute')) {
        this.logger?.warn('Permission denied', { sender: event.sender });
        return;
      }

      // 2. Build unified context using ContextBuilder
      const agentContext = await this.contextBuilder.buildContext({
        maxMemoryTokens: 1000,
        maxActions: 10,
        includeChainState: !!this.chainClient,
        includeActions: true,
        includeMemory: this.enableMemory,
      });

      // Format context for planner
      const contextString = this.contextBuilder.formatContext(agentContext);
      const fullContext = event.context
        ? `${event.context}\n\n${contextString}`
        : contextString;

      // 3. Plan tasks using planner with context
      const tasks = await this.planner.plan(event.goal || event.data, fullContext);
      this.emit('tasks:planned', { tasks });
      this.logger?.info('Tasks planned', { taskCount: tasks.length });

      // 4. Execute tasks using executor
      const results = await this.executor.executeAll(tasks);
      this.emit('tasks:executed', { results });
      this.logger?.info('Tasks executed', { resultCount: results.length });

      // Add results to memory as output
      if (this.enableMemory) {
        await this.memory.addOutput({ tasks, results }, { agentId: this.agentAddress });
      }

      // 5. Store event and actions
      await this.storage.saveEvent(event);
      for (let i = 0; i < tasks.length; i++) {
        await this.storage.saveAction(tasks[i], results[i]);
      }
      const taskId = event.id || `event-${Date.now()}`;
      this.emit('results:stored', { taskId });
      this.logger?.debug('Results stored', { taskId });

    } catch (error) {
      this.emit('error', { error, event });
      this.logger?.error('Event processing failed', { error, event });
    }
  }

  /**
   * Pause agent execution
   */
  async pause(): Promise<void> {
    if (this.state !== AgentState.Active) {
      throw new Error(`Cannot pause agent in state: ${this.state}`);
    }

    this.state = AgentState.Paused;
  }

  /**
   * Stop agent execution
   */
  async stop(): Promise<void> {
    if (this.state === AgentState.Terminated) {
      throw new Error('Agent is already terminated');
    }

    // Cleanup triggers
    this.trigger.cleanup();

    this.emit('stopped', { agentId: this.agentAddress });
    this.logger?.info('Agent stopped', { agentId: this.agentAddress });

    this.state = AgentState.Stopped;
  }

  /**
   * Terminate agent permanently
   * Deactivates the agent on-chain
   */
  async terminate(signer: ethers.Signer): Promise<void> {
    if (!this.registryContract || this.agentId === null) {
      throw new Error('Agent not registered');
    }

    // Deactivate agent on contract
    const tx = await this.registryContract
      .connect(signer)
      .deactivateAgent(this.agentId);

    await tx.wait();

    this.state = AgentState.Terminated;
    this.tasks.clear();
  }

  /**
   * Add task to agent queue
   */
  addTask(task: Omit<AgentTask, 'id' | 'createdAt'>): string {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullTask: AgentTask = {
      id: taskId,
      createdAt: Date.now(),
      ...task,
    };

    this.tasks.set(taskId, fullTask);
    return taskId;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Remove task from queue
   */
  removeTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * Get all tasks
   */
  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get agent state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get agent configuration
   */
  getConfig(): Readonly<AgentConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get agent address (if registered)
   */
  getAddress(): string | null {
    return this.agentAddress;
  }

  /**
   * Check if agent is active
   */
  isActive(): boolean {
    return this.state === AgentState.Active;
  }

  /**
   * Check if agent is registered
   */
  isRegistered(): boolean {
    return this.state !== AgentState.Created && this.agentAddress !== null;
  }

  /**
   * Register a trigger for the agent
   * @param config Trigger configuration
   * @returns Trigger ID
   */
  registerTrigger(config: Omit<TriggerConfig, 'id' | 'createdAt'>): string {
    return this.trigger.register(config);
  }

  /**
   * Enable a registered trigger
   * @param triggerId Trigger ID
   */
  enableTrigger(triggerId: string): void {
    this.trigger.enable(triggerId);
  }

  /**
   * Disable a registered trigger
   * @param triggerId Trigger ID
   */
  disableTrigger(triggerId: string): void {
    this.trigger.disable(triggerId);
  }

  /**
   * Get all registered triggers
   * @returns Array of trigger configs
   */
  getTriggers(): TriggerConfig[] {
    return this.trigger.getAllTriggers();
  }

  /**
   * Get agent status including runtime module info
   * @returns Agent status object
   */
  getStatus() {
    return {
      state: this.state,
      address: this.agentAddress,
      config: {
        name: this.config.name,
        description: this.config.description,
        owner: this.config.owner,
      },
      runtime: {
        taskCount: this.tasks.size,
        triggerCount: this.trigger.getAllTriggers().length,
        isActive: this.isActive(),
        isRegistered: this.isRegistered(),
      },
    };
  }

  /**
   * Get trigger module (for advanced usage)
   * @returns Trigger instance
   */
  getTriggerModule(): Trigger {
    return this.trigger;
  }

  /**
   * Get planner module (for advanced usage)
   * @returns Planner instance
   */
  getPlannerModule(): Planner {
    return this.planner;
  }

  /**
   * Get executor module (for advanced usage)
   * @returns Executor instance
   */
  getExecutorModule(): Executor {
    return this.executor;
  }

  /**
   * Get storage module (for advanced usage)
   * @returns Storage instance
   */
  getStorageModule(): IStorage {
    return this.storage;
  }

  /**
   * Get policy module (for advanced usage)
   * @returns Policy instance
   */
  getPolicyModule(): Policy {
    return this.policy;
  }

  /**
   * Get memory module (for advanced usage)
   * @returns Memory instance
   */
  getMemoryModule(): Memory {
    return this.memory;
  }

  /**
   * Get context builder (for advanced usage)
   * @returns ContextBuilder instance
   */
  getContextBuilder(): ContextBuilder {
    return this.contextBuilder;
  }

  /**
   * Set chain client for context building
   * @param chainClient ChainClient instance
   */
  setChainClient(chainClient: ChainClient): void {
    this.chainClient = chainClient;
    this.contextBuilder.setChainClient(chainClient);
  }

  /**
   * Add memory entry
   * @param type Memory type
   * @param content Content to store
   * @param metadata Optional metadata
   * @returns Entry ID
   */
  async addMemory(
    type: 'input' | 'output' | 'state' | 'system',
    content: any,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.memory.addMemory(type, content, metadata);
  }

  /**
   * Get memory context for LLM
   * @param maxTokens Max tokens to include
   * @returns Context string
   */
  async getMemoryContext(maxTokens?: number): Promise<string> {
    return this.memory.getContext(maxTokens);
  }

  /**
   * Get memory history
   * @param limit Max entries to return
   * @returns Memory entries
   */
  async getMemoryHistory(limit?: number): Promise<any[]> {
    if (limit) {
      return this.memory.getRecent(limit);
    }
    return this.memory.getHistory();
  }

  /**
   * Clear agent memory
   */
  async clearMemory(): Promise<void> {
    await this.memory.clear();
  }

  /**
   * Get memory session ID
   * @returns Session ID
   */
  getMemorySessionId(): string {
    return this.memory.getSessionId();
  }

  /**
   * Set memory session ID
   * @param sessionId New session ID
   */
  setMemorySessionId(sessionId: string): void {
    this.memory.setSessionId(sessionId);
  }
}

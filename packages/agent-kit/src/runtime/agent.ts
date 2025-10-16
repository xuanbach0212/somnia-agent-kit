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
import { IStorage, MemoryStorage, FileStorage, StorageBackend } from './storage';
import { Policy } from './policy';
import { EventEmitter } from '../core/utils';
import type { Logger } from '../monitor/logger';

export enum AgentState {
  Created = 'created',
  Registered = 'registered',
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
  Terminated = 'terminated',
}

export interface AgentConfig {
  name: string;
  description: string;
  version?: string;
  owner: string;
  capabilities?: string[];
  metadata?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  type: string;
  data: any;
  priority?: number;
  createdAt: number;
}

export interface AgentOptions {
  logger?: Logger;
  storageBackend?: StorageBackend;
  storagePath?: string; // Path for FileStorage (default: './data')
}

interface AgentEvents {
  started: { agentId: string | null };
  stopped: { agentId: string | null };
  'event:received': any;
  'tasks:planned': { tasks: any[] };
  'tasks:executed': { results: any[] };
  'results:stored': { taskId: string };
  error: { error: any; event?: any };
}

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
  private tasks: Map<string, AgentTask> = new Map();

  // Runtime modules
  private trigger: Trigger;
  private planner: Planner;
  private executor: Executor;
  private storage: IStorage;
  private policy: Policy;
  private logger?: Logger;

  constructor(config: AgentConfig, options?: AgentOptions) {
    super();
    this.config = config;
    this.logger = options?.logger;

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
        this.config.capabilities || []
      );

    const receipt = await tx.wait();

    // Extract agent address from event
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
      this.agentAddress = parsed?.args[0];
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

      // 1. Check policy permissions
      if (event.sender && !this.policy.checkPermission(event.sender, 'execute')) {
        this.logger?.warn('Permission denied', { sender: event.sender });
        return;
      }

      // 2. Plan tasks using planner
      const tasks = await this.planner.plan(event.goal || event.data, event.context);
      this.emit('tasks:planned', { tasks });
      this.logger?.info('Tasks planned', { taskCount: tasks.length });

      // 3. Execute tasks using executor
      const results = await this.executor.executeAll(tasks);
      this.emit('tasks:executed', { results });
      this.logger?.info('Tasks executed', { resultCount: results.length });

      // 4. Store event and actions
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
   */
  async terminate(signer: ethers.Signer): Promise<void> {
    if (!this.registryContract || !this.agentAddress) {
      throw new Error('Agent not registered');
    }

    // Deregister from contract
    const tx = await this.registryContract
      .connect(signer)
      .deregisterAgent(this.agentAddress);

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
  getStorageModule(): Storage {
    return this.storage;
  }

  /**
   * Get policy module (for advanced usage)
   * @returns Policy instance
   */
  getPolicyModule(): Policy {
    return this.policy;
  }
}

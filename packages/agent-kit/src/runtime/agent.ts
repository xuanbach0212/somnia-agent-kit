/**
 * Agent Lifecycle Management
 * Handles agent creation, registration, execution, and termination
 * Orchestrates Trigger → Planner → Executor → Storage → Policy flow
 */

import { ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';
import { ContextBuilder } from '../llm/context';
import type { Logger } from '../monitor/logger';
import type { AgentConfig, AgentEvents, AgentOptions, AgentTask } from '../types/agent';
import { AgentState } from '../types/agent'; // Enum must be imported as value
import type { TriggerEvent } from '../types/common';
import type { IAgentExecutor, IAgentRegistry } from '../types/contracts';
import { StorageBackend } from '../types/storage';
import { EventEmitter } from '../utils/logger';
import { Executor } from './executor';
import { FileBackend, InMemoryBackend, Memory } from './memoryManager';
import { Planner } from './planner';
import { Policy } from './policy';
import { FileStorage, IStorage, MemoryStorage } from './storage';
import { Trigger, TriggerConfig } from './trigger';

// Re-export types for backward compatibility
export { AgentConfig, AgentEvents, AgentOptions, AgentState, AgentTask };

/**
 * Agent class for managing autonomous agent lifecycle
 *
 * Orchestrates runtime modules in a complete lifecycle:
 * - **Trigger**: Listens for events and triggers
 * - **Planner**: Decomposes tasks into executable actions
 * - **Executor**: Executes actions with retry logic
 * - **Storage**: Persists events and action history
 * - **Policy**: Enforces access control and permissions
 * - **Memory**: Maintains conversation and context history
 *
 * @fires Agent#started - Emitted when agent starts
 * @fires Agent#paused - Emitted when agent pauses
 * @fires Agent#terminated - Emitted when agent terminates
 * @fires Agent#event:received - Emitted when event is received
 * @fires Agent#tasks:planned - Emitted when tasks are planned
 * @fires Agent#tasks:executed - Emitted when tasks are executed
 * @fires Agent#results:stored - Emitted when results are stored
 * @fires Agent#error - Emitted when error occurs
 *
 * @example
 * ```typescript
 * // Create agent with configuration
 * const agent = new Agent(
 *   {
 *     name: 'MyAgent',
 *     description: 'Autonomous trading agent',
 *     owner: '0x...',
 *   },
 *   {
 *     logger: new Logger(),
 *     enableMemory: true,
 *     storageBackend: StorageBackend.File,
 *   }
 * );
 *
 * // Initialize with contracts
 * await agent.initialize(registryContract, executorContract);
 *
 * // Register on-chain
 * await agent.register(signer);
 *
 * // Start execution
 * await agent.start();
 *
 * // Listen to events
 * agent.on('tasks:executed', ({ results }) => {
 *   console.log('Tasks completed:', results);
 * });
 * ```
 */
export class Agent extends EventEmitter<AgentEvents> {
  private state: AgentState = AgentState.Created;
  private config: AgentConfig;
  private registryContract: IAgentRegistry | null = null;
  private executorContract: IAgentExecutor | null = null;
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
    this.executor = new Executor(undefined, undefined, {}, this.logger);

    // Initialize storage based on backend type
    const backend = options?.storageBackend || StorageBackend.Memory;
    this.storage =
      backend === StorageBackend.File
        ? new FileStorage(options?.storagePath || './data')
        : new MemoryStorage();

    this.policy = new Policy();

    // Initialize memory
    const memoryBackendType = options?.memoryBackend || 'memory';
    const memoryBackend =
      memoryBackendType === 'file'
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
   * Initialize agent with smart contracts
   *
   * Must be called before register() to connect the agent to on-chain contracts.
   * Sets up the AgentRegistry and AgentExecutor contract interfaces.
   *
   * @param registry - AgentRegistry contract instance for registration
   * @param executor - AgentExecutor contract instance for execution
   * @returns Promise that resolves when initialization is complete
   *
   * @throws {Error} If contracts are invalid or already initialized
   *
   * @example
   * ```typescript
   * const registry = await chainClient.getContract(
   *   registryAddress,
   *   AGENT_REGISTRY_ABI
   * ) as IAgentRegistry;
   *
   * const executor = await chainClient.getContract(
   *   executorAddress,
   *   AGENT_EXECUTOR_ABI
   * ) as IAgentExecutor;
   *
   * await agent.initialize(registry, executor);
   * ```
   */
  async initialize(registry: IAgentRegistry, executor: IAgentExecutor): Promise<void> {
    this.registryContract = registry;
    this.executorContract = executor;
  }

  /**
   * Register agent on-chain via AgentRegistry contract
   *
   * Submits agent metadata to the blockchain and obtains a unique agent ID.
   * The agent must be in `Created` state to register.
   *
   * Emits `AgentRegistered` event on-chain with agentId and owner address.
   * Transitions agent state from `Created` to `Registered`.
   *
   * @param signer - Ethereum signer to sign the registration transaction
   * @returns Promise resolving to the agent's on-chain address
   *
   * @throws {Error} If agent not initialized (call initialize() first)
   * @throws {Error} If agent not in Created state
   * @throws {Error} If transaction fails or is reverted
   *
   * @example
   * ```typescript
   * const signer = chainClient.getSigner();
   * const agentAddress = await agent.register(signer);
   * console.log('Agent registered at:', agentAddress);
   * console.log('Agent ID:', agent.getAgentId());
   * ```
   */
  async register(signer: ethers.Signer): Promise<string> {
    if (!this.registryContract) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    if (this.state !== AgentState.Created) {
      throw new Error(`Cannot register agent in state: ${this.state}`);
    }

    // Register on AgentRegistry contract
    const tx = await this.registryContract.connect(signer).registerAgent(
      this.config.name,
      this.config.description,
      this.config.metadata?.ipfsHash || '', // IPFS metadata hash
      this.config.capabilities || []
    );

    const receipt = await tx.wait();

    // Extract agentId from event
    const iface = this.registryContract!.interface as ethers.Interface;
    const event = receipt?.logs.find((log: ethers.Log) => {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        return parsed?.name === 'AgentRegistered';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = iface.parseLog({
        topics: event.topics as string[],
        data: event.data,
      });
      this.agentId = parsed?.args[0]; // agentId (uint256)
      this.agentAddress = parsed?.args[1]; // owner address
    }

    this.state = AgentState.Registered;
    return this.agentAddress || '';
  }

  /**
   * Start agent execution and begin processing events
   *
   * Transitions agent to Active state and starts the event processing loop.
   * Can be called from Registered or Paused states.
   *
   * The agent will:
   * 1. Subscribe to trigger events
   * 2. Process incoming events through planner
   * 3. Execute planned actions via executor
   * 4. Store results in storage backend
   * 5. Maintain conversation memory
   *
   * @returns Promise that resolves when agent starts successfully
   *
   * @throws {Error} If agent not in Registered or Paused state
   *
   * @fires Agent#started - When agent starts successfully
   *
   * @example
   * ```typescript
   * // Start agent after registration
   * await agent.register(signer);
   * await agent.start();
   *
   * // Listen for lifecycle events
   * agent.on('started', ({ agentId }) => {
   *   console.log('Agent started:', agentId);
   * });
   *
   * // Resume from paused state
   * await agent.pause();
   * await agent.start(); // Resumes execution
   * ```
   */
  async start(): Promise<void> {
    if (this.state !== AgentState.Registered && this.state !== AgentState.Paused) {
      throw new Error(`Cannot start agent in state: ${this.state}`);
    }

    this.state = AgentState.Active;
    await this.run();
  }

  /**
   * Main event processing loop (internal)
   *
   * Subscribes to trigger events and processes them through the complete pipeline:
   * Trigger → Planner → Executor → Storage → Memory
   *
   * This is an internal method called by start(). Use start() to begin execution.
   *
   * @private
   * @returns Promise that resolves when event loop is set up
   * @throws {Error} If agent not in Active state
   */
  private async run(): Promise<void> {
    if (!this.isActive()) {
      throw new Error('Agent must be active to run');
    }

    // Subscribe to trigger events
    this.trigger.on('triggered', async (data: TriggerEvent) => {
      await this.onEvent(data);
    });

    this.emit('started', { agentId: this.agentAddress });
    this.logger?.info('Agent started', {
      agentId: this.agentAddress,
      name: this.config.name,
    });
  }

  /**
   * Event handler - orchestrates the complete event processing flow (internal)
   *
   * Processes events through the full pipeline:
   * 1. **Policy Check**: Verify sender permissions
   * 2. **Context Building**: Build unified context from memory, chain state, and history
   * 3. **Planning**: Decompose goal into executable actions
   * 4. **Execution**: Execute actions with retry logic
   * 5. **Storage**: Persist event and results
   * 6. **Memory**: Update conversation history
   *
   * @private
   * @param event - Event data from trigger containing goal, sender, context, etc.
   * @returns Promise that resolves when event is fully processed
   *
   * @fires Agent#event:received - When event is received
   * @fires Agent#tasks:planned - When tasks are planned
   * @fires Agent#tasks:executed - When tasks complete
   * @fires Agent#results:stored - When results are persisted
   * @fires Agent#error - If processing fails
   *
   * @example
   * ```typescript
   * // Event structure
   * const event: TriggerEvent = {
   *   goal: 'Transfer 1 ETH to Alice',
   *   sender: '0x...',
   *   context: 'User requested urgent transfer',
   *   id: 'event-123'
   * };
   * ```
   */
  private async onEvent(event: TriggerEvent): Promise<void> {
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
      // Convert string context to Context object
      const contextObj = { description: fullContext };
      const goal = event.goal || event.data || { description: 'Unknown goal' };
      const tasks = await this.planner.plan(goal, contextObj);
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
   * Pause agent execution temporarily
   *
   * Transitions agent from Active to Paused state. The agent stops processing
   * new events but maintains its state and can be resumed with start().
   *
   * @returns Promise that resolves when agent is paused
   *
   * @throws {Error} If agent not in Active state
   *
   * @fires Agent#paused - When agent is successfully paused
   *
   * @example
   * ```typescript
   * // Pause during execution
   * await agent.start();
   * await agent.pause();
   *
   * // Resume later
   * await agent.start();
   * ```
   */
  async pause(): Promise<void> {
    if (this.state !== AgentState.Active) {
      throw new Error(`Cannot pause agent in state: ${this.state}`);
    }

    this.state = AgentState.Paused;
  }

  /**
   * Stop agent execution gracefully
   *
   * Stops the agent and cleans up all triggers and subscriptions.
   * Unlike pause(), stop() requires re-initialization to restart.
   * The agent state is set to Stopped (different from Terminated).
   *
   * @returns Promise that resolves when agent is stopped
   *
   * @throws {Error} If agent is already terminated
   *
   * @fires Agent#stopped - When agent stops successfully
   *
   * @example
   * ```typescript
   * // Stop agent execution
   * await agent.stop();
   *
   * // Agent can be started again after stop
   * await agent.start();
   * ```
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
   * Terminate agent permanently and deactivate on-chain
   *
   * Permanently terminates the agent by:
   * 1. Calling deactivateAgent() on the AgentRegistry contract
   * 2. Clearing all pending tasks
   * 3. Setting state to Terminated (cannot be restarted)
   *
   * This is a permanent action that deactivates the agent on-chain.
   * Use stop() if you want to temporarily stop execution.
   *
   * @param signer - Ethereum signer to sign the deactivation transaction
   * @returns Promise that resolves when agent is terminated
   *
   * @throws {Error} If agent not registered
   * @throws {Error} If transaction fails
   *
   * @fires Agent#terminated - When agent is terminated successfully
   *
   * @example
   * ```typescript
   * // Permanently terminate agent
   * const signer = chainClient.getSigner();
   * await agent.terminate(signer);
   *
   * // Agent cannot be restarted after termination
   * // State is now AgentState.Terminated
   * ```
   */
  async terminate(signer: ethers.Signer): Promise<void> {
    if (!this.registryContract || this.agentId === null) {
      throw new Error('Agent not registered');
    }

    // Deactivate agent on contract
    const tx = await this.registryContract.connect(signer).deactivateAgent(this.agentId);

    await tx.wait();

    this.state = AgentState.Terminated;
    this.tasks.clear();
  }

  /**
   * Add task to agent's task queue
   *
   * Tasks are queued and can be retrieved for execution. This is useful for
   * scheduling tasks that will be processed by the agent's event loop.
   *
   * The task is assigned a unique ID and timestamp automatically.
   *
   * @param task - Task details (without id and createdAt which are auto-generated)
   * @returns Unique task ID for tracking
   *
   * @example
   * ```typescript
   * const taskId = agent.addTask({
   *   type: 'transfer',
   *   params: {
   *     to: '0x...',
   *     amount: '1.0'
   *   },
   *   priority: 2
   * });
   *
   * console.log('Task queued:', taskId);
   *
   * // Retrieve task later
   * const task = agent.getTask(taskId);
   * ```
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

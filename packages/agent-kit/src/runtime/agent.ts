/**
 * Agent Lifecycle Management
 * Handles agent creation, registration, execution, and termination
 */

import { ethers } from 'ethers';
import type { AgentRegistry, AgentExecutor } from '../../../../contracts/typechain-types';

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

/**
 * Agent class for managing autonomous agent lifecycle
 */
export class Agent {
  private state: AgentState = AgentState.Created;
  private config: AgentConfig;
  private registryContract: AgentRegistry | null = null;
  private executorContract: AgentExecutor | null = null;
  private agentAddress: string | null = null;
  private tasks: Map<string, AgentTask> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
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
}

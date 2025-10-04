/**
 * Agent Builder - Fluent API for building and deploying AI agents
 */

import { Logger } from '../utils/logger';
import { SomniaAgentSDK } from './SomniaAgentSDK';
import { AgentConfig, AgentExecutor, ExecutionResult } from './types';

export class AgentBuilder {
  private config: Partial<AgentConfig> = {
    capabilities: [],
  };
  private executor?: AgentExecutor;
  private sdk?: SomniaAgentSDK;
  private logger: Logger;
  private agentId?: string;

  constructor() {
    this.logger = new Logger('AgentBuilder');
  }

  /**
   * Set agent name
   */
  withName(name: string): AgentBuilder {
    this.config.name = name;
    return this;
  }

  /**
   * Set agent description
   */
  withDescription(description: string): AgentBuilder {
    this.config.description = description;
    return this;
  }

  /**
   * Add a capability to the agent
   */
  addCapability(capability: string): AgentBuilder {
    if (!this.config.capabilities) {
      this.config.capabilities = [];
    }
    this.config.capabilities.push(capability);
    return this;
  }

  /**
   * Add multiple capabilities
   */
  withCapabilities(capabilities: string[]): AgentBuilder {
    this.config.capabilities = capabilities;
    return this;
  }

  /**
   * Set agent metadata
   */
  withMetadata(metadata: Record<string, any>): AgentBuilder {
    this.config.metadata = metadata;
    return this;
  }

  /**
   * Set the agent executor function
   */
  withExecutor(executor: AgentExecutor): AgentBuilder {
    this.executor = executor;
    return this;
  }

  /**
   * Connect to Somnia SDK
   */
  connectSDK(sdk: SomniaAgentSDK): AgentBuilder {
    this.sdk = sdk;
    return this;
  }

  /**
   * Build and register the agent
   */
  async build(): Promise<DeployedAgent> {
    if (!this.sdk) {
      throw new Error('SDK not connected. Use connectSDK() first.');
    }

    if (!this.config.name || !this.config.description) {
      throw new Error('Agent name and description are required');
    }

    this.logger.info('Building agent...');

    // Register agent
    const agentId = await this.sdk.registerAgent(this.config as AgentConfig);
    this.agentId = agentId;

    this.logger.info(`Agent built successfully with ID: ${agentId}`);

    return new DeployedAgent(this.sdk, agentId, this.executor);
  }

  /**
   * Quick build - creates an agent with minimal configuration
   */
  static quick(
    name: string,
    description: string,
    executor: AgentExecutor
  ): AgentBuilder {
    return new AgentBuilder()
      .withName(name)
      .withDescription(description)
      .withExecutor(executor);
  }
}

/**
 * Deployed Agent - Represents an agent that has been deployed to Somnia
 */
export class DeployedAgent {
  private sdk: SomniaAgentSDK;
  private agentId: string;
  private executor?: AgentExecutor;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor(
    sdk: SomniaAgentSDK,
    agentId: string,
    executor?: AgentExecutor
  ) {
    this.sdk = sdk;
    this.agentId = agentId;
    this.executor = executor;
    this.logger = new Logger(`DeployedAgent:${agentId}`);
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.executor?.initialize) {
      this.logger.info('Initializing agent executor...');
      await this.executor.initialize();
    }

    this.isInitialized = true;
    this.logger.info('Agent initialized');
  }

  /**
   * Execute a task with the agent
   */
  async execute(input: any): Promise<ExecutionResult> {
    if (!this.executor) {
      throw new Error('No executor configured for this agent');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    this.logger.info('Executing agent task...');
    const startTime = Date.now();

    try {
      const result = await this.executor.execute(input);
      const executionTime = Date.now() - startTime;

      // Record execution on-chain
      await this.sdk.recordExecution(
        this.agentId,
        result.success,
        executionTime
      );

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record failed execution
      await this.sdk.recordExecution(this.agentId, false, executionTime);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Get agent ID
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get agent details
   */
  async getDetails() {
    return this.sdk.getAgent(this.agentId);
  }

  /**
   * Get agent metrics
   */
  async getMetrics() {
    return this.sdk.getAgentMetrics(this.agentId);
  }

  /**
   * Update agent configuration
   */
  async update(config: Partial<AgentConfig>) {
    await this.sdk.updateAgent(this.agentId, config);
    this.logger.info('Agent updated');
  }

  /**
   * Deactivate the agent
   */
  async deactivate() {
    await this.sdk.deactivateAgent(this.agentId);
    this.logger.info('Agent deactivated');
  }

  /**
   * Activate the agent
   */
  async activate() {
    await this.sdk.activateAgent(this.agentId);
    this.logger.info('Agent activated');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.executor?.cleanup) {
      this.logger.info('Cleaning up agent executor...');
      await this.executor.cleanup();
    }
    this.isInitialized = false;
  }
}


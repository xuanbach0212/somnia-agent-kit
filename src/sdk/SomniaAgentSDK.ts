/**
 * Main SDK for interacting with Somnia AI Agent Framework
 */

import { ethers } from 'ethers';
import { getAgentManagerContract, getAgentRegistryContract } from '../utils/contracts';
import { IPFSManager } from '../utils/ipfs';
import { Logger } from '../utils/logger';
import { Agent, AgentConfig, AgentMetrics, CreateTaskParams, SomniaConfig, Task } from './types';

export class SomniaAgentSDK {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private agentRegistry: ethers.Contract;
  private agentManager: ethers.Contract;
  private ipfsManager: IPFSManager;
  private logger: Logger;
  private config: SomniaConfig;

  constructor(config: SomniaConfig) {
    this.config = config;
    this.logger = new Logger('SomniaAgentSDK');

    // Initialize provider
    const rpcUrl = config.rpcUrl || 'https://dream-rpc.somnia.network';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize signer if private key provided
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }

    // Initialize contracts
    if (!config.agentRegistryAddress || !config.agentManagerAddress) {
      throw new Error('Contract addresses must be provided');
    }

    this.agentRegistry = getAgentRegistryContract(
      config.agentRegistryAddress,
      this.signer || this.provider
    );

    this.agentManager = getAgentManagerContract(
      config.agentManagerAddress,
      this.signer || this.provider
    );

    // Initialize IPFS
    this.ipfsManager = new IPFSManager(config.ipfsConfig);

    this.logger.info('Somnia Agent SDK initialized');
  }

  /**
   * Register a new AI agent on Somnia
   */
  async registerAgent(agentConfig: AgentConfig): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Registering agent: ${agentConfig.name}`);

    // Upload metadata to IPFS
    const metadata = {
      ...agentConfig.metadata,
      version: '1.0.0',
      framework: 'somnia-ai-agent',
    };

    const ipfsHash = await this.ipfsManager.uploadJSON(metadata);
    this.logger.info(`Metadata uploaded to IPFS: ${ipfsHash}`);

    // Register agent on-chain
    const tx = await this.agentRegistry.registerAgent(
      agentConfig.name,
      agentConfig.description,
      ipfsHash,
      agentConfig.capabilities
    );

    const receipt = await tx.wait();
    this.logger.info(`Agent registered, tx: ${receipt.hash}`);

    // Extract agent ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.agentRegistry.interface.parseLog(log);
        return parsed?.name === 'AgentRegistered';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Failed to get agent ID from transaction');
    }

    const parsed = this.agentRegistry.interface.parseLog(event);
    const agentId = parsed?.args[0].toString();

    this.logger.info(`Agent registered with ID: ${agentId}`);
    return agentId;
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<Agent> {
    this.logger.info(`Fetching agent: ${agentId}`);

    const agentData = await this.agentRegistry.getAgent(agentId);
    const capabilities = await this.agentRegistry.getAgentCapabilities(agentId);

    return {
      id: agentId,
      name: agentData[0],
      description: agentData[1],
      ipfsMetadata: agentData[2],
      owner: agentData[3],
      isActive: agentData[4],
      registeredAt: Number(agentData[5]),
      lastUpdated: Number(agentData[5]),
      capabilities: capabilities,
      executionCount: Number(agentData[6]),
    };
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    this.logger.info(`Fetching metrics for agent: ${agentId}`);

    const metrics = await this.agentRegistry.agentMetrics(agentId);

    const totalExecutions = Number(metrics[0]);
    const successfulExecutions = Number(metrics[1]);
    const successRate =
      totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions: Number(metrics[2]),
      averageExecutionTime: Number(metrics[3]),
      lastExecutionTime: Number(metrics[4]),
      successRate,
    };
  }

  /**
   * Update agent information
   */
  async updateAgent(
    agentId: string,
    agentConfig: Partial<AgentConfig>
  ): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Updating agent: ${agentId}`);

    // Get current agent data
    const currentAgent = await this.getAgent(agentId);

    // Upload new metadata if provided
    let ipfsHash = currentAgent.ipfsMetadata;
    if (agentConfig.metadata) {
      ipfsHash = await this.ipfsManager.uploadJSON(agentConfig.metadata);
    }

    const tx = await this.agentRegistry.updateAgent(
      agentId,
      agentConfig.name || currentAgent.name,
      agentConfig.description || currentAgent.description,
      ipfsHash,
      agentConfig.capabilities || currentAgent.capabilities
    );

    await tx.wait();
    this.logger.info(`Agent ${agentId} updated`);
  }

  /**
   * Record agent execution for metrics tracking
   */
  async recordExecution(
    agentId: string,
    success: boolean,
    executionTime: number
  ): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(
      `Recording execution for agent ${agentId}: success=${success}, time=${executionTime}ms`
    );

    const tx = await this.agentRegistry.recordExecution(
      agentId,
      success,
      executionTime
    );

    await tx.wait();
  }

  /**
   * Create a task for an agent
   */
  async createTask(params: CreateTaskParams): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Creating task for agent: ${params.agentId}`);

    // Convert task data to string if it's an object
    let taskData = params.taskData;
    if (typeof taskData === 'object') {
      const ipfsHash = await this.ipfsManager.uploadJSON(taskData);
      taskData = ipfsHash;
    }

    const tx = await this.agentManager.createTask(params.agentId, taskData, {
      value: params.reward,
    });

    const receipt = await tx.wait();
    this.logger.info(`Task created, tx: ${receipt.hash}`);

    // Extract task ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.agentManager.interface.parseLog(log);
        return parsed?.name === 'TaskCreated';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Failed to get task ID from transaction');
    }

    const parsed = this.agentManager.interface.parseLog(event);
    const taskId = parsed?.args[0].toString();

    this.logger.info(`Task created with ID: ${taskId}`);
    return taskId;
  }

  /**
   * Get task details
   */
  async getTask(taskId: string): Promise<Task> {
    this.logger.info(`Fetching task: ${taskId}`);

    const taskData = await this.agentManager.getTask(taskId);

    return {
      taskId,
      agentId: taskData[0].toString(),
      requester: taskData[1],
      taskData: taskData[2],
      reward: taskData[3].toString(),
      status: Number(taskData[4]),
      createdAt: Number(taskData[5]),
      result: taskData[6] || undefined,
    };
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, result: string | object): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Completing task: ${taskId}`);

    // Upload result to IPFS if it's an object
    let resultData = typeof result === 'string' ? result : '';
    if (typeof result === 'object') {
      resultData = await this.ipfsManager.uploadJSON(result);
    }

    const tx = await this.agentManager.completeTask(taskId, resultData);
    await tx.wait();
    this.logger.info(`Task ${taskId} completed`);
  }

  /**
   * Get all agents owned by an address
   */
  async getOwnerAgents(ownerAddress?: string): Promise<string[]> {
    const address = ownerAddress || (await this.signer?.getAddress());
    if (!address) {
      throw new Error('Address required');
    }

    this.logger.info(`Fetching agents for owner: ${address}`);
    const agentIds = await this.agentRegistry.getOwnerAgents(address);
    return agentIds.map((id: bigint) => id.toString());
  }

  /**
   * Get total number of registered agents
   */
  async getTotalAgents(): Promise<number> {
    const total = await this.agentRegistry.getTotalAgents();
    return Number(total);
  }

  /**
   * Deactivate an agent
   */
  async deactivateAgent(agentId: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Deactivating agent: ${agentId}`);
    const tx = await this.agentRegistry.deactivateAgent(agentId);
    await tx.wait();
    this.logger.info(`Agent ${agentId} deactivated`);
  }

  /**
   * Activate an agent
   */
  async activateAgent(agentId: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for this operation');
    }

    this.logger.info(`Activating agent: ${agentId}`);
    const tx = await this.agentRegistry.activateAgent(agentId);
    await tx.wait();
    this.logger.info(`Agent ${agentId} activated`);
  }

  /**
   * Get the current signer address
   */
  async getSignerAddress(): Promise<string | undefined> {
    return this.signer?.getAddress();
  }

  /**
   * Get IPFS metadata for an agent
   */
  async getAgentMetadata(ipfsHash: string): Promise<any> {
    return this.ipfsManager.getJSON(ipfsHash);
  }
}


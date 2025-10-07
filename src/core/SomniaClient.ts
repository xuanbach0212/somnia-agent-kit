/**
 * SomniaClient - Low-level blockchain interaction layer
 * Handles contract calls, transactions, and event subscriptions
 */

import { ethers } from 'ethers';
import {
  getAgentManagerContract,
  getAgentRegistryContract,
} from '../utils/contracts';
import { IPFSManager } from '../utils/ipfs';
import { Logger } from '../utils/logger';
import {
  AgentData,
  AgentMetrics,
  ClientConfig,
  CreateTaskParams,
  EventCallback,
  RegisterAgentParams,
  Subscription,
  TaskData,
  TransactionReceipt,
  TransactionRequest,
  UpdateAgentParams,
} from './types';

export class SomniaClient {
  private provider?: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private agentRegistry?: ethers.Contract;
  private agentManager?: ethers.Contract;
  private ipfsManager: IPFSManager;
  private logger: Logger;
  private config?: ClientConfig;
  private connected: boolean = false;
  private subscriptions: Map<string, Subscription> = new Map();
  private subscriptionCounter: number = 0;

  constructor() {
    this.logger = new Logger('SomniaClient');
    this.ipfsManager = new IPFSManager();
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  async connect(config: ClientConfig): Promise<void> {
    this.config = config;
    this.logger.info('Connecting to Somnia network...');

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Initialize signer if private key provided
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
      const address = await this.signer.getAddress();
      this.logger.info(`Signer connected: ${address}`);
    }

    // Initialize contracts
    this.agentRegistry = getAgentRegistryContract(
      config.contracts.agentRegistry,
      this.signer || this.provider
    );

    this.agentManager = getAgentManagerContract(
      config.contracts.agentManager,
      this.signer || this.provider
    );

    // Initialize IPFS
    if (config.ipfs) {
      this.ipfsManager = new IPFSManager(config.ipfs);
    }

    this.connected = true;
    this.logger.info('Connected to Somnia network');
  }

  disconnect(): void {
    this.logger.info('Disconnecting from Somnia network...');

    // Unsubscribe all event listeners
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();

    this.provider = undefined;
    this.signer = undefined;
    this.agentRegistry = undefined;
    this.agentManager = undefined;
    this.connected = false;

    this.logger.info('Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // ========================================================================
  // Transaction Methods
  // ========================================================================

  async sendTransaction(tx: TransactionRequest): Promise<TransactionReceipt> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required for sending transactions');
    }

    this.logger.info('Sending transaction...');
    const response = await this.signer.sendTransaction(tx);
    const receipt = await response.wait();

    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status || 0,
      logs: receipt.logs,
    };
  }

  async estimateGas(tx: TransactionRequest): Promise<bigint> {
    this.ensureConnected();
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.estimateGas(tx);
  }

  // ========================================================================
  // Event Subscription
  // ========================================================================

  subscribeToEvent(eventName: string, callback: EventCallback): Subscription {
    this.ensureConnected();

    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    this.logger.info(`Subscribing to event: ${eventName} (${subscriptionId})`);

    let contract: ethers.Contract | undefined;
    if (eventName.startsWith('Agent')) {
      contract = this.agentRegistry;
    } else if (eventName.startsWith('Task')) {
      contract = this.agentManager;
    }

    if (!contract) {
      throw new Error(`Unknown event: ${eventName}`);
    }

    // Set up event listener
    contract.on(eventName, callback);

    const subscription: Subscription = {
      id: subscriptionId,
      eventName,
      callback,
      unsubscribe: () => {
        contract?.off(eventName, callback);
        this.subscriptions.delete(subscriptionId);
        this.logger.info(`Unsubscribed from ${eventName} (${subscriptionId})`);
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  unsubscribe(subscription: Subscription): void {
    subscription.unsubscribe();
  }

  // ========================================================================
  // Agent Registry Methods
  // ========================================================================

  async registerAgent(params: RegisterAgentParams): Promise<string> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Registering agent: ${params.name}`);

    // Upload metadata to IPFS
    const ipfsHash =
      params.ipfsMetadata || (await this.ipfsManager.uploadJSON({}));

    // Register on-chain
    const tx = await this.agentRegistry!.registerAgent(
      params.name,
      params.description,
      ipfsHash,
      params.capabilities
    );

    const receipt = await tx.wait();
    this.logger.info(`Agent registered, tx: ${receipt.hash}`);

    // Extract agent ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.agentRegistry!.interface.parseLog(log);
        return parsed?.name === 'AgentRegistered';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Failed to get agent ID from transaction');
    }

    const parsed = this.agentRegistry!.interface.parseLog(event);
    const agentId = parsed?.args[0].toString();

    this.logger.info(`Agent registered with ID: ${agentId}`);
    return agentId;
  }

  async updateAgent(
    agentId: string,
    params: UpdateAgentParams
  ): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Updating agent: ${agentId}`);

    // Get current agent data
    const currentAgent = await this.getAgent(agentId);

    // Upload new metadata if provided
    let ipfsHash = currentAgent.ipfsMetadata;
    if (params.ipfsMetadata) {
      ipfsHash = params.ipfsMetadata;
    }

    const tx = await this.agentRegistry!.updateAgent(
      agentId,
      params.name || currentAgent.name,
      params.description || currentAgent.description,
      ipfsHash,
      params.capabilities || currentAgent.capabilities
    );

    await tx.wait();
    this.logger.info(`Agent ${agentId} updated`);
  }

  async activateAgent(agentId: string): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Activating agent: ${agentId}`);
    const tx = await this.agentRegistry!.activateAgent(agentId);
    await tx.wait();
  }

  async deactivateAgent(agentId: string): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Deactivating agent: ${agentId}`);
    const tx = await this.agentRegistry!.deactivateAgent(agentId);
    await tx.wait();
  }

  async recordExecution(
    agentId: string,
    success: boolean,
    executionTime: number
  ): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(
      `Recording execution for agent ${agentId}: success=${success}, time=${executionTime}ms`
    );

    const tx = await this.agentRegistry!.recordExecution(
      agentId,
      success,
      executionTime
    );
    await tx.wait();
  }

  async getAgent(agentId: string): Promise<AgentData> {
    this.ensureConnected();
    this.logger.info(`Fetching agent: ${agentId}`);

    const agentData = await this.agentRegistry!.getAgent(agentId);
    const capabilities = await this.agentRegistry!.getAgentCapabilities(
      agentId
    );

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

  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    this.ensureConnected();
    this.logger.info(`Fetching metrics for agent: ${agentId}`);

    const metrics = await this.agentRegistry!.agentMetrics(agentId);

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

  async getOwnerAgents(ownerAddress?: string): Promise<string[]> {
    this.ensureConnected();
    const address = ownerAddress || (await this.signer?.getAddress());
    if (!address) {
      throw new Error('Address required');
    }

    this.logger.info(`Fetching agents for owner: ${address}`);
    const agentIds = await this.agentRegistry!.getOwnerAgents(address);
    return agentIds.map((id: bigint) => id.toString());
  }

  async getTotalAgents(): Promise<number> {
    this.ensureConnected();
    const total = await this.agentRegistry!.getTotalAgents();
    return Number(total);
  }

  // ========================================================================
  // Task Manager Methods
  // ========================================================================

  async createTask(params: CreateTaskParams): Promise<string> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Creating task for agent: ${params.agentId}`);

    // Convert task data to string if it's an object
    let taskData = params.taskData;
    if (typeof taskData === 'object') {
      const ipfsHash = await this.ipfsManager.uploadJSON(taskData);
      taskData = ipfsHash;
    }

    const tx = await this.agentManager!.createTask(params.agentId, taskData, {
      value: params.reward,
    });

    const receipt = await tx.wait();
    this.logger.info(`Task created, tx: ${receipt.hash}`);

    // Extract task ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.agentManager!.interface.parseLog(log);
        return parsed?.name === 'TaskCreated';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Failed to get task ID from transaction');
    }

    const parsed = this.agentManager!.interface.parseLog(event);
    const taskId = parsed?.args[0].toString();

    this.logger.info(`Task created with ID: ${taskId}`);
    return taskId;
  }

  async startTask(taskId: string): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Starting task: ${taskId}`);
    const tx = await this.agentManager!.startTask(taskId);
    await tx.wait();
  }

  async completeTask(taskId: string, result: string | object): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Completing task: ${taskId}`);

    // Upload result to IPFS if it's an object
    let resultData = typeof result === 'string' ? result : '';
    if (typeof result === 'object') {
      resultData = await this.ipfsManager.uploadJSON(result);
    }

    const tx = await this.agentManager!.completeTask(taskId, resultData);
    await tx.wait();
    this.logger.info(`Task ${taskId} completed`);
  }

  async failTask(taskId: string): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Failing task: ${taskId}`);
    const tx = await this.agentManager!.failTask(taskId);
    await tx.wait();
  }

  async cancelTask(taskId: string): Promise<void> {
    this.ensureConnected();
    if (!this.signer) {
      throw new Error('Signer required');
    }

    this.logger.info(`Cancelling task: ${taskId}`);
    const tx = await this.agentManager!.cancelTask(taskId);
    await tx.wait();
  }

  async getTask(taskId: string): Promise<TaskData> {
    this.ensureConnected();
    this.logger.info(`Fetching task: ${taskId}`);

    const taskData = await this.agentManager!.getTask(taskId);

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

  async getTotalTasks(): Promise<number> {
    this.ensureConnected();
    const total = await this.agentManager!.getTotalTasks();
    return Number(total);
  }

  // ========================================================================
  // IPFS Methods
  // ========================================================================

  async uploadToIPFS(data: any): Promise<string> {
    return await this.ipfsManager.uploadJSON(data);
  }

  async fetchFromIPFS(hash: string): Promise<any> {
    return await this.ipfsManager.getJSON(hash);
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  async getSignerAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not configured');
    }
    return await this.signer.getAddress();
  }

  async getBalance(address?: string): Promise<bigint> {
    this.ensureConnected();
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const addr = address || (await this.signer?.getAddress());
    if (!addr) {
      throw new Error('Address required');
    }

    return await this.provider.getBalance(addr);
  }

  getProvider(): ethers.JsonRpcProvider | undefined {
    return this.provider;
  }

  getSigner(): ethers.Wallet | undefined {
    return this.signer;
  }

  getIPFSManager(): IPFSManager {
    return this.ipfsManager;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }
  }
}

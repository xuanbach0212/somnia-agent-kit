/**
 * Smart Contract Interactions
 */

import { ethers } from 'ethers';
import { ChainClient } from './chainClient';

// Minimal ABIs for contract interactions
const AGENT_REGISTRY_ABI = [
  'function registerAgent(string name, string description, string ipfsHash, string[] capabilities) returns (uint256)',
  'function getAgent(uint256 agentId) view returns (string name, string description, string ipfsHash, address owner, bool isActive, uint256 registeredAt)',
  'function updateAgent(uint256 agentId, string name, string description, string ipfsHash, string[] capabilities)',
  'function activateAgent(uint256 agentId)',
  'function deactivateAgent(uint256 agentId)',
  'function getOwnerAgents(address owner) view returns (uint256[])',
  'function getTotalAgents() view returns (uint256)',
  'event AgentRegistered(uint256 indexed agentId, address indexed owner, string name, uint256 timestamp)',
  'event AgentUpdated(uint256 indexed agentId, string name, uint256 timestamp)',
];

const AGENT_EXECUTOR_ABI = [
  'function executeTask(uint256 agentId, bytes data) payable returns (bytes)',
  'function recordExecution(uint256 agentId, bool success, uint256 executionTime)',
  'function getAgentMetrics(uint256 agentId) view returns (uint256 totalExecutions, uint256 successfulExecutions, uint256 failedExecutions, uint256 averageTime)',
  'event TaskExecuted(uint256 indexed agentId, address indexed executor, bool success, uint256 timestamp)',
];

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  ipfsHash: string;
  owner: string;
  isActive: boolean;
  registeredAt: number;
}

export interface AgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageTime: number;
  successRate: number;
}

export class ContractManager {
  private chainClient: ChainClient;
  private agentRegistry: ethers.Contract;
  private agentExecutor: ethers.Contract;

  constructor(
    chainClient: ChainClient,
    registryAddress: string,
    executorAddress: string
  ) {
    this.chainClient = chainClient;
    this.agentRegistry = chainClient.getContract(
      registryAddress,
      AGENT_REGISTRY_ABI
    );
    this.agentExecutor = chainClient.getContract(
      executorAddress,
      AGENT_EXECUTOR_ABI
    );
  }

  /**
   * Register a new agent
   */
  async registerAgent(
    name: string,
    description: string,
    ipfsHash: string,
    capabilities: string[]
  ): Promise<string> {
    const tx = await this.agentRegistry.registerAgent(
      name,
      description,
      ipfsHash,
      capabilities
    );
    const receipt = await tx.wait();

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
      throw new Error('Failed to extract agent ID from transaction');
    }

    const parsed = this.agentRegistry.interface.parseLog(event);
    return parsed?.args[0].toString();
  }

  /**
   * Get agent information
   */
  async getAgent(agentId: string): Promise<AgentInfo> {
    const result = await this.agentRegistry.getAgent(agentId);
    return {
      id: agentId,
      name: result[0],
      description: result[1],
      ipfsHash: result[2],
      owner: result[3],
      isActive: result[4],
      registeredAt: Number(result[5]),
    };
  }

  /**
   * Update agent information
   */
  async updateAgent(
    agentId: string,
    name: string,
    description: string,
    ipfsHash: string,
    capabilities: string[]
  ): Promise<void> {
    const tx = await this.agentRegistry.updateAgent(
      agentId,
      name,
      description,
      ipfsHash,
      capabilities
    );
    await tx.wait();
  }

  /**
   * Activate agent
   */
  async activateAgent(agentId: string): Promise<void> {
    const tx = await this.agentRegistry.activateAgent(agentId);
    await tx.wait();
  }

  /**
   * Deactivate agent
   */
  async deactivateAgent(agentId: string): Promise<void> {
    const tx = await this.agentRegistry.deactivateAgent(agentId);
    await tx.wait();
  }

  /**
   * Get all agents owned by an address
   */
  async getOwnerAgents(owner: string): Promise<string[]> {
    const agentIds = await this.agentRegistry.getOwnerAgents(owner);
    return agentIds.map((id: bigint) => id.toString());
  }

  /**
   * Get total number of agents
   */
  async getTotalAgents(): Promise<number> {
    const total = await this.agentRegistry.getTotalAgents();
    return Number(total);
  }

  /**
   * Execute a task
   */
  async executeTask(
    agentId: string,
    data: string,
    value: bigint = 0n
  ): Promise<string> {
    const tx = await this.agentExecutor.executeTask(agentId, data, {
      value,
    });
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Record execution metrics
   */
  async recordExecution(
    agentId: string,
    success: boolean,
    executionTime: number
  ): Promise<void> {
    const tx = await this.agentExecutor.recordExecution(
      agentId,
      success,
      executionTime
    );
    await tx.wait();
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    const result = await this.agentExecutor.getAgentMetrics(agentId);
    const totalExecutions = Number(result[0]);
    const successfulExecutions = Number(result[1]);
    const successRate =
      totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions: Number(result[2]),
      averageTime: Number(result[3]),
      successRate,
    };
  }

  /**
   * Subscribe to agent events
   */
  onAgentRegistered(callback: (agentId: string, owner: string, name: string) => void): void {
    this.agentRegistry.on('AgentRegistered', callback);
  }

  /**
   * Subscribe to task execution events
   */
  onTaskExecuted(callback: (agentId: string, executor: string, success: boolean) => void): void {
    this.agentExecutor.on('TaskExecuted', callback);
  }
}

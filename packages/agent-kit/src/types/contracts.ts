/**
 * Contract Type Definitions
 * Minimal type-safe interfaces for smart contracts
 * Alternative to generated typechain types
 */

import { ethers } from 'ethers';

/**
 * AgentRegistry contract interface
 * Extends ethers.Contract with typed methods
 */
export interface IAgentRegistry {
  registerAgent(
    name: string,
    description: string,
    ipfsMetadata: string,
    capabilities: string[]
  ): Promise<ethers.ContractTransactionResponse>;

  deactivateAgent(agentId: bigint): Promise<ethers.ContractTransactionResponse>;

  getAgent(agentId: bigint): Promise<{
    name: string;
    description: string;
    owner: string;
    isActive: boolean;
    ipfsMetadata: string;
    registeredAt: bigint;
  }>;

  getAgentCapabilities(agentId: bigint): Promise<string[]>;

  getTotalAgents(): Promise<bigint>;

  interface: ethers.Interface;
  connect(signer: ethers.Signer): IAgentRegistry;

  // Allow any other Contract methods
  [key: string]: any;
}

/**
 * AgentManager contract interface
 */
export interface IAgentManager {
  createTask(
    agentId: bigint,
    taskData: string,
    options?: { value?: bigint }
  ): Promise<ethers.ContractTransactionResponse>;

  getTask(taskId: bigint): Promise<{
    agentId: bigint;
    status: number;
    taskData: string;
    result: string;
  }>;

  interface: ethers.Interface;
  connect(signer: ethers.Signer): IAgentManager;

  [key: string]: any;
}

/**
 * AgentExecutor contract interface
 */
export interface IAgentExecutor {
  executeTask(
    taskId: bigint,
    result: string
  ): Promise<ethers.ContractTransactionResponse>;

  interface: ethers.Interface;
  connect(signer: ethers.Signer): IAgentExecutor;

  [key: string]: any;
}

/**
 * AgentVault contract interface
 */
export interface IAgentVault {
  deposit(agentId: bigint): Promise<ethers.ContractTransactionResponse>;

  withdraw(
    agentId: bigint,
    amount: bigint
  ): Promise<ethers.ContractTransactionResponse>;

  getBalance(agentId: bigint): Promise<bigint>;

  interface: ethers.Interface;
  connect(signer: ethers.Signer): IAgentVault;

  [key: string]: any;
}

/**
 * Type guard to cast ethers.Contract to specific interface
 */
export function asAgentRegistry(contract: ethers.Contract): IAgentRegistry {
  return contract as unknown as IAgentRegistry;
}

export function asAgentManager(contract: ethers.Contract): IAgentManager {
  return contract as unknown as IAgentManager;
}

export function asAgentExecutor(contract: ethers.Contract): IAgentExecutor {
  return contract as unknown as IAgentExecutor;
}

export function asAgentVault(contract: ethers.Contract): IAgentVault {
  return contract as unknown as IAgentVault;
}

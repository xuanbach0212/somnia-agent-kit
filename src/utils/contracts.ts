/**
 * Contract utilities for interacting with Somnia smart contracts
 */

import { ethers } from 'ethers';

// Agent Registry ABI
export const AGENT_REGISTRY_ABI = [
  'event AgentRegistered(uint256 indexed agentId, address indexed owner, string name, uint256 timestamp)',
  'event AgentUpdated(uint256 indexed agentId, string name, uint256 timestamp)',
  'event AgentDeactivated(uint256 indexed agentId, uint256 timestamp)',
  'event AgentActivated(uint256 indexed agentId, uint256 timestamp)',
  'event AgentExecuted(uint256 indexed agentId, bool success, uint256 executionTime, uint256 timestamp)',
  'function registerAgent(string memory _name, string memory _description, string memory _ipfsMetadata, string[] memory _capabilities) external returns (uint256)',
  'function updateAgent(uint256 _agentId, string memory _name, string memory _description, string memory _ipfsMetadata, string[] memory _capabilities) external',
  'function recordExecution(uint256 _agentId, bool _success, uint256 _executionTime) external',
  'function deactivateAgent(uint256 _agentId) external',
  'function activateAgent(uint256 _agentId) external',
  'function getOwnerAgents(address _owner) external view returns (uint256[] memory)',
  'function getAgentCapabilities(uint256 _agentId) external view returns (string[] memory)',
  'function getAgent(uint256 _agentId) external view returns (string memory name, string memory description, string memory ipfsMetadata, address owner, bool isActive, uint256 registeredAt, uint256 executionCount)',
  'function getTotalAgents() external view returns (uint256)',
  'function agentMetrics(uint256) external view returns (uint256 totalExecutions, uint256 successfulExecutions, uint256 failedExecutions, uint256 averageExecutionTime, uint256 lastExecutionTime)',
];

// Agent Manager ABI
export const AGENT_MANAGER_ABI = [
  'event TaskCreated(uint256 indexed taskId, uint256 indexed agentId, address indexed requester, uint256 reward, uint256 timestamp)',
  'event TaskStarted(uint256 indexed taskId, uint256 timestamp)',
  'event TaskCompleted(uint256 indexed taskId, string result, uint256 timestamp)',
  'event TaskFailed(uint256 indexed taskId, uint256 timestamp)',
  'event TaskCancelled(uint256 indexed taskId, uint256 timestamp)',
  'function createTask(uint256 _agentId, string memory _taskData) external payable returns (uint256)',
  'function startTask(uint256 _taskId) external',
  'function completeTask(uint256 _taskId, string memory _result) external',
  'function failTask(uint256 _taskId) external',
  'function cancelTask(uint256 _taskId) external',
  'function getTask(uint256 _taskId) external view returns (uint256 agentId, address requester, string memory taskData, uint256 reward, uint8 status, uint256 createdAt, string memory result)',
  'function getTotalTasks() external view returns (uint256)',
];

/**
 * Get Agent Registry contract instance
 */
export function getAgentRegistryContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.Provider
): ethers.Contract {
  return new ethers.Contract(address, AGENT_REGISTRY_ABI, signerOrProvider);
}

/**
 * Get Agent Manager contract instance
 */
export function getAgentManagerContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.Provider
): ethers.Contract {
  return new ethers.Contract(address, AGENT_MANAGER_ABI, signerOrProvider);
}

/**
 * Parse contract events
 */
export function parseContractEvent(
  contract: ethers.Contract,
  log: ethers.Log
): ethers.LogDescription | null {
  try {
    return contract.interface.parseLog(log);
  } catch {
    return null;
  }
}

/**
 * Wait for transaction with retries
 */
export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.ContractTransactionReceipt | null> {
  return tx.wait(confirmations);
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  ...args: any[]
): Promise<bigint> {
  return contract[method].estimateGas(...args);
}


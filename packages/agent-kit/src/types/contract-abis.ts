/**
 * Contract ABIs
 * Extracted from contract artifacts for type-safe contract interactions
 *
 * @packageDocumentation
 */

// Note: ABIs are loaded dynamically from contract artifacts
// This file exports ABI references that can be used with ethers.Contract

/**
 * Contract ABI type
 */
export type ContractABI = readonly any[];

/**
 * Get contract ABI by name
 * ABIs are loaded from contract artifacts at runtime
 */
export function getContractABI(contractName: string): ContractABI {
  // ABIs will be imported from artifacts or defined inline
  // For now, return empty array and will be populated by contract loader
  return [];
}

/**
 * Contract names
 */
export const CONTRACT_NAMES = {
  AGENT_REGISTRY: 'AgentRegistry',
  AGENT_MANAGER: 'AgentManager',
  AGENT_EXECUTOR: 'AgentExecutor',
  AGENT_VAULT: 'AgentVault',
} as const;

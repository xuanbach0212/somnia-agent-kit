/**
 * Configuration Validation
 * Validates configuration objects before use
 */

import type { AgentKitConfig, SDKConfig, RuntimeConfig } from '../types/config';

/**
 * Validate agent kit configuration
 *
 * @param config Configuration to validate
 * @throws Error if configuration is invalid
 *
 * @example
 * ```typescript
 * try {
 *   validateAgentConfig(config);
 *   console.log('Config is valid');
 * } catch (error) {
 *   console.error('Invalid config:', error.message);
 * }
 * ```
 */
export function validateAgentConfig(config: AgentKitConfig): void {
  // Validate network
  if (!config.network?.rpcUrl) {
    throw new Error('Network RPC URL is required');
  }

  if (!isValidUrl(config.network.rpcUrl)) {
    throw new Error(`Invalid RPC URL: ${config.network.rpcUrl}`);
  }

  if (!config.network.chainId || config.network.chainId < 1) {
    throw new Error('Valid chain ID is required');
  }

  // Validate contracts
  if (!config.contracts?.agentRegistry) {
    throw new Error('AgentRegistry contract address is required');
  }

  if (!config.contracts?.agentExecutor) {
    throw new Error('AgentExecutor contract address is required');
  }

  // Validate contract addresses format
  if (!isValidAddress(config.contracts.agentRegistry)) {
    throw new Error(
      `Invalid AgentRegistry address: ${config.contracts.agentRegistry}`
    );
  }

  if (!isValidAddress(config.contracts.agentExecutor)) {
    throw new Error(
      `Invalid AgentExecutor address: ${config.contracts.agentExecutor}`
    );
  }

  // Validate optional contract addresses
  if (config.contracts.agentManager && !isValidAddress(config.contracts.agentManager)) {
    throw new Error(
      `Invalid AgentManager address: ${config.contracts.agentManager}`
    );
  }

  if (config.contracts.agentVault && !isValidAddress(config.contracts.agentVault)) {
    throw new Error(`Invalid AgentVault address: ${config.contracts.agentVault}`);
  }

  // Validate private key if provided
  if (config.privateKey && !isValidPrivateKey(config.privateKey)) {
    throw new Error('Invalid private key format');
  }
}

/**
 * Validate SDK configuration
 *
 * @param config SDK configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateSDKConfig(config: SDKConfig): void {
  if (config.defaultTimeout !== undefined && config.defaultTimeout < 0) {
    throw new Error('defaultTimeout must be positive');
  }

  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    throw new Error('maxRetries must be positive');
  }

  if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    throw new Error(
      `Invalid log level: ${config.logLevel}. Must be debug, info, warn, or error`
    );
  }

  if (
    config.llmProvider &&
    !['openai', 'anthropic', 'ollama', 'custom'].includes(config.llmProvider)
  ) {
    throw new Error(
      `Invalid LLM provider: ${config.llmProvider}. Must be openai, anthropic, ollama, or custom`
    );
  }
}

/**
 * Validate runtime configuration
 *
 * @param config Runtime configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateRuntimeConfig(config: RuntimeConfig): void {
  if (config.maxConcurrent !== undefined && config.maxConcurrent < 1) {
    throw new Error('maxConcurrent must be at least 1');
  }

  if (config.memoryLimit !== undefined && config.memoryLimit < 0) {
    throw new Error('memoryLimit must be positive');
  }

  if (
    config.storageBackend &&
    !['memory', 'file'].includes(config.storageBackend)
  ) {
    throw new Error(
      `Invalid storage backend: ${config.storageBackend}. Must be memory or file`
    );
  }

  if (config.memoryBackend && !['memory', 'file'].includes(config.memoryBackend)) {
    throw new Error(
      `Invalid memory backend: ${config.memoryBackend}. Must be memory or file`
    );
  }

  if (config.storageBackend === 'file' && !config.storagePath) {
    throw new Error('storagePath is required when storageBackend is file');
  }

  if (config.memoryBackend === 'file' && !config.memoryPath) {
    throw new Error('memoryPath is required when memoryBackend is file');
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if address is valid Ethereum address
 *
 * @param address Address to check
 * @returns true if address is valid
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if private key is valid
 *
 * @param key Private key to check
 * @returns true if private key is valid
 */
function isValidPrivateKey(key: string): boolean {
  // Remove 0x prefix if present
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
}

/**
 * Check if URL is valid
 *
 * @param url URL to check
 * @returns true if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Legacy alias for backward compatibility
/** @deprecated Use validateAgentConfig instead */
export const validateConfig = validateAgentConfig;

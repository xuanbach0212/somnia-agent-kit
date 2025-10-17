/**
 * Blockchain Layer Types
 * Types for blockchain interactions, transactions, events, and chain state
 */

import type { Address, Hash, Timestamp } from './common';

// =============================================================================
// Chain Configuration
// =============================================================================

/**
 * Chain configuration (simplified alternative to NetworkConfig + ContractAddresses)
 */
export interface ChainConfig {
  /** RPC endpoint URL */
  rpcUrl: string;

  /** Chain ID */
  chainId: number;

  /** Network type */
  network: 'testnet' | 'mainnet' | 'local' | 'devnet';

  /** Optional human-readable name */
  name?: string;

  /** Contract addresses (flat mapping) */
  contracts?: Record<string, Address>;

  /** Optional block explorer URL */
  blockExplorer?: string;
}

// =============================================================================
// Transaction Types
// =============================================================================

/**
 * Transaction information (simplified version of ethers.TransactionReceipt)
 */
export interface Transaction {
  /** Transaction hash */
  hash: Hash;

  /** Sender address */
  from: Address;

  /** Recipient address (null for contract creation) */
  to?: Address;

  /** Transaction value in wei */
  value?: bigint;

  /** Transaction data (contract call) */
  data?: string;

  /** Gas used by transaction */
  gasUsed?: bigint;

  /** Gas price in wei */
  gasPrice?: bigint;

  /** Block number */
  blockNumber?: number;

  /** Block hash */
  blockHash?: Hash;

  /** Transaction timestamp */
  timestamp?: Timestamp;

  /** Transaction status */
  status?: 'pending' | 'success' | 'failed';

  /** Number of confirmations */
  confirmations?: number;

  /** Nonce */
  nonce?: number;
}

/**
 * Transaction request for creating transactions
 */
export interface TransactionRequest {
  /** Recipient address */
  to?: Address;

  /** Sender address */
  from?: Address;

  /** Transaction value in wei */
  value?: bigint;

  /** Transaction data */
  data?: string;

  /** Gas limit */
  gasLimit?: bigint;

  /** Legacy gas price */
  gasPrice?: bigint;

  /** EIP-1559 max fee per gas */
  maxFeePerGas?: bigint;

  /** EIP-1559 max priority fee per gas */
  maxPriorityFeePerGas?: bigint;

  /** Transaction nonce */
  nonce?: number;

  /** Chain ID */
  chainId?: number;
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Blockchain event (on-chain event from smart contract)
 */
export interface ChainEvent {
  /** Event name */
  name: string;

  /** Contract address that emitted the event */
  contract: Address;

  /** Event arguments */
  args: Record<string, any>;

  /** Transaction hash */
  txHash?: Hash;

  /** Block number */
  blockNumber?: number;

  /** Block hash */
  blockHash?: Hash;

  /** Event timestamp */
  timestamp?: Timestamp;

  /** Log index in block */
  logIndex?: number;

  /** Transaction index in block */
  transactionIndex?: number;
}

// =============================================================================
// Block Types
// =============================================================================

/**
 * Block information
 */
export interface Block {
  /** Block number */
  number: number;

  /** Block hash */
  hash: Hash;

  /** Parent block hash */
  parentHash: Hash;

  /** Block timestamp */
  timestamp: Timestamp;

  /** Total gas used in block */
  gasUsed: bigint;

  /** Gas limit for block */
  gasLimit: bigint;

  /** Transaction hashes in block */
  transactions: Hash[];

  /** Block miner address */
  miner?: Address;

  /** Extra data */
  extraData?: string;

  /** Difficulty (PoW) */
  difficulty?: bigint;

  /** Base fee per gas (EIP-1559) */
  baseFeePerGas?: bigint;
}

// =============================================================================
// Gas Types
// =============================================================================

/**
 * Gas estimation result
 */
export interface GasEstimate {
  /** Estimated gas limit */
  gasLimit: bigint;

  /** Legacy gas price (in wei) */
  gasPrice?: bigint;

  /** EIP-1559 max fee per gas (in wei) */
  maxFeePerGas?: bigint;

  /** EIP-1559 max priority fee per gas (in wei) */
  maxPriorityFeePerGas?: bigint;

  /** Estimated total cost in wei */
  estimatedCost: bigint;
}

/**
 * Gas pricing information
 */
export interface GasPricing {
  /** Legacy gas price */
  gasPrice?: bigint;

  /** EIP-1559 max fee per gas */
  maxFeePerGas?: bigint;

  /** EIP-1559 max priority fee per gas */
  maxPriorityFeePerGas?: bigint;

  /** Base fee per gas (from latest block) */
  baseFeePerGas?: bigint;
}

// =============================================================================
// Chain State
// =============================================================================

/**
 * Current blockchain state snapshot
 */
export interface ChainState {
  /** Current block number */
  blockNumber: number;

  /** Current block timestamp */
  blockTimestamp: Timestamp;

  /** Current gas price */
  gasPrice: bigint;

  /** Chain ID */
  chainId: number;

  /** Network name */
  networkName: string;

  /** Last updated timestamp */
  lastUpdated?: Timestamp;
}

// =============================================================================
// Contract Interaction Types
// =============================================================================

/**
 * Contract call parameters
 */
export interface ContractCall {
  /** Contract address */
  contract: Address;

  /** Method name */
  method: string;

  /** Method arguments */
  args: any[];

  /** Transaction value (for payable methods) */
  value?: bigint;

  /** Gas limit */
  gasLimit?: bigint;

  /** Sender address */
  from?: Address;
}

/**
 * Contract call result
 */
export interface ContractCallResult<T = any> {
  /** Call succeeded */
  success: boolean;

  /** Return data */
  data?: T;

  /** Error message (if failed) */
  error?: string;

  /** Gas used */
  gasUsed?: bigint;

  /** Transaction hash (for state-changing calls) */
  txHash?: Hash;

  /** Block number (for state-changing calls) */
  blockNumber?: number;
}

/**
 * Contract deployment parameters
 */
export interface ContractDeployment {
  /** Contract bytecode */
  bytecode: string;

  /** Constructor arguments */
  args: any[];

  /** Deployment value */
  value?: bigint;

  /** Gas limit */
  gasLimit?: bigint;

  /** Sender address */
  from?: Address;
}

/**
 * Contract deployment result
 */
export interface ContractDeploymentResult {
  /** Deployment succeeded */
  success: boolean;

  /** Deployed contract address */
  address?: Address;

  /** Deployment transaction hash */
  txHash?: Hash;

  /** Error message (if failed) */
  error?: string;

  /** Gas used */
  gasUsed?: bigint;

  /** Block number */
  blockNumber?: number;
}

// =============================================================================
// Network Types
// =============================================================================

/**
 * Network information
 */
export interface NetworkInfo {
  /** Chain ID */
  chainId: number;

  /** Network name */
  name: string;

  /** Ensemble contract address (if available) */
  ensAddress?: Address;
}

/**
 * Peer information (for network diagnostics)
 */
export interface PeerInfo {
  /** Peer ID */
  id: string;

  /** Peer address */
  address: string;

  /** Connection protocol */
  protocols: string[];

  /** Peer version */
  version?: string;
}

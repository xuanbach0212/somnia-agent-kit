/**
 * Contract Deployer
 *
 * Utilities for deploying smart contracts to Somnia blockchain.
 * Supports deployment from compiled bytecode and ABI.
 *
 * @example
 * ```typescript
 * const deployer = new ContractDeployer(chainClient);
 *
 * // Deploy a contract
 * const result = await deployer.deployContract({
 *   abi: MyContract_ABI,
 *   bytecode: MyContract_BYTECODE,
 *   constructorArgs: ['arg1', 'arg2'],
 * });
 *
 * console.log('Deployed at:', result.address);
 * ```
 */

import { ContractFactory, ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Contract deployment parameters
 */
export interface DeployContractParams {
  /** Contract ABI */
  abi: any[];
  /** Contract bytecode (with 0x prefix) */
  bytecode: string;
  /** Constructor arguments (optional) */
  constructorArgs?: any[];
  /** Gas limit (optional) */
  gasLimit?: bigint;
  /** Value to send with deployment (optional) */
  value?: bigint;
}

/**
 * Deployment result
 */
export interface DeploymentResult {
  /** Deployed contract address */
  address: string;
  /** Transaction hash */
  txHash: string;
  /** Transaction receipt */
  receipt: ethers.TransactionReceipt;
  /** Contract instance */
  contract: any;
  /** Block number */
  blockNumber: number;
  /** Gas used */
  gasUsed: bigint;
}

/**
 * CREATE2 deployment parameters
 */
export interface Create2DeployParams {
  /** Factory contract address */
  factoryAddress: string;
  /** Salt for deterministic address */
  salt: string;
  /** Init code (bytecode + constructor args) */
  initCode: string;
  /** Gas limit (optional) */
  gasLimit?: bigint;
}

// =============================================================================
// ContractDeployer Class
// =============================================================================

/**
 * Contract Deployer
 *
 * Provides utilities for deploying smart contracts to Somnia.
 */
export class ContractDeployer {
  private chainClient: ChainClient;

  /**
   * Create a new ContractDeployer instance
   *
   * @param chainClient - ChainClient instance for blockchain interaction
   *
   * @example
   * ```typescript
   * const deployer = new ContractDeployer(chainClient);
   * ```
   */
  constructor(chainClient: ChainClient) {
    this.chainClient = chainClient;
  }

  /**
   * Deploy a smart contract
   *
   * @param params - Deployment parameters
   * @returns Deployment result
   *
   * @example
   * ```typescript
   * const result = await deployer.deployContract({
   *   abi: ERC20_ABI,
   *   bytecode: ERC20_BYTECODE,
   *   constructorArgs: ['My Token', 'MTK', 18, ethers.parseEther('1000000')],
   * });
   *
   * console.log('Token deployed at:', result.address);
   * ```
   */
  async deployContract(params: DeployContractParams): Promise<DeploymentResult> {
    const { abi, bytecode, constructorArgs = [], gasLimit, value } = params;

    // Validate bytecode
    if (!bytecode || bytecode.length < 3) {
      throw new Error('Invalid bytecode');
    }

    // Ensure bytecode starts with 0x
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

    // Create contract factory
    const signer = this.chainClient.getSigner();
    const factory = new ContractFactory(abi, cleanBytecode, signer);

    // Deploy contract
    const deployTx: any = {
      gasLimit,
      value,
    };

    const contract = await factory.deploy(...constructorArgs, deployTx);

    // Wait for deployment
    await contract.waitForDeployment();

    // Get deployment transaction receipt
    const deployTxHash = contract.deploymentTransaction()?.hash;
    if (!deployTxHash) {
      throw new Error('Deployment transaction hash not found');
    }

    const receipt = await this.chainClient
      .getProvider()
      .getTransactionReceipt(deployTxHash);

    if (!receipt) {
      throw new Error('Deployment transaction receipt not found');
    }

    const address = await contract.getAddress();

    return {
      address,
      txHash: deployTxHash,
      receipt,
      contract,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }

  /**
   * Estimate gas for contract deployment
   *
   * @param params - Deployment parameters
   * @returns Estimated gas limit
   *
   * @example
   * ```typescript
   * const gasEstimate = await deployer.estimateDeploymentCost({
   *   abi: ERC20_ABI,
   *   bytecode: ERC20_BYTECODE,
   *   constructorArgs: ['My Token', 'MTK'],
   * });
   *
   * console.log('Estimated gas:', gasEstimate);
   * ```
   */
  async estimateDeploymentCost(params: DeployContractParams): Promise<bigint> {
    const { abi, bytecode, constructorArgs = [] } = params;

    const cleanBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

    const signer = this.chainClient.getSigner();
    const factory = new ContractFactory(abi, cleanBytecode, signer);

    // Get deployment transaction
    const deployTx = await factory.getDeployTransaction(...constructorArgs);

    // Estimate gas
    return await this.chainClient.getProvider().estimateGas(deployTx);
  }

  /**
   * Deploy contract using CREATE2 for deterministic addresses
   *
   * Note: Requires a CREATE2 factory contract to be deployed.
   *
   * @param params - CREATE2 deployment parameters
   * @returns Deployed contract address
   *
   * @example
   * ```typescript
   * const address = await deployer.deployWithCreate2({
   *   factoryAddress: '0x...',
   *   salt: '0x...',
   *   initCode: '0x...',
   * });
   * ```
   */
  async deployWithCreate2(params: Create2DeployParams): Promise<string> {
    const { factoryAddress, salt, initCode, gasLimit } = params;

    // CREATE2 factory ABI (simplified)
    const factoryABI = [
      'function deploy(bytes32 salt, bytes memory bytecode) returns (address)',
    ];

    const factory = this.chainClient.getContract(factoryAddress, factoryABI);

    // Deploy using CREATE2
    const tx = await factory.deploy(salt, initCode, { gasLimit });
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('CREATE2 deployment failed');
    }

    // Extract deployed address from logs
    // This assumes the factory emits an event with the deployed address
    // You may need to adjust this based on your factory implementation
    const deployedAddress = receipt.logs[0]?.address || '';

    if (!deployedAddress) {
      throw new Error('Could not extract deployed address from receipt');
    }

    return deployedAddress;
  }

  /**
   * Predict CREATE2 address
   *
   * @param factoryAddress - Factory contract address
   * @param salt - Salt for deployment
   * @param initCodeHash - Keccak256 hash of init code
   * @returns Predicted contract address
   *
   * @example
   * ```typescript
   * const predictedAddress = ContractDeployer.predictCreate2Address(
   *   factoryAddress,
   *   salt,
   *   ethers.keccak256(initCode)
   * );
   * ```
   */
  static predictCreate2Address(
    factoryAddress: string,
    salt: string,
    initCodeHash: string
  ): string {
    const packed = ethers.solidityPacked(
      ['bytes1', 'address', 'bytes32', 'bytes32'],
      ['0xff', factoryAddress, salt, initCodeHash]
    );

    const hash = ethers.keccak256(packed);
    return ethers.getAddress('0x' + hash.slice(-40));
  }

  /**
   * Verify contract code at an address
   *
   * @param address - Contract address
   * @returns true if contract exists at address
   *
   * @example
   * ```typescript
   * const exists = await deployer.verifyContractExists(contractAddress);
   * ```
   */
  async verifyContractExists(address: string): Promise<boolean> {
    const code = await this.chainClient.getProvider().getCode(address);
    return code !== '0x' && code !== '0x0';
  }

  /**
   * Get contract bytecode at an address
   *
   * @param address - Contract address
   * @returns Contract bytecode
   *
   * @example
   * ```typescript
   * const bytecode = await deployer.getContractBytecode(contractAddress);
   * ```
   */
  async getContractBytecode(address: string): Promise<string> {
    return await this.chainClient.getProvider().getCode(address);
  }

  /**
   * Wait for contract deployment transaction
   *
   * @param txHash - Transaction hash
   * @param confirmations - Number of confirmations to wait for
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * const receipt = await deployer.waitForDeployment(txHash, 3);
   * ```
   */
  async waitForDeployment(
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    return await this.chainClient.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get deployment transaction details
   *
   * @param txHash - Transaction hash
   * @returns Transaction details
   */
  async getDeploymentTransaction(
    txHash: string
  ): Promise<ethers.TransactionResponse | null> {
    return await this.chainClient.getTransaction(txHash);
  }

  /**
   * Calculate deployment cost
   *
   * @param gasUsed - Gas used for deployment
   * @param gasPrice - Gas price (optional, fetches current if not provided)
   * @returns Deployment cost in wei
   *
   * @example
   * ```typescript
   * const cost = await deployer.calculateDeploymentCost(result.gasUsed);
   * console.log('Deployment cost:', ethers.formatEther(cost), 'STT');
   * ```
   */
  async calculateDeploymentCost(gasUsed: bigint, gasPrice?: bigint): Promise<bigint> {
    if (!gasPrice) {
      const feeData = await this.chainClient.getProvider().getFeeData();
      gasPrice = feeData.gasPrice || 0n;
    }

    return gasUsed * gasPrice;
  }

  /**
   * Deploy and verify contract in one step
   *
   * @param params - Deployment parameters
   * @param waitConfirmations - Number of confirmations to wait
   * @returns Deployment result
   *
   * @example
   * ```typescript
   * const result = await deployer.deployAndVerify(
   *   {
   *     abi: MyContract_ABI,
   *     bytecode: MyContract_BYTECODE,
   *     constructorArgs: ['arg1', 'arg2'],
   *   },
   *   3
   * );
   * ```
   */
  async deployAndVerify(
    params: DeployContractParams,
    waitConfirmations: number = 1
  ): Promise<DeploymentResult> {
    const result = await this.deployContract(params);

    // Wait for additional confirmations
    if (waitConfirmations > 1) {
      await this.waitForDeployment(result.txHash, waitConfirmations);
    }

    // Verify contract exists
    const exists = await this.verifyContractExists(result.address);
    if (!exists) {
      throw new Error('Contract deployment verification failed');
    }

    return result;
  }
}

// =============================================================================
// Exports
// =============================================================================

export { ContractDeployer as default };

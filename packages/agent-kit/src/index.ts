/**
 * Somnia Agent Kit - Main SDK Entry Point
 * @packageDocumentation
 */

import { ethers } from 'ethers';
import { ChainClient } from './core/chainClient';
import { AgentKitConfig, loadConfig } from './core/config';
import { SomniaContracts } from './core/contracts';
import { MultiCall } from './core/multicall';
import { SignerManager } from './core/signerManager';
import {
  ContractDeployer,
  ContractVerifier,
  type ContractVerifierConfig,
} from './deployment';
import { WebSocketClient, type WebSocketConfig } from './events';
import { DeepSeekAdapter, OllamaAdapter, OpenAIAdapter } from './llm/adapters';
import {
  Logger,
  LogLevel,
  Metrics,
  type LoggerConfig,
  type MetricsConfig,
} from './monitor';
import { Agent } from './runtime';
import { IPFSManager, type IPFSManagerConfig } from './storage';
import { ERC20Manager, ERC721Manager, NativeTokenManager } from './tokens';
import { MetaMaskConnector } from './wallets';

/**
 * Main SDK class for Somnia Agent Kit
 */
export class SomniaAgentKit {
  private config: AgentKitConfig;
  private initialized: boolean = false;
  private chainClient: ChainClient;
  private _contracts: SomniaContracts | null = null;

  // Cached module instances
  private _multiCall: MultiCall | null = null;
  private _erc20Manager: ERC20Manager | null = null;
  private _erc721Manager: ERC721Manager | null = null;
  private _nativeTokenManager: NativeTokenManager | null = null;
  private _ipfsManager: IPFSManager | null = null;
  private _webSocketClient: WebSocketClient | null = null;
  private _contractDeployer: ContractDeployer | null = null;
  private _contractVerifier: ContractVerifier | null = null;
  private _metaMaskConnector: MetaMaskConnector | null = null;

  // LLM, Monitoring, Runtime instances
  private _llm: OpenAIAdapter | OllamaAdapter | DeepSeekAdapter | null = null;
  private _logger: Logger | null = null;
  private _metrics: Metrics | null = null;
  private _agent: Agent | null = null;

  /**
   * Create a new SomniaAgentKit instance
   * @param userConfig - Configuration for the agent kit (will be merged with env vars and defaults)
   *
   * @example
   * // Create with manual config
   * const kit = new SomniaAgentKit({
   *   network: SOMNIA_NETWORKS.testnet,
   *   contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
   *   privateKey: '0x...'
   * });
   *
   * @example
   * // Create with partial config (merged with env vars)
   * const kit = new SomniaAgentKit({
   *   network: SOMNIA_NETWORKS.testnet,
   *   contracts: { agentRegistry: '0x...', agentExecutor: '0x...' }
   * });
   */
  constructor(userConfig?: Partial<AgentKitConfig>) {
    // Load and merge config from defaults, env, and user input
    this.config = loadConfig(userConfig);

    // Create ChainClient (includes provider and signer management)
    this.chainClient = new ChainClient(this.config);
  }

  /**
   * Initialize the agent kit
   * Connects to the network and initializes contracts
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Connect to network and validate chain ID
    await this.chainClient.connect();

    // Initialize contracts using ChainClient
    this._contracts = SomniaContracts.fromChainClient(
      this.chainClient,
      this.config.contracts
    );

    await this._contracts.initialize();

    this.initialized = true;
  }

  /**
   * Check if the kit is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get contracts instance
   */
  get contracts(): SomniaContracts {
    if (!this._contracts) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return this._contracts;
  }

  /**
   * Get ChainClient instance
   * Provides access to full blockchain interaction API
   */
  getChainClient(): ChainClient {
    return this.chainClient;
  }

  /**
   * Get SignerManager instance
   * Provides access to transaction signing and sending
   */
  getSignerManager(): SignerManager {
    return this.chainClient.getSignerManager();
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.Provider {
    return this.chainClient.getProvider();
  }

  /**
   * Get signer instance (if available)
   */
  getSigner(): ethers.Signer | ethers.Wallet | null {
    const signerManager = this.chainClient.getSignerManager();
    return signerManager.hasSigner() ? signerManager.getSigner() : null;
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<AgentKitConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      name: this.config.network.name,
      rpcUrl: this.config.network.rpcUrl,
      chainId: this.config.network.chainId,
    };
  }

  /**
   * Get MultiCall instance for batch RPC operations
   * @returns MultiCall instance
   * @example
   * ```typescript
   * const multicall = kit.getMultiCall();
   * const calls = [...]; // Array of calls
   * const results = await multicall.aggregate(calls);
   * ```
   */
  getMultiCall(): MultiCall {
    if (!this._multiCall) {
      this._multiCall = new MultiCall(this.chainClient);
    }
    return this._multiCall;
  }

  /**
   * Get ERC20 token manager
   * @returns ERC20Manager instance
   * @example
   * ```typescript
   * const erc20 = kit.getERC20Manager();
   * const balance = await erc20.balanceOf(tokenAddress, account);
   * ```
   */
  getERC20Manager(): ERC20Manager {
    if (!this._erc20Manager) {
      this._erc20Manager = new ERC20Manager(this.chainClient);
    }
    return this._erc20Manager;
  }

  /**
   * Get ERC721 NFT manager
   * @returns ERC721Manager instance
   * @example
   * ```typescript
   * const nft = kit.getERC721Manager();
   * const owner = await nft.ownerOf(collectionAddress, tokenId);
   * ```
   */
  getERC721Manager(): ERC721Manager {
    if (!this._erc721Manager) {
      this._erc721Manager = new ERC721Manager(this.chainClient);
    }
    return this._erc721Manager;
  }

  /**
   * Get native token manager (STT/SOMI)
   * @returns NativeTokenManager instance
   * @example
   * ```typescript
   * const native = kit.getNativeTokenManager();
   * const balance = await native.getBalance();
   * ```
   */
  getNativeTokenManager(): NativeTokenManager {
    if (!this._nativeTokenManager) {
      this._nativeTokenManager = new NativeTokenManager(this.chainClient);
    }
    return this._nativeTokenManager;
  }

  /**
   * Get IPFS storage manager
   * @param config - Optional IPFS configuration
   * @returns IPFSManager instance
   * @example
   * ```typescript
   * const ipfs = kit.getIPFSManager();
   * const metadata = await ipfs.fetchNFTMetadata('ipfs://...');
   * ```
   */
  getIPFSManager(config?: IPFSManagerConfig): IPFSManager {
    if (!this._ipfsManager) {
      this._ipfsManager = new IPFSManager(config);
    }
    return this._ipfsManager;
  }

  /**
   * Get WebSocket client for real-time events
   * @param config - Optional WebSocket configuration
   * @returns WebSocketClient instance
   * @example
   * ```typescript
   * const ws = kit.getWebSocketClient();
   * await ws.connect();
   * await ws.subscribeToBlocks((block) => console.log(block));
   * ```
   */
  getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
    if (!this._webSocketClient) {
      this._webSocketClient = new WebSocketClient(this.chainClient, config);
    }
    return this._webSocketClient;
  }

  /**
   * Get contract deployer
   * @returns ContractDeployer instance
   * @example
   * ```typescript
   * const deployer = kit.getContractDeployer();
   * const result = await deployer.deployContract({ abi, bytecode, constructorArgs });
   * ```
   */
  getContractDeployer(): ContractDeployer {
    if (!this._contractDeployer) {
      this._contractDeployer = new ContractDeployer(this.chainClient);
    }
    return this._contractDeployer;
  }

  /**
   * Get contract verifier for Somnia Explorer
   * @param config - Optional verifier configuration
   * @returns ContractVerifier instance
   * @example
   * ```typescript
   * const verifier = kit.getContractVerifier();
   * const result = await verifier.verifyContract({ address, sourceCode, ... });
   * ```
   */
  getContractVerifier(config?: ContractVerifierConfig): ContractVerifier {
    if (!this._contractVerifier) {
      this._contractVerifier = new ContractVerifier(this.chainClient, config);
    }
    return this._contractVerifier;
  }

  /**
   * Get MetaMask connector (browser only)
   * @returns MetaMaskConnector instance
   * @example
   * ```typescript
   * const metamask = kit.getMetaMaskConnector();
   * if (await metamask.isInstalled()) {
   *   const account = await metamask.connect();
   * }
   * ```
   */
  getMetaMaskConnector(): MetaMaskConnector {
    if (!this._metaMaskConnector) {
      this._metaMaskConnector = new MetaMaskConnector();
    }
    return this._metaMaskConnector;
  }

  /**
   * Get LLM adapter based on configuration
   * @returns LLM adapter instance (OpenAI, Ollama, or DeepSeek)
   * @example
   * ```typescript
   * const llm = kit.getLLM();
   * const response = await llm.query('What is blockchain?');
   * ```
   */
  getLLM(): OpenAIAdapter | OllamaAdapter | DeepSeekAdapter {
    if (!this._llm) {
      const llmConfig = this.config.llmProvider;

      if (!llmConfig || !llmConfig.provider) {
        throw new Error('LLM provider not configured. Set llmProvider in config.');
      }

      switch (llmConfig.provider) {
        case 'openai':
          this._llm = new OpenAIAdapter({
            apiKey: llmConfig.apiKey || '',
            baseURL: llmConfig.baseUrl,
            defaultModel: llmConfig.model || 'gpt-4',
            ...llmConfig.options,
          });
          break;
        case 'ollama':
          this._llm = new OllamaAdapter({
            baseURL: llmConfig.baseUrl || 'http://localhost:11434',
            defaultModel: llmConfig.model || 'llama3',
            ...llmConfig.options,
          });
          break;
        case 'anthropic':
        case 'custom':
          // DeepSeek can be used as a fallback for custom providers
          this._llm = new DeepSeekAdapter({
            apiKey: llmConfig.apiKey || '',
            baseURL: llmConfig.baseUrl,
            defaultModel: llmConfig.model || 'deepseek-chat',
            ...llmConfig.options,
          });
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
      }
    }
    return this._llm;
  }

  /**
   * Get logger instance
   * @param config - Optional logger configuration
   * @returns Logger instance
   * @example
   * ```typescript
   * const logger = kit.getLogger();
   * logger.info('Agent started');
   * logger.error('Task failed', { error });
   * ```
   */
  getLogger(config?: LoggerConfig): Logger {
    if (!this._logger) {
      // Map string log level to LogLevel enum
      const logLevel = this.mapLogLevel(this.config.logLevel);
      this._logger = new Logger({
        level: logLevel,
        ...config,
      });
    }
    return this._logger;
  }

  /**
   * Map string log level to LogLevel enum
   * @private
   */
  private mapLogLevel(level?: string): LogLevel {
    switch (level) {
      case 'debug':
        return LogLevel.Debug;
      case 'info':
        return LogLevel.Info;
      case 'warn':
        return LogLevel.Warn;
      case 'error':
        return LogLevel.Error;
      default:
        return LogLevel.Info;
    }
  }

  /**
   * Get metrics collector
   * @param config - Optional metrics configuration
   * @returns Metrics instance
   * @example
   * ```typescript
   * const metrics = kit.getMetrics();
   * await metrics.record('execution', 1);
   * const summary = await metrics.getSummary();
   * ```
   */
  getMetrics(config?: MetricsConfig): Metrics {
    if (!this._metrics) {
      this._metrics = new Metrics({
        ...config,
      });
    }
    return this._metrics;
  }

  /**
   * Get or create an autonomous agent
   * @param name - Agent name (optional, uses default if not provided)
   * @returns Agent instance
   * @example
   * ```typescript
   * const agent = kit.getAgent('MyAgent');
   * await agent.start();
   * ```
   */
  getAgent(name?: string): Agent {
    if (!this._agent) {
      // Agent constructor expects AgentConfig with specific fields
      const owner = this.getSignerAddress();

      this._agent = new Agent(
        {
          name: name || 'DefaultAgent',
          description: 'Autonomous agent created via SDK',
          owner,
        } as any,
        {
          logger: this.getLogger(),
        }
      );
    }
    return this._agent;
  }

  /**
   * Get signer address safely
   * @private
   */
  private getSignerAddress(): string {
    const signer = this.getSigner();
    if (!signer) {
      return ethers.ZeroAddress;
    }

    // Check if signer has address property (Wallet type)
    if ('address' in signer && typeof signer.address === 'string') {
      return signer.address;
    }

    // For generic Signer, we can't get address synchronously
    // Return zero address as fallback
    return ethers.ZeroAddress;
  }
}

// Re-export types and utilities from config layer
export {
  // Global config instance (for quick start)
  config,
  createConfigFromEnv,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_CONFIG, // Alias for backward compatibility
  DEFAULT_NETWORK,
  DEFAULT_RUNTIME_CONFIG,
  DEFAULT_SDK_CONFIG,
  getConfig,
  getNetwork,
  loadAgentConfigFromEnv,
  loadConfig,
  loadFromEnv,
  loadRuntimeConfigFromEnv,
  loadSDKConfigFromEnv,
  mergeConfig,
  SOMNIA_NETWORKS as NETWORK_CONFIGS,
  resetConfig,
  setConfig,
  SOMNIA_NETWORKS,
  validateAgentConfig,
  validateConfig,
  validateRuntimeConfig,
  validateSDKConfig,
} from './config';
export type {
  AgentKitConfig,
  CompleteSolutionConfig,
  ContractAddresses,
  LLMProviderConfig,
  NetworkConfig,
  RuntimeConfig,
  SDKConfig,
} from './config';
// Version tracking
export {
  BUILD_DATE,
  getVersionInfo,
  getVersionString,
  SDK_NAME,
  SDK_VERSION,
} from './version';

// Utility functions (from utils/ module)
export {
  bytesToHex,
  createLogger,
  delay,
  // Event emitter
  EventEmitter,
  // Ether and token utilities
  formatEther,
  formatUnits,
  fromHex,
  hexToBytes,
  // Address utilities
  isValidAddress,
  keccak256,
  // Logger shortcuts
  Logger,
  LogLevel,
  parseEther,
  parseUnits,
  retry,
  shortAddress,
  // Async utilities
  sleep,
  timeout,
  // Hex and data conversion
  toHex,
  toUtf8Bytes,
  toUtf8String,
} from './utils';
export type { EventListener, LogEntry, LoggerConfig } from './utils';

// Core blockchain layer
export { ChainClient } from './core/chainClient';
export { SomniaContracts } from './core/contracts';
export type { ContractInstances } from './core/contracts';
export * from './core/multicall';
export * from './core/rpcProvider';
export { SignerManager } from './core/signerManager';

// Token management
export * from './tokens';

// Contract deployment
export * from './deployment';

// Wallet connectors
export * from './wallets';

// Storage (IPFS)
export * from './storage';

// Real-time events
export * from './events';

// Runtime modules
export * from './runtime';

// LLM integration (includes prompt management)
export * from './llm';

// Monitoring
export * from './monitor';

// CLI
export * from './cli';

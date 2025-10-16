# Somnia Agent Kit - API Reference

> Comprehensive API documentation for all modules, classes, and functions

**Version**: 2.0.1
**Last Updated**: 2025-01-16

---

## Table of Contents

1. [Core Modules](#core-modules)
   - [SomniaAgentKit (Main SDK)](#somniaagentkit)
   - [ChainClient](#chainclient)
   - [SignerManager](#signermanager)
   - [SomniaContracts](#somniacontracts)
   - [Config](#config)
   - [Utils](#utils)
2. [Runtime Modules](#runtime-modules)
   - [Agent](#agent)
   - [Planner](#planner)
   - [Executor](#executor)
   - [Trigger](#trigger)
   - [Storage](#storage)
   - [Policy](#policy)
3. [LLM Adapters](#llm-adapters)
   - [OpenAIAdapter](#openai adapter)
   - [OllamaAdapter](#ollamaadapter)
4. [Monitoring](#monitoring)
   - [Logger](#logger)
   - [Metrics](#metrics)
   - [EventRecorder](#eventrecorder)

---

## Core Modules

### SomniaAgentKit

**Main SDK Class** - Entry point for the Somnia Agent Kit SDK

**Location**: `packages/agent-kit/src/index.ts`

#### Constructor

```typescript
new SomniaAgentKit(userConfig?: Partial<AgentKitConfig>)
```

**Parameters**:
- `userConfig` (optional): Partial configuration object
  - Merged with defaults and environment variables
  - See [AgentKitConfig](#agentkitconfig-interface) for structure

**Example**:
```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0x...',
    agentExecutor: '0x...'
  },
  privateKey: process.env.PRIVATE_KEY
});
```

#### Methods

##### `async initialize(): Promise<void>`

Initialize the SDK and connect to the network.

**Returns**: `Promise<void>`

**Throws**: Error if network connection fails or chain ID mismatch

**Example**:
```typescript
await kit.initialize();
console.log('SDK initialized:', kit.isInitialized());
```

---

##### `isInitialized(): boolean`

Check if the SDK is initialized.

**Returns**: `boolean`

---

##### `getChainClient(): ChainClient`

Get the ChainClient instance for blockchain interactions.

**Returns**: `ChainClient` instance

**Example**:
```typescript
const client = kit.getChainClient();
const blockNumber = await client.getBlockNumber();
```

---

##### `getSignerManager(): SignerManager`

Get the SignerManager instance for transaction signing.

**Returns**: `SignerManager` instance

**Example**:
```typescript
const signer = kit.getSignerManager();
await signer.sendTx('0x...', '0x...', ethers.parseEther('0.1'));
```

---

##### `getProvider(): ethers.Provider`

Get the ethers.js provider instance.

**Returns**: `ethers.Provider`

---

##### `getSigner(): ethers.Signer | ethers.Wallet | null`

Get the signer instance if available.

**Returns**: Signer instance or `null` if no private key configured

---

##### `get contracts: SomniaContracts`

Get the contracts wrapper instance.

**Returns**: `SomniaContracts` instance

**Throws**: Error if SDK not initialized

**Example**:
```typescript
const registry = kit.contracts.AgentRegistry;
const agentInfo = await registry.getAgent(agentId);
```

---

##### `getConfig(): Readonly<AgentKitConfig>`

Get the current configuration (read-only).

**Returns**: Frozen config object

---

##### `getNetworkInfo(): NetworkInfo`

Get network information.

**Returns**: Object with `name`, `rpcUrl`, `chainId`

---

### ChainClient

**Blockchain Client** - Manages provider, signer, and blockchain interactions

**Location**: `packages/agent-kit/src/core/chainClient.ts`

#### Constructor

```typescript
new ChainClient(config: AgentKitConfig)
```

#### Methods

##### `async connect(): Promise<void>`

Connect to the network and validate chain ID.

**Throws**: Error if chain ID mismatch

---

##### `isConnected(): boolean`

Check if connected to the network.

**Returns**: `boolean`

---

##### `getProvider(): ethers.JsonRpcProvider`

Get the provider instance.

**Returns**: `ethers.JsonRpcProvider`

---

##### `getSignerManager(): SignerManager`

Get the signer manager instance.

**Returns**: `SignerManager`

---

##### `getSigner(): ethers.Wallet | ethers.Signer`

Get the signer instance.

**Returns**: Signer instance

**Throws**: Error if no signer configured

---

##### `async getBlockNumber(useCache?: boolean): Promise<number>`

Get current block number with optional caching (2-second TTL).

**Parameters**:
- `useCache` (default: `true`): Use cached value if available

**Returns**: `Promise<number>` - Current block number

**Example**:
```typescript
const blockNumber = await client.getBlockNumber();
const freshBlock = await client.getBlockNumber(false); // Bypass cache
```

---

##### `async refreshBlockNumber(): Promise<number>`

Force refresh block number (bypass cache).

**Returns**: `Promise<number>`

---

##### `async getGasPrice(): Promise<bigint>`

Get current gas price.

**Returns**: `Promise<bigint>` - Gas price in wei

---

##### `async estimateGas(tx: ethers.TransactionRequest): Promise<bigint>`

Estimate gas for a transaction.

**Parameters**:
- `tx`: Transaction request object

**Returns**: `Promise<bigint>` - Estimated gas limit

---

##### `async sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionReceipt>`

Send a transaction and wait for receipt.

**Parameters**:
- `tx`: Transaction request

**Returns**: `Promise<ethers.TransactionReceipt>`

**Throws**: Error if transaction fails

---

##### `async waitForTransaction(txHash: string, confirmations?: number): Promise<ethers.TransactionReceipt>`

Wait for transaction confirmation.

**Parameters**:
- `txHash`: Transaction hash
- `confirmations` (default: `1`): Number of confirmations to wait for

**Returns**: `Promise<ethers.TransactionReceipt>`

---

##### `async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>`

Get transaction receipt.

**Parameters**:
- `txHash`: Transaction hash

**Returns**: `Promise<ethers.TransactionReceipt | null>`

---

##### `async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null>`

Get transaction details.

**Parameters**:
- `txHash`: Transaction hash

**Returns**: `Promise<ethers.TransactionResponse | null>`

---

##### `async getTx(txHash: string): Promise<ethers.TransactionResponse | null>`

Alias for `getTransaction()`.

---

##### `getContract(address: string, abi: ethers.Interface | ethers.InterfaceAbi): ethers.Contract`

Get a contract instance with signer.

**Parameters**:
- `address`: Contract address
- `abi`: Contract ABI or Interface

**Returns**: `ethers.Contract` connected to signer

---

##### `getReadOnlyContract(address: string, abi: ethers.Interface | ethers.InterfaceAbi): ethers.Contract`

Get a read-only contract instance.

**Parameters**:
- `address`: Contract address
- `abi`: Contract ABI or Interface

**Returns**: `ethers.Contract` connected to provider

---

#### Event Listening

##### `on(event: string, handler: ethers.Listener): void`

Subscribe to provider events.

**Parameters**:
- `event`: Event name ('block', 'pending', 'error', etc.)
- `handler`: Event handler function

**Example**:
```typescript
client.on('block', (blockNumber) => {
  console.log('New block:', blockNumber);
});
```

---

##### `off(event: string, handler?: ethers.Listener): void`

Unsubscribe from provider events.

**Parameters**:
- `event`: Event name
- `handler` (optional): Specific handler to remove (removes all if not provided)

---

##### `once(event: string, handler: ethers.Listener): void`

Subscribe to event (one time only).

---

##### `removeAllListeners(event?: string): void`

Remove all event listeners.

**Parameters**:
- `event` (optional): Specific event (removes all if not provided)

---

##### `listenerCount(event?: string): any`

Get listener count for an event.

**Parameters**:
- `event` (optional): Event name

**Returns**: Number of listeners

---

##### `disconnect(): void`

Disconnect from network and remove all listeners.

---

### SignerManager

**Signer Management** - Handles wallet creation, transaction signing, and sending

**Location**: `packages/agent-kit/src/core/signerManager.ts`

#### Constructor

```typescript
new SignerManager(provider: ethers.Provider, privateKey?: string)
```

**Parameters**:
- `provider`: Ethers provider instance
- `privateKey` (optional): Private key (with or without 0x prefix)

#### Static Factory Methods

##### `static fromMnemonic(mnemonic: string, provider: ethers.Provider, path?: string): SignerManager`

Create SignerManager from mnemonic phrase.

**Parameters**:
- `mnemonic`: 12 or 24 word mnemonic phrase
- `provider`: Provider instance
- `path` (optional): Derivation path (default: "m/44'/60'/0'/0/0")

**Returns**: `SignerManager` instance

**Example**:
```typescript
const manager = SignerManager.fromMnemonic(
  'word1 word2 ... word12',
  provider,
  "m/44'/60'/0'/0/1" // Custom path
);
```

---

##### `static fromSigner(signer: ethers.Signer, provider: ethers.Provider): SignerManager`

Create SignerManager from external signer.

**Parameters**:
- `signer`: External signer (e.g., hardware wallet, browser wallet)
- `provider`: Provider instance

**Returns**: `SignerManager` instance

**Example**:
```typescript
const externalSigner = await window.ethereum.getSigner();
const manager = SignerManager.fromSigner(externalSigner, provider);
```

---

#### Methods

##### `getSigner(): ethers.Wallet | ethers.Signer`

Get the current signer.

**Returns**: Signer instance

**Throws**: Error if no signer configured

---

##### `async getAddress(): Promise<string>`

Get signer address.

**Returns**: `Promise<string>` - Ethereum address

---

##### `async getBalance(address?: string): Promise<bigint>`

Get account balance.

**Parameters**:
- `address` (optional): Address to check (defaults to signer address)

**Returns**: `Promise<bigint>` - Balance in wei

---

##### `async signMessage(message: string): Promise<string>`

Sign a message.

**Parameters**:
- `message`: Message to sign

**Returns**: `Promise<string>` - Signature

---

##### `async signTransaction(tx: ethers.TransactionRequest): Promise<string>`

Sign a transaction (without sending).

**Parameters**:
- `tx`: Transaction request

**Returns**: `Promise<string>` - Signed transaction

---

##### `async sendTx(to: string, data: string, value?: bigint): Promise<ethers.TransactionReceipt>`

**CRITICAL METHOD** - Send transaction to blockchain.

**Parameters**:
- `to`: Recipient address
- `data`: Transaction data (hex string)
- `value` (optional): Value to send in wei

**Returns**: `Promise<ethers.TransactionReceipt>`

**Throws**: Error if transaction fails

**Example**:
```typescript
const receipt = await signerManager.sendTx(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x...',
  ethers.parseEther('0.1')
);
console.log('TX hash:', receipt.hash);
```

---

##### `async estimateGas(tx: ethers.TransactionRequest): Promise<bigint>`

Estimate gas for a transaction.

**Parameters**:
- `tx`: Transaction request

**Returns**: `Promise<bigint>` - Estimated gas limit

**Example**:
```typescript
const gasEstimate = await signerManager.estimateGas({
  to: '0x...',
  data: '0x...',
  value: ethers.parseEther('0.1')
});
```

---

##### `async getNonce(): Promise<number>`

Get current nonce for the signer (pending transactions included).

**Returns**: `Promise<number>` - Current nonce

---

##### `async getGasPrice(): Promise<bigint>`

Get current gas price.

**Returns**: `Promise<bigint>` - Gas price in wei

---

##### `hasSigner(): boolean`

Check if signer is configured.

**Returns**: `boolean`

---

##### `setSigner(privateKey: string): void`

Set a new signer using private key.

**Parameters**:
- `privateKey`: Private key (with or without 0x)

---

### SomniaContracts

**Contract Wrapper** - Type-safe access to Somnia smart contracts

**Location**: `packages/agent-kit/src/core/contracts.ts`

#### Constructor

```typescript
new SomniaContracts(
  provider: ethers.Provider,
  addresses: ContractAddresses,
  signer?: ethers.Signer
)
```

#### Static Factory

##### `static fromChainClient(client: ChainClient, addresses: ContractAddresses): SomniaContracts`

Create SomniaContracts from ChainClient (recommended).

**Parameters**:
- `client`: ChainClient instance
- `addresses`: Contract addresses

**Returns**: `SomniaContracts` instance

**Example**:
```typescript
const contracts = SomniaContracts.fromChainClient(chainClient, {
  agentRegistry: '0x...',
  agentExecutor: '0x...'
});
```

---

#### Methods

##### `async initialize(): Promise<void>`

Initialize contract instances.

**Returns**: `Promise<void>`

---

##### `isInitialized(): boolean`

Check if contracts are initialized.

**Returns**: `boolean`

---

#### Contract Getters

##### `get AgentRegistry: AgentRegistry`

Get AgentRegistry contract instance.

**Returns**: Typechain-generated AgentRegistry contract

**Throws**: Error if not initialized

---

##### `get registry: AgentRegistry`

Lowercase alias for AgentRegistry.

---

##### `get AgentExecutor: AgentExecutor`

Get AgentExecutor contract instance.

**Returns**: Typechain-generated AgentExecutor contract

---

##### `get executor: AgentExecutor`

Lowercase alias for AgentExecutor.

---

##### `get AgentManager: AgentManager`

Get AgentManager contract instance.

**Returns**: Typechain-generated AgentManager contract

**Throws**: Error if agentManager address not configured

---

##### `get manager: AgentManager`

Lowercase alias for AgentManager.

---

##### `get AgentVault: AgentVault`

Get AgentVault contract instance.

**Returns**: Typechain-generated AgentVault contract

**Throws**: Error if agentVault address not configured

---

##### `get vault: AgentVault`

Lowercase alias for AgentVault.

---

##### `getAddresses(): Readonly<ContractAddresses>`

Get all contract addresses.

**Returns**: Frozen object with addresses

---

##### `async updateSigner(signer: ethers.Signer): Promise<void>`

Update signer and reinitialize contracts.

**Parameters**:
- `signer`: New signer instance

**Returns**: `Promise<void>`

---

##### `getInstances(): Readonly<ContractInstances> | null`

Get all contract instances (for advanced usage).

**Returns**: Frozen object with instances or `null` if not initialized

---

### Config

**Configuration System** - Environment variable loading, defaults, and validation

**Location**: `packages/agent-kit/src/core/config.ts`

#### Types & Interfaces

##### `AgentKitConfig` Interface

```typescript
interface AgentKitConfig {
  network: NetworkConfig;
  contracts: ContractAddresses;
  privateKey?: string;
  llmProvider?: LLMProviderConfig;
  defaultGasLimit?: bigint;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled?: boolean;
}
```

---

##### `NetworkConfig` Interface

```typescript
interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  name: string;
}
```

---

##### `ContractAddresses` Interface

```typescript
interface ContractAddresses {
  agentRegistry: string;
  agentExecutor: string;
  agentManager?: string;
  agentVault?: string;
}
```

---

##### `LLMProviderConfig` Interface

```typescript
interface LLMProviderConfig {
  provider?: 'openai' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}
```

---

#### Constants

##### `SOMNIA_NETWORKS`

Predefined network configurations.

```typescript
const SOMNIA_NETWORKS = {
  mainnet: {
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Mainnet',
  },
  testnet: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    name: 'Somnia Dream Testnet',
  },
  devnet: {
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    name: 'Somnia Devnet',
  },
}
```

---

##### `DEFAULT_CONFIG`

Default configuration values.

```typescript
const DEFAULT_CONFIG = {
  defaultGasLimit: 3000000n,
  logLevel: 'info' as const,
  metricsEnabled: false,
}
```

---

#### Functions

##### `validateConfig(config: AgentKitConfig): void`

Validate configuration object.

**Parameters**:
- `config`: Configuration to validate

**Throws**: Error if invalid

---

##### `loadFromEnv(): Partial<AgentKitConfig>`

Load configuration from environment variables.

**Returns**: `Partial<AgentKitConfig>`

**Environment Variables**:
- `SOMNIA_RPC_URL`, `SOMNIA_CHAIN_ID`
- `AGENT_REGISTRY_ADDRESS`, `AGENT_EXECUTOR_ADDRESS`, `AGENT_MANAGER_ADDRESS`, `AGENT_VAULT_ADDRESS`
- `PRIVATE_KEY`
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
- `DEFAULT_GAS_LIMIT`, `LOG_LEVEL`, `METRICS_ENABLED`

---

##### `loadConfig(userConfig?: Partial<AgentKitConfig>): AgentKitConfig`

**MAIN FUNCTION** - Load and merge configuration from defaults, environment, and user input.

**Parameters**:
- `userConfig` (optional): User-provided config

**Returns**: `AgentKitConfig` - Complete validated configuration

**Priority** (highest to lowest):
1. User-provided config
2. Environment variables
3. Default values

**Example**:
```typescript
// Load from env + defaults
const config1 = loadConfig();

// Override network
const config2 = loadConfig({
  network: SOMNIA_NETWORKS.testnet
});

// Full manual config
const config3 = loadConfig({
  network: { rpcUrl: '...', chainId: 50312, name: 'Custom' },
  contracts: { agentRegistry: '0x...', agentExecutor: '0x...' },
  privateKey: '0x...'
});
```

---

##### `createConfigFromEnv(): AgentKitConfig`

Convenience function to load all config from .env file.

**Returns**: `AgentKitConfig`

**Throws**: Error if required env vars missing

**Example**:
```typescript
// Requires SOMNIA_RPC_URL, AGENT_REGISTRY_ADDRESS, AGENT_EXECUTOR_ADDRESS in .env
const config = createConfigFromEnv();
const kit = new SomniaAgentKit(config);
```

---

### Utils

**Utility Library** - 20+ helper functions for common tasks

**Location**: `packages/agent-kit/src/core/utils.ts`

#### Async Utilities

##### `sleep(ms: number): Promise<void>`

Sleep for specified milliseconds.

**Parameters**:
- `ms`: Milliseconds to sleep

**Returns**: `Promise<void>`

**Example**:
```typescript
await sleep(1000); // Wait 1 second
```

---

##### `retry<T>(fn: () => Promise<T>, maxRetries?: number, delayMs?: number): Promise<T>`

Retry async function with exponential backoff.

**Parameters**:
- `fn`: Async function to retry
- `maxRetries` (default: `3`): Maximum retry attempts
- `delayMs` (default: `1000`): Initial delay in milliseconds

**Returns**: `Promise<T>` - Result of successful execution

**Throws**: Last error if all retries fail

**Example**:
```typescript
const data = await retry(
  () => fetch('https://api.example.com'),
  5,
  2000
);
```

---

##### `delay<T>(ms: number, value?: T): Promise<T>`

Delay execution and optionally return a value.

**Parameters**:
- `ms`: Milliseconds to delay
- `value` (optional): Value to return after delay

**Returns**: `Promise<T>`

**Example**:
```typescript
const result = await delay(1000, 'done'); // Waits 1s, returns "done"
```

---

##### `timeout<T>(promise: Promise<T>, ms: number, errorMessage?: string): Promise<T>`

Add timeout to a promise.

**Parameters**:
- `promise`: Promise to add timeout to
- `ms`: Timeout in milliseconds
- `errorMessage` (optional): Custom error message

**Returns**: `Promise<T>`

**Throws**: Error if timeout reached

**Example**:
```typescript
const data = await timeout(
  fetchData(),
  5000,
  'Request timeout after 5s'
);
```

---

#### Hex & Data Conversion

##### `toHex(value: number | bigint | string): string`

Convert value to hex string.

**Parameters**:
- `value`: Number, bigint, or string to convert

**Returns**: `string` - Hex string with 0x prefix

**Example**:
```typescript
toHex(255) // "0xff"
toHex(1000000n) // "0xf4240"
```

---

##### `fromHex(hex: string): number`

Parse hex string to number.

**Parameters**:
- `hex`: Hex string

**Returns**: `number`

**Example**:
```typescript
fromHex("0xff") // 255
```

---

##### `bytesToHex(bytes: Uint8Array): string`

Convert bytes to hex string.

**Parameters**:
- `bytes`: Uint8Array to convert

**Returns**: `string` - Hex string with 0x prefix

**Example**:
```typescript
bytesToHex(new Uint8Array([1, 2, 3])) // "0x010203"
```

---

##### `hexToBytes(hex: string): Uint8Array`

Convert hex string to bytes.

**Parameters**:
- `hex`: Hex string

**Returns**: `Uint8Array`

**Example**:
```typescript
hexToBytes("0x010203") // Uint8Array([1, 2, 3])
```

---

##### `toUtf8Bytes(str: string): Uint8Array`

Convert string to UTF-8 bytes.

**Parameters**:
- `str`: String to convert

**Returns**: `Uint8Array`

---

##### `toUtf8String(bytes: Uint8Array): string`

Convert UTF-8 bytes to string.

**Parameters**:
- `bytes`: Bytes to convert

**Returns**: `string`

---

##### `keccak256(data: string | Uint8Array): string`

Compute keccak256 hash.

**Parameters**:
- `data`: Data to hash (string or bytes)

**Returns**: `string` - Hash as hex string

**Example**:
```typescript
keccak256("hello") // "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
```

---

#### Ether & Token Utilities

##### `formatEther(wei: bigint | string): string`

Format wei to ether string.

**Parameters**:
- `wei`: Wei amount

**Returns**: `string` - Ether amount

**Example**:
```typescript
formatEther(1000000000000000000n) // "1.0"
```

---

##### `parseEther(ether: string): bigint`

Parse ether string to wei.

**Parameters**:
- `ether`: Ether amount as string

**Returns**: `bigint` - Wei amount

**Example**:
```typescript
parseEther("1.0") // 1000000000000000000n
```

---

##### `formatUnits(value: bigint | string, decimals: number): string`

Format token amount with decimals.

**Parameters**:
- `value`: Amount in smallest unit
- `decimals`: Token decimals

**Returns**: `string` - Formatted amount

**Example**:
```typescript
formatUnits(1000000n, 6) // "1.0" (USDC with 6 decimals)
```

---

##### `parseUnits(value: string, decimals: number): bigint`

Parse token amount with decimals.

**Parameters**:
- `value`: Amount as string
- `decimals`: Token decimals

**Returns**: `bigint` - Amount in smallest unit

**Example**:
```typescript
parseUnits("1.0", 6) // 1000000n (USDC)
```

---

#### Address Utilities

##### `isValidAddress(address: string): boolean`

Validate Ethereum address format.

**Parameters**:
- `address`: Address to validate

**Returns**: `boolean`

**Example**:
```typescript
isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // true
isValidAddress('invalid') // false
```

---

##### `shortAddress(address: string): string`

Get short address format (0x1234...5678).

**Parameters**:
- `address`: Address to shorten

**Returns**: `string` - Shortened address

**Example**:
```typescript
shortAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // "0x742d...0bEb"
```

---

#### EventEmitter

##### `class EventEmitter<TEvents>`

Type-safe event emitter for custom event handling.

**Generic Type**:
- `TEvents`: Record of event names to event data types

**Example**:
```typescript
interface MyEvents {
  data: { message: string };
  status: { code: number };
}

class MyClass extends EventEmitter<MyEvents> {
  doSomething() {
    this.emit('data', { message: 'hello' });
    this.emit('status', { code: 200 });
  }
}

const obj = new MyClass();
const unsubscribe = obj.on('data', (data) => console.log(data.message));
unsubscribe(); // Clean up
```

**Methods**:

- `on<K>(event: K, listener: EventListener<TEvents[K]>): () => void` - Subscribe to event
- `once<K>(event: K, listener: EventListener<TEvents[K]>): () => void` - Subscribe once
- `off<K>(event: K, listener: EventListener<TEvents[K]>): void` - Unsubscribe
- `emit<K>(event: K, data: TEvents[K]): void` - Emit event
- `removeAllListeners(event?: K): void` - Remove all listeners
- `listenerCount(event: K): number` - Get listener count

---

#### Logger Shortcuts

##### `Logger` (Re-exported)

Logger class from monitor/logger.ts.

See [Logger](#logger) section for full API.

---

##### `LogLevel` (Re-exported)

Log level enum: `Error`, `Warn`, `Info`, `Debug`, `Verbose`

---

##### `createLogger(context?: string, config?: LoggerConfig): Logger | ChildLogger`

Create a new logger instance.

**Parameters**:
- `context` (optional): Context name for log entries
- `config` (optional): Logger configuration

**Returns**: `Logger` or `ChildLogger` instance

**Example**:
```typescript
const logger = createLogger('MyService');
logger.info('Service started');

const debugLogger = createLogger('Debug', { level: LogLevel.Debug });
debugLogger.debug('Debug message');
```

---

## Runtime Modules

### Agent

**Agent Lifecycle Management** - Create, register, and manage AI agents

**Location**: `packages/agent-kit/src/runtime/agent.ts`

#### Agent States

```typescript
enum AgentState {
  Created = 'created',
  Registered = 'registered',
  Active = 'active',
  Paused = 'paused',
  Stopped = 'stopped',
  Terminated = 'terminated',
}
```

#### Constructor

```typescript
new Agent(config: AgentConfig)
```

**AgentConfig**:
```typescript
interface AgentConfig {
  name: string;
  description: string;
  owner: string;
  capabilities?: string[];
  metadata?: Record<string, any>;
}
```

#### Methods

##### `async initialize(registry: AgentRegistry, executor: AgentExecutor): Promise<void>`

Initialize agent with contract instances.

---

##### `async register(signer: ethers.Signer): Promise<string>`

Register agent on-chain.

**Returns**: `Promise<string>` - Agent address

---

##### `async start(): Promise<void>`

Start agent execution.

---

##### `async pause(): Promise<void>`

Pause agent execution.

---

##### `async resume(): Promise<void>`

Resume agent execution.

---

##### `async stop(): Promise<void>`

Stop agent execution.

---

##### `async terminate(): Promise<void>`

Terminate agent (irreversible).

---

##### `getState(): AgentState`

Get current agent state.

**Returns**: `AgentState`

---

##### `getId(): string`

Get agent ID.

**Returns**: `string`

---

##### `getAddress(): string | null`

Get agent on-chain address.

**Returns**: `string | null`

---

##### `getConfig(): Readonly<AgentConfig>`

Get agent configuration.

**Returns**: Frozen config object

---

### Planner

**Task Planning** - Task decomposition and dependency resolution

**Location**: `packages/agent-kit/src/runtime/planner.ts`

#### Task Planning

##### `async plan(goal: string, context?: any): Promise<Task[]>`

Plan tasks to achieve goal.

**Parameters**:
- `goal`: Goal description
- `context` (optional): Additional context

**Returns**: `Promise<Task[]>` - Array of planned tasks

---

##### `async decompose(task: Task): Promise<Task[]>`

Decompose complex task into subtasks.

**Parameters**:
- `task`: Task to decompose

**Returns**: `Promise<Task[]>` - Array of subtasks

---

##### `resolveDependencies(tasks: Task[]): Task[]`

Resolve task dependencies and return execution order.

**Parameters**:
- `tasks`: Array of tasks

**Returns**: `Task[]` - Tasks in execution order

---

### Executor

**Task Execution** - Execute tasks with retry logic and error handling

**Location**: `packages/agent-kit/src/runtime/executor.ts`

#### Task Execution

##### `async execute(task: Task): Promise<TaskResult>`

Execute a single task.

**Parameters**:
- `task`: Task to execute

**Returns**: `Promise<TaskResult>`

---

##### `async executeAll(tasks: Task[]): Promise<TaskResult[]>`

Execute multiple tasks concurrently.

**Parameters**:
- `tasks`: Array of tasks

**Returns**: `Promise<TaskResult[]>`

---

##### `async executeSequential(tasks: Task[]): Promise<TaskResult[]>`

Execute tasks sequentially.

**Parameters**:
- `tasks`: Array of tasks

**Returns**: `Promise<TaskResult[]>`

---

### Trigger

**Event Triggers** - Time, event, and condition-based triggers

**Location**: `packages/agent-kit/src/runtime/trigger.ts`

#### Trigger Types

```typescript
enum TriggerType {
  Time = 'time',
  Event = 'event',
  Condition = 'condition',
  Manual = 'manual',
}
```

#### Methods

##### `register(config: TriggerConfig): string`

Register a trigger.

**Parameters**:
- `config`: Trigger configuration

**Returns**: `string` - Trigger ID

---

##### `async trigger(triggerId: string, data?: any): Promise<void>`

Manually trigger a trigger.

**Parameters**:
- `triggerId`: Trigger ID
- `data` (optional): Trigger data

**Returns**: `Promise<void>`

---

##### `enable(triggerId: string): void`

Enable a trigger.

---

##### `disable(triggerId: string): void`

Disable a trigger.

---

##### `deleteTrigger(triggerId: string): boolean`

Delete a trigger.

**Returns**: `boolean` - Success status

---

##### `getTrigger(triggerId: string): TriggerConfig | undefined`

Get trigger configuration.

**Returns**: `TriggerConfig | undefined`

---

##### `getAllTriggers(): TriggerConfig[]`

Get all triggers.

**Returns**: `TriggerConfig[]`

---

##### `cleanup(): void`

Cleanup all triggers and intervals.

---

### Storage

**State Persistence** - Multi-backend storage support

**Location**: `packages/agent-kit/src/runtime/storage.ts`

#### Storage Backends

```typescript
enum StorageBackend {
  Memory = 'memory',
  File = 'file',
  OnChain = 'onchain',
  IPFS = 'ipfs',
}
```

#### Methods

##### `async set(key: string, value: any): Promise<void>`

Store value.

**Parameters**:
- `key`: Storage key
- `value`: Value to store

**Returns**: `Promise<void>`

---

##### `async get<T>(key: string): Promise<T | null>`

Retrieve value.

**Parameters**:
- `key`: Storage key

**Returns**: `Promise<T | null>`

---

##### `async delete(key: string): Promise<void>`

Delete value.

**Parameters**:
- `key`: Storage key

**Returns**: `Promise<void>`

---

##### `async has(key: string): Promise<boolean>`

Check if key exists.

**Parameters**:
- `key`: Storage key

**Returns**: `Promise<boolean>`

---

##### `async clear(): Promise<void>`

Clear all storage.

**Returns**: `Promise<void>`

---

### Policy

**Access Control** - Role-based permissions and governance

**Location**: `packages/agent-kit/src/runtime/policy.ts`

#### Roles

```typescript
enum Role {
  Owner = 'owner',
  Admin = 'admin',
  User = 'user',
}
```

#### Methods

##### `setRole(address: string, role: Role): void`

Set role for address.

**Parameters**:
- `address`: Ethereum address
- `role`: Role to assign

---

##### `getRole(address: string): Role | undefined`

Get role for address.

**Parameters**:
- `address`: Ethereum address

**Returns**: `Role | undefined`

---

##### `hasRole(address: string, role: Role): boolean`

Check if address has role.

**Parameters**:
- `address`: Ethereum address
- `role`: Role to check

**Returns**: `boolean`

---

##### `checkPermission(address: string, action: string): boolean`

Check if address has permission for action.

**Parameters**:
- `address`: Ethereum address
- `action`: Action name

**Returns**: `boolean`

---

---

## LLM Adapters

### OpenAIAdapter

**OpenAI Integration** - GPT-3.5, GPT-4, embeddings, streaming

**Location**: `packages/agent-kit/src/llm/openaiAdapter.ts`

#### Constructor

```typescript
new OpenAIAdapter(config: OpenAIConfig)
```

**OpenAIConfig**:
```typescript
interface OpenAIConfig {
  apiKey: string;
  defaultModel?: string; // default: 'gpt-3.5-turbo'
  organization?: string;
}
```

#### Methods

##### `async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>`

Generate chat completion.

**Parameters**:
- `messages`: Array of chat messages
- `options` (optional): Chat options (model, temperature, maxTokens, etc.)

**Returns**: `Promise<string>` - Generated response

**Example**:
```typescript
const response = await adapter.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
]);
```

---

##### `async generate(prompt: string, options?: GenerateOptions): Promise<string>`

Generate text completion.

**Parameters**:
- `prompt`: Prompt text
- `options` (optional): Generation options

**Returns**: `Promise<string>` - Generated text

---

##### `async embed(text: string, model?: string): Promise<number[]>`

Generate embeddings.

**Parameters**:
- `text`: Text to embed
- `model` (optional): Embedding model (default: 'text-embedding-ada-002')

**Returns**: `Promise<number[]>` - Embedding vector

---

##### `async streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>`

Stream chat completion.

**Parameters**:
- `messages`: Array of chat messages
- `options` (optional): Chat options

**Returns**: `AsyncGenerator<string>` - Stream of response chunks

**Example**:
```typescript
for await (const chunk of adapter.streamChat(messages)) {
  process.stdout.write(chunk);
}
```

---

### OllamaAdapter

**Ollama Integration** - Local LLM support with model management

**Location**: `packages/agent-kit/src/llm/ollamaAdapter.ts`

#### Constructor

```typescript
new OllamaAdapter(config: OllamaConfig)
```

**OllamaConfig**:
```typescript
interface OllamaConfig {
  baseUrl?: string; // default: 'http://localhost:11434'
  defaultModel?: string; // default: 'llama2'
}
```

#### Methods

##### `async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>`

Generate chat completion.

---

##### `async generate(prompt: string, options?: GenerateOptions): Promise<string>`

Generate text completion.

---

##### `async embed(text: string, model?: string): Promise<number[]>`

Generate embeddings.

---

##### `async streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>`

Stream chat completion.

---

##### `async pullModel(model: string): Promise<void>`

Pull model from Ollama registry.

**Parameters**:
- `model`: Model name

**Returns**: `Promise<void>`

---

##### `async deleteModel(model: string): Promise<void>`

Delete local model.

**Parameters**:
- `model`: Model name

**Returns**: `Promise<void>`

---

##### `async listModels(): Promise<string[]>`

List available models.

**Returns**: `Promise<string[]>` - Array of model names

---

---

## Monitoring

### Logger

**Structured Logging** - Multi-level logging with context

**Location**: `packages/agent-kit/src/monitor/logger.ts`

#### Log Levels

```typescript
enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'verbose',
}
```

#### Constructor

```typescript
new Logger(config?: LoggerConfig)
```

**LoggerConfig**:
```typescript
interface LoggerConfig {
  level?: LogLevel; // default: Info
  enableConsole?: boolean; // default: true
  enableFile?: boolean; // default: false
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}
```

#### Methods

##### `error(message: string, metadata?: Record<string, any>, context?: string): void`

Log error message.

---

##### `warn(message: string, metadata?: Record<string, any>, context?: string): void`

Log warning message.

---

##### `info(message: string, metadata?: Record<string, any>, context?: string): void`

Log info message.

---

##### `debug(message: string, metadata?: Record<string, any>, context?: string): void`

Log debug message.

---

##### `verbose(message: string, metadata?: Record<string, any>, context?: string): void`

Log verbose message.

---

##### `child(context: string): ChildLogger`

Create child logger with predefined context.

**Parameters**:
- `context`: Context name

**Returns**: `ChildLogger` instance

**Example**:
```typescript
const logger = new Logger();
const childLogger = logger.child('MyService');
childLogger.info('Service started'); // Automatically includes context
```

---

##### `getLogs(limit?: number): LogEntry[]`

Get recent logs.

**Parameters**:
- `limit` (optional): Limit number of logs

**Returns**: `LogEntry[]`

---

##### `getLogsByLevel(level: LogLevel, limit?: number): LogEntry[]`

Get logs by level.

---

##### `getLogsByContext(context: string, limit?: number): LogEntry[]`

Get logs by context.

---

##### `getLogsByTimeRange(startTime: number, endTime: number): LogEntry[]`

Get logs in time range.

---

##### `clearLogs(): void`

Clear all logs.

---

##### `setLevel(level: LogLevel): void`

Set log level.

---

##### `getLevel(): LogLevel`

Get current log level.

---

### Metrics

**Performance Metrics** - Counters, gauges, histograms, timing

**Location**: `packages/agent-kit/src/monitor/metrics.ts`

#### Metric Types

```typescript
enum MetricType {
  Counter = 'counter',
  Gauge = 'gauge',
  Histogram = 'histogram',
}
```

#### Methods

##### `incrementCounter(name: string, value?: number, labels?: Record<string, string>): void`

Increment counter.

**Parameters**:
- `name`: Metric name
- `value` (optional): Increment value (default: 1)
- `labels` (optional): Metric labels

---

##### `setGauge(name: string, value: number, labels?: Record<string, string>): void`

Set gauge value.

---

##### `recordHistogram(name: string, value: number, labels?: Record<string, string>): void`

Record histogram value.

---

##### `startTimer(name: string, labels?: Record<string, string>): () => void`

Start timer for metric.

**Returns**: Function to stop timer

**Example**:
```typescript
const stopTimer = metrics.startTimer('operation_duration');
// ... do operation
stopTimer(); // Records duration
```

---

##### `getMetric(name: string, labels?: Record<string, string>): Metric | undefined`

Get metric by name and labels.

---

##### `getAllMetrics(): Metric[]`

Get all metrics.

**Returns**: `Metric[]`

---

##### `export(): MetricData[]`

Export all metrics data.

**Returns**: `MetricData[]`

---

##### `reset(): void`

Reset all metrics.

---

### EventRecorder

**Event Tracking** - On-chain event listening and recording

**Location**: `packages/agent-kit/src/monitor/eventRecorder.ts`

#### Methods

##### `async record(contract: ethers.Contract, eventName: string, callback?: (event: any) => void): Promise<void>`

Start recording events from contract.

**Parameters**:
- `contract`: Contract instance
- `eventName`: Event name to listen for
- `callback` (optional): Callback function for each event

**Returns**: `Promise<void>`

**Example**:
```typescript
await recorder.record(
  kit.contracts.AgentRegistry,
  'AgentRegistered',
  (event) => console.log('New agent:', event.args.agentId)
);
```

---

##### `stopRecording(contract: ethers.Contract, eventName: string): void`

Stop recording events.

**Parameters**:
- `contract`: Contract instance
- `eventName`: Event name

---

##### `getEvents(eventName: string, limit?: number): ContractEvent[]`

Get recorded events.

**Parameters**:
- `eventName`: Event name
- `limit` (optional): Limit number of events

**Returns**: `ContractEvent[]`

---

##### `getEventsByTimeRange(startTime: number, endTime: number): ContractEvent[]`

Get events in time range.

---

##### `clearEvents(): void`

Clear all recorded events.

---

##### `export(): ContractEvent[]`

Export all events.

**Returns**: `ContractEvent[]`

---

## Quick Reference

### Import Paths

```typescript
// Main SDK
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

// Core
import { ChainClient, SignerManager, SomniaContracts } from '@somnia/agent-kit';
import { loadConfig, createConfigFromEnv } from '@somnia/agent-kit';

// Utils
import {
  sleep, retry, delay, timeout,
  toHex, fromHex, formatEther, parseEther,
  EventEmitter, Logger, LogLevel, createLogger
} from '@somnia/agent-kit';

// Runtime (not directly exported, use via Agent)
import { Agent } from '@somnia/agent-kit/runtime';

// LLM
import { OpenAIAdapter, OllamaAdapter } from '@somnia/agent-kit/llm';

// Monitor
import { Logger, Metrics, EventRecorder } from '@somnia/agent-kit/monitor';
```

---

### Common Patterns

#### Basic Setup

```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0x...',
    agentExecutor: '0x...'
  },
  privateKey: process.env.PRIVATE_KEY
});

await kit.initialize();
```

#### Send Transaction

```typescript
const signer = kit.getSignerManager();
const receipt = await signer.sendTx(
  '0xRecipient...',
  '0xData...',
  ethers.parseEther('0.1')
);
```

#### Contract Interaction

```typescript
const registry = kit.contracts.AgentRegistry;
const agentInfo = await registry.getAgent(agentId);
```

#### Event Listening

```typescript
const client = kit.getChainClient();
client.on('block', (blockNumber) => {
  console.log('New block:', blockNumber);
});
```

#### Logging

```typescript
const logger = createLogger('MyService');
logger.info('Service started', { port: 3000 });
logger.error('Error occurred', { error: err.message });
```

---

## Type Definitions

All types are exported from the main package:

```typescript
import type {
  // Config
  AgentKitConfig,
  NetworkConfig,
  ContractAddresses,
  LLMProviderConfig,

  // Contracts
  ContractInstances,

  // Utils
  EventListener,
  LoggerConfig,
  LogEntry,
} from '@somnia/agent-kit';
```

---

**End of API Reference**

For more information, see:
- [CLAUDE.md](./CLAUDE.md) - Development context
- [README.md](./README.md) - Project overview
- [docs/](./docs/) - Additional documentation

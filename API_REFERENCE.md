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
   - [Memory](#memory)
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

**AI/Rule-Based Planning** - LLM and rule-based task planning

**Location**: `packages/agent-kit/src/runtime/planner.ts`

#### Interfaces

##### `IPlanner`

Base planner interface.

```typescript
interface IPlanner {
  plan(goal: any, context?: any): Promise<Action[]>;
}
```

##### `Action`

Simple action format.

```typescript
interface Action {
  type: string;
  params: Record<string, any>;
}
```

#### Classes

##### `RulePlanner`

Rule-based planner for predefined task types.

**Usage**:
```typescript
const planner = new RulePlanner();
const actions = await planner.plan({
  type: 'transfer',
  to: '0x123...',
  amount: '1.0'
});
// Returns: [
//   { type: 'validate_address', params: { address: '0x123...' } },
//   { type: 'check_balance', params: { amount: '1.0' } },
//   { type: 'execute_transfer', params: { to: '0x123...', amount: '1.0' } }
// ]
```

**Supported task types**: `transfer`, `swap`, `contract_call`, `deploy_contract`

##### `LLMPlanner`

AI-powered planner using OpenAI or Ollama.

**Constructor**:
```typescript
constructor(llm: OpenAIAdapter | OllamaAdapter, options?: {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
})
```

**Usage**:
```typescript
const llm = new OpenAIAdapter({ apiKey: 'sk-...' });
const planner = new LLMPlanner(llm);

const actions = await planner.plan(
  'Transfer 1 ETH to Alice and swap 100 USDC for STT',
  { userBalance: '5 ETH', network: 'testnet' }
);
// LLM generates appropriate action sequence
```

**Methods**:
- `setSystemPrompt(prompt: string)`: Customize AI instructions
- `getSystemPrompt()`: Get current system prompt

##### `Planner` (Legacy)

Base planner with backward compatibility.

**Methods**:
- `plan(goal: any, context?: any): Promise<Action[]>` - Plan actions
- `createPlan(taskId, taskType, taskData, priority)` - Legacy method (deprecated)

---

### Executor

**Action Execution Engine** - Execute actions with blockchain integration

**Location**: `packages/agent-kit/src/runtime/executor.ts`

#### Constructor

```typescript
constructor(
  chainClient?: ChainClient,
  contracts?: SomniaContracts,
  config?: ExecutorConfig
)
```

**ExecutorConfig**:
```typescript
interface ExecutorConfig {
  maxRetries?: number;         // Default: 3
  retryDelay?: number;          // Default: 1000ms
  timeout?: number;             // Default: 30000ms
  enableParallel?: boolean;     // Default: true
  dryRun?: boolean;             // Default: false
}
```

#### Methods

##### `execute(action: Action): Promise<ExecutionResult>`

Execute single action with retry logic.

**Parameters**:
- `action`: Action to execute `{ type: string, params: Record<string, any> }`

**Returns**: `Promise<ExecutionResult>`
```typescript
interface ExecutionResult {
  stepId: string;
  status: ExecutionStatus;
  result?: any;
  error?: string;
  retryCount?: number;
  duration: number;
  txReceipt?: TxReceipt;  // For on-chain actions
  dryRun?: boolean;       // Indicates simulation
}
```

**Example**:
```typescript
const executor = new Executor(chainClient, contracts);
const result = await executor.execute({
  type: 'execute_transfer',
  params: { to: '0x123...', amount: '1.0' }
});
console.log('TX Hash:', result.txReceipt?.hash);
```

---

##### `executeAll(actions: Action[]): Promise<ExecutionResult[]>`

Execute multiple actions (parallel or sequential).

**Parameters**:
- `actions`: Array of actions

**Returns**: `Promise<ExecutionResult[]>`

**Example**:
```typescript
const actions = [
  { type: 'validate_address', params: { address: '0x123...' } },
  { type: 'check_balance', params: { amount: '1.0' } },
  { type: 'execute_transfer', params: { to: '0x123...', amount: '1.0' } }
];

const results = await executor.executeAll(actions);
```

---

##### `registerHandler(action: string, handler: Function): void`

Register custom action handler.

**Parameters**:
- `action`: Action type
- `handler`: `async (params: any) => Promise<any>`

**Example**:
```typescript
executor.registerHandler('my_custom_action', async (params) => {
  // Custom logic
  return { success: true, data: params };
});
```

#### Built-in Handlers

- **validate_address**: Validates Ethereum address using ethers.isAddress()
- **validate_contract**: Checks if address has bytecode
- **check_balance**: Gets balance via ChainClient
- **execute_transfer**: Sends ETH transfer with receipt
- **estimate_gas**: Estimates transaction gas
- **approve_token**: Token approval (placeholder)
- **get_quote**: DEX quote (placeholder)
- **execute_swap**: Token swap (placeholder)
- **call_contract**: Contract method call (placeholder)
- **execute**: Generic execution

#### Dry-Run Mode

```typescript
const executor = new Executor(chainClient, contracts, { dryRun: true });
const result = await executor.execute(action);
// No real transaction sent, result.dryRun === true
```

---

### Trigger

**Event Sources** - Blockchain, interval, and webhook triggers

**Location**: `packages/agent-kit/src/runtime/trigger.ts`

#### Interfaces

##### `ITrigger`

Base trigger interface.

```typescript
interface ITrigger {
  start(callback: (data: any) => void): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}
```

#### Trigger Classes

##### `OnChainTrigger`

Listen to blockchain events via ChainClient.

**Constructor**:
```typescript
constructor(
  client: ChainClient,
  contract: ethers.Contract,
  eventName: string,
  filter?: any
)
```

**Usage**:
```typescript
const trigger = new OnChainTrigger(
  chainClient,
  agentRegistry,
  'AgentRegistered',
  { owner: myAddress }
);

await trigger.start((data) => {
  console.log('Event:', data.eventName);
  console.log('Args:', data.args);
  console.log('TX Hash:', data.transactionHash);
});

// Later...
await trigger.stop();
```

---

##### `IntervalTrigger`

Time-based periodic execution.

**Constructor**:
```typescript
constructor(
  intervalMs: number,
  options?: {
    startImmediately?: boolean;
    maxExecutions?: number;
  }
)
```

**Usage**:
```typescript
const trigger = new IntervalTrigger(5000, {
  startImmediately: true,
  maxExecutions: 100
});

await trigger.start((data) => {
  console.log('Execution #', data.execution);
  console.log('Timestamp:', data.timestamp);
});
```

---

##### `WebhookTrigger`

HTTP webhook receiver with Express.

**Constructor**:
```typescript
constructor(options: {
  port: number;
  path: string;
  secret?: string;
})
```

**Usage**:
```typescript
const trigger = new WebhookTrigger({
  port: 3000,
  path: '/webhook',
  secret: 'my-secret'
});

await trigger.start((data) => {
  console.log('Webhook body:', data.body);
  console.log('Headers:', data.headers);
});
```

---

##### `Trigger` (Manager)

Trigger manager with factory methods.

**Methods**:
- `register(config)`: Register trigger
- `enable(triggerId)`: Enable trigger
- `disable(triggerId)`: Disable trigger
- `getAllTriggers()`: Get all registered triggers
- `cleanup()`: Stop and cleanup all triggers
- `createOnChainTrigger(...)`: Factory for OnChainTrigger
- `createIntervalTrigger(...)`: Factory for IntervalTrigger
- `createWebhookTrigger(...)`: Factory for WebhookTrigger

---

### Storage

**Event & Action Persistence** - Memory and file-based storage

**Location**: `packages/agent-kit/src/runtime/storage.ts`

#### Interfaces

##### `IStorage`

Base storage interface for events and actions.

```typescript
interface IStorage {
  saveEvent(event: any, metadata?: Record<string, any>): Promise<void>;
  saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void>;
  getEvents(filter?: any): Promise<EventEntry[]>;
  getActions(filter?: any): Promise<ActionEntry[]>;
  getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }>;
  clear(): Promise<void>;
  size(): Promise<{ events: number; actions: number }>;
}
```

##### `EventEntry`

Event storage format.

```typescript
interface EventEntry {
  id: string;
  event: any;
  timestamp: number;
  agentId?: string;
  metadata?: Record<string, any>;
}
```

##### `ActionEntry`

Action storage format.

```typescript
interface ActionEntry {
  id: string;
  action: any;
  result?: any;
  status?: 'pending' | 'success' | 'failed';
  timestamp: number;
  agentId?: string;
  metadata?: Record<string, any>;
}
```

#### Storage Classes

##### `MemoryStorage`

In-memory storage (perfect for testing).

**Usage**:
```typescript
const storage = new MemoryStorage();
await storage.saveEvent({ type: 'transfer', data: {...} });
await storage.saveAction({ type: 'execute_transfer' }, result);

const history = await storage.getHistory();
console.log('Events:', history.events.length);
console.log('Actions:', history.actions.length);

// Filter by time range
const recent = await storage.getEvents({
  from: Date.now() - 86400000  // Last 24h
});
```

---

##### `FileStorage`

Persistent JSON file storage.

**Constructor**:
```typescript
constructor(filePath: string = './data')
```

**Usage**:
```typescript
const storage = new FileStorage('./agent-data');
await storage.saveEvent(event);
await storage.saveAction(action, result);

// Data persisted to:
// ./agent-data/events.json
// ./agent-data/actions.json

const events = await storage.getEvents();
const actions = await storage.getActions({ status: 'success' });
```

**Features**:
- Auto-creates directories
- Atomic file operations
- Error handling for missing files
- JSON pretty-printing

---

##### `StorageBackend`

Enum for Agent options.

```typescript
enum StorageBackend {
  Memory = 'memory',
  File = 'file',
}
```

**Usage with Agent**:
```typescript
const agent = new Agent(config, {
  storageBackend: StorageBackend.File,
  storagePath: './my-agent-data'
});
```

---

### Policy

**Guards & Access Control** - Operational policies and permissions

**Location**: `packages/agent-kit/src/runtime/policy.ts`

#### Operational Policy

##### `OperationalPolicy`

Configuration for operational guards.

```typescript
interface OperationalPolicy {
  maxGasLimit?: bigint;
  maxRetries?: number;
  maxTransferAmount?: bigint;
  minTransferAmount?: bigint;
  allowedActions?: string[];
  blockedActions?: string[];
  rateLimit?: {
    maxActions: number;
    windowMs: number;
  };
  requireApproval?: boolean;
}
```

#### Methods

##### `checkPermission(address: string, action: string): boolean`

Check if address has permission (for Agent.ts compatibility).

**Returns**: `boolean` - true if allowed

---

##### `shouldExecute(action: Action): boolean`

Main guard - check all operational policies.

**Parameters**:
- `action`: Action to check

**Returns**: `boolean` - true if should execute

**Checks**:
- Action type allowed/blocked?
- Transfer amount within limits?
- Rate limit not exceeded?
- Approval required?

**Example**:
```typescript
const policy = new Policy();
policy.setTransferLimit(0n, ethers.parseEther('10'));
policy.addAllowedAction('execute_transfer');
policy.setRateLimit(10, 60000); // 10 actions per minute

if (policy.shouldExecute(action)) {
  await executor.execute(action);
  policy.recordAction(action.type);
}
```

---

##### `shouldDelay(action: Action): number | false`

Check if action should be delayed.

**Returns**: Delay in milliseconds, or `false` for no delay

**Example**:
```typescript
const delay = policy.shouldDelay(action);
if (delay) {
  console.log(`Waiting ${delay}ms due to rate limit...`);
  await sleep(delay);
}
```

---

##### `overrideAction(action: Action): Action`

Modify action before execution (e.g., cap amounts).

**Returns**: Modified action

**Example**:
```typescript
const finalAction = policy.overrideAction(action);
// If action.params.amount > maxTransferAmount, it's capped
await executor.execute(finalAction);
```

---

#### Convenience Methods

- `setOperationalPolicy(policy: OperationalPolicy)`: Set complete policy
- `getOperationalPolicy()`: Get current policy
- `setGasLimit(limit: bigint)`: Set max gas
- `setRetryLimit(limit: number)`: Set max retries
- `setTransferLimit(min: bigint, max: bigint)`: Set transfer limits
- `addAllowedAction(action: string)`: Whitelist action type
- `addBlockedAction(action: string)`: Blacklist action type
- `setRateLimit(maxActions: number, windowMs: number)`: Set rate limit
- `recordAction(action: string)`: Record for rate limiting
- `clearActionHistory()`: Clear rate limit history

#### Access Control (Enterprise)

For enterprise use cases, Policy also supports rule-based access control:

**Methods**:
- `addRule(rule: PolicyRule)`: Add permission rule
- `removeRule(ruleId: string)`: Remove rule
- `assignRole(role: string, address: string)`: Assign role
- `revokeRole(role: string, address: string)`: Revoke role
- `hasRole(role: string, address: string)`: Check role
- `evaluate(context: PolicyContext)`: Evaluate permission

**Example**:
```typescript
policy.assignRole('admin', '0xOwnerAddress');
policy.addRule({
  name: 'Admin can execute',
  action: 'execute',
  effect: PolicyEffect.Allow,
  conditions: [{ type: 'role', operator: 'eq', field: 'role', value: 'admin' }],
  enabled: true
});
```

---

### Memory

**Agent Memory System** - Short-term and long-term memory for context-aware agents

**Location**: `packages/agent-kit/src/runtime/memory.ts`

#### Overview

The Memory module enables agents to maintain conversational context and state across interactions. It provides:
- **Short-term memory**: Recent interactions within token limits
- **Long-term memory**: Persistent storage of all interactions
- **Context building**: Token-aware context construction for LLMs
- **Multiple backends**: In-memory or file-based storage
- **Session management**: Separate memory spaces for different conversations

#### Types and Interfaces

##### `MemoryType`

```typescript
type MemoryType = 'input' | 'output' | 'state' | 'system';
```

Memory entry types:
- `input`: User inputs, events, goals
- `output`: Agent responses, results
- `state`: Agent state changes
- `system`: System messages, errors

---

##### `MemoryEntry`

Memory entry structure.

```typescript
interface MemoryEntry {
  id: string;
  sessionId: string;
  type: MemoryType;
  content: any;
  timestamp: number;
  tokens?: number;
  metadata?: Record<string, any>;
}
```

---

##### `MemoryBackend`

Interface for storage backends.

```typescript
interface MemoryBackend {
  save(entry: MemoryEntry): Promise<void>;
  load(sessionId: string, filter?: MemoryFilter): Promise<MemoryEntry[]>;
  clear(sessionId?: string): Promise<void>;
  count(sessionId: string): Promise<number>;
}
```

---

##### `MemoryFilter`

Filter options for querying memory.

```typescript
interface MemoryFilter {
  type?: MemoryType;
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
}
```

---

##### `MemoryConfig`

Configuration for Memory instance.

```typescript
interface MemoryConfig {
  backend?: MemoryBackend;
  sessionId?: string;
  maxTokens?: number;    // default: 4000
  maxEntries?: number;   // default: 100
  summarizeOld?: boolean; // default: false
}
```

---

#### Backend Implementations

##### `InMemoryBackend`

Fast in-memory storage (for development/testing).

**Usage**:
```typescript
import { InMemoryBackend, Memory } from '@somnia/agent-kit';

const backend = new InMemoryBackend();
const memory = new Memory({ backend });
```

**Features**:
- Fast read/write operations
- No disk I/O
- Data lost on process restart
- Perfect for testing and development

---

##### `FileBackend`

Persistent JSON file storage.

**Constructor**:
```typescript
constructor(basePath: string = './data/memory')
```

**Usage**:
```typescript
import { FileBackend, Memory } from '@somnia/agent-kit';

const backend = new FileBackend('./agent-memory');
const memory = new Memory({ backend });

// Data persisted to:
// ./agent-memory/<sessionId>.json
```

**Features**:
- Persistent storage across restarts
- One JSON file per session
- Automatic directory creation
- Pretty-printed JSON for debugging

---

#### Memory Class

##### Constructor

```typescript
new Memory(config?: MemoryConfig)
```

**Example**:
```typescript
import { Memory, FileBackend } from '@somnia/agent-kit';

// In-memory (default)
const memory1 = new Memory();

// File-based with custom config
const memory2 = new Memory({
  backend: new FileBackend('./data/memory'),
  sessionId: 'user-123',
  maxTokens: 8000,
  maxEntries: 200
});
```

---

##### `async addMemory(type: MemoryType, content: any, metadata?: Record<string, any>): Promise<string>`

Add memory entry.

**Parameters**:
- `type`: Memory type
- `content`: Content to store (any type)
- `metadata` (optional): Additional metadata

**Returns**: Entry ID

**Example**:
```typescript
const entryId = await memory.addMemory('input', {
  goal: 'Send 1 ETH to Alice',
  sender: '0x123...'
}, {
  agentId: 'agent-001'
});
```

---

##### `async addInput(content: any, metadata?: Record<string, any>): Promise<string>`

Add input memory (convenience method).

**Example**:
```typescript
await memory.addInput({
  type: 'transfer',
  to: '0xAlice...',
  amount: '1.0'
});
```

---

##### `async addOutput(content: any, metadata?: Record<string, any>): Promise<string>`

Add output memory (convenience method).

**Example**:
```typescript
await memory.addOutput({
  tasks: [...],
  results: [...],
  success: true
});
```

---

##### `async addState(content: any, metadata?: Record<string, any>): Promise<string>`

Add state memory (convenience method).

**Example**:
```typescript
await memory.addState({
  state: 'active',
  address: '0x123...'
});
```

---

##### `async getContext(maxTokens?: number): Promise<string>`

**CRITICAL METHOD** - Build context string for LLM within token limit.

**Parameters**:
- `maxTokens` (optional): Max tokens to include (default: from config)

**Returns**: Formatted context string

**Algorithm**:
1. Retrieves all memory entries
2. Starts from most recent
3. Adds entries until token limit reached
4. Formats with timestamps and types
5. Returns chronologically ordered context

**Example**:
```typescript
// Get up to 1000 tokens of context
const context = await memory.getContext(1000);

// Use with LLM
const prompt = `${context}\n\nNew goal: ${userGoal}`;
const response = await llm.generate(prompt);
```

**Output Format**:
```
[2025-01-16T10:30:00.000Z] [INPUT]
{"goal": "Check balance", "sender": "0x123..."}

[2025-01-16T10:30:05.000Z] [OUTPUT]
{"tasks": [...], "results": [...]}
```

---

##### `async getHistory(filter?: MemoryFilter): Promise<MemoryEntry[]>`

Get all memory entries with optional filtering.

**Parameters**:
- `filter` (optional): Filter criteria

**Returns**: Array of memory entries

**Example**:
```typescript
// Get all entries
const all = await memory.getHistory();

// Get only inputs from last hour
const recentInputs = await memory.getHistory({
  type: 'input',
  fromTimestamp: Date.now() - 3600000
});

// Get last 10 entries
const recent = await memory.getHistory({ limit: 10 });
```

---

##### `async getRecent(limit: number = 10): Promise<MemoryEntry[]>`

Get recent memory entries.

**Parameters**:
- `limit`: Number of entries to retrieve

**Returns**: Array of recent entries

**Example**:
```typescript
const last5 = await memory.getRecent(5);
```

---

##### `async getByType(type: MemoryType, limit?: number): Promise<MemoryEntry[]>`

Get memory entries by type.

**Parameters**:
- `type`: Memory type
- `limit` (optional): Limit number of results

**Example**:
```typescript
const inputs = await memory.getByType('input', 20);
const outputs = await memory.getByType('output');
```

---

##### `async clear(): Promise<void>`

Clear all memory for current session.

**Example**:
```typescript
await memory.clear();
console.log('Memory cleared');
```

---

##### `async clearAll(): Promise<void>`

Clear all sessions (all memory).

**Example**:
```typescript
await memory.clearAll();
console.log('All sessions cleared');
```

---

##### `async count(): Promise<number>`

Get memory entry count for current session.

**Returns**: Number of entries

**Example**:
```typescript
const count = await memory.count();
console.log(`Memory has ${count} entries`);
```

---

##### `getSessionId(): string`

Get current session ID.

**Returns**: Session ID string

---

##### `setSessionId(sessionId: string): void`

Switch to different session.

**Parameters**:
- `sessionId`: New session ID

**Example**:
```typescript
// Switch to different user's session
memory.setSessionId('user-456');

// Now all operations use the new session
await memory.addInput({ message: 'Hello' });
```

---

##### `async summarize(): Promise<string>`

Get summary of memory contents.

**Returns**: Summary string with statistics

**Example**:
```typescript
const summary = await memory.summarize();
console.log(summary);
// Session: user-123
// Total entries: 42
// Time range: 2025-01-16T10:00:00.000Z to 2025-01-16T12:00:00.000Z
//
// Entry types:
// - input: 15
// - output: 15
// - state: 10
// - system: 2
```

---

##### `async export(): Promise<MemoryEntry[]>`

Export all memory entries as JSON.

**Returns**: Array of all entries

**Example**:
```typescript
const backup = await memory.export();
await fs.writeFile('backup.json', JSON.stringify(backup, null, 2));
```

---

##### `async import(entries: MemoryEntry[]): Promise<void>`

Import memory entries from JSON.

**Parameters**:
- `entries`: Array of memory entries

**Example**:
```typescript
const backup = JSON.parse(await fs.readFile('backup.json', 'utf-8'));
await memory.import(backup);
console.log('Memory restored');
```

---

#### Integration with Agent

The Agent class automatically integrates with Memory:

**Constructor Options**:
```typescript
interface AgentOptions {
  memoryBackend?: 'memory' | 'file';
  memoryPath?: string;
  sessionId?: string;
  enableMemory?: boolean;  // default: true
}
```

**Agent Methods**:

##### `async addMemory(type: MemoryType, content: any, metadata?: Record<string, any>): Promise<string>`

Add memory entry via agent.

**Example**:
```typescript
const agent = new Agent(config, {
  memoryBackend: 'file',
  memoryPath: './agent-memory'
});

await agent.addMemory('state', { status: 'initialized' });
```

---

##### `async getMemoryContext(maxTokens?: number): Promise<string>`

Get memory context for LLM.

**Example**:
```typescript
const context = await agent.getMemoryContext(1000);
const prompt = `${context}\n\nNew task: ${task}`;
```

---

##### `async getMemoryHistory(limit?: number): Promise<MemoryEntry[]>`

Get memory history.

**Example**:
```typescript
const recent = await agent.getMemoryHistory(10);
```

---

##### `async clearMemory(): Promise<void>`

Clear agent memory.

**Example**:
```typescript
await agent.clearMemory();
```

---

##### `getMemorySessionId(): string`

Get current session ID.

---

##### `setMemorySessionId(sessionId: string): void`

Switch memory session.

**Example**:
```typescript
agent.setMemorySessionId('new-session-123');
```

---

##### `getMemoryModule(): Memory`

Get direct access to Memory instance (for advanced usage).

**Example**:
```typescript
const memory = agent.getMemoryModule();
const stats = await memory.summarize();
```

---

#### Automatic Memory Integration

When an agent processes events, memory is automatically managed:

```typescript
// In agent.onEvent():
// 1. Save incoming event as input
await this.memory.addInput(event, { agentId: this.agentAddress });

// 2. Get memory context for planning
const memoryContext = await this.memory.getContext(1000);
const context = `${event.context}\n\nRecent Memory:\n${memoryContext}`;

// 3. Plan with context
const tasks = await this.planner.plan(event.goal, context);

// 4. Execute tasks
const results = await this.executor.executeAll(tasks);

// 5. Save results as output
await this.memory.addOutput({ tasks, results }, { agentId: this.agentAddress });
```

This creates a complete memory trail of all agent interactions.

---

#### Complete Usage Example

```typescript
import { Agent, AgentConfig, Memory, FileBackend } from '@somnia/agent-kit';

// Option 1: Memory via Agent (recommended)
const agent = new Agent({
  name: 'MyAgent',
  description: 'Agent with memory',
  owner: '0x123...'
}, {
  memoryBackend: 'file',
  memoryPath: './data/memory',
  sessionId: 'user-456',
  enableMemory: true
});

// Memory automatically used in event processing
await agent.start();

// Manual memory operations
await agent.addMemory('system', { status: 'started' });
const context = await agent.getMemoryContext();
const history = await agent.getMemoryHistory(20);

// Option 2: Standalone Memory
const memory = new Memory({
  backend: new FileBackend('./memory'),
  sessionId: 'session-123',
  maxTokens: 4000,
  maxEntries: 100
});

// Add memories
await memory.addInput({ goal: 'Transfer 1 ETH' });
await memory.addOutput({ success: true, txHash: '0x...' });
await memory.addState({ balance: '5.0 ETH' });

// Build context for LLM
const llmContext = await memory.getContext(2000);

// Query memory
const inputs = await memory.getByType('input', 10);
const recent = await memory.getRecent(5);
const filtered = await memory.getHistory({
  type: 'output',
  fromTimestamp: Date.now() - 86400000 // Last 24h
});

// Statistics
console.log(await memory.summarize());
console.log(`Total entries: ${await memory.count()}`);

// Backup/restore
const backup = await memory.export();
await fs.writeFile('backup.json', JSON.stringify(backup));

// Later...
const restored = JSON.parse(await fs.readFile('backup.json', 'utf-8'));
await memory.import(restored);

// Switch sessions
memory.setSessionId('another-session');
```

---

#### Helper Functions

##### `createMemory(sessionId?: string): Memory`

Create memory with in-memory backend.

**Example**:
```typescript
import { createMemory } from '@somnia/agent-kit';

const memory = createMemory('session-123');
```

---

##### `createFileMemory(basePath?: string, sessionId?: string): Memory`

Create memory with file backend.

**Example**:
```typescript
import { createFileMemory } from '@somnia/agent-kit';

const memory = createFileMemory('./data/memory', 'session-123');
```

---

#### Best Practices

1. **Use file backend for production**:
```typescript
const agent = new Agent(config, {
  memoryBackend: 'file',
  memoryPath: './data/memory'
});
```

2. **Set appropriate token limits**:
```typescript
// For GPT-3.5 (4k context)
const context = await memory.getContext(2000);

// For GPT-4 (8k context)
const context = await memory.getContext(6000);
```

3. **Use session IDs for multi-user systems**:
```typescript
const getUserSession = (userId) => `user-${userId}`;
agent.setMemorySessionId(getUserSession(req.user.id));
```

4. **Backup memory periodically**:
```typescript
setInterval(async () => {
  const backup = await memory.export();
  await fs.writeFile(`backup-${Date.now()}.json`, JSON.stringify(backup));
}, 3600000); // Every hour
```

5. **Clean up old sessions**:
```typescript
// Clear old sessions to save disk space
const oldSessionId = 'session-old';
await memory.backend.clear(oldSessionId);
```

---
## LLM Adapters

### Standard Interface: LLMAdapter

All LLM adapters implement a unified `LLMAdapter` interface for consistent usage across different providers.

**Location**: `packages/agent-kit/src/llm/types.ts`

```typescript
interface LLMAdapter {
  readonly name: string;
  generate(input: string, options?: GenerateOptions): Promise<LLMResponse>;
  chat?(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  embed?(text: string, model?: string): Promise<number[]>;
  stream?(input: string, options?: GenerateOptions): AsyncGenerator<string, void, unknown>;
  testConnection?(): Promise<boolean>;
}
```

### Standard Types

#### LLMResponse
```typescript
interface LLMResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'error';
  metadata?: Record<string, any>;
}
```

#### GenerateOptions
```typescript
interface GenerateOptions {
  model?: string;
  temperature?: number;      // 0-2, default: 0.7
  maxTokens?: number;        // default: 1000
  topP?: number;             // 0-1, default: 1.0
  frequencyPenalty?: number; // -2 to 2, default: 0
  presencePenalty?: number;  // -2 to 2, default: 0
  stop?: string[];           // Stop sequences
  timeout?: number;          // Request timeout in ms (default: 30000)
  retries?: number;          // Max retry attempts (default: 3)
}
```

#### Message
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

---

### OpenAIAdapter

**OpenAI GPT Integration** - GPT-3.5, GPT-4, embeddings, streaming

**Location**: `packages/agent-kit/src/llm/openaiAdapter.ts`

#### Constructor

```typescript
new OpenAIAdapter(config: OpenAIConfig)
```

**OpenAIConfig**:
```typescript
interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  baseURL?: string;          // default: 'https://api.openai.com/v1'
  defaultModel?: string;     // default: 'gpt-3.5-turbo'
  timeout?: number;          // default: 30000ms
  retries?: number;          // default: 3
  logger?: LLMLogger;        // Custom logger
}
```

#### Methods

##### `async generate(input: string, options?: GenerateOptions): Promise<LLMResponse>`

Generate text completion.

**Example**:
```typescript
const adapter = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });

const response = await adapter.generate('Explain quantum computing', {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
});

console.log(response.content);
console.log('Tokens used:', response.usage?.totalTokens);
```

---

##### `async chat(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>`

Chat completion with message history.

**Example**:
```typescript
const response = await adapter.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is blockchain?' }
], {
  temperature: 0.3,
  maxTokens: 200,
});

console.log(response.content);
```

---

##### `async embed(text: string, model?: string): Promise<number[]>`

Generate embeddings for semantic search.

**Example**:
```typescript
const embedding = await adapter.embed('Hello world', 'text-embedding-ada-002');
console.log('Vector dimension:', embedding.length); // 1536 for ada-002
```

---

##### `async *stream(input: string, options?: GenerateOptions): AsyncGenerator<string>`

Stream text completion for real-time responses.

**Example**:
```typescript
for await (const chunk of adapter.stream('Write a story about AI')) {
  process.stdout.write(chunk);
}
```

---

##### `async testConnection(): Promise<boolean>`

Test connection to OpenAI API.

**Example**:
```typescript
const isConnected = await adapter.testConnection();
console.log('OpenAI connected:', isConnected);
```

---

### AnthropicAdapter

**Anthropic Claude Integration** - Claude 3 Opus, Sonnet, Haiku

**Location**: `packages/agent-kit/src/llm/anthropicAdapter.ts`

#### Constructor

```typescript
new AnthropicAdapter(config: AnthropicConfig)
```

**AnthropicConfig**:
```typescript
interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;          // default: 'https://api.anthropic.com/v1'
  defaultModel?: string;     // default: 'claude-3-sonnet-20240229'
  timeout?: number;          // default: 30000ms
  retries?: number;          // default: 3
  logger?: LLMLogger;        // Custom logger
}
```

**Supported Models**:
- `claude-3-opus-20240229` - Most powerful, best for complex tasks
- `claude-3-sonnet-20240229` - Balanced performance and speed
- `claude-3-haiku-20240307` - Fastest, best for simple tasks

#### Methods

##### `async generate(input: string, options?: GenerateOptions): Promise<LLMResponse>`

Generate text completion with Claude.

**Example**:
```typescript
const adapter = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await adapter.generate('Analyze this code', {
  model: 'claude-3-opus-20240229',
  temperature: 0.5,
  maxTokens: 1024,
});

console.log(response.content);
console.log('Model:', response.model);
console.log('Tokens:', response.usage);
```

---

##### `async chat(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>`

Chat with message history. System messages are automatically extracted.

**Example**:
```typescript
const response = await adapter.chat([
  { role: 'system', content: 'You are a code review expert.' },
  { role: 'user', content: 'Review this function: ...' }
], {
  model: 'claude-3-sonnet-20240229',
  maxTokens: 2048,
});
```

---

##### `async *stream(input: string, options?: GenerateOptions): AsyncGenerator<string>`

Stream responses from Claude.

**Example**:
```typescript
for await (const chunk of adapter.stream('Write a poem about coding')) {
  process.stdout.write(chunk);
}
```

---

##### `async testConnection(): Promise<boolean>`

Test connection to Anthropic API.

---

### OllamaAdapter

**Local LLM Integration** - Llama, Mistral, and other local models

**Location**: `packages/agent-kit/src/llm/ollamaAdapter.ts`

#### Constructor

```typescript
new OllamaAdapter(config?: OllamaConfig)
```

**OllamaConfig**:
```typescript
interface OllamaConfig {
  baseURL?: string;          // default: 'http://localhost:11434'
  defaultModel?: string;     // default: 'llama2'
  timeout?: number;          // default: 30000ms
  retries?: number;          // default: 3
  logger?: LLMLogger;        // Custom logger
}
```

**Supported Models** (examples):
- `llama2`, `llama3` - Meta's Llama models
- `mistral`, `mixtral` - Mistral AI models
- `codellama` - Code-specialized model
- `phi` - Microsoft's small models

#### Methods

##### `async generate(input: string, options?: GenerateOptions): Promise<LLMResponse>`

Generate text with local model.

**Example**:
```typescript
const adapter = new OllamaAdapter({ baseURL: 'http://localhost:11434' });

const response = await adapter.generate('Explain machine learning', {
  model: 'llama3',
  temperature: 0.8,
  maxTokens: 500,
});

console.log(response.content);
console.log('Evaluation time:', response.metadata?.eval_duration);
```

---

##### `async chat(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>`

Chat completion with local model.

**Example**:
```typescript
const response = await adapter.chat([
  { role: 'system', content: 'You are a helpful coding assistant.' },
  { role: 'user', content: 'How do I sort an array in Python?' }
], {
  model: 'codellama',
});
```

---

##### `async embed(text: string, model?: string): Promise<number[]>`

Generate embeddings with local model.

---

##### `async *stream(input: string, options?: GenerateOptions): AsyncGenerator<string>`

Stream responses from local model.

---

##### `async listModels(): Promise<OllamaModel[]>`

List all available local models.

**Example**:
```typescript
const models = await adapter.listModels();
models.forEach(model => {
  console.log(`${model.name} - ${(model.size / 1e9).toFixed(2)} GB`);
});
```

---

##### `async pullModel(model: string): Promise<void>`

Download a model from Ollama registry.

**Example**:
```typescript
await adapter.pullModel('llama3');
console.log('Model downloaded!');
```

---

##### `async deleteModel(model: string): Promise<void>`

Delete a local model.

---

##### `async hasModel(model: string): Promise<boolean>`

Check if model exists locally.

**Example**:
```typescript
const hasLlama = await adapter.hasModel('llama3');
if (!hasLlama) {
  await adapter.pullModel('llama3');
}
```

---

##### `async testConnection(): Promise<boolean>`

Test connection to Ollama server.

---

### Unified Usage Example

All adapters implement the same interface, making it easy to switch providers:

```typescript
import { OpenAIAdapter, AnthropicAdapter, OllamaAdapter, LLMAdapter } from '@somnia/agent-kit';

// Choose adapter based on environment
let llm: LLMAdapter;

if (process.env.OPENAI_API_KEY) {
  llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
} else if (process.env.ANTHROPIC_API_KEY) {
  llm = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });
} else {
  llm = new OllamaAdapter(); // Use local model
}

// Same interface for all adapters
const response = await llm.generate('Explain blockchain in simple terms', {
  temperature: 0.7,
  maxTokens: 200,
});

console.log(response.content);
console.log('Provider:', llm.name);
console.log('Tokens used:', response.usage?.totalTokens);
```

### Retry and Timeout Configuration

All adapters support automatic retry with exponential backoff:

```typescript
const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,  // 60 second timeout
  retries: 5,      // Retry up to 5 times
});

// Retry logic:
// Attempt 1: immediate
// Attempt 2: wait 1s
// Attempt 3: wait 2s
// Attempt 4: wait 4s
// Attempt 5: wait 8s
// Attempt 6: wait 10s (capped at maxDelay)
```

### Custom Logging

All adapters support custom loggers:

```typescript
import { OpenAIAdapter, LLMLogger } from '@somnia/agent-kit';

class MyLogger implements LLMLogger {
  debug(message: string, data?: any) { /* custom implementation */ }
  info(message: string, data?: any) { /* custom implementation */ }
  warn(message: string, data?: any) { /* custom implementation */ }
  error(message: string, data?: any) { /* custom implementation */ }
}

const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY,
  logger: new MyLogger(),
});
```

---
## Prompt Management

Dynamic prompt building and template system for AI agents.

**Location**: `packages/agent-kit/src/prompt/`

### Overview

The prompt module provides:
- **Templates**: Pre-built prompt templates for common agent tasks
- **Builder**: Dynamic prompt construction with placeholder replacement
- **Validation**: Template validation and variable checking
- **Sanitization**: Security features to prevent prompt injection

---

### Prompt Templates

#### PromptTemplate Interface

```typescript
interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples?: Record<string, any>[];
}
```

#### Built-in Templates

##### ACTION_PLANNER_PROMPT
Plans actions from user goals. Used by `LLMPlanner`.

**Variables**: `goal`, `context`

**Example**:
```typescript
import { getTemplate, buildPrompt } from '@somnia/agent-kit';

const template = getTemplate('action_planner');
const prompt = buildPrompt(template.template, {
  goal: 'Send 1 ETH to Alice',
  context: 'My balance: 5 ETH'
});
```

---

##### BLOCKCHAIN_ANALYZER_PROMPT
Analyzes blockchain state and provides recommendations.

**Variables**: `blockNumber`, `network`, `gasPrice`, `task`, `events`, `state`

**Example**:
```typescript
const prompt = buildFromTemplate('blockchain_analyzer', {
  blockNumber: 1000000,
  network: 'mainnet',
  gasPrice: '20 gwei',
  task: 'Monitor for high-value transfers'
});
```

---

##### EVENT_HANDLER_PROMPT
Handles blockchain events and determines appropriate actions.

**Variables**: `eventType`, `contractAddress`, `blockNumber`, `txHash`, `eventData`, `instructions`

---

##### TRANSACTION_BUILDER_PROMPT
Builds blockchain transactions based on requirements.

**Variables**: `txType`, `target`, `amount`, `data`, `requirements`

---

##### Additional Templates
- **BASIC_AGENT_PROMPT**: General purpose AI agent
- **TOOL_EXECUTOR_PROMPT**: Executes tools and handles results
- **DATA_QUERY_PROMPT**: Queries blockchain data
- **ERROR_HANDLER_PROMPT**: Handles errors and suggests recovery
- **RISK_ASSESSMENT_PROMPT**: Assesses transaction risks

---

### Prompt Builder

#### buildPrompt()

Build prompt from template string and data.

```typescript
function buildPrompt(
  template: string,
  data: Record<string, any>,
  options?: BuildOptions
): string
```

**BuildOptions**:
```typescript
interface BuildOptions {
  strict?: boolean;    // Throw error on missing variables (default: false)
  trim?: boolean;      // Trim whitespace (default: true)
  maxLength?: number;  // Max prompt length
  sanitize?: boolean;  // Sanitize inputs (default: true)
}
```

**Placeholder Syntax**:
- `{{variable}}` - Simple placeholder
- `${variable}` - Alternative syntax
- `{{#if variable}}...{{/if}}` - Conditional blocks

**Example**:
```typescript
import { buildPrompt } from '@somnia/agent-kit';

const template = `You are an AI agent.
Goal: {{goal}}
{{#if context}}
Context: {{context}}
{{/if}}`;

const prompt = buildPrompt(template, {
  goal: 'Check balance',
  context: 'User: 0x123...'
}, {
  strict: true,
  maxLength: 1000
});
```

---

#### buildFromTemplate()

Build prompt from named template.

```typescript
function buildFromTemplate(
  templateName: string,
  data: Record<string, any>,
  options?: BuildOptions
): string
```

**Example**:
```typescript
import { buildFromTemplate } from '@somnia/agent-kit';

const prompt = buildFromTemplate('action_planner', {
  goal: 'Swap 1 ETH for USDC',
  context: 'Balance: 2 ETH'
});
```

---

#### composePrompts()

Combine multiple prompts together.

```typescript
function composePrompts(
  prompts: string[],
  separator?: string  // default: '\n\n'
): string
```

**Example**:
```typescript
import { composePrompts, buildFromTemplate } from '@somnia/agent-kit';

const systemPrompt = buildFromTemplate('basic_agent', { goal: 'Monitor' });
const contextPrompt = 'Current block: 1000000';

const fullPrompt = composePrompts([systemPrompt, contextPrompt]);
```

---

#### injectContext()

Inject context into prompt.

```typescript
function injectContext(
  prompt: string,
  context: Record<string, any>,
  position?: 'start' | 'end'  // default: 'end'
): string
```

**Example**:
```typescript
import { injectContext } from '@somnia/agent-kit';

const prompt = 'Analyze the blockchain state.';
const enhanced = injectContext(prompt, {
  blockNumber: 1000000,
  network: 'mainnet',
  gasPrice: '20 gwei'
}, 'end');

// Result:
// Analyze the blockchain state.
//
// Context:
// - blockNumber: 1000000
// - network: mainnet
// - gasPrice: 20 gwei
```

---

#### sanitizeData()

Sanitize data to prevent injection attacks.

```typescript
function sanitizeData(
  data: Record<string, any>
): Record<string, any>
```

Removes:
- Control characters (\x00-\x1F, \x7F)
- Leading/trailing whitespace
- Recursively sanitizes nested objects

**Example**:
```typescript
import { sanitizeData } from '@somnia/agent-kit';

const dirty = {
  goal: 'Test\x00Goal\n',
  context: '  spaces  '
};

const clean = sanitizeData(dirty);
// { goal: 'TestGoal', context: 'spaces' }
```

---

#### validateTemplate()

Validate template against data.

```typescript
function validateTemplate(
  template: PromptTemplate | string,
  data: Record<string, any>
): { valid: boolean; missing: string[] }
```

**Example**:
```typescript
import { getTemplate, validateTemplate } from '@somnia/agent-kit';

const template = getTemplate('action_planner');
const result = validateTemplate(template, {
  goal: 'Send ETH'
  // missing: context
});

console.log(result);
// { valid: false, missing: ['context'] }
```

---

#### extractVariables()

Extract variables from template string.

```typescript
function extractVariables(template: string): string[]
```

**Example**:
```typescript
import { extractVariables } from '@somnia/agent-kit';

const template = 'Goal: {{goal}}, Context: {{context}}';
const vars = extractVariables(template);
console.log(vars); // ['goal', 'context']
```

---

#### previewTemplate()

Preview template with example data.

```typescript
function previewTemplate(templateName: string): string
```

**Example**:
```typescript
import { previewTemplate } from '@somnia/agent-kit';

const preview = previewTemplate('action_planner');
console.log(preview);
// Shows template name and rendered example
```

---

#### createTemplate()

Create custom prompt template.

```typescript
function createTemplate(
  name: string,
  description: string,
  template: string
): PromptTemplate
```

**Example**:
```typescript
import { createTemplate } from '@somnia/agent-kit';

const myTemplate = createTemplate(
  'my_custom_agent',
  'Custom agent for specific task',
  `You are a custom AI agent.
  Task: {{task}}
  Requirements: {{requirements}}`
);

console.log(myTemplate.variables); // ['task', 'requirements']
```

---

### Template Helpers

#### getTemplate()

Get template by name.

```typescript
function getTemplate(name: string): PromptTemplate | undefined
```

**Example**:
```typescript
import { getTemplate } from '@somnia/agent-kit';

const template = getTemplate('action_planner');
console.log(template.description);
console.log(template.variables);
```

---

#### listTemplates()

List all available templates.

```typescript
function listTemplates(): string[]
```

**Example**:
```typescript
import { listTemplates } from '@somnia/agent-kit';

const templates = listTemplates();
console.log(templates);
// ['basic_agent', 'action_planner', 'blockchain_analyzer', ...]
```

---

#### getTemplateVariables()

Get variables for a template.

```typescript
function getTemplateVariables(name: string): string[]
```

**Example**:
```typescript
import { getTemplateVariables } from '@somnia/agent-kit';

const vars = getTemplateVariables('action_planner');
console.log(vars); // ['goal', 'context']
```

---

### Complete Usage Example

```typescript
import {
  buildFromTemplate,
  composePrompts,
  injectContext,
  validateTemplate,
  getTemplate,
  sanitizeData
} from '@somnia/agent-kit';

// 1. Get and validate template
const template = getTemplate('action_planner');
const data = {
  goal: 'Swap 1 ETH for USDC',
  context: 'Balance: 2 ETH, Gas: 20 gwei'
};

const validation = validateTemplate(template, data);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}

// 2. Sanitize data
const cleanData = sanitizeData(data);

// 3. Build prompt
const prompt = buildFromTemplate('action_planner', cleanData, {
  strict: true,
  trim: true,
  maxLength: 2000
});

// 4. Add additional context
const enhanced = injectContext(prompt, {
  blockNumber: 1000000,
  network: 'mainnet'
});

// 5. Use with LLM
import { OpenAIAdapter } from '@somnia/agent-kit';

const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
const response = await llm.generate(enhanced);
console.log(response.content);
```

---

### Integration with LLMPlanner

The `LLMPlanner` automatically uses the `ACTION_PLANNER_PROMPT` template:

```typescript
import { LLMPlanner, OpenAIAdapter } from '@somnia/agent-kit';

const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
const planner = new LLMPlanner(llm);

// Uses ACTION_PLANNER_PROMPT internally
const actions = await planner.plan('Send 1 ETH to Alice', {
  balance: '5 ETH',
  address: '0x123...'
});
```

You can override with custom prompt:

```typescript
import { LLMPlanner, OpenAIAdapter, buildFromTemplate } from '@somnia/agent-kit';

const customPrompt = buildFromTemplate('my_custom_planner', {...});

const planner = new LLMPlanner(llm, {
  systemPrompt: customPrompt
});
```

---

### Security Best Practices

1. **Always sanitize user input**:
```typescript
const userInput = req.body.goal; // From user
const cleanInput = sanitizeData({ goal: userInput });
const prompt = buildFromTemplate('action_planner', cleanInput);
```

2. **Use strict mode for required variables**:
```typescript
const prompt = buildPrompt(template, data, { strict: true });
```

3. **Enforce max length**:
```typescript
const prompt = buildPrompt(template, data, { maxLength: 2000 });
```

4. **Validate before building**:
```typescript
const validation = validateTemplate(template, data);
if (!validation.valid) {
  throw new Error(`Missing: ${validation.missing.join(', ')}`);
}
```

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
  format?: 'json' | 'pretty'; // default: 'pretty' (uses pino-pretty)
  enableMemoryStorage?: boolean; // default: true
  telemetry?: TelemetryConfig; // Optional telemetry integration
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

**Performance Metrics** - Counters, gauges, histograms, timing, uptime tracking

**Location**: `packages/agent-kit/src/monitor/metrics.ts`

#### Constructor

```typescript
new Metrics(config?: MetricsConfig)
```

**MetricsConfig**:
```typescript
interface MetricsConfig {
  retentionPeriod?: number; // Milliseconds (default: 24 hours)
  maxMetrics?: number; // Maximum metrics to store (default: 10000)
  telemetry?: TelemetryConfig; // Optional telemetry integration
  telemetryInterval?: number; // Auto-export interval in ms (default: 60s)
}
```

#### Core Methods

##### `record(name: string, value: number, tags?: Record<string, string>): void`

Record a metric value.

**Parameters**:
- `name`: Metric name
- `value`: Metric value
- `tags` (optional): Metric tags/labels

---

##### `increment(name: string, value?: number): void`

Increment a counter.

**Parameters**:
- `name`: Counter name
- `value` (optional): Increment value (default: 1)

---

##### `decrement(name: string, value?: number): void`

Decrement a counter.

---

##### `gauge(name: string, value: number): void`

Set a gauge value.

---

##### `histogram(name: string, value: number): void`

Record a histogram value.

---

##### `async time<T>(name: string, fn: () => Promise<T>): Promise<T>`

Time an async operation.

**Example**:
```typescript
const result = await metrics.time('db.query', async () => {
  return await database.query('SELECT * FROM users');
});
```

---

#### Getter Methods

##### `getCounter(name: string): number`

Get counter value.

**Returns**: Counter value (0 if not found)

---

##### `getGauge(name: string): number | undefined`

Get gauge value.

---

##### `getHistogram(name: string): number[]`

Get histogram values.

**Returns**: Array of recorded values

---

##### `getSummary(name: string): MetricSummary | null`

Get metric summary with statistics.

**Returns**: `MetricSummary` with count, sum, avg, min, max, lastValue, lastTimestamp

---

##### `getAllSummaries(): MetricSummary[]`

Get summaries for all metrics.

---

##### `getMetrics(name: string, limit?: number): Metric[]`

Get raw metrics by name.

---

##### `getMetricsByTimeRange(name: string, startTime: number, endTime: number): Metric[]`

Get metrics in time range.

---

##### `getMetricNames(): string[]`

Get all metric names.

---

#### Calculated Metrics

##### `rate(numerator: string, denominator: string): number`

Calculate rate (ratio) between two counters as percentage.

**Example**:
```typescript
// Calculate success rate
const successRate = metrics.rate('tx.success', 'tx.total');
console.log(`Success rate: ${successRate}%`);
```

---

##### `calculateRate(metricName: string, windowMs?: number): number`

Calculate operations per second over time window.

**Parameters**:
- `metricName`: Counter name
- `windowMs` (optional): Time window in milliseconds (default: 60000 = 60s)

**Returns**: Rate per second (TPS for transactions)

**Example**:
```typescript
// Calculate TPS over last 60 seconds
const tps = metrics.calculateRate('tx.total', 60000);
```

---

##### `getPercentile(name: string, percentile: number): number | null`

Calculate percentile for histogram.

**Parameters**:
- `name`: Histogram name
- `percentile`: Percentile (0-100), e.g., 50 for median, 95 for p95, 99 for p99

**Example**:
```typescript
const p95 = metrics.getPercentile('tx.gas_used', 95);
console.log(`95th percentile gas: ${p95}`);
```

---

#### Uptime Tracking

##### `getUptime(): number`

Get uptime in milliseconds since metrics instance creation.

---

##### `resetUptime(): void`

Reset uptime counter.

---

#### Convenience Methods

##### `recordTransaction(success: boolean, gasUsed?: number): void`

Record a blockchain transaction.

**Parameters**:
- `success`: Whether transaction succeeded
- `gasUsed` (optional): Amount of gas used

**Increments**:
- `tx.total` counter
- `tx.success` or `tx.failed` counter
- Records `tx.gas_used` histogram

---

##### `recordLLMCall(duration?: number, success?: boolean): void`

Record an LLM call.

**Parameters**:
- `duration` (optional): Duration in milliseconds
- `success` (optional): Whether call succeeded (default: true)

**Increments**:
- `llm.total` counter
- `llm.success` or `llm.failed` counter
- Records `llm.reasoning_time` histogram

---

##### `recordGasUsed(amount: number): void`

Record gas usage.

---

#### Export Methods

##### `getSnapshot(): Record<string, any>`

Get snapshot of all metrics (alias for export).

**Returns**: Complete metrics snapshot including counters, gauges, histograms, calculated metrics (tx_sent, tx_success_rate, avg_gas_used, llm_calls, reasoning_time, uptime, tps)

---

##### `export(): Record<string, any>`

Export metrics as JSON.

**Returns**: Structured metrics data with counters, gauges, summaries, histograms, and calculated metrics

**Example**:
```typescript
const snapshot = metrics.export();
console.log(`TPS: ${snapshot.tps}`);
console.log(`Success Rate: ${snapshot.tx_success_rate}%`);
console.log(`Uptime: ${snapshot.uptime}ms`);
```

---

##### `clear(name?: string): void`

Clear metrics.

**Parameters**:
- `name` (optional): Clear specific metric, or all if omitted

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

### Telemetry

**Remote Observability** - Send logs and metrics to external monitoring services

**Location**: `packages/agent-kit/src/monitor/telemetry.ts`

#### Supported Formats

- **JSON**: Generic JSON format for custom endpoints
- **Prometheus**: Text format for Prometheus Pushgateway
- **Datadog**: Datadog Series API format
- **OpenTelemetry**: OTLP metrics format

#### Constructor

```typescript
new Telemetry(config?: TelemetryConfig)
```

**TelemetryConfig**:
```typescript
interface TelemetryConfig {
  endpoint?: string; // TELEMETRY_ENDPOINT env var
  format?: 'json' | 'prometheus' | 'datadog' | 'opentelemetry'; // default: 'json'
  batchSize?: number; // Number of items before auto-flush (default: 100)
  flushInterval?: number; // Auto-flush interval in ms (default: 10s)
  enabled?: boolean; // Enable/disable (auto-detected from endpoint)
  retries?: number; // Max retry attempts (default: 3)
  timeout?: number; // Request timeout in ms (default: 5s)
  headers?: Record<string, string>; // Custom headers (API keys, etc.)
  onError?: (error: Error) => void; // Error callback
}
```

#### Methods

##### `send(data: TelemetryData): void`

Send data to telemetry (non-blocking, adds to queue).

**Parameters**:
- `data`: Telemetry data with type ('log', 'metric', 'event'), timestamp, and data payload

**Auto-flushes** when batch size reached.

---

##### `async sendMetrics(metrics: Metrics): Promise<void>`

Send metrics snapshot to telemetry.

**Parameters**:
- `metrics`: Metrics instance

---

##### `async sendLogs(logs: LogEntry[]): Promise<void>`

Send log entries to telemetry.

**Parameters**:
- `logs`: Array of log entries

---

##### `async sendEvent(event: any, tags?: Record<string, string>): Promise<void>`

Send custom event to telemetry.

**Parameters**:
- `event`: Event data
- `tags` (optional): Event tags

---

##### `async flush(): Promise<void>`

Flush queue to endpoint immediately.

**Behavior**:
- Non-blocking async operation
- Batches items from queue
- Formats based on config (JSON, Prometheus, Datadog, OpenTelemetry)
- Retries with exponential backoff (1s → 2s → 4s → 10s max)

---

##### `enable(): void`

Enable telemetry and start auto-flush.

---

##### `disable(): void`

Disable telemetry and stop auto-flush.

---

##### `isEnabled(): boolean`

Check if telemetry is enabled.

---

##### `getQueueSize(): number`

Get current queue size.

---

##### `clearQueue(): void`

Clear telemetry queue.

---

##### `async shutdown(): Promise<void>`

Cleanup and flush remaining data.

**Important**: Call before process exit to ensure all data is sent.

---

#### Helper Functions

##### `createTelemetry(config?: TelemetryConfig): Telemetry`

Create telemetry instance with config.

---

##### `async sendTelemetry(data: any): Promise<void>`

Convenience function to send telemetry using default instance.

**Requires**: `TELEMETRY_ENDPOINT` environment variable

**Example**:
```typescript
import { sendTelemetry } from '@somnia/agent-kit';

// Set endpoint
process.env.TELEMETRY_ENDPOINT = 'https://my-monitoring.com/api';

// Send custom event
await sendTelemetry({
  event: 'agent_started',
  agentId: 'my-agent',
  timestamp: Date.now(),
});
```

---

#### Usage Examples

**Prometheus Integration**:
```typescript
import { Telemetry, Metrics } from '@somnia/agent-kit';

const telemetry = new Telemetry({
  endpoint: 'http://pushgateway:9091/metrics/job/my-agent',
  format: 'prometheus',
  flushInterval: 30000, // 30s
});

const metrics = new Metrics({ telemetry });

// Metrics automatically exported to Prometheus every 30s
metrics.recordTransaction(true, 21000);
```

**Datadog Integration**:
```typescript
const telemetry = new Telemetry({
  endpoint: 'https://api.datadoghq.com/api/v1/series',
  format: 'datadog',
  headers: {
    'DD-API-KEY': process.env.DATADOG_API_KEY,
  },
});
```

**Custom JSON Endpoint**:
```typescript
const telemetry = new Telemetry({
  endpoint: 'https://my-monitoring.com/api/metrics',
  format: 'json',
  batchSize: 50,
  retries: 5,
});

telemetry.send({
  type: 'metric',
  timestamp: Date.now(),
  data: { cpu: 80, memory: 60 },
});
```

---

### Dashboard

**Development Monitoring UI** - Real-time agent monitoring with REST API and HTML UI

**Location**: `packages/agent-kit/src/monitor/dashboard.ts`

#### Constructor

```typescript
new Dashboard(config?: DashboardConfig)
```

**DashboardConfig**:
```typescript
interface DashboardConfig {
  port?: number; // Default: 3001
  enableUI?: boolean; // HTML UI (default: true)
  enableCORS?: boolean; // CORS (default: true)
  logger?: Logger; // Logger instance
  metrics?: Metrics; // Metrics instance
  agent?: any; // Agent instance for status
  onError?: (error: Error) => void; // Error callback
}
```

#### Methods

##### `async start(): Promise<void>`

Start dashboard server.

**Output**: Logs dashboard URL to console

---

##### `async stop(): Promise<void>`

Stop dashboard server.

---

##### `getURL(): string`

Get dashboard URL.

**Returns**: URL string (e.g., `http://localhost:3001`)

---

##### `isRunning(): boolean`

Check if dashboard is running.

---

#### Helper Functions

##### `startDashboard(config: DashboardConfig): Dashboard`

Convenience function to create and start dashboard.

**Returns**: Dashboard instance

**Example**:
```typescript
import { startDashboard, logger, Metrics } from '@somnia/agent-kit';

const metrics = new Metrics();

const dashboard = startDashboard({
  port: 3001,
  logger,
  metrics,
  agent: myAgent,
});

// Open http://localhost:3001 in browser
```

---

#### REST API Endpoints

##### `GET /health`

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

---

##### `GET /metrics`

Get metrics snapshot.

**Response**: Complete metrics data (counters, gauges, histograms, calculated metrics)

**Example**:
```json
{
  "tx_sent": 42,
  "tx_success_rate": 95.2,
  "avg_gas_used": 21000,
  "llm_calls": 15,
  "reasoning_time": 250,
  "uptime": 3600000,
  "tps": 0.7,
  "counters": { ... },
  "gauges": { ... },
  "histograms": { ... }
}
```

---

##### `GET /logs?limit=N`

Get recent logs.

**Query Parameters**:
- `limit` (optional): Number of logs (default: 20)

**Response**:
```json
{
  "logs": [
    {
      "timestamp": 1234567890,
      "level": "info",
      "message": "Transaction sent",
      "context": "Agent",
      "metadata": { "txHash": "0x..." }
    }
  ],
  "total": 20
}
```

---

##### `GET /status`

Get agent status.

**Response**:
```json
{
  "online": true,
  "uptime": 3600000,
  "version": "2.0.0",
  "timestamp": 1234567890,
  "agent": {
    "state": "active",
    "address": "0x...",
    "name": "My Agent"
  }
}
```

---

##### `GET /`

HTML dashboard UI.

**Features**:
- Real-time metrics display
- Recent logs with auto-refresh (10s)
- Agent status with uptime
- Dark theme UI
- Auto-refresh metrics/status every 5s

---

#### Usage Example

**Complete Setup**:
```typescript
import {
  SomniaAgentKit,
  logger,
  Metrics,
  startDashboard,
} from '@somnia/agent-kit';

// Initialize
const kit = await SomniaAgentKit.create({
  rpcUrl: 'https://dream-rpc.somnia.network',
  privateKey: process.env.PRIVATE_KEY,
});

const metrics = new Metrics();

// Start dashboard
const dashboard = startDashboard({
  port: 3001,
  logger,
  metrics,
  agent: kit.agent,
});

// Open http://localhost:3001 to view dashboard

// Use metrics
metrics.recordTransaction(true, 21000);
logger.info('Dashboard running', { url: dashboard.getURL() });

// Cleanup on exit
process.on('SIGINT', async () => {
  await dashboard.stop();
  process.exit(0);
});
```

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

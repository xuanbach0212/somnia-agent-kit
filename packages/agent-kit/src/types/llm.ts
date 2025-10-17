/**
 * LLM Types and Interfaces
 * Standard types for LLM adapters (OpenAI, Anthropic, Ollama, etc.)
 */

// =============================================================================
// Message Types
// =============================================================================

/**
 * Standard message format for chat completion
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// =============================================================================
// Generation Options
// =============================================================================

/**
 * Generation options for LLM
 */
export interface GenerateOptions {
  /** Model name to use */
  model?: string;

  /** Temperature (0-2, higher = more random) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Top-p sampling (0-1) */
  topP?: number;

  /** Frequency penalty (-2 to 2) */
  frequencyPenalty?: number;

  /** Presence penalty (-2 to 2) */
  presencePenalty?: number;

  /** Stop sequences */
  stop?: string[];

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Max retry attempts */
  retries?: number;
}

// =============================================================================
// Token Usage
// =============================================================================

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// =============================================================================
// LLM Response
// =============================================================================

/**
 * Standard LLM response
 */
export interface LLMResponse {
  /** Generated content */
  content: string;

  /** Model used */
  model?: string;

  /** Token usage statistics */
  usage?: TokenUsage;

  /** Reason generation stopped */
  finishReason?: 'stop' | 'length' | 'error';

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// Retry Configuration
// =============================================================================

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;

  /** Initial retry delay in milliseconds */
  retryDelay: number;

  /** Exponential backoff multiplier */
  backoffMultiplier: number;

  /** Maximum delay cap in milliseconds */
  maxDelay: number;
}

// =============================================================================
// LLM Adapter Interface
// =============================================================================

/**
 * Standard LLM Adapter interface
 * All LLM providers must implement this interface
 */
export interface LLMAdapter {
  /**
   * Adapter name (e.g., 'openai', 'anthropic', 'ollama')
   */
  readonly name: string;

  /**
   * Generate text completion from a prompt
   * @param input Prompt string
   * @param options Generation options
   * @returns LLM response
   */
  generate(input: string, options?: GenerateOptions): Promise<LLMResponse>;

  /**
   * Chat completion with message history
   * @param messages Array of messages
   * @param options Generation options
   * @returns LLM response
   */
  chat?(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;

  /**
   * Generate embeddings for text
   * @param text Text to embed
   * @param model Model to use for embeddings
   * @returns Embedding vector
   */
  embed?(text: string, model?: string): Promise<number[]>;

  /**
   * Stream text completion
   * @param input Prompt string
   * @param options Generation options
   * @returns Async generator yielding text chunks
   */
  stream?(
    input: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Test connection to LLM provider
   * @returns true if connection successful
   */
  testConnection?(): Promise<boolean>;
}

// =============================================================================
// Logger Interface
// =============================================================================

/**
 * Logger interface for LLM adapters
 */
export interface LLMLogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

/**
 * Default console logger implementation
 */
export class ConsoleLogger implements LLMLogger {
  debug(message: string, data?: any): void {
    console.debug(`[LLM] ${message}`, data || '');
  }

  info(message: string, data?: any): void {
    console.info(`[LLM] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[LLM] ${message}`, data || '');
  }

  error(message: string, data?: any): void {
    console.error(`[LLM] ${message}`, data || '');
  }
}

// =============================================================================
// Prompt Types
// =============================================================================

/**
 * Prompt payload for building prompts from templates
 */
export interface PromptPayload {
  /** Prompt template string with placeholders */
  template: string;

  /** Variables to inject into template */
  variables: Record<string, any>;

  /** Optional template name (for named templates) */
  templateName?: string;

  /** Build options */
  options?: PromptBuildOptions;
}

/**
 * Options for building prompts from templates
 */
export interface PromptBuildOptions {
  /** Throw error on missing variables (default: false) */
  strict?: boolean;

  /** Trim whitespace (default: true) */
  trim?: boolean;

  /** Max prompt length (default: unlimited) */
  maxLength?: number;

  /** Sanitize inputs (default: true) */
  sanitize?: boolean;
}

/**
 * Prompt template definition
 */
export interface PromptTemplate {
  /** Template name */
  name: string;

  /** Template description */
  description: string;

  /** Template string with placeholders ({{var}} or ${var}) */
  template: string;

  /** Required variables */
  variables: string[];

  /** Usage examples */
  examples?: Record<string, any>[];

  /** Template category */
  category?: 'agent' | 'planner' | 'executor' | 'analyzer' | 'custom';
}

// =============================================================================
// Action & Planning Types
// =============================================================================

/**
 * Base action interface for LLM reasoning
 *
 * NOTE: This is the LLM planning layer action format. For runtime execution,
 * see RuntimeAction in types/action.ts which includes additional fields like
 * id, createdAt, executed, etc.
 *
 * Conversion flow: LLM Action → RuntimeAction → Execution → Storage
 */
export interface Action {
  /** Action type */
  type: string;

  /** Action parameters */
  params: Record<string, any>;
}

/**
 * Action type categories
 */
export enum ActionType {
  // Blockchain operations
  Transfer = 'transfer',
  Swap = 'swap',
  ContractCall = 'contract_call',
  DeployContract = 'deploy_contract',

  // Validation operations
  ValidateAddress = 'validate_address',
  ValidateContract = 'validate_contract',
  CheckBalance = 'check_balance',
  EstimateGas = 'estimate_gas',

  // Token operations
  ApproveToken = 'approve_token',
  GetQuote = 'get_quote',

  // Contract operations
  CallContract = 'call_contract',
  CompileContract = 'compile_contract',
  EstimateDeploymentGas = 'estimate_deployment_gas',

  // Execution operations
  Execute = 'execute',
  ExecuteTransfer = 'execute_transfer',
  ExecuteSwap = 'execute_swap',

  // Data operations
  DataFetch = 'data_fetch',
  QueryData = 'query_data',

  // Special operations
  NoAction = 'no_action',

  // Generic
  Generic = 'generic',
}

/**
 * Structured action plan with reasoning
 */
export interface ActionPlan {
  /** Action type (enum or custom string) */
  type: ActionType | string;

  /** Target address (for blockchain operations) */
  target?: string;

  /** Action parameters */
  params: Record<string, any>;

  /** Reasoning for this action */
  reason: string;

  /** Dependencies (action IDs that must complete first) */
  dependencies?: string[];

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

/**
 * Task execution status
 */
export enum TaskStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/**
 * Execution plan step
 */
export interface PlanStep {
  /** Unique step ID */
  id: string;

  /** Action to execute */
  action: Action | ActionPlan;

  /** Step status */
  status: TaskStatus;

  /** Step result (if completed) */
  result?: any;

  /** Error (if failed) */
  error?: string;

  /** Execution timestamp */
  executedAt?: number;
}

/**
 * Complete execution plan
 */
export interface ExecutionPlan {
  /** Plan steps */
  steps: PlanStep[];

  /** Total number of steps */
  totalSteps: number;

  /** Current step index */
  currentStep: number;

  /** Overall plan status */
  status: TaskStatus;

  /** Plan creation timestamp */
  createdAt?: number;

  /** Plan completion timestamp */
  completedAt?: number;
}

// =============================================================================
// Reasoning Types
// =============================================================================

/**
 * Context for LLM reasoning
 */
export interface ReasoningContext {
  /** User goal/query */
  goal: string;

  /** Current blockchain state */
  chainState?: any;

  /** Agent memory/conversation history */
  memory?: string[];

  /** Available tools/actions */
  availableActions?: string[];

  /** Additional context data */
  context?: Record<string, any>;

  /** User address */
  userAddress?: string;

  /** Agent address */
  agentAddress?: string;
}

/**
 * LLM reasoning result
 */
export interface ReasoningResult {
  /** Generated action plans */
  actions: ActionPlan[];

  /** Reasoning explanation */
  reasoning: string;

  /** Confidence score (0-1) */
  confidence?: number;

  /** LLM response metadata */
  llmResponse: LLMResponse;

  /** Processing latency in milliseconds */
  latencyMs?: number;

  /** Raw LLM output (before parsing) */
  rawOutput?: string;
}

// =============================================================================
// Enhanced Response Types
// =============================================================================

/**
 * Enhanced LLM response with performance metrics
 */
export interface LLMResponseWithMetrics extends LLMResponse {
  /** Request latency in milliseconds */
  latencyMs?: number;

  /** Tokens per second */
  tokensPerSecond?: number;

  /** Estimated cost in USD */
  costEstimate?: number;

  /** Provider name */
  provider?: string;

  /** Request timestamp */
  timestamp?: number;
}

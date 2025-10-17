/**
 * Standard LLM Types and Interfaces
 * Unified interface for all LLM adapters (OpenAI, Anthropic, Ollama, etc.)
 */

/**
 * Standard message format for chat completion
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generation options for LLM
 */
export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  timeout?: number; // Request timeout in ms (default: 30000)
  retries?: number; // Max retry attempts (default: 3)
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Standard LLM response
 */
export interface LLMResponse {
  content: string;
  model?: string;
  usage?: TokenUsage;
  finishReason?: 'stop' | 'length' | 'error';
  metadata?: Record<string, any>;
}

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // Initial delay in ms
  backoffMultiplier: number; // Exponential backoff multiplier (default: 2)
  maxDelay: number; // Max delay cap in ms
}

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

/**
 * LLM Provider - Abstract base class for all LLM implementations
 */

import {
  ChatMessage,
  ChatOptions,
  GenerateOptions,
  LLMConfig,
  ModelInfo,
} from '../llm/types';

export abstract class LLMProvider {
  protected apiKey?: string;
  protected model: string;
  protected baseURL?: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || this.getDefaultModel();
    this.baseURL = config.baseURL;
  }

  /**
   * Get the default model for this provider
   */
  abstract getDefaultModel(): string;

  /**
   * Generate a completion from a prompt
   * @param prompt - The input prompt
   * @param options - Generation options
   * @returns Generated text
   */
  abstract generate(prompt: string, options?: GenerateOptions): Promise<string>;

  /**
   * Chat completion with message history
   * @param messages - Array of chat messages
   * @param options - Chat options
   * @returns Assistant's response
   */
  abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;

  /**
   * Generate embeddings for text (for vector search, RAG, etc.)
   * @param text - Input text to embed
   * @returns Vector embedding
   */
  abstract embed(text: string): Promise<number[]>;

  /**
   * Estimate token count for text
   * @param text - Input text
   * @returns Estimated token count
   */
  abstract estimateTokens(text: string): number;

  /**
   * Get model information
   * @returns Model info including context window, max tokens, etc.
   */
  abstract getModelInfo(): ModelInfo;

  /**
   * Get the current model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

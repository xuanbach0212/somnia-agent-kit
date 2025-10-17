/**
 * Anthropic Claude Integration
 * Adapter for Anthropic API (Claude 3 Opus, Sonnet, Haiku)
 */

import type {
  LLMAdapter,
  LLMResponse,
  Message,
  GenerateOptions,
  RetryConfig,
  LLMLogger,
} from './types';
import { ConsoleLogger } from './types';

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
  retries?: number;
  logger?: LLMLogger;
}

/**
 * Anthropic Adapter for Claude LLM operations
 */
export class AnthropicAdapter implements LLMAdapter {
  readonly name = 'anthropic';
  private config: AnthropicConfig;
  private baseURL: string;
  private logger: LLMLogger;
  private retryConfig: RetryConfig;

  constructor(config: AnthropicConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.anthropic.com/v1';
    this.logger = config.logger || new ConsoleLogger();
    this.retryConfig = {
      maxRetries: config.retries || 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
    };
  }

  /**
   * Generate text completion (implements LLMAdapter interface)
   */
  async generate(input: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      this.logger.debug('Generate request', {
        model: options?.model || this.config.defaultModel,
        inputLength: input.length,
      });

      const response = await this.makeRequestWithRetry('/messages', {
        model: options?.model || this.config.defaultModel || 'claude-3-sonnet-20240229',
        max_tokens: options?.maxTokens || 1024,
        messages: [{ role: 'user', content: input }],
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
      });

      const content = response.content[0]?.text || '';
      const duration = Date.now() - startTime;

      this.logger.info('Generate success', {
        model: response.model,
        tokens: response.usage?.output_tokens,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.input_tokens,
              completionTokens: response.usage.output_tokens,
              totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            }
          : undefined,
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        metadata: {
          id: response.id,
          duration,
        },
      };
    } catch (error) {
      this.logger.error('Generate failed', error);
      throw error;
    }
  }

  /**
   * Chat completion with message history
   */
  async chat(messages: Message[], options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      this.logger.debug('Chat request', {
        model: options?.model || this.config.defaultModel,
        messageCount: messages.length,
      });

      // Convert messages to Anthropic format
      // Anthropic requires alternating user/assistant messages
      const anthropicMessages = this.convertMessages(messages);

      const response = await this.makeRequestWithRetry('/messages', {
        model: options?.model || this.config.defaultModel || 'claude-3-sonnet-20240229',
        max_tokens: options?.maxTokens || 1024,
        messages: anthropicMessages,
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
      });

      const content = response.content[0]?.text || '';
      const duration = Date.now() - startTime;

      this.logger.info('Chat success', {
        model: response.model,
        tokens: response.usage?.output_tokens,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.input_tokens,
              completionTokens: response.usage.output_tokens,
              totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            }
          : undefined,
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        metadata: {
          id: response.id,
          duration,
        },
      };
    } catch (error) {
      this.logger.error('Chat failed', error);
      throw error;
    }
  }

  /**
   * Stream text completion
   */
  async *stream(
    input: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    this.logger.debug('Stream request', {
      model: options?.model || this.config.defaultModel,
    });

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: options?.model || this.config.defaultModel || 'claude-3-sonnet-20240229',
        max_tokens: options?.maxTokens || 1024,
        messages: [{ role: 'user', content: input }],
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} ${response.statusText}${
          error.error?.message ? ` - ${error.error.message}` : ''
        }`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text;
                if (text) {
                  yield text;
                }
              } else if (parsed.type === 'message_stop') {
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Convert standard messages to Anthropic format
   */
  private convertMessages(messages: Message[]): any[] {
    const anthropicMessages: any[] = [];
    let systemMessage = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Anthropic puts system messages in a separate field
        systemMessage += msg.content + '\n';
      } else {
        anthropicMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return anthropicMessages;
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequestWithRetry(endpoint: string, body: any): Promise<any> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.retryDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.warn(`Retry attempt ${attempt}`, { delay });
          await this.sleep(delay);
          delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelay);
        }

        return await this.makeRequest(endpoint, body);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof Error && error.message.includes('401')) {
          throw error; // Authentication error - don't retry
        }

        if (attempt >= this.retryConfig.maxRetries) {
          break;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Make API request
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const timeout = this.config.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Anthropic API error: ${response.status} ${response.statusText}${
            error.error?.message ? ` - ${error.error.message}` : ''
          }`
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generate('Hello', { maxTokens: 10 });
      return true;
    } catch (error) {
      this.logger.error('Connection test failed', error);
      return false;
    }
  }

  /**
   * Count tokens (rough estimate)
   */
  countTokens(text: string): number {
    // Claude uses similar tokenization to GPT
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

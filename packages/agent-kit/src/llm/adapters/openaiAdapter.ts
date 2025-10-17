/**
 * OpenAI GPT Integration
 * Adapter for OpenAI API (GPT-3.5, GPT-4, etc.)
 */

import type {
  LLMAdapter,
  LLMResponse,
  Message,
  GenerateOptions,
  RetryConfig,
  LLMLogger,
} from '../../types/llm';
import { ConsoleLogger } from '../../types/llm';

export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
  retries?: number;
  logger?: LLMLogger;
}

/**
 * OpenAI Adapter for LLM operations
 */
export class OpenAIAdapter implements LLMAdapter {
  readonly name = 'openai';
  private config: OpenAIConfig;
  private baseURL: string;
  private logger: LLMLogger;
  private retryConfig: RetryConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
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
  async generate(prompt: string, options?: GenerateOptions): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      this.logger.debug('Generate request', {
        model: options?.model || this.config.defaultModel,
        inputLength: prompt.length,
      });

      const response = await this.makeRequestWithRetry('/chat/completions', {
        model: options?.model || this.config.defaultModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        top_p: options?.topP || 1.0,
        frequency_penalty: options?.frequencyPenalty || 0,
        presence_penalty: options?.presencePenalty || 0,
        stop: options?.stop,
      });

      const content = response.choices[0]?.message?.content || '';
      const duration = Date.now() - startTime;

      this.logger.info('Generate success', {
        model: response.model,
        tokens: response.usage?.total_tokens,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        finishReason: response.choices[0]?.finish_reason || 'stop',
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

      const response = await this.makeRequestWithRetry('/chat/completions', {
        model: options?.model || this.config.defaultModel || 'gpt-3.5-turbo',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        top_p: options?.topP || 1.0,
        frequency_penalty: options?.frequencyPenalty || 0,
        presence_penalty: options?.presencePenalty || 0,
        stop: options?.stop,
      });

      const content = response.choices[0]?.message?.content || '';
      const duration = Date.now() - startTime;

      this.logger.info('Chat success', {
        model: response.model,
        tokens: response.usage?.total_tokens,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        finishReason: response.choices[0]?.finish_reason || 'stop',
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
   * Generate embeddings
   */
  async embed(text: string, model?: string): Promise<number[]> {
    const response = await this.makeRequest('/embeddings', {
      model: model || 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0]?.embedding || [];
  }

  /**
   * Stream text completion
   */
  async *stream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: options?.model || this.config.defaultModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
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
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
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
        const error = await response.json().catch(() => ({})) as any;
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}${
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
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    if (this.config.organization) {
      headers['OpenAI-Organization'] = this.config.organization;
    }

    return headers;
  }

  /**
   * Count tokens (rough estimate)
   */
  countTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generate('Hello', { maxTokens: 5 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Ollama Local LLM Integration
 * Adapter for local Ollama models (Llama, Mistral, etc.)
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

export interface OllamaConfig {
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
  retries?: number;
  logger?: LLMLogger;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

/**
 * Ollama Adapter for local LLM operations
 */
export class OllamaAdapter implements LLMAdapter {
  readonly name = 'ollama';
  private config: OllamaConfig;
  private baseURL: string;
  private logger: LLMLogger;
  private retryConfig: RetryConfig;

  constructor(config: OllamaConfig = {}) {
    this.config = config;
    this.baseURL = config.baseURL || 'http://localhost:11434';
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

      const response = await this.makeRequestWithRetry('/api/generate', {
        model: options?.model || this.config.defaultModel || 'llama2',
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 1000,
          top_p: options?.topP || 0.9,
          stop: options?.stop,
        },
      });

      const content = response.response || '';
      const duration = Date.now() - startTime;

      this.logger.info('Generate success', {
        model: response.model,
        tokens: response.prompt_eval_count + response.eval_count,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.prompt_eval_count || 0,
          completionTokens: response.eval_count || 0,
          totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
        },
        finishReason: response.done ? 'stop' : 'length',
        metadata: {
          duration,
          eval_duration: response.eval_duration,
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

      const response = await this.makeRequestWithRetry('/api/chat', {
        model: options?.model || this.config.defaultModel || 'llama2',
        messages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 1000,
          top_p: options?.topP || 0.9,
          stop: options?.stop,
        },
      });

      const content = response.message?.content || '';
      const duration = Date.now() - startTime;

      this.logger.info('Chat success', {
        model: response.model,
        tokens: response.prompt_eval_count + response.eval_count,
        duration,
      });

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.prompt_eval_count || 0,
          completionTokens: response.eval_count || 0,
          totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
        },
        finishReason: response.done ? 'stop' : 'length',
        metadata: {
          duration,
          eval_duration: response.eval_duration,
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
    const response = await this.makeRequest('/api/embeddings', {
      model: model || this.config.defaultModel || 'llama2',
      prompt: text,
    });

    return response.embedding || [];
  }

  /**
   * Stream text completion
   */
  async *stream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || this.config.defaultModel || 'llama2',
        prompt,
        stream: true,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 1000,
          top_p: options?.topP || 0.9,
          stop: options?.stop,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              yield parsed.response;
            }
            if (parsed.done) {
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    const response = await fetch(`${this.baseURL}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models || [];
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(model: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    // Wait for pull to complete
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.status === 'success') {
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(model: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
  }

  /**
   * Show model information
   */
  async showModel(model: string): Promise<any> {
    const response = await this.makeRequest('/api/show', { name: model });
    return response;
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
        if (error instanceof Error && error.message.includes('not found')) {
          throw error; // Model not found - don't retry
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
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
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if model exists locally
   */
  async hasModel(model: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some((m) => m.name === model || m.name.startsWith(model + ':'));
    } catch (error) {
      return false;
    }
  }
}

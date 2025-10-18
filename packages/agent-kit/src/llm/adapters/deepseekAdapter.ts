/**
 * DeepSeek LLM Adapter
 * Provides integration with DeepSeek's AI models
 */

import type {
  GenerateOptions,
  LLMAdapter,
  LLMResponse,
  Message,
  TokenUsage,
} from '../../types/llm';

export interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  retries?: number;
}

export class DeepSeekAdapter implements LLMAdapter {
  readonly name = 'deepseek';
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
  }

  /**
   * Generate text completion
   */
  async generate(prompt: string, options?: GenerateOptions): Promise<LLMResponse> {
    const model = options?.model || this.config.defaultModel || 'deepseek-chat';
    const temperature = options?.temperature ?? this.config.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.maxTokens || 2000;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as any;
        throw new Error(
          `DeepSeek API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = (await response.json()) as any;
      const content = data.choices[0]?.message?.content || '';

      const usage: TokenUsage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      return {
        content,
        model,
        usage,
        finishReason: data.choices[0]?.finish_reason === 'stop' ? 'stop' : undefined,
      };
    } catch (error) {
      throw new Error(
        `DeepSeek generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Chat completion with message history
   */
  async chat(messages: Message[], options?: GenerateOptions): Promise<LLMResponse> {
    const model = options?.model || this.config.defaultModel || 'deepseek-chat';
    const temperature = options?.temperature ?? this.config.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || this.config.maxTokens || 2000;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as any;
        throw new Error(
          `DeepSeek API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = (await response.json()) as any;
      const content = data.choices[0]?.message?.content || '';

      const usage: TokenUsage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      return {
        content,
        model,
        usage,
        finishReason: data.choices[0]?.finish_reason === 'stop' ? 'stop' : undefined,
      };
    } catch (error) {
      throw new Error(
        `DeepSeek chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate embeddings (optional - not supported by DeepSeek)
   */
  async embed(text: string, model?: string): Promise<number[]> {
    throw new Error('DeepSeek embeddings not yet supported');
  }

  /**
   * Stream completion (optional - not implemented yet)
   */
  async *stream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    throw new Error('DeepSeek streaming not yet implemented');
  }

  /**
   * Test connection to DeepSeek API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generate('Hello', { maxTokens: 10 });
      return response.content.length > 0;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      return false;
    }
  }
}

/**
 * Anthropic Claude Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../core/LLMProvider';
import {
  AnthropicConfig,
  ChatMessage,
  ChatOptions,
  GenerateOptions,
  ModelInfo,
} from './types';

export class AnthropicProvider extends LLMProvider {
  private client: Anthropic;

  constructor(config: AnthropicConfig) {
    super(config);

    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
    });
  }

  getDefaultModel(): string {
    return 'claude-3-haiku-20240307';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      throw new Error(
        `Anthropic generate failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    try {
      // Anthropic requires system messages to be separate
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      throw new Error(
        `Anthropic chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    // Anthropic doesn't provide embedding API yet
    // Users should use OpenAI or another provider for embeddings
    throw new Error(
      'Anthropic does not provide embedding API. Use OpenAI or another provider for embeddings.'
    );
  }

  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    // Claude uses similar tokenization to GPT models
    return Math.ceil(text.length / 4);
  }

  getModelInfo(): ModelInfo {
    const modelInfoMap: Record<string, ModelInfo> = {
      'claude-3-opus-20240229': {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        contextWindow: 200000,
        maxOutputTokens: 4096,
      },
      'claude-3-sonnet-20240229': {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        contextWindow: 200000,
        maxOutputTokens: 4096,
      },
      'claude-3-haiku-20240307': {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        contextWindow: 200000,
        maxOutputTokens: 4096,
      },
      'claude-3-5-sonnet-20240620': {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20240620',
        contextWindow: 200000,
        maxOutputTokens: 8192,
      },
    };

    return (
      modelInfoMap[this.model] || {
        provider: 'anthropic',
        model: this.model,
        contextWindow: 200000,
        maxOutputTokens: 4096,
      }
    );
  }
}

/**
 * OpenAI Provider Implementation
 */

import OpenAI from 'openai';
import { LLMProvider } from '../core/LLMProvider';
import {
  ChatMessage,
  ChatOptions,
  GenerateOptions,
  ModelInfo,
  OpenAIConfig,
} from './types';

export class OpenAIProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: OpenAIConfig) {
    super(config);

    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      organization: config.organization,
    });
  }

  getDefaultModel(): string {
    return 'gpt-3.5-turbo';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP,
        stop: options?.stopSequences,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(
        `OpenAI generate failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP,
        stop: options?.stopSequences,
        stream: options?.stream || false,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(
        `OpenAI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      throw new Error(
        `OpenAI embed failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English text
    // This is a simple heuristic, for production use tiktoken library
    return Math.ceil(text.length / 4);
  }

  getModelInfo(): ModelInfo {
    const modelInfoMap: Record<string, ModelInfo> = {
      'gpt-3.5-turbo': {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        contextWindow: 16385,
        maxOutputTokens: 4096,
      },
      'gpt-4': {
        provider: 'openai',
        model: 'gpt-4',
        contextWindow: 8192,
        maxOutputTokens: 4096,
      },
      'gpt-4-turbo': {
        provider: 'openai',
        model: 'gpt-4-turbo',
        contextWindow: 128000,
        maxOutputTokens: 4096,
      },
      'gpt-4o': {
        provider: 'openai',
        model: 'gpt-4o',
        contextWindow: 128000,
        maxOutputTokens: 4096,
      },
    };

    return (
      modelInfoMap[this.model] || {
        provider: 'openai',
        model: this.model,
        contextWindow: 16385,
        maxOutputTokens: 4096,
      }
    );
  }
}

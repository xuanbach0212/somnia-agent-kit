/**
 * Mock LLM Provider for Testing
 * Use this when you don't have API keys or for testing
 */

import { LLMProvider } from '../core/LLMProvider';
import {
  ChatMessage,
  ChatOptions,
  GenerateOptions,
  LLMConfig,
  ModelInfo,
} from './types';

export class MockProvider extends LLMProvider {
  private responseDelay: number;

  constructor(config: LLMConfig & { responseDelay?: number } = {}) {
    super(config);
    this.responseDelay = config.responseDelay || 100; // ms
  }

  getDefaultModel(): string {
    return 'mock-model-v1';
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.responseDelay));
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    await this.delay();

    const truncatedPrompt =
      prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt;

    return `[MOCK RESPONSE] Generated response to prompt: "${truncatedPrompt}"

This is a mock LLM response. Configure a real LLM provider (OpenAI or Anthropic) to get actual AI responses.

Prompt length: ${prompt.length} characters
Estimated tokens: ${this.estimateTokens(prompt)}
Max tokens requested: ${options?.maxTokens || 'default'}
Temperature: ${options?.temperature || 'default'}`;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    await this.delay();

    const lastMessage = messages[messages.length - 1];
    const messageCount = messages.length;
    const hasSystem = messages.some((m) => m.role === 'system');

    return `[MOCK RESPONSE] Chat response to: "${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}"

This is a mock chat response. Configure a real LLM provider to get actual AI chat.

Conversation context:
- Total messages: ${messageCount}
- Has system message: ${hasSystem}
- Last message role: ${lastMessage.role}
- Options: ${JSON.stringify(options || {}, null, 2)}`;
  }

  async embed(text: string): Promise<number[]> {
    await this.delay();

    // Generate deterministic "random" embedding based on text
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };

    // Return 1536-dimensional vector (OpenAI standard)
    return Array(1536)
      .fill(0)
      .map((_, i) => random(i) * 2 - 1); // values between -1 and 1
  }

  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  getModelInfo(): ModelInfo {
    return {
      provider: 'mock',
      model: this.model,
      contextWindow: 100000,
      maxOutputTokens: 4096,
    };
  }

  /**
   * Set custom response for testing
   */
  setMockResponse(response: string): void {
    this.mockResponse = response;
  }

  private mockResponse?: string;

  async generateWithMock(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    await this.delay();
    return this.mockResponse || (await this.generate(prompt, options));
  }
}

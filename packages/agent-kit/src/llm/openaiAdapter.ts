/**
 * OpenAI GPT Integration
 * Adapter for OpenAI API (GPT-3.5, GPT-4, etc.)
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  baseURL?: string;
  defaultModel?: string;
}

/**
 * OpenAI Adapter for LLM operations
 */
export class OpenAIAdapter {
  private config: OpenAIConfig;
  private baseURL: string;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
  }

  /**
   * Generate text completion
   */
  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await this.makeRequest('/chat/completions', {
      model: options?.model || this.config.defaultModel || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      top_p: options?.topP || 1.0,
      frequency_penalty: options?.frequencyPenalty || 0,
      presence_penalty: options?.presencePenalty || 0,
      stop: options?.stop,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Chat completion with message history
   */
  async chat(messages: Message[], options?: GenerateOptions): Promise<string> {
    const response = await this.makeRequest('/chat/completions', {
      model: options?.model || this.config.defaultModel || 'gpt-3.5-turbo',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      top_p: options?.topP || 1.0,
      frequency_penalty: options?.frequencyPenalty || 0,
      presence_penalty: options?.presencePenalty || 0,
      stop: options?.stop,
    });

    return response.choices[0]?.message?.content || '';
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
   * Make API request
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}${
          error.error?.message ? ` - ${error.error.message}` : ''
        }`
      );
    }

    return response.json();
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

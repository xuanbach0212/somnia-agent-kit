/**
 * Ollama Local LLM Integration
 * Adapter for local Ollama models (Llama, Mistral, etc.)
 */

import type { Message, GenerateOptions } from './openaiAdapter';

export interface OllamaConfig {
  baseURL?: string;
  defaultModel?: string;
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
export class OllamaAdapter {
  private config: OllamaConfig;
  private baseURL: string;

  constructor(config: OllamaConfig = {}) {
    this.config = config;
    this.baseURL = config.baseURL || 'http://localhost:11434';
  }

  /**
   * Generate text completion
   */
  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await this.makeRequest('/api/generate', {
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

    return response.response || '';
  }

  /**
   * Chat completion with message history
   */
  async chat(messages: Message[], options?: GenerateOptions): Promise<string> {
    const response = await this.makeRequest('/api/chat', {
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

    return response.message?.content || '';
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
   * Make API request
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

/**
 * LLM Type Definitions
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string; // for custom endpoints
}

export interface OpenAIConfig extends LLMConfig {
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o';
  organization?: string;
}

export interface AnthropicConfig extends LLMConfig {
  model?:
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
    | 'claude-3-5-sonnet-20240620';
}

// ============================================================================
// Message Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ============================================================================
// Options Types
// ============================================================================

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface ChatOptions extends GenerateOptions {
  stream?: boolean;
}

// ============================================================================
// Model Info Types
// ============================================================================

export interface ModelInfo {
  provider: string;
  model: string;
  contextWindow: number;
  maxOutputTokens: number;
}

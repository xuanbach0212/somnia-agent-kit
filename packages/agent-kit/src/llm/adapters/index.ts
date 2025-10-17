/**
 * LLM Provider Adapters
 * Unified interface for different LLM providers
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * // Import specific adapter
 * import { OpenAIAdapter } from '@somnia/agent-kit/llm/adapters';
 * import { OllamaAdapter } from '@somnia/agent-kit/llm/adapters';
 *
 * // Create OpenAI adapter
 * const openai = new OpenAIAdapter({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   defaultModel: 'gpt-4'
 * });
 *
 * // Create Ollama adapter (local)
 * const ollama = new OllamaAdapter({
 *   baseURL: 'http://localhost:11434',
 *   defaultModel: 'llama3'
 * });
 * ```
 */

export { OpenAIAdapter } from './openaiAdapter';
export { OllamaAdapter } from './ollamaAdapter';

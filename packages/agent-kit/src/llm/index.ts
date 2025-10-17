/**
 * LLM Module - AI Reasoning & LLM Integration
 * Provider-agnostic interface for AI language models
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * // Import adapters
 * import { OpenAIAdapter, OllamaAdapter } from '@somnia/agent-kit/llm/adapters';
 *
 * // Import prompt management
 * import { buildPrompt, getTemplate } from '@somnia/agent-kit/llm/prompt';
 *
 * // Import planner and reasoner
 * import { LLMPlanner, MultiStepReasoner } from '@somnia/agent-kit/llm';
 *
 * // Create adapter
 * const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
 *
 * // Use planner
 * const planner = new LLMPlanner(llm);
 * const plans = await planner.planWithReason('Send 1 ETH to Alice');
 *
 * // Use reasoner
 * const reasoner = new MultiStepReasoner(llm);
 * const trace = await reasoner.chainOfThought('Should I execute this transaction?');
 * ```
 */

// LLM Adapters (from adapters/ subfolder)
export * from './adapters';

// Prompt Management (from prompt/ subfolder)
export * from './prompt';

// LLM-specific modules (keep memory internal to avoid conflicts with runtime)
// export * from './memory';  // Internal to LLM module
export * from './context';
export * from './planner';
export * from './reasoning';

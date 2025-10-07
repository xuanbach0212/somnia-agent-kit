/**
 * Somnia AI Agent Framework
 * Main SDK entry point
 */

// Core exports
export { SomniaClient } from './core/SomniaClient';
export { SomniaAgent } from './core/SomniaAgent';
export { LLMProvider } from './core/LLMProvider';

// LLM Providers (core feature)
export { OpenAIProvider } from './llm/OpenAIProvider';
export { AnthropicProvider } from './llm/AnthropicProvider';
export { MockProvider } from './llm/MockProvider';

// Monitoring (keep existing)
export { AgentMonitor } from './monitoring/AgentMonitor';
export { MetricsCollector } from './monitoring/MetricsCollector';
export { MonitoringClient } from './monitoring/MonitoringClient';

// Utils
export { Logger } from './utils/logger';
export { IPFSManager } from './utils/ipfs';
export * from './utils/contracts';

// Types
export * from './core/types';
export * from './llm/types';

// Re-export for convenience
export { SomniaClient as default } from './core/SomniaClient';

/**
 * Agent Memory System
 * Manages short-term and long-term memory for agents
 * Enables context-aware conversations and state persistence
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type {
  MemoryType,
  MemoryEntry,
  MemoryBackend,
  MemoryFilter,
  MemoryConfig,
} from '../types/memory';

// Re-export types for backward compatibility
export { MemoryType, MemoryEntry, MemoryBackend, MemoryFilter, MemoryConfig };

// =============================================================================
// In-Memory Backend
// =============================================================================

/**
 * In-memory storage backend (fast, for development)
 */
export class InMemoryBackend implements MemoryBackend {
  private storage: Map<string, MemoryEntry[]> = new Map();

  async save(entry: MemoryEntry): Promise<void> {
    const entries = this.storage.get(entry.sessionId) || [];
    entries.push(entry);
    this.storage.set(entry.sessionId, entries);
  }

  async load(sessionId: string, filter?: MemoryFilter): Promise<MemoryEntry[]> {
    let entries = this.storage.get(sessionId) || [];

    // Apply filters
    if (filter) {
      if (filter.type) {
        entries = entries.filter((e) => e.type === filter.type);
      }
      if (filter.fromTimestamp) {
        entries = entries.filter((e) => e.timestamp >= filter.fromTimestamp!);
      }
      if (filter.toTimestamp) {
        entries = entries.filter((e) => e.timestamp <= filter.toTimestamp!);
      }
      if (filter.limit) {
        entries = entries.slice(-filter.limit);
      }
    }

    return entries;
  }

  async clear(sessionId?: string): Promise<void> {
    if (sessionId) {
      this.storage.delete(sessionId);
    } else {
      this.storage.clear();
    }
  }

  async count(sessionId: string): Promise<number> {
    const entries = this.storage.get(sessionId) || [];
    return entries.length;
  }
}

// =============================================================================
// File-based Backend
// =============================================================================

/**
 * File-based storage backend (persistent JSON)
 */
export class FileBackend implements MemoryBackend {
  private basePath: string;
  private initialized: boolean = false;

  constructor(basePath: string = './data/memory') {
    this.basePath = basePath;
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    await fs.mkdir(this.basePath, { recursive: true });
    this.initialized = true;
  }

  private getFilePath(sessionId: string): string {
    return path.join(this.basePath, `${sessionId}.json`);
  }

  async save(entry: MemoryEntry): Promise<void> {
    await this.init();
    const filePath = this.getFilePath(entry.sessionId);

    let entries: MemoryEntry[] = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      entries = JSON.parse(data);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    entries.push(entry);
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
  }

  async load(sessionId: string, filter?: MemoryFilter): Promise<MemoryEntry[]> {
    await this.init();
    const filePath = this.getFilePath(sessionId);

    let entries: MemoryEntry[] = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      entries = JSON.parse(data);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return [];
    }

    // Apply filters
    if (filter) {
      if (filter.type) {
        entries = entries.filter((e) => e.type === filter.type);
      }
      if (filter.fromTimestamp) {
        entries = entries.filter((e) => e.timestamp >= filter.fromTimestamp!);
      }
      if (filter.toTimestamp) {
        entries = entries.filter((e) => e.timestamp <= filter.toTimestamp!);
      }
      if (filter.limit) {
        entries = entries.slice(-filter.limit);
      }
    }

    return entries;
  }

  async clear(sessionId?: string): Promise<void> {
    await this.init();

    if (sessionId) {
      const filePath = this.getFilePath(sessionId);
      try {
        await fs.unlink(filePath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    } else {
      // Clear all sessions
      const files = await fs.readdir(this.basePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.basePath, file));
        }
      }
    }
  }

  async count(sessionId: string): Promise<number> {
    const entries = await this.load(sessionId);
    return entries.length;
  }
}

// =============================================================================
// Memory Manager
// =============================================================================

/**
 * Memory manager for agents
 * Manages short-term and long-term memory with context building
 */
export class Memory {
  private backend: MemoryBackend;
  private sessionId: string;
  private config: Required<MemoryConfig>;

  constructor(config: MemoryConfig = {}) {
    this.backend = config.backend || new InMemoryBackend();
    this.sessionId = config.sessionId || this.generateSessionId();
    this.config = {
      backend: this.backend,
      sessionId: this.sessionId,
      maxTokens: config.maxTokens || 4000,
      maxEntries: config.maxEntries || 100,
      summarizeOld: config.summarizeOld || false,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add memory entry
   */
  async addMemory(
    type: MemoryType,
    content: any,
    metadata?: Record<string, any>
  ): Promise<string> {
    const entry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      type,
      content,
      timestamp: Date.now(),
      tokens: this.estimateTokens(content),
      metadata,
    };

    await this.backend.save(entry);

    // Check if we need to cleanup old entries
    const count = await this.backend.count(this.sessionId);
    if (count > this.config.maxEntries) {
      await this.cleanup();
    }

    return entry.id;
  }

  /**
   * Add input memory
   */
  async addInput(content: any, metadata?: Record<string, any>): Promise<string> {
    return this.addMemory('input', content, metadata);
  }

  /**
   * Add output memory
   */
  async addOutput(content: any, metadata?: Record<string, any>): Promise<string> {
    return this.addMemory('output', content, metadata);
  }

  /**
   * Add state memory
   */
  async addState(content: any, metadata?: Record<string, any>): Promise<string> {
    return this.addMemory('state', content, metadata);
  }

  /**
   * Get context for LLM
   * Builds a context string from recent memories within token limit
   */
  async getContext(maxTokens?: number): Promise<string> {
    const limit = maxTokens || this.config.maxTokens;
    const entries = await this.getHistory();

    const contextParts: string[] = [];
    let totalTokens = 0;

    // Build context from most recent entries first
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      const entryTokens = entry.tokens || this.estimateTokens(entry.content);

      if (totalTokens + entryTokens > limit) {
        break; // Stop if we exceed token limit
      }

      const formatted = this.formatEntry(entry);
      contextParts.unshift(formatted); // Add to beginning
      totalTokens += entryTokens;
    }

    return contextParts.join('\n\n');
  }

  /**
   * Format memory entry for context
   */
  private formatEntry(entry: MemoryEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const content =
      typeof entry.content === 'string'
        ? entry.content
        : JSON.stringify(entry.content, null, 2);

    return `[${timestamp}] [${entry.type.toUpperCase()}]\n${content}`;
  }

  /**
   * Get memory history
   */
  async getHistory(filter?: MemoryFilter): Promise<MemoryEntry[]> {
    return this.backend.load(this.sessionId, filter);
  }

  /**
   * Get recent memories
   */
  async getRecent(limit: number = 10): Promise<MemoryEntry[]> {
    return this.backend.load(this.sessionId, { limit });
  }

  /**
   * Get memories by type
   */
  async getByType(type: MemoryType, limit?: number): Promise<MemoryEntry[]> {
    return this.backend.load(this.sessionId, { type, limit });
  }

  /**
   * Clear memory
   */
  async clear(): Promise<void> {
    await this.backend.clear(this.sessionId);
  }

  /**
   * Clear all sessions
   */
  async clearAll(): Promise<void> {
    await this.backend.clear();
  }

  /**
   * Get memory count
   */
  async count(): Promise<number> {
    return this.backend.count(this.sessionId);
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Set session ID (switch sessions)
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Cleanup old entries
   * Keeps only the most recent maxEntries
   */
  private async cleanup(): Promise<void> {
    const entries = await this.getHistory();
    const toKeep = entries.slice(-this.config.maxEntries);

    // Clear and re-add
    await this.clear();
    for (const entry of toKeep) {
      await this.backend.save(entry);
    }
  }

  /**
   * Estimate token count
   * Rough estimate: ~4 characters per token
   */
  private estimateTokens(content: any): number {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    return Math.ceil(text.length / 4);
  }

  /**
   * Summarize memory
   * Returns a summary of the conversation history
   */
  async summarize(): Promise<string> {
    const entries = await this.getHistory();

    if (entries.length === 0) {
      return 'No memory entries to summarize.';
    }

    const summary: string[] = [
      `Session: ${this.sessionId}`,
      `Total entries: ${entries.length}`,
      `Time range: ${new Date(entries[0].timestamp).toISOString()} to ${new Date(entries[entries.length - 1].timestamp).toISOString()}`,
      '',
      'Entry types:',
    ];

    // Count by type
    const typeCounts: Record<string, number> = {};
    for (const entry of entries) {
      typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
    }

    for (const [type, count] of Object.entries(typeCounts)) {
      summary.push(`- ${type}: ${count}`);
    }

    return summary.join('\n');
  }

  /**
   * Export memory
   * Returns all entries as JSON
   */
  async export(): Promise<MemoryEntry[]> {
    return this.getHistory();
  }

  /**
   * Import memory
   * Loads entries from JSON
   */
  async import(entries: MemoryEntry[]): Promise<void> {
    await this.clear();
    for (const entry of entries) {
      // Update session ID
      entry.sessionId = this.sessionId;
      await this.backend.save(entry);
    }
  }
}

/**
 * Create memory with in-memory backend
 */
export function createMemory(sessionId?: string): Memory {
  return new Memory({
    backend: new InMemoryBackend(),
    sessionId,
  });
}

/**
 * Create memory with file backend
 */
export function createFileMemory(basePath?: string, sessionId?: string): Memory {
  return new Memory({
    backend: new FileBackend(basePath),
    sessionId,
  });
}

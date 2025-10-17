/**
 * State Persistence Layer
 * Manages agent state storage (on-chain and off-chain)
 * Includes specialized storage for events and actions
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type {
  StorageBackend,
  StorageType,
  EventEntry,
  ActionEntry,
  IStorage,
} from '../types/storage';

// Re-export types for backward compatibility
export { StorageBackend, StorageType, EventEntry, ActionEntry, IStorage };

// =============================================================================
// MemoryStorage - In-memory storage for testing
// =============================================================================

/**
 * In-memory storage implementation
 * Perfect for testing and development
 */
export class MemoryStorage implements IStorage {
  events: EventEntry[] = [];
  actions: ActionEntry[] = [];

  async saveEvent(event: any, metadata?: Record<string, any>): Promise<void> {
    const entry: EventEntry = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: Date.now(),
      metadata,
    };
    this.events.push(entry);
  }

  async saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void> {
    const entry: ActionEntry = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      result,
      status: result ? 'success' : 'pending',
      timestamp: Date.now(),
      metadata,
    };
    this.actions.push(entry);
  }

  async getEvents(filter?: any): Promise<EventEntry[]> {
    if (!filter) {
      return [...this.events];
    }

    // Simple filtering by timestamp range
    if (filter.from || filter.to) {
      return this.events.filter((e) => {
        if (filter.from && e.timestamp < filter.from) return false;
        if (filter.to && e.timestamp > filter.to) return false;
        return true;
      });
    }

    return [...this.events];
  }

  async getActions(filter?: any): Promise<ActionEntry[]> {
    if (!filter) {
      return [...this.actions];
    }

    // Simple filtering
    if (filter.from || filter.to || filter.status) {
      return this.actions.filter((a) => {
        if (filter.from && a.timestamp < filter.from) return false;
        if (filter.to && a.timestamp > filter.to) return false;
        if (filter.status && a.status !== filter.status) return false;
        return true;
      });
    }

    return [...this.actions];
  }

  async getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }> {
    return {
      events: [...this.events],
      actions: [...this.actions],
    };
  }

  async clear(): Promise<void> {
    this.events = [];
    this.actions = [];
  }

  async size(): Promise<{ events: number; actions: number }> {
    return {
      events: this.events.length,
      actions: this.actions.length,
    };
  }
}

// =============================================================================
// FileStorage - Persistent JSON file storage
// =============================================================================

/**
 * File-based storage implementation
 * Writes events and actions to JSON files
 */
export class FileStorage implements IStorage {
  private filePath: string;
  private eventsFile: string;
  private actionsFile: string;
  private initialized: boolean = false;

  constructor(filePath: string = './data') {
    this.filePath = filePath;
    this.eventsFile = path.join(filePath, 'events.json');
    this.actionsFile = path.join(filePath, 'actions.json');
  }

  /**
   * Initialize storage directory
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.filePath, { recursive: true });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize storage directory:', error);
      throw error;
    }
  }

  /**
   * Read events from file
   */
  private async readEvents(): Promise<EventEntry[]> {
    await this.init();

    try {
      const data = await fs.readFile(this.eventsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Write events to file
   */
  private async writeEvents(events: EventEntry[]): Promise<void> {
    await this.init();
    await fs.writeFile(this.eventsFile, JSON.stringify(events, null, 2), 'utf-8');
  }

  /**
   * Read actions from file
   */
  private async readActions(): Promise<ActionEntry[]> {
    await this.init();

    try {
      const data = await fs.readFile(this.actionsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Write actions to file
   */
  private async writeActions(actions: ActionEntry[]): Promise<void> {
    await this.init();
    await fs.writeFile(this.actionsFile, JSON.stringify(actions, null, 2), 'utf-8');
  }

  async saveEvent(event: any, metadata?: Record<string, any>): Promise<void> {
    const events = await this.readEvents();
    const entry: EventEntry = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: Date.now(),
      metadata,
    };
    events.push(entry);
    await this.writeEvents(events);
  }

  async saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void> {
    const actions = await this.readActions();
    const entry: ActionEntry = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      result,
      status: result ? 'success' : 'pending',
      timestamp: Date.now(),
      metadata,
    };
    actions.push(entry);
    await this.writeActions(actions);
  }

  async getEvents(filter?: any): Promise<EventEntry[]> {
    const events = await this.readEvents();

    if (!filter) {
      return events;
    }

    // Filter by timestamp range
    if (filter.from || filter.to) {
      return events.filter((e) => {
        if (filter.from && e.timestamp < filter.from) return false;
        if (filter.to && e.timestamp > filter.to) return false;
        return true;
      });
    }

    return events;
  }

  async getActions(filter?: any): Promise<ActionEntry[]> {
    const actions = await this.readActions();

    if (!filter) {
      return actions;
    }

    // Filter by timestamp range and status
    if (filter.from || filter.to || filter.status) {
      return actions.filter((a) => {
        if (filter.from && a.timestamp < filter.from) return false;
        if (filter.to && a.timestamp > filter.to) return false;
        if (filter.status && a.status !== filter.status) return false;
        return true;
      });
    }

    return actions;
  }

  async getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }> {
    const [events, actions] = await Promise.all([
      this.readEvents(),
      this.readActions(),
    ]);

    return { events, actions };
  }

  async clear(): Promise<void> {
    await this.init();

    try {
      await Promise.all([
        fs.unlink(this.eventsFile).catch(() => {}),
        fs.unlink(this.actionsFile).catch(() => {}),
      ]);
    } catch (error) {
      console.error('Failed to clear storage files:', error);
    }
  }

  async size(): Promise<{ events: number; actions: number }> {
    const [events, actions] = await Promise.all([
      this.readEvents(),
      this.readActions(),
    ]);

    return {
      events: events.length,
      actions: actions.length,
    };
  }
}

// =============================================================================
// Legacy KeyValueStorage (backward compatibility)
// =============================================================================

export interface StorageConfig {
  type: StorageType;
  path?: string;
  contractAddress?: string;
}

export interface StorageEntry {
  key: string;
  value: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * KeyValueStorage class for managing agent state (legacy)
 * @deprecated Use MemoryStorage or FileStorage instead
 */
export class KeyValueStorage {
  private config: StorageConfig;
  private memoryStore: Map<string, StorageEntry> = new Map();

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * Store a value
   */
  async set(key: string, value: any, metadata?: Record<string, any>): Promise<void> {
    const entry: StorageEntry = {
      key,
      value,
      timestamp: Date.now(),
      metadata,
    };

    switch (this.config.type) {
      case StorageType.Memory:
        this.memoryStore.set(key, entry);
        break;

      case StorageType.LocalFile:
        await this.setLocalFile(key, entry);
        break;

      case StorageType.OnChain:
        await this.setOnChain(key, entry);
        break;

      case StorageType.IPFS:
        await this.setIPFS(key, entry);
        break;

      default:
        throw new Error(`Unsupported storage type: ${this.config.type}`);
    }
  }

  /**
   * Get a value
   */
  async get(key: string): Promise<any | null> {
    switch (this.config.type) {
      case StorageType.Memory:
        const entry = this.memoryStore.get(key);
        return entry ? entry.value : null;

      case StorageType.LocalFile:
        return this.getLocalFile(key);

      case StorageType.OnChain:
        return this.getOnChain(key);

      case StorageType.IPFS:
        return this.getIPFS(key);

      default:
        throw new Error(`Unsupported storage type: ${this.config.type}`);
    }
  }

  /**
   * Delete a value
   */
  async delete(key: string): Promise<boolean> {
    switch (this.config.type) {
      case StorageType.Memory:
        return this.memoryStore.delete(key);

      case StorageType.LocalFile:
        return this.deleteLocalFile(key);

      case StorageType.OnChain:
        return this.deleteOnChain(key);

      case StorageType.IPFS:
        // IPFS is immutable, cannot delete
        return false;

      default:
        throw new Error(`Unsupported storage type: ${this.config.type}`);
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    switch (this.config.type) {
      case StorageType.Memory:
        return this.memoryStore.has(key);

      case StorageType.LocalFile:
        return this.hasLocalFile(key);

      case StorageType.OnChain:
        return this.hasOnChain(key);

      case StorageType.IPFS:
        return this.hasIPFS(key);

      default:
        return false;
    }
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    switch (this.config.type) {
      case StorageType.Memory:
        return Array.from(this.memoryStore.keys());

      case StorageType.LocalFile:
        return this.keysLocalFile();

      case StorageType.OnChain:
        return this.keysOnChain();

      case StorageType.IPFS:
        return this.keysIPFS();

      default:
        return [];
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    switch (this.config.type) {
      case StorageType.Memory:
        this.memoryStore.clear();
        break;

      case StorageType.LocalFile:
        await this.clearLocalFile();
        break;

      case StorageType.OnChain:
        await this.clearOnChain();
        break;

      case StorageType.IPFS:
        // IPFS is immutable, cannot clear
        break;

      default:
        throw new Error(`Unsupported storage type: ${this.config.type}`);
    }
  }

  /**
   * Get storage size
   */
  async size(): Promise<number> {
    switch (this.config.type) {
      case StorageType.Memory:
        return this.memoryStore.size;

      case StorageType.LocalFile:
        return this.sizeLocalFile();

      case StorageType.OnChain:
        return this.sizeOnChain();

      case StorageType.IPFS:
        return this.sizeIPFS();

      default:
        return 0;
    }
  }

  // Local file storage methods (placeholder implementations)
  private async setLocalFile(key: string, entry: StorageEntry): Promise<void> {
    // In production: fs.writeFile to path/key.json
    this.memoryStore.set(key, entry);
  }

  private async getLocalFile(key: string): Promise<any | null> {
    // In production: fs.readFile from path/key.json
    const entry = this.memoryStore.get(key);
    return entry ? entry.value : null;
  }

  private async deleteLocalFile(key: string): Promise<boolean> {
    // In production: fs.unlink path/key.json
    return this.memoryStore.delete(key);
  }

  private async hasLocalFile(key: string): Promise<boolean> {
    // In production: fs.access path/key.json
    return this.memoryStore.has(key);
  }

  private async keysLocalFile(): Promise<string[]> {
    // In production: fs.readdir path
    return Array.from(this.memoryStore.keys());
  }

  private async clearLocalFile(): Promise<void> {
    // In production: fs.rmdir path
    this.memoryStore.clear();
  }

  private async sizeLocalFile(): Promise<number> {
    // In production: count files in path
    return this.memoryStore.size;
  }

  // On-chain storage methods (placeholder implementations)
  private async setOnChain(key: string, entry: StorageEntry): Promise<void> {
    // In production: contract.setStorage(key, value)
    this.memoryStore.set(key, entry);
  }

  private async getOnChain(key: string): Promise<any | null> {
    // In production: contract.getStorage(key)
    const entry = this.memoryStore.get(key);
    return entry ? entry.value : null;
  }

  private async deleteOnChain(key: string): Promise<boolean> {
    // In production: contract.deleteStorage(key)
    return this.memoryStore.delete(key);
  }

  private async hasOnChain(key: string): Promise<boolean> {
    // In production: contract.hasStorage(key)
    return this.memoryStore.has(key);
  }

  private async keysOnChain(): Promise<string[]> {
    // In production: contract.getStorageKeys()
    return Array.from(this.memoryStore.keys());
  }

  private async clearOnChain(): Promise<void> {
    // In production: contract.clearStorage()
    this.memoryStore.clear();
  }

  private async sizeOnChain(): Promise<number> {
    // In production: contract.getStorageSize()
    return this.memoryStore.size;
  }

  // IPFS storage methods (placeholder implementations)
  private async setIPFS(key: string, entry: StorageEntry): Promise<void> {
    // In production: ipfs.add(JSON.stringify(entry))
    this.memoryStore.set(key, entry);
  }

  private async getIPFS(key: string): Promise<any | null> {
    // In production: ipfs.cat(cid)
    const entry = this.memoryStore.get(key);
    return entry ? entry.value : null;
  }

  private async hasIPFS(key: string): Promise<boolean> {
    // In production: check if CID exists
    return this.memoryStore.has(key);
  }

  private async keysIPFS(): Promise<string[]> {
    // In production: list pinned CIDs
    return Array.from(this.memoryStore.keys());
  }

  private async sizeIPFS(): Promise<number> {
    // In production: count pinned CIDs
    return this.memoryStore.size;
  }
}

// =============================================================================
// Backward Compatibility Exports
// =============================================================================

/**
 * @deprecated Use KeyValueStorage instead
 */
export const Storage = KeyValueStorage;

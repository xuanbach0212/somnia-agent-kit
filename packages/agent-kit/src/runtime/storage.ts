/**
 * Storage implementations for agent persistence
 */

import fs from 'fs/promises';
import path from 'path';
import type { IStorage, EventEntry, ActionEntry } from '../types/storage';

// Re-export IStorage for convenience
export type { IStorage, EventEntry, ActionEntry };

/**
 * In-memory storage (for testing/development)
 */
export class MemoryStorage implements IStorage {
  private events: EventEntry[] = [];
  private actions: ActionEntry[] = [];

  async saveEvent(event: any, metadata?: Record<string, any>): Promise<void> {
    this.events.push({
      id: `event-${Date.now()}-${Math.random()}`,
      event,
      timestamp: Date.now(),
      metadata,
    });
  }

  async saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void> {
    this.actions.push({
      id: `action-${Date.now()}-${Math.random()}`,
      action,
      result,
      status: result ? 'success' : 'pending',
      timestamp: Date.now(),
      metadata,
    });
  }

  async getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }> {
    return {
      events: [...this.events],
      actions: [...this.actions],
    };
  }

  async getEvents(): Promise<EventEntry[]> {
    return [...this.events];
  }

  async getActions(): Promise<ActionEntry[]> {
    return [...this.actions];
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

/**
 * File-based storage (persistent)
 */
export class FileStorage implements IStorage {
  private eventsFile: string;
  private actionsFile: string;

  constructor(basePath: string = './data') {
    this.eventsFile = path.join(basePath, 'events.json');
    this.actionsFile = path.join(basePath, 'actions.json');
  }

  async saveEvent(event: any, metadata?: Record<string, any>): Promise<void> {
    const events = await this.loadEvents();
    events.push({
      id: `event-${Date.now()}-${Math.random()}`,
      event,
      timestamp: Date.now(),
      metadata,
    });
    await this.saveEvents(events);
  }

  async saveAction(action: any, result?: any, metadata?: Record<string, any>): Promise<void> {
    const actions = await this.loadActions();
    actions.push({
      id: `action-${Date.now()}-${Math.random()}`,
      action,
      result,
      status: result ? 'success' : 'pending',
      timestamp: Date.now(),
      metadata,
    });
    await this.saveActions(actions);
  }

  async getHistory(): Promise<{ events: EventEntry[]; actions: ActionEntry[] }> {
    return {
      events: await this.loadEvents(),
      actions: await this.loadActions(),
    };
  }

  async getEvents(): Promise<EventEntry[]> {
    return this.loadEvents();
  }

  async getActions(): Promise<ActionEntry[]> {
    return this.loadActions();
  }

  async clear(): Promise<void> {
    await this.saveEvents([]);
    await this.saveActions([]);
  }

  async size(): Promise<{ events: number; actions: number }> {
    const events = await this.loadEvents();
    const actions = await this.loadActions();
    return {
      events: events.length,
      actions: actions.length,
    };
  }

  private async loadEvents(): Promise<EventEntry[]> {
    try {
      const data = await fs.readFile(this.eventsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async loadActions(): Promise<ActionEntry[]> {
    try {
      const data = await fs.readFile(this.actionsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveEvents(events: EventEntry[]): Promise<void> {
    await fs.mkdir(path.dirname(this.eventsFile), { recursive: true });
    await fs.writeFile(this.eventsFile, JSON.stringify(events, null, 2));
  }

  private async saveActions(actions: ActionEntry[]): Promise<void> {
    await fs.mkdir(path.dirname(this.actionsFile), { recursive: true });
    await fs.writeFile(this.actionsFile, JSON.stringify(actions, null, 2));
  }
}

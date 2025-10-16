/**
 * On-chain Event Tracking
 * Records and monitors blockchain events related to agents
 */

import { ethers } from 'ethers';

export interface EventRecord {
  id: string;
  event: string;
  contract: string;
  blockNumber: number;
  transactionHash: string;
  args: Record<string, any>;
  timestamp: number;
}

export interface EventFilter {
  event?: string;
  contract?: string;
  fromBlock?: number;
  toBlock?: number;
}

export interface EventRecorderConfig {
  provider: ethers.Provider;
  contracts: Map<string, ethers.Contract>;
  maxEvents?: number;
}

/**
 * EventRecorder class for tracking blockchain events
 */
export class EventRecorder {
  private config: EventRecorderConfig;
  private events: EventRecord[] = [];
  private listeners: Map<string, ethers.ContractEventName[]> = new Map();
  private eventCallbacks: Map<string, ((event: EventRecord) => void)[]> = new Map();

  constructor(config: EventRecorderConfig) {
    this.config = {
      ...config,
      maxEvents: config.maxEvents || 10000,
    };
  }

  /**
   * Start listening to contract events
   */
  async startListening(
    contractName: string,
    eventNames: string[]
  ): Promise<void> {
    const contract = this.config.contracts.get(contractName);
    if (!contract) {
      throw new Error(`Contract not found: ${contractName}`);
    }

    for (const eventName of eventNames) {
      const listener = (...args: any[]) => {
        this.handleEvent(contractName, eventName, args);
      };

      contract.on(eventName, listener);

      // Store listener reference
      const listeners = this.listeners.get(contractName) || [];
      listeners.push(eventName);
      this.listeners.set(contractName, listeners);
    }
  }

  /**
   * Stop listening to contract events
   */
  stopListening(contractName: string): void {
    const contract = this.config.contracts.get(contractName);
    if (!contract) {
      return;
    }

    const listeners = this.listeners.get(contractName);
    if (listeners) {
      for (const eventName of listeners) {
        contract.off(eventName);
      }
      this.listeners.delete(contractName);
    }
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(
    contractName: string,
    eventName: string,
    args: any[]
  ): Promise<void> {
    try {
      // Last arg is typically the event object
      const eventLog = args[args.length - 1];
      const contract = this.config.contracts.get(contractName);

      if (!contract) {
        return;
      }

      // Parse event args
      const parsedArgs: Record<string, any> = {};
      const iface = contract.interface;
      const eventFragment = iface.getEvent(eventName);

      if (eventFragment) {
        for (let i = 0; i < eventFragment.inputs.length; i++) {
          const input = eventFragment.inputs[i];
          parsedArgs[input.name] = args[i];
        }
      }

      const record: EventRecord = {
        id: `${eventLog.transactionHash}-${eventLog.index}`,
        event: eventName,
        contract: contractName,
        blockNumber: eventLog.blockNumber,
        transactionHash: eventLog.transactionHash,
        args: parsedArgs,
        timestamp: Date.now(),
      };

      // Store event
      this.events.push(record);
      if (this.events.length > this.config.maxEvents!) {
        this.events.shift();
      }

      // Notify callbacks
      this.notifyCallbacks(eventName, record);
    } catch (error) {
      console.error(`Error handling event ${eventName}:`, error);
    }
  }

  /**
   * Register callback for event
   */
  on(eventName: string, callback: (event: EventRecord) => void): void {
    const callbacks = this.eventCallbacks.get(eventName) || [];
    callbacks.push(callback);
    this.eventCallbacks.set(eventName, callbacks);
  }

  /**
   * Unregister callback for event
   */
  off(eventName: string, callback?: (event: EventRecord) => void): void {
    if (!callback) {
      this.eventCallbacks.delete(eventName);
      return;
    }

    const callbacks = this.eventCallbacks.get(eventName);
    if (callbacks) {
      const filtered = callbacks.filter((cb) => cb !== callback);
      if (filtered.length > 0) {
        this.eventCallbacks.set(eventName, filtered);
      } else {
        this.eventCallbacks.delete(eventName);
      }
    }
  }

  /**
   * Notify registered callbacks
   */
  private notifyCallbacks(eventName: string, event: EventRecord): void {
    const callbacks = this.eventCallbacks.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event callback for ${eventName}:`, error);
        }
      });
    }

    // Also notify wildcard listeners
    const wildcardCallbacks = this.eventCallbacks.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in wildcard event callback:`, error);
        }
      });
    }
  }

  /**
   * Get all events
   */
  getEvents(filter?: EventFilter): EventRecord[] {
    let filtered = [...this.events];

    if (filter) {
      if (filter.event) {
        filtered = filtered.filter((e) => e.event === filter.event);
      }
      if (filter.contract) {
        filtered = filtered.filter((e) => e.contract === filter.contract);
      }
      if (filter.fromBlock !== undefined) {
        filtered = filtered.filter((e) => e.blockNumber >= filter.fromBlock!);
      }
      if (filter.toBlock !== undefined) {
        filtered = filtered.filter((e) => e.blockNumber <= filter.toBlock!);
      }
    }

    return filtered;
  }

  /**
   * Get event by ID
   */
  getEvent(id: string): EventRecord | undefined {
    return this.events.find((e) => e.id === id);
  }

  /**
   * Get events by transaction hash
   */
  getEventsByTransaction(transactionHash: string): EventRecord[] {
    return this.events.filter((e) => e.transactionHash === transactionHash);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 10): EventRecord[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Export events as JSON
   */
  export(): EventRecord[] {
    return [...this.events];
  }

  /**
   * Get event count
   */
  getEventCount(filter?: EventFilter): number {
    return this.getEvents(filter).length;
  }

  /**
   * Get unique event names
   */
  getEventNames(): string[] {
    const names = new Set(this.events.map((e) => e.event));
    return Array.from(names);
  }

  /**
   * Get unique contract names
   */
  getContractNames(): string[] {
    const names = new Set(this.events.map((e) => e.contract));
    return Array.from(names);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    // Stop all listeners
    for (const contractName of this.listeners.keys()) {
      this.stopListening(contractName);
    }

    // Clear events
    this.clearEvents();

    // Clear callbacks
    this.eventCallbacks.clear();
  }
}

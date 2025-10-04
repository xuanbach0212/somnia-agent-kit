/**
 * IPFS utilities for storing and retrieving agent metadata
 */

import axios from 'axios';
import { IPFSConfig } from '../sdk/types';

export class IPFSManager {
  private config: IPFSConfig;
  private gatewayUrl: string;

  constructor(config?: IPFSConfig) {
    this.config = config || {
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    };
    
    // Use public IPFS gateway for retrieval
    this.gatewayUrl = 'https://ipfs.io/ipfs/';
  }

  /**
   * Upload JSON data to IPFS
   * Note: For production, integrate with a proper IPFS service (Pinata, Infura, etc.)
   */
  async uploadJSON(data: any): Promise<string> {
    try {
      // For demo purposes, we'll use a mock IPFS hash
      // In production, implement actual IPFS upload using ipfs-http-client or similar
      const jsonString = JSON.stringify(data);
      const hash = this.generateMockIPFSHash(jsonString);
      
      // Store in memory cache for demo
      this.cacheData(hash, data);
      
      return hash;
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Retrieve JSON data from IPFS
   */
  async getJSON(hash: string): Promise<any> {
    try {
      // Try to get from cache first (for demo)
      const cached = this.getCachedData(hash);
      if (cached) {
        return cached;
      }

      // Try to fetch from IPFS gateway
      const response = await axios.get(`${this.gatewayUrl}${hash}`, {
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve from IPFS: ${error}`);
    }
  }

  /**
   * Generate a mock IPFS hash for demo purposes
   * In production, this would be replaced with actual IPFS hash
   */
  private generateMockIPFSHash(data: string): string {
    // Simple hash for demo - in production use actual IPFS
    const hash = Buffer.from(data).toString('base64').substring(0, 46);
    return `Qm${hash.replace(/[^a-zA-Z0-9]/g, 'X')}`;
  }

  /**
   * Cache management for demo purposes
   */
  private cache = new Map<string, any>();

  private cacheData(hash: string, data: any): void {
    this.cache.set(hash, data);
  }

  private getCachedData(hash: string): any | null {
    return this.cache.get(hash) || null;
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(buffer: Buffer, filename?: string): Promise<string> {
    try {
      // For demo purposes
      const hash = this.generateMockIPFSHash(buffer.toString('base64'));
      return hash;
    } catch (error) {
      throw new Error(`Failed to upload file to IPFS: ${error}`);
    }
  }

  /**
   * Get file from IPFS
   */
  async getFile(hash: string): Promise<Buffer> {
    try {
      const response = await axios.get(`${this.gatewayUrl}${hash}`, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to retrieve file from IPFS: ${error}`);
    }
  }
}


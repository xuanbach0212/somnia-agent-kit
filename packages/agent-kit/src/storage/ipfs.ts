/**
 * IPFS Storage Manager
 *
 * Utilities for uploading and retrieving data from IPFS.
 * Supports NFT metadata, images, and general file storage.
 *
 * @example
 * ```typescript
 * const ipfs = new IPFSManager({
 *   gateway: 'https://ipfs.io/ipfs/',
 * });
 *
 * // Upload NFT metadata
 * const uri = await ipfs.uploadJSON({
 *   name: 'Cool NFT #1',
 *   description: 'A really cool NFT',
 *   image: 'ipfs://QmImageHash...',
 * });
 *
 * console.log('Metadata URI:', uri);
 * ```
 */

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * IPFS manager configuration
 */
export interface IPFSManagerConfig {
  /** IPFS gateway URL for reading */
  gateway?: string;
  /** API endpoint for uploading (e.g., Pinata, Infura) */
  apiEndpoint?: string;
  /** API key for upload service */
  apiKey?: string;
  /** API secret for upload service */
  apiSecret?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * NFT metadata structure for IPFS (ERC721/ERC1155 standard)
 */
export interface IPFSNFTMetadata {
  /** NFT name */
  name: string;
  /** NFT description */
  description?: string;
  /** Image URL (usually ipfs://) */
  image?: string;
  /** External URL */
  external_url?: string;
  /** Animation URL (for videos, audio, etc.) */
  animation_url?: string;
  /** Background color (hex without #) */
  background_color?: string;
  /** Attributes/traits */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  }>;
  /** Additional properties */
  [key: string]: any;
}

/**
 * Upload result
 */
export interface UploadResult {
  /** IPFS hash (CID) */
  hash: string;
  /** Full IPFS URI (ipfs://...) */
  uri: string;
  /** HTTP gateway URL */
  url: string;
  /** File size in bytes */
  size?: number;
}

// =============================================================================
// IPFSManager Class
// =============================================================================

/**
 * IPFS Storage Manager
 *
 * Provides utilities for storing and retrieving data from IPFS.
 *
 * Note: This is a basic implementation. For production use, consider:
 * - Pinata (https://pinata.cloud)
 * - Infura IPFS (https://infura.io/product/ipfs)
 * - NFT.Storage (https://nft.storage)
 * - Web3.Storage (https://web3.storage)
 */
export class IPFSManager {
  private config: Required<IPFSManagerConfig>;

  /**
   * Create a new IPFSManager instance
   *
   * @param config - IPFS configuration
   *
   * @example
   * ```typescript
   * // Basic setup (read-only)
   * const ipfs = new IPFSManager({
   *   gateway: 'https://ipfs.io/ipfs/',
   * });
   *
   * // With Pinata
   * const ipfs = new IPFSManager({
   *   gateway: 'https://gateway.pinata.cloud/ipfs/',
   *   apiEndpoint: 'https://api.pinata.cloud',
   *   apiKey: process.env.PINATA_API_KEY,
   *   apiSecret: process.env.PINATA_API_SECRET,
   * });
   * ```
   */
  constructor(config: IPFSManagerConfig = {}) {
    this.config = {
      gateway: config.gateway || 'https://ipfs.io/ipfs/',
      apiEndpoint: config.apiEndpoint || '',
      apiKey: config.apiKey || '',
      apiSecret: config.apiSecret || '',
      timeout: config.timeout || 30000,
    };
  }

  /**
   * Upload JSON data to IPFS
   *
   * @param data - JSON data to upload
   * @returns Upload result with IPFS hash and URI
   *
   * @example
   * ```typescript
   * const result = await ipfs.uploadJSON({
   *   name: 'My Data',
   *   value: 123,
   * });
   *
   * console.log('IPFS URI:', result.uri);
   * ```
   */
  async uploadJSON(data: any): Promise<UploadResult> {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return await this.uploadFile(blob, 'data.json');
  }

  /**
   * Upload NFT metadata to IPFS
   *
   * @param metadata - NFT metadata
   * @returns Upload result
   *
   * @example
   * ```typescript
   * const result = await ipfs.uploadNFTMetadata({
   *   name: 'Cool NFT #1',
   *   description: 'A really cool NFT',
   *   image: 'ipfs://QmImageHash...',
   *   attributes: [
   *     { trait_type: 'Rarity', value: 'Legendary' },
   *     { trait_type: 'Level', value: 99 },
   *   ],
   * });
   * ```
   */
  async uploadNFTMetadata(metadata: IPFSNFTMetadata): Promise<UploadResult> {
    // Validate required fields
    if (!metadata.name) {
      throw new Error('NFT metadata must have a name');
    }

    return await this.uploadJSON(metadata);
  }

  /**
   * Upload a file to IPFS
   *
   * @param file - File or Blob to upload
   * @param filename - Optional filename
   * @returns Upload result
   *
   * @example
   * ```typescript
   * // In browser
   * const fileInput = document.querySelector('input[type="file"]');
   * const file = fileInput.files[0];
   * const result = await ipfs.uploadFile(file);
   * ```
   */
  async uploadFile(file: Blob | File, filename?: string): Promise<UploadResult> {
    if (!this.config.apiEndpoint) {
      throw new Error(
        'API endpoint not configured. Please provide apiEndpoint in config for uploads.'
      );
    }

    // This is a generic implementation
    // Actual implementation depends on the IPFS service (Pinata, Infura, etc.)
    throw new Error(
      'Upload not implemented. Please use a specific IPFS service integration ' +
        '(Pinata, Infura, NFT.Storage, etc.) or implement your own upload logic.'
    );
  }

  /**
   * Fetch JSON data from IPFS
   *
   * @param hash - IPFS hash or full URI
   * @returns Parsed JSON data
   *
   * @example
   * ```typescript
   * const data = await ipfs.fetchJSON('QmHash...');
   * // or
   * const data = await ipfs.fetchJSON('ipfs://QmHash...');
   * ```
   */
  async fetchJSON(hash: string): Promise<any> {
    const url = this.toHTTP(hash);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw new Error(
        `Failed to fetch from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetch NFT metadata from IPFS
   *
   * @param uri - IPFS URI or hash
   * @returns NFT metadata
   *
   * @example
   * ```typescript
   * const metadata = await ipfs.fetchNFTMetadata('ipfs://QmHash...');
   * console.log('NFT:', metadata.name);
   * ```
   */
  async fetchNFTMetadata(uri: string): Promise<IPFSNFTMetadata> {
    return await this.fetchJSON(uri);
  }

  /**
   * Fetch file from IPFS
   *
   * @param hash - IPFS hash or URI
   * @returns File blob
   *
   * @example
   * ```typescript
   * const blob = await ipfs.fetchFile('QmImageHash...');
   * const url = URL.createObjectURL(blob);
   * ```
   */
  async fetchFile(hash: string): Promise<Blob> {
    const url = this.toHTTP(hash);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw new Error(
        `Failed to fetch file from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Convert IPFS hash/URI to HTTP gateway URL
   *
   * @param hashOrUri - IPFS hash or URI
   * @returns HTTP gateway URL
   *
   * @example
   * ```typescript
   * const url = ipfs.toHTTP('ipfs://QmHash...');
   * // Returns: https://ipfs.io/ipfs/QmHash...
   * ```
   */
  toHTTP(hashOrUri: string): string {
    const hash = this.extractHash(hashOrUri);
    const gateway = this.config.gateway.endsWith('/')
      ? this.config.gateway
      : this.config.gateway + '/';

    return `${gateway}${hash}`;
  }

  /**
   * Convert HTTP gateway URL to IPFS URI
   *
   * @param url - HTTP gateway URL
   * @returns IPFS URI (ipfs://...)
   *
   * @example
   * ```typescript
   * const uri = IPFSManager.toIPFS('https://ipfs.io/ipfs/QmHash...');
   * // Returns: ipfs://QmHash...
   * ```
   */
  static toIPFS(url: string): string {
    // Extract hash from gateway URL
    const match = url.match(/\/ipfs\/([^/?#]+)/i);
    if (match) {
      return `ipfs://${match[1]}`;
    }

    // If already an IPFS URI, return as is
    if (url.startsWith('ipfs://')) {
      return url;
    }

    // Otherwise, assume it's just a hash
    return `ipfs://${url}`;
  }

  /**
   * Extract IPFS hash from URI or URL
   *
   * @param hashOrUri - IPFS hash, URI, or gateway URL
   * @returns Clean IPFS hash
   *
   * @example
   * ```typescript
   * const hash = ipfs.extractHash('ipfs://QmHash...');
   * // Returns: QmHash...
   * ```
   */
  extractHash(hashOrUri: string): string {
    // Remove ipfs:// prefix
    if (hashOrUri.startsWith('ipfs://')) {
      return hashOrUri.substring(7);
    }

    // Extract from gateway URL
    const match = hashOrUri.match(/\/ipfs\/([^/?#]+)/i);
    if (match) {
      return match[1];
    }

    // Assume it's already a clean hash
    return hashOrUri;
  }

  /**
   * Validate IPFS hash (CID)
   *
   * @param hash - IPFS hash to validate
   * @returns true if valid
   *
   * @example
   * ```typescript
   * const valid = IPFSManager.isValidHash('QmHash...');
   * ```
   */
  static isValidHash(hash: string): boolean {
    // Basic CID v0 (Qm... - typically 46 chars, allow 44-59) or v1 (b... - base32) validation
    // CID v0: Qm followed by 44+ base58 chars
    // CID v1: b followed by 58+ base32 chars
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44,59}|b[A-Za-z2-7]{58,})$/.test(hash);
  }

  /**
   * Get gateway URL
   *
   * @returns Current gateway URL
   */
  getGateway(): string {
    return this.config.gateway;
  }

  /**
   * Set gateway URL
   *
   * @param gateway - New gateway URL
   *
   * @example
   * ```typescript
   * ipfs.setGateway('https://cloudflare-ipfs.com/ipfs/');
   * ```
   */
  setGateway(gateway: string): void {
    this.config.gateway = gateway;
  }

  /**
   * Get current configuration (with secrets redacted)
   *
   * @returns Configuration object
   */
  getConfig(): Partial<IPFSManagerConfig> {
    return {
      gateway: this.config.gateway,
      apiEndpoint: this.config.apiEndpoint || undefined,
      timeout: this.config.timeout,
      apiKey: this.config.apiKey ? '***' : undefined,
      apiSecret: this.config.apiSecret ? '***' : undefined,
    };
  }

  /**
   * Create IPFS URI from hash
   *
   * @param hash - IPFS hash
   * @returns IPFS URI (ipfs://...)
   */
  static createURI(hash: string): string {
    return `ipfs://${hash}`;
  }

  /**
   * Get common IPFS gateways
   *
   * @returns Array of gateway URLs
   */
  static getCommonGateways(): string[] {
    return [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
    ];
  }
}

// =============================================================================
// Exports
// =============================================================================

export { IPFSManager as default };

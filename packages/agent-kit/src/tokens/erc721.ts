/**
 * ERC721 NFT Manager
 *
 * Utilities for interacting with ERC721 NFT collections on Somnia blockchain.
 * Supports standard ERC721 operations including minting, transfers, and approvals.
 *
 * @example
 * ```typescript
 * const nft = new ERC721Manager(chainClient);
 *
 * // Check NFT owner
 * const owner = await nft.ownerOf(collectionAddress, tokenId);
 *
 * // Transfer NFT
 * await nft.safeTransferFrom(
 *   collectionAddress,
 *   fromAddress,
 *   toAddress,
 *   tokenId
 * );
 * ```
 */

import { Contract, ethers } from 'ethers';
import type { ChainClient } from '../core/chainClient';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * ERC721 collection information
 */
export interface CollectionInfo {
  /** Collection name */
  name: string;
  /** Collection symbol */
  symbol: string;
  /** Total supply (if supported) */
  totalSupply?: bigint;
}

/**
 * NFT metadata structure (ERC721 standard)
 */
export interface NFTMetadata {
  /** NFT name */
  name?: string;
  /** NFT description */
  description?: string;
  /** Image URL (usually IPFS) */
  image?: string;
  /** External URL */
  external_url?: string;
  /** Animation URL */
  animation_url?: string;
  /** Attributes */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

// =============================================================================
// ERC721 ABI (Standard Interface)
// =============================================================================

const ERC721_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',

  // Write functions
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

// Optional ERC721Enumerable extension
const ERC721_ENUMERABLE_ABI = [
  ...ERC721_ABI,
  'function totalSupply() view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
];

// =============================================================================
// ERC721Manager Class
// =============================================================================

/**
 * ERC721 NFT Manager
 *
 * Provides high-level utilities for interacting with ERC721 NFT collections.
 */
export class ERC721Manager {
  private chainClient: ChainClient;

  /**
   * Create a new ERC721Manager instance
   *
   * @param chainClient - ChainClient instance for blockchain interaction
   *
   * @example
   * ```typescript
   * const nft = new ERC721Manager(chainClient);
   * ```
   */
  constructor(chainClient: ChainClient) {
    this.chainClient = chainClient;
  }

  /**
   * Get an ERC721 contract instance
   *
   * @param address - NFT contract address
   * @param enumerable - Whether to include ERC721Enumerable functions
   * @returns Contract instance
   */
  private getERC721Contract(address: string, enumerable: boolean = false): Contract {
    const abi = enumerable ? ERC721_ENUMERABLE_ABI : ERC721_ABI;
    return this.chainClient.getContract(address, abi);
  }

  /**
   * Get collection information
   *
   * @param collection - NFT contract address
   * @returns Collection information
   *
   * @example
   * ```typescript
   * const info = await nft.getCollectionInfo(collectionAddress);
   * console.log(`${info.name} (${info.symbol})`);
   * ```
   */
  async getCollectionInfo(collection: string): Promise<CollectionInfo> {
    const contract = this.getERC721Contract(collection);

    const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);

    const info: CollectionInfo = {
      name,
      symbol,
    };

    // Try to get total supply (if ERC721Enumerable)
    try {
      const enumerableContract = this.getERC721Contract(collection, true);
      info.totalSupply = await enumerableContract.totalSupply();
    } catch {
      // Not enumerable, skip
    }

    return info;
  }

  /**
   * Get the owner of an NFT
   *
   * @param collection - NFT contract address
   * @param tokenId - Token ID
   * @returns Owner address
   *
   * @example
   * ```typescript
   * const owner = await nft.ownerOf(collectionAddress, 123n);
   * console.log('Owner:', owner);
   * ```
   */
  async ownerOf(collection: string, tokenId: bigint): Promise<string> {
    const contract = this.getERC721Contract(collection);
    return await contract.ownerOf(tokenId);
  }

  /**
   * Get the number of NFTs owned by an address
   *
   * @param collection - NFT contract address
   * @param owner - Owner address
   * @returns Number of NFTs owned
   *
   * @example
   * ```typescript
   * const balance = await nft.balanceOf(collectionAddress, ownerAddress);
   * console.log('Owns', balance, 'NFTs');
   * ```
   */
  async balanceOf(collection: string, owner: string): Promise<bigint> {
    const contract = this.getERC721Contract(collection);
    return await contract.balanceOf(owner);
  }

  /**
   * Get the token URI for an NFT
   *
   * @param collection - NFT contract address
   * @param tokenId - Token ID
   * @returns Token URI (usually IPFS URL)
   *
   * @example
   * ```typescript
   * const uri = await nft.tokenURI(collectionAddress, 123n);
   * console.log('Metadata URI:', uri);
   * ```
   */
  async tokenURI(collection: string, tokenId: bigint): Promise<string> {
    const contract = this.getERC721Contract(collection);
    return await contract.tokenURI(tokenId);
  }

  /**
   * Transfer an NFT
   *
   * @param collection - NFT contract address
   * @param from - Current owner address
   * @param to - Recipient address
   * @param tokenId - Token ID
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * await nft.transferFrom(
   *   collectionAddress,
   *   fromAddress,
   *   toAddress,
   *   123n
   * );
   * ```
   */
  async transferFrom(
    collection: string,
    from: string,
    to: string,
    tokenId: bigint
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC721Contract(collection);
    const tx = await contract.transferFrom(from, to, tokenId);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transfer transaction failed');
    }

    return receipt;
  }

  /**
   * Safely transfer an NFT (checks if recipient can receive)
   *
   * @param collection - NFT contract address
   * @param from - Current owner address
   * @param to - Recipient address
   * @param tokenId - Token ID
   * @param data - Additional data (optional)
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * await nft.safeTransferFrom(
   *   collectionAddress,
   *   fromAddress,
   *   toAddress,
   *   123n
   * );
   * ```
   */
  async safeTransferFrom(
    collection: string,
    from: string,
    to: string,
    tokenId: bigint,
    data?: string
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC721Contract(collection);

    const tx = data
      ? await contract['safeTransferFrom(address,address,uint256,bytes)'](
          from,
          to,
          tokenId,
          data
        )
      : await contract['safeTransferFrom(address,address,uint256)'](from, to, tokenId);

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('SafeTransfer transaction failed');
    }

    return receipt;
  }

  /**
   * Approve an address to transfer a specific NFT
   *
   * @param collection - NFT contract address
   * @param to - Approved address
   * @param tokenId - Token ID
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * await nft.approve(collectionAddress, spenderAddress, 123n);
   * ```
   */
  async approve(
    collection: string,
    to: string,
    tokenId: bigint
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC721Contract(collection);
    const tx = await contract.approve(to, tokenId);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Approve transaction failed');
    }

    return receipt;
  }

  /**
   * Set approval for all NFTs in the collection
   *
   * @param collection - NFT contract address
   * @param operator - Operator address
   * @param approved - Whether to approve or revoke
   * @returns Transaction receipt
   *
   * @example
   * ```typescript
   * // Approve marketplace to transfer all NFTs
   * await nft.setApprovalForAll(
   *   collectionAddress,
   *   marketplaceAddress,
   *   true
   * );
   * ```
   */
  async setApprovalForAll(
    collection: string,
    operator: string,
    approved: boolean
  ): Promise<ethers.TransactionReceipt> {
    const contract = this.getERC721Contract(collection);
    const tx = await contract.setApprovalForAll(operator, approved);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('SetApprovalForAll transaction failed');
    }

    return receipt;
  }

  /**
   * Get approved address for a specific NFT
   *
   * @param collection - NFT contract address
   * @param tokenId - Token ID
   * @returns Approved address
   *
   * @example
   * ```typescript
   * const approved = await nft.getApproved(collectionAddress, 123n);
   * ```
   */
  async getApproved(collection: string, tokenId: bigint): Promise<string> {
    const contract = this.getERC721Contract(collection);
    return await contract.getApproved(tokenId);
  }

  /**
   * Check if an operator is approved for all NFTs
   *
   * @param collection - NFT contract address
   * @param owner - Owner address
   * @param operator - Operator address
   * @returns true if operator is approved
   *
   * @example
   * ```typescript
   * const isApproved = await nft.isApprovedForAll(
   *   collectionAddress,
   *   ownerAddress,
   *   operatorAddress
   * );
   * ```
   */
  async isApprovedForAll(
    collection: string,
    owner: string,
    operator: string
  ): Promise<boolean> {
    const contract = this.getERC721Contract(collection);
    return await contract.isApprovedForAll(owner, operator);
  }

  /**
   * Get total supply (if ERC721Enumerable)
   *
   * @param collection - NFT contract address
   * @returns Total supply
   * @throws Error if contract doesn't support ERC721Enumerable
   *
   * @example
   * ```typescript
   * const supply = await nft.totalSupply(collectionAddress);
   * console.log('Total NFTs:', supply);
   * ```
   */
  async totalSupply(collection: string): Promise<bigint> {
    const contract = this.getERC721Contract(collection, true);
    return await contract.totalSupply();
  }

  /**
   * Get token ID by index for an owner (if ERC721Enumerable)
   *
   * @param collection - NFT contract address
   * @param owner - Owner address
   * @param index - Index
   * @returns Token ID
   *
   * @example
   * ```typescript
   * // Get first NFT owned by address
   * const tokenId = await nft.tokenOfOwnerByIndex(
   *   collectionAddress,
   *   ownerAddress,
   *   0
   * );
   * ```
   */
  async tokenOfOwnerByIndex(
    collection: string,
    owner: string,
    index: number
  ): Promise<bigint> {
    const contract = this.getERC721Contract(collection, true);
    return await contract.tokenOfOwnerByIndex(owner, index);
  }

  /**
   * Get token ID by global index (if ERC721Enumerable)
   *
   * @param collection - NFT contract address
   * @param index - Index
   * @returns Token ID
   */
  async tokenByIndex(collection: string, index: number): Promise<bigint> {
    const contract = this.getERC721Contract(collection, true);
    return await contract.tokenByIndex(index);
  }

  /**
   * Get all token IDs owned by an address (if ERC721Enumerable)
   *
   * @param collection - NFT contract address
   * @param owner - Owner address
   * @returns Array of token IDs
   *
   * @example
   * ```typescript
   * const tokenIds = await nft.getOwnedTokens(
   *   collectionAddress,
   *   ownerAddress
   * );
   * console.log('Owned NFTs:', tokenIds);
   * ```
   */
  async getOwnedTokens(collection: string, owner: string): Promise<bigint[]> {
    const balance = await this.balanceOf(collection, owner);
    const tokenIds: bigint[] = [];

    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await this.tokenOfOwnerByIndex(collection, owner, i);
      tokenIds.push(tokenId);
    }

    return tokenIds;
  }

  /**
   * Check if an NFT exists (has an owner)
   *
   * @param collection - NFT contract address
   * @param tokenId - Token ID
   * @returns true if NFT exists
   */
  async exists(collection: string, tokenId: bigint): Promise<boolean> {
    try {
      await this.ownerOf(collection, tokenId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get collection name
   *
   * @param collection - NFT contract address
   * @returns Collection name
   */
  async name(collection: string): Promise<string> {
    const contract = this.getERC721Contract(collection);
    return await contract.name();
  }

  /**
   * Get collection symbol
   *
   * @param collection - NFT contract address
   * @returns Collection symbol
   */
  async symbol(collection: string): Promise<string> {
    const contract = this.getERC721Contract(collection);
    return await contract.symbol();
  }
}

// =============================================================================
// Exports
// =============================================================================

export { ERC721Manager as default };

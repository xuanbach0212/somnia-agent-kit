/**
 * MetaMask Wallet Connector
 *
 * Utilities for connecting to MetaMask browser extension.
 * Supports account management, network switching, and transaction signing.
 *
 * @example
 * ```typescript
 * const metamask = new MetaMaskConnector();
 *
 * // Check if installed
 * if (await metamask.isInstalled()) {
 *   // Connect wallet
 *   const account = await metamask.connect();
 *   console.log('Connected:', account);
 *
 *   // Switch to Somnia testnet
 *   await metamask.switchToSomnia('testnet');
 * }
 * ```
 */

import { ethers } from 'ethers';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * MetaMask network configuration
 */
export interface MetaMaskNetwork {
  /** Network name */
  chainName: string;
  /** Chain ID (hex string) */
  chainId: string;
  /** RPC URLs */
  rpcUrls: string[];
  /** Block explorer URLs */
  blockExplorerUrls?: string[];
  /** Native currency */
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Ethereum provider interface (window.ethereum)
 */
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  selectedAddress?: string | null;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// =============================================================================
// Somnia Network Configurations
// =============================================================================

const SOMNIA_NETWORKS: Record<'testnet' | 'mainnet', MetaMaskNetwork> = {
  testnet: {
    chainName: 'Somnia Shannon Testnet',
    chainId: '0xC478', // 50312 in hex
    rpcUrls: ['https://dream-rpc.somnia.network/'],
    blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
    nativeCurrency: {
      name: 'Somnia Test Token',
      symbol: 'STT',
      decimals: 18,
    },
  },
  mainnet: {
    chainName: 'Somnia Mainnet',
    chainId: '0x13A7', // 5031 in hex
    rpcUrls: ['https://api.infra.mainnet.somnia.network/'],
    blockExplorerUrls: ['https://explorer.somnia.network/'],
    nativeCurrency: {
      name: 'Somnia',
      symbol: 'SOMI',
      decimals: 18,
    },
  },
};

// =============================================================================
// MetaMaskConnector Class
// =============================================================================

/**
 * MetaMask Wallet Connector
 *
 * Provides utilities for connecting to MetaMask browser extension.
 * Only works in browser environments.
 */
export class MetaMaskConnector {
  private provider: EthereumProvider | null = null;
  private connected: boolean = false;
  private accounts: string[] = [];

  /**
   * Check if MetaMask is installed
   *
   * @returns true if MetaMask is available
   *
   * @example
   * ```typescript
   * if (await metamask.isInstalled()) {
   *   console.log('MetaMask is installed');
   * } else {
   *   console.log('Please install MetaMask');
   * }
   * ```
   */
  async isInstalled(): Promise<boolean> {
    if (typeof globalThis === 'undefined' || !(globalThis as any).window) {
      return false; // Not in browser
    }

    const win = (globalThis as any).window as Window;
    return Boolean(win.ethereum?.isMetaMask);
  }

  /**
   * Get the MetaMask provider
   *
   * @returns Ethereum provider
   * @throws Error if MetaMask is not installed
   */
  private getProvider(): EthereumProvider {
    if (typeof globalThis === 'undefined' || !(globalThis as any).window) {
      throw new Error('MetaMask is only available in browser environments');
    }

    const win = (globalThis as any).window as Window;

    if (!win.ethereum?.isMetaMask) {
      throw new Error(
        'MetaMask is not installed. Please install it from https://metamask.io'
      );
    }

    if (!this.provider) {
      this.provider = win.ethereum;
    }

    return this.provider;
  }

  /**
   * Connect to MetaMask wallet
   *
   * Requests account access from the user.
   *
   * @returns Connected account address
   *
   * @example
   * ```typescript
   * try {
   *   const account = await metamask.connect();
   *   console.log('Connected account:', account);
   * } catch (error) {
   *   console.error('User rejected connection');
   * }
   * ```
   */
  async connect(): Promise<string> {
    const provider = this.getProvider();

    try {
      // Request accounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.accounts = accounts;
      this.connected = true;

      return accounts[0];
    } catch (error) {
      throw new Error(
        `Failed to connect to MetaMask: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect from MetaMask
   *
   * Note: MetaMask doesn't have a true disconnect method.
   * This just clears local state.
   */
  disconnect(): void {
    this.connected = false;
    this.accounts = [];
  }

  /**
   * Get connected accounts
   *
   * @returns Array of connected account addresses
   *
   * @example
   * ```typescript
   * const accounts = await metamask.getAccounts();
   * console.log('Connected accounts:', accounts);
   * ```
   */
  async getAccounts(): Promise<string[]> {
    const provider = this.getProvider();

    try {
      const accounts = await provider.request({
        method: 'eth_accounts',
      });

      this.accounts = accounts || [];
      return this.accounts;
    } catch (error) {
      throw new Error(
        `Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the selected account
   *
   * @returns Currently selected account address
   */
  async getSelectedAccount(): Promise<string> {
    const accounts = await this.getAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts connected');
    }

    return accounts[0];
  }

  /**
   * Get current chain ID
   *
   * @returns Chain ID (hex string)
   *
   * @example
   * ```typescript
   * const chainId = await metamask.getChainId();
   * console.log('Current chain:', parseInt(chainId, 16));
   * ```
   */
  async getChainId(): Promise<string> {
    const provider = this.getProvider();

    try {
      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      return chainId;
    } catch (error) {
      throw new Error(
        `Failed to get chain ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Switch to Somnia network
   *
   * @param network - Network to switch to ('testnet' or 'mainnet')
   *
   * @example
   * ```typescript
   * await metamask.switchToSomnia('testnet');
   * console.log('Switched to Somnia testnet');
   * ```
   */
  async switchToSomnia(network: 'testnet' | 'mainnet'): Promise<void> {
    const networkConfig = SOMNIA_NETWORKS[network];
    const provider = this.getProvider();

    try {
      // Try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Add the network
        await this.addSomniaNetwork(network);
      } else {
        throw error;
      }
    }
  }

  /**
   * Add Somnia network to MetaMask
   *
   * @param network - Network to add ('testnet' or 'mainnet')
   *
   * @example
   * ```typescript
   * await metamask.addSomniaNetwork('testnet');
   * console.log('Somnia testnet added to MetaMask');
   * ```
   */
  async addSomniaNetwork(network: 'testnet' | 'mainnet'): Promise<void> {
    const networkConfig = SOMNIA_NETWORKS[network];
    const provider = this.getProvider();

    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
    } catch (error) {
      throw new Error(
        `Failed to add network: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Request accounts (prompt user to connect)
   *
   * @returns Array of account addresses
   */
  async requestAccounts(): Promise<string[]> {
    return [await this.connect()];
  }

  /**
   * Listen to account changes
   *
   * @param handler - Callback function
   *
   * @example
   * ```typescript
   * metamask.on('accountsChanged', (accounts) => {
   *   console.log('Accounts changed:', accounts);
   * });
   * ```
   */
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: 'chainChanged', handler: (chainId: string) => void): void;
  on(event: 'connect', handler: (connectInfo: { chainId: string }) => void): void;
  on(
    event: 'disconnect',
    handler: (error: { code: number; message: string }) => void
  ): void;
  on(event: string, handler: (...args: any[]) => void): void {
    const provider = this.getProvider();
    provider.on(event, handler);
  }

  /**
   * Remove event listener
   *
   * @param event - Event name
   * @param handler - Callback function to remove
   *
   * @example
   * ```typescript
   * const handler = (accounts) => console.log(accounts);
   * metamask.on('accountsChanged', handler);
   * // Later...
   * metamask.removeListener('accountsChanged', handler);
   * ```
   */
  removeListener(event: string, handler: (...args: any[]) => void): void {
    const provider = this.getProvider();
    provider.removeListener(event, handler);
  }

  /**
   * Get an ethers.js provider instance
   *
   * @returns BrowserProvider instance
   *
   * @example
   * ```typescript
   * const provider = await metamask.getEthersProvider();
   * const blockNumber = await provider.getBlockNumber();
   * ```
   */
  async getEthersProvider(): Promise<ethers.BrowserProvider> {
    const provider = this.getProvider();
    return new ethers.BrowserProvider(provider as any);
  }

  /**
   * Get an ethers.js signer instance
   *
   * @returns Signer instance
   *
   * @example
   * ```typescript
   * const signer = await metamask.getEthersSigner();
   * const address = await signer.getAddress();
   * ```
   */
  async getEthersSigner(): Promise<ethers.Signer> {
    const provider = await this.getEthersProvider();
    return await provider.getSigner();
  }

  /**
   * Sign a message
   *
   * @param message - Message to sign
   * @param account - Account to sign with (optional, uses selected account)
   * @returns Signature
   *
   * @example
   * ```typescript
   * const signature = await metamask.signMessage('Hello World');
   * console.log('Signature:', signature);
   * ```
   */
  async signMessage(message: string, account?: string): Promise<string> {
    const provider = this.getProvider();
    const from = account || (await this.getSelectedAccount());

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [ethers.hexlify(ethers.toUtf8Bytes(message)), from],
      });

      return signature;
    } catch (error) {
      throw new Error(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if connected
   *
   * @returns true if wallet is connected
   */
  isConnected(): boolean {
    return this.connected && this.accounts.length > 0;
  }

  /**
   * Get connected account (if any)
   *
   * @returns Account address or null
   */
  getAccount(): string | null {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }
}

// =============================================================================
// Exports
// =============================================================================

export { MetaMaskConnector as default };

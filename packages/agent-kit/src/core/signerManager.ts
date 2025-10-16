/**
 * Signer Management - Handles wallet and transaction signing
 */

import { ethers } from 'ethers';

export class SignerManager {
  private signer?: ethers.Wallet;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider, privateKey?: string) {
    this.provider = provider;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, provider);
    }
  }

  /**
   * Get the current signer
   */
  getSigner(): ethers.Wallet {
    if (!this.signer) {
      throw new Error('No signer configured. Provide a private key.');
    }
    return this.signer;
  }

  /**
   * Get signer address
   */
  async getAddress(): Promise<string> {
    return await this.getSigner().getAddress();
  }

  /**
   * Get account balance
   */
  async getBalance(address?: string): Promise<bigint> {
    const addr = address || (await this.getAddress());
    return await this.provider.getBalance(addr);
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    return await this.getSigner().signMessage(message);
  }

  /**
   * Sign a transaction
   */
  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    return await this.getSigner().signTransaction(tx);
  }

  /**
   * Check if signer is configured
   */
  hasSigner(): boolean {
    return !!this.signer;
  }

  /**
   * Set a new signer
   */
  setSigner(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }
}

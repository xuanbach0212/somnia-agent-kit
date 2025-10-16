/**
 * Signer Management - Handles wallet and transaction signing
 */

import { ethers } from 'ethers';

export class SignerManager {
  private signer?: ethers.Wallet | ethers.Signer;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider, privateKey?: string) {
    this.provider = provider;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, provider);
    }
  }

  /**
   * Create SignerManager from mnemonic phrase
   * @param mnemonic Mnemonic phrase (12 or 24 words)
   * @param provider Provider instance
   * @param path Derivation path (default: "m/44'/60'/0'/0/0")
   * @returns SignerManager instance
   */
  static fromMnemonic(
    mnemonic: string,
    provider: ethers.Provider,
    path?: string
  ): SignerManager {
    const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
    const manager = new SignerManager(provider);
    manager.signer = path ? wallet.derivePath(path) : wallet;
    return manager;
  }

  /**
   * Create SignerManager from external signer
   * @param signer External signer instance
   * @param provider Provider instance
   * @returns SignerManager instance
   */
  static fromSigner(
    signer: ethers.Signer,
    provider: ethers.Provider
  ): SignerManager {
    const manager = new SignerManager(provider);
    manager.signer = signer;
    return manager;
  }

  /**
   * Get the current signer
   */
  getSigner(): ethers.Wallet | ethers.Signer {
    if (!this.signer) {
      throw new Error('No signer configured. Provide a private key, mnemonic, or signer.');
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

  /**
   * Send transaction to blockchain
   * @param to Recipient address
   * @param data Transaction data (hex string)
   * @param value Value to send in wei (optional)
   * @returns Transaction receipt
   *
   * @example
   * const receipt = await signerManager.sendTx(
   *   '0x...',
   *   '0x...',
   *   ethers.parseEther('0.1')
   * );
   */
  async sendTx(
    to: string,
    data: string,
    value?: bigint
  ): Promise<ethers.TransactionReceipt> {
    const signer = this.getSigner();

    const tx: ethers.TransactionRequest = {
      to,
      data,
      value: value || 0n,
    };

    // Send transaction
    const response = await signer.sendTransaction(tx);

    // Wait for confirmation
    const receipt = await response.wait();

    if (!receipt) {
      throw new Error('Transaction failed: No receipt received');
    }

    return receipt;
  }

  /**
   * Estimate gas for a transaction
   * @param tx Transaction request
   * @returns Estimated gas limit
   *
   * @example
   * const gas = await signerManager.estimateGas({
   *   to: '0x...',
   *   data: '0x...',
   *   value: ethers.parseEther('0.1')
   * });
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas({
      ...tx,
      from: await this.getAddress(),
    });
  }

  /**
   * Get current nonce for the signer
   * @returns Current nonce
   */
  async getNonce(): Promise<number> {
    const address = await this.getAddress();
    return await this.provider.getTransactionCount(address, 'pending');
  }

  /**
   * Get gas price
   * @returns Current gas price in wei
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || 0n;
  }
}

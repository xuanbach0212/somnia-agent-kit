/**
 * Token Commands
 * Manage ERC20, ERC721, and native tokens
 */

import { ethers } from 'ethers';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface TokenBalanceOptions {
  token?: string;
  type?: string;
  _positional?: string[];
}

export interface TokenTransferOptions {
  token?: string;
  amount?: string;
  _positional?: string[];
}

export interface TokenInfoOptions {
  _positional?: string[];
}

export interface TokenApproveOptions {
  token?: string;
  amount?: string;
  _positional?: string[];
}

export interface NFTOwnerOptions {
  collection?: string;
  _positional?: string[];
}

export interface NFTTransferOptions {
  collection?: string;
  _positional?: string[];
}

export interface NFTMetadataOptions {
  collection?: string;
  _positional?: string[];
}

/**
 * Initialize SDK from config
 */
async function initSDK(): Promise<SomniaAgentKit> {
  const config = loadConfig();

  const kit = new SomniaAgentKit({
    network: {
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      name: config.network,
    },
    contracts: {
      agentRegistry: config.contracts.agentRegistry,
      agentManager: config.contracts.agentManager,
      agentExecutor: config.contracts.agentExecutor,
      agentVault: config.contracts.agentVault,
    },
    privateKey: config.privateKey || process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  return kit;
}

/**
 * Token balance command
 */
export async function tokenBalanceCommand(options: TokenBalanceOptions): Promise<void> {
  const address = options._positional?.[0];

  if (!address) {
    throw new Error('Address is required. Usage: sak token:balance <address> [options]');
  }

  console.log(`💰 Fetching token balance...\n`);

  const kit = await initSDK();
  const type = options.type || 'native';

  if (type === 'native') {
    const nativeManager = kit.getNativeTokenManager();
    const balance = await nativeManager.getBalance(address);
    const formatted = ethers.formatEther(balance);

    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  Native Token Balance                                                     ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Address:  ${address.padEnd(61)}║`);
    console.log(`║  Balance:  ${formatted.padEnd(61)}║`);
    console.log(`║  Wei:      ${balance.toString().padEnd(61)}║`);
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
  } else if (type === 'erc20' && options.token) {
    const erc20Manager = kit.getERC20Manager();
    const balance = await erc20Manager.balanceOf(options.token, address);
    const info = await erc20Manager.getTokenInfo(options.token);
    const formatted = ethers.formatUnits(balance, info.decimals);

    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  ERC20 Token Balance                                                      ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Token:    ${info.name.padEnd(61)}║`);
    console.log(`║  Symbol:   ${info.symbol.padEnd(61)}║`);
    console.log(`║  Address:  ${address.padEnd(61)}║`);
    console.log(`║  Balance:  ${formatted.padEnd(61)}║`);
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
  } else if (type === 'erc721' && options.token) {
    const erc721Manager = kit.getERC721Manager();
    const balance = await erc721Manager.balanceOf(options.token, address);
    const info = await erc721Manager.getCollectionInfo(options.token);

    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  ERC721 NFT Balance                                                       ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Collection: ${info.name.padEnd(59)}║`);
    console.log(`║  Symbol:     ${info.symbol.padEnd(59)}║`);
    console.log(`║  Owner:      ${address.padEnd(59)}║`);
    console.log(`║  NFTs Owned: ${balance.toString().padEnd(59)}║`);
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
  } else {
    throw new Error(
      'Invalid type or missing token address. Use --type native|erc20|erc721 and --token <address>'
    );
  }
  console.log();
}

/**
 * Token transfer command
 */
export async function tokenTransferCommand(options: TokenTransferOptions): Promise<void> {
  const to = options._positional?.[0];
  const amount = options._positional?.[1] || options.amount;

  if (!to || !amount) {
    throw new Error('Usage: sak token:transfer <to> <amount> --token <address>');
  }

  console.log(`📤 Transferring tokens...\n`);

  const kit = await initSDK();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const from = await signer.getAddress();

  if (options.token) {
    // ERC20 transfer
    const erc20Manager = kit.getERC20Manager();
    const info = await erc20Manager.getTokenInfo(options.token);
    const amountWei = ethers.parseUnits(amount, info.decimals);

    console.log(`   From:   ${from}`);
    console.log(`   To:     ${to}`);
    console.log(`   Amount: ${amount} ${info.symbol}`);
    console.log(`   Token:  ${options.token}\n`);

    console.log('⏳ Sending transaction...');
    const receipt = await erc20Manager.transfer(options.token, to, amountWei);
    console.log(`📤 Transaction hash: ${receipt.hash}`);
    console.log('✅ Transfer successful!\n');
  } else {
    // Native token transfer
    const nativeManager = kit.getNativeTokenManager();
    const amountWei = ethers.parseEther(amount);

    console.log(`   From:   ${from}`);
    console.log(`   To:     ${to}`);
    console.log(`   Amount: ${amount} STT\n`);

    console.log('⏳ Sending transaction...');
    const receipt = await nativeManager.transfer(to, amountWei);
    console.log(`📤 Transaction hash: ${receipt.hash}`);
    console.log('✅ Transfer successful!\n');
  }
}

/**
 * Token info command
 */
export async function tokenInfoCommand(options: TokenInfoOptions): Promise<void> {
  const tokenAddress = options._positional?.[0];

  if (!tokenAddress) {
    throw new Error('Token address is required. Usage: sak token:info <address>');
  }

  console.log(`📋 Fetching token information...\n`);

  const kit = await initSDK();
  const erc20Manager = kit.getERC20Manager();

  try {
    const info = await erc20Manager.getTokenInfo(tokenAddress);

    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  ERC20 Token Information                                                  ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Name:     ${info.name.padEnd(61)}║`);
    console.log(`║  Symbol:   ${info.symbol.padEnd(61)}║`);
    console.log(`║  Decimals: ${info.decimals.toString().padEnd(61)}║`);
    console.log(
      `║  Supply:   ${ethers.formatUnits(info.totalSupply, info.decimals).padEnd(61)}║`
    );
    console.log(`║  Address:  ${tokenAddress.padEnd(61)}║`);
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();
  } catch (error) {
    throw new Error(
      `Failed to get token info. Is this a valid ERC20 token? ${(error as Error).message}`
    );
  }
}

/**
 * Token approve command
 */
export async function tokenApproveCommand(options: TokenApproveOptions): Promise<void> {
  const spender = options._positional?.[0];
  const amount = options._positional?.[1] || options.amount;

  if (!spender || !amount || !options.token) {
    throw new Error('Usage: sak token:approve <spender> <amount> --token <address>');
  }

  console.log(`✅ Approving token spending...\n`);

  const kit = await initSDK();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const erc20Manager = kit.getERC20Manager();
  const info = await erc20Manager.getTokenInfo(options.token);
  const amountWei = ethers.parseUnits(amount, info.decimals);

  console.log(`   Token:   ${info.name} (${info.symbol})`);
  console.log(`   Spender: ${spender}`);
  console.log(`   Amount:  ${amount} ${info.symbol}\n`);

  console.log('⏳ Sending transaction...');
  const receipt = await erc20Manager.approve(options.token, spender, amountWei);
  console.log(`📤 Transaction hash: ${receipt.hash}`);
  console.log('✅ Approval successful!\n');
}

/**
 * NFT owner command
 */
export async function nftOwnerCommand(options: NFTOwnerOptions): Promise<void> {
  const tokenId = options._positional?.[0];

  if (!tokenId || !options.collection) {
    throw new Error('Usage: sak nft:owner <tokenId> --collection <address>');
  }

  console.log(`🔍 Fetching NFT owner...\n`);

  const kit = await initSDK();
  const erc721Manager = kit.getERC721Manager();

  const owner = await erc721Manager.ownerOf(options.collection, BigInt(tokenId));
  const info = await erc721Manager.getCollectionInfo(options.collection);

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  NFT Ownership                                                            ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Collection: ${info.name.padEnd(59)}║`);
  console.log(`║  Symbol:     ${info.symbol.padEnd(59)}║`);
  console.log(`║  Token ID:   ${tokenId.padEnd(59)}║`);
  console.log(`║  Owner:      ${owner.padEnd(59)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();
}

/**
 * NFT transfer command
 */
export async function nftTransferCommand(options: NFTTransferOptions): Promise<void> {
  const to = options._positional?.[0];
  const tokenId = options._positional?.[1];

  if (!to || !tokenId || !options.collection) {
    throw new Error('Usage: sak nft:transfer <to> <tokenId> --collection <address>');
  }

  console.log(`📤 Transferring NFT...\n`);

  const kit = await initSDK();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const from = await signer.getAddress();
  const erc721Manager = kit.getERC721Manager();
  const info = await erc721Manager.getCollectionInfo(options.collection);

  console.log(`   Collection: ${info.name}`);
  console.log(`   From:       ${from}`);
  console.log(`   To:         ${to}`);
  console.log(`   Token ID:   ${tokenId}\n`);

  console.log('⏳ Sending transaction...');
  const receipt = await erc721Manager.transferFrom(
    options.collection,
    from,
    to,
    BigInt(tokenId)
  );
  console.log(`📤 Transaction hash: ${receipt.hash}`);
  console.log('✅ Transfer successful!\n');
}

/**
 * NFT metadata command
 */
export async function nftMetadataCommand(options: NFTMetadataOptions): Promise<void> {
  const tokenId = options._positional?.[0];

  if (!tokenId || !options.collection) {
    throw new Error('Usage: sak nft:metadata <tokenId> --collection <address>');
  }

  console.log(`📋 Fetching NFT metadata...\n`);

  const kit = await initSDK();
  const erc721Manager = kit.getERC721Manager();

  const uri = await erc721Manager.tokenURI(options.collection, BigInt(tokenId));
  const info = await erc721Manager.getCollectionInfo(options.collection);

  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  NFT Metadata                                                             ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Collection: ${info.name.padEnd(59)}║`);
  console.log(`║  Token ID:   ${tokenId.padEnd(59)}║`);
  console.log(`║  URI:        ${uri.substring(0, 59).padEnd(59)}║`);
  if (uri.length > 59) {
    console.log(`║              ${uri.substring(59, 118).padEnd(59)}║`);
  }
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();

  // Try to fetch metadata if it's an HTTP URL
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    console.log('💡 Fetching metadata from URI...\n');
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      console.log(JSON.stringify(metadata, null, 2));
      console.log();
    } catch (error) {
      console.log(`⚠️  Could not fetch metadata: ${(error as Error).message}\n`);
    }
  }
}
